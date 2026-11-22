# ADR 0008 · One view, typed routes

- Status: accepted; history and the place of the selection amended on 2026-11-21, the selectable communities on 2026-11-22, the settings route and its sections on 22.11.2026 (see the notes at the end)
- Date: 2026-11-21

## Context

The design (`docs/design/handoff/03 - Ansichten, Navigation und Befehle.md`) describes one Obsidian view with about eight internal screens, a community switch that holds across them, commands that open a screen, and state that survives a restart through `getState()`/`setState()`. The shell has one view with one panel and no navigation. Mobile is out of the MVP (owner decision, 2026-11-21).

## Decision

- **One registered view type.** Each open view has its own Vue app (ADR 0002) and its own current route. Two views can show two screens.
- **A route is data, not a URL.** `Route` is a typed union in the shell's application layer, with English names and at most the parameters a screen needs. It contains only routes that exist; there are no placeholder screens. The tracer slice adds the first: the community settings, which is also the start route until the overview exists.

  | Screen in the design | Route |
  | --- | --- |
  | `einstellungen/gemeinschaften` | `{ name: "settings", section: "communities" }` |
  | `einstellungen/datenprobleme` | `{ name: "settings", section: "data-issues" }` (amendment 22.11.2026) |

  Each later slice adds its rows here.
- **No router library.** Eight screens with one parameter need a `switch`, which the compiler checks. If nested layouts or guards appear, a router can replace the mechanism behind the same navigate use case.
- **Obsidian keeps the state.** The view's `getState()` returns the route; `setState()` decodes it with a schema and navigates. An unknown or broken state falls back to the start route and never throws. A route to a record that no longer exists shows a not-found state with a way back.
- **Obsidian owns the history.** A navigation is recorded in the leaf's history, so Obsidian's back and forward work and the plugin keeps no stack of its own. The step that builds this proves it in e2e; if the leaf history cannot carry it, the fallback is an in-memory stack per view.
- **Components navigate through the runtime.** `useRoute()` and `useNavigate()` live with the other composables; presentation still never imports `obsidian`. A command opens a route through one function that reveals an existing view or creates one.
- **The community selection is one service for all views.** It has a current value and a stream, like settings. It is stored per device in Obsidian's vault-scoped local storage through a port, not in `data.json`, so Sync does not switch the community on another device. With nothing stored, or when the stored community is gone, a single existing community is selected; with two or more, none is, and the frame asks for a choice before anything can be edited.
- **The app frame** (navigation, community switch, route outlet) belongs to the shell. Its layout follows the width of its container, because an Obsidian pane can be narrow on a desktop too.

## Consequences

- A screen is added by a new member of `Route`, a case in the outlet and, if wanted, a command. Typecheck fails until the outlet handles it.
- Routes are not shareable links. Obsidian URIs for deep links would be a separate decision.
- State that should survive a restart must be in the route or in a service. Form input is lost when a view closes; a draft store is decided with the first long form.
- The view tests grow by state restore, and the Obsidian test double by `getState`/`setState` and local storage.

## Amendment, 2026-11-21: fixed tab, own history

The bullet "Obsidian owns the history" no longer holds. Obsidian 1.15.1 records a leaf's history only for a view whose `navigation` is `true` (`WorkspaceLeaf.recordHistory`); the first build set it, and the e2e spec proved that Obsidian's back and forward buttons then worked. But `navigation = true` also makes the tab navigable for files: a plain click in the file explorer runs `getLeaf(false).openFile(file)`, which opens the note in the active plugin tab and closes the plugin view. The owner decided that a work dashboard must not vanish because of one click.

Decision:

- The plugin view is a fixed tab: `ShellView.navigation` is `false`. A file opened while it is active goes to another tab.
- Each view keeps its own history in memory, the fallback this ADR named: a navigation pushes the current route onto a back stack and clears the forward stack, back and forward move between them, a navigation to the current route pushes nothing, and at most 50 steps back are kept. The stack is plain data in the shell's application layer; components reach it through `useHistory()`, and the app frame shows a back and a forward control.
- Obsidian still keeps the route: `getState()` returns it, `setState()` decodes it, and every change asks Obsidian to save the layout. The history is not saved; a restored view starts with an empty one.
- The first state Obsidian sets on a view (a restored layout, `openRoute` on a new view) is where its history starts. A state set later on the open view (`openRoute` on it) is a navigation.

Consequences: Obsidian's own back and forward buttons in the view header do nothing for in-plugin navigation; the frame's controls do. The e2e spec checks that a note opened like a file-explorer click lands in another tab (it fails with `navigation = true`) and that the frame's controls move between routes.

## Amendment, 2026-11-21: composition and the community selection

- **`Route` is composed at the root.** Each module contributes a route schema (`CommunitiesRoute`); `src/application/routes.ts` builds `Route = Schema.Union([...])` and `appRoutes = routesOf(Route, start)`. The shell holds only the mechanism (`RouteLike`, `routesOf`, the history). The decision "a typed union in the shell's application layer" reads as that composition.
- **The selection and the switch belong to `communities`.** The shell cannot import a feature module, so `CommunitySelectionService` (`src/application/communities/selection.ts`) and `CommunitySwitch.vue` live in the communities module. The shell's frame offers a context area that `appSurface` fills with the switch. The selection is still one service for every view and is stored through the shell's `DeviceStore`, per device.
- **The stored choice.** A community the rule selects by itself (the only one) is stored too when no community's id is stored, once the index has read the vault without a failure, so a second community does not drop it. A stored community that is gone stays stored, also while the rule selects the only other one, and counts again when its note returns, as after Sync or a moment of broken YAML; only the user's choice replaces it. The price: when the stored community is gone for good and a second one is added later, the frame asks for a choice once.
- **Not enforced yet.** With two or more communities and none selected, the switch shows the prompt, but no screen is gated by it: the only screen edits communities themselves. The first screen that edits a record belonging to a community has to refuse editing until one is selected.
- **Not-found.** `NotFoundState` serves a route without a screen. No route has a record parameter yet, so a route to a missing record is untested until the first one.

## Amendment, 2026-11-22: only communities without issues can be selected

Context: a UX review in Obsidian 1.15.1 found the switch offering every community with an id, also a read-only one (a newer version, a duplicate id) and one with a broken field (an unknown colour, a duplicate short code). A view could then work in a community whose note the plugin cannot or should not write, and two switch entries could carry the same short code.

Decision (owner, 22.11.2026):

- The candidates of the selection rule are the communities without any issue (`selectableIds` in `src/domain/communities/selection.ts`). A read-only note always has an issue, so it is never a candidate. A community with an issue is still listed on the settings screen, with its issue, but the switch does not offer it and it cannot be the selection.
- The issues between communities count too: `CommunitySelectionService` applies the rule to the communities as `toCommunityList` makes them, which adds `short-code.duplicate`.
- A stored community that has an issue now is treated like one that is gone for a moment: it stays stored, the rule falls back to the only other candidate or to none (and asks for a choice among two or more), and it counts again once its note is repaired. Only the user's choice replaces it.
- With communities listed but none without issues, nothing is selected and nothing is asked; the switch says that no community can be chosen until one is repaired.

Consequences: the choice prompt counts candidates, not notes. A note that breaks for a moment while someone edits it in Obsidian drops the selection for that moment, as a note that is gone does.

## Amendment, 22.11.2026: the settings route belongs to the shell, its sections to the modules

Context: the route `{ name: "settings", section: "communities" }` was the communities module's own (`CommunitiesRoute`), and `appSurface` mapped one screen per route name, ignoring `section`. The design's settings view (VIEW-07, `einstellungen/<bereich>`) has about nine areas from several modules: a second module's area would have had to share the communities screen or take a route name of its own, against the design. The notes the plugin cannot read sat on the communities screen, though they are no community concern.

Decision (owner, 22.11.2026):

- **The shell owns the settings route and its screen.** `settingsRoute(sections)` (`src/application/shell/routes.ts`) is the schema `{ name: "settings", section }`, with `section` one of the given ids. The application root composes the ids, as it composes `Route`: `SETTINGS_SECTIONS` and `SettingsSection` in `src/application/routes.ts`, one id per module that contributes a section (`COMMUNITIES_SECTION` = `communities`, the notes module's `DATA_ISSUES_SECTION` = `data-issues`). `SettingsScreen.vue` (`src/presentation/shell/`) is the screen of the route name `settings`.
- **Each module contributes its section through `appSurface`:** `{ label, component, badge? }` by section id (`SettingsSectionPart`), typed by `SettingsSection`, so a section id without a part, or a part for an id no module has, fails typecheck. Components load lazily. `communities` contributes the community list, its form and dialogs; `notes` contributes "Datenprobleme" (glossary: data issues), the notes of no known type, with a badge that counts them.
- **The screen** shows a labelled navigation between the sections (`aria-label` from the catalog, one button per section, `aria-current="page"` and a bar on the current one, in the tab order, wrapping at 320 px) above the current section. With a single section it shows no navigation. It stays mounted across its sections (the route outlet keys it by its name), so the entry the user chose keeps the focus; the section remounts. A section no module contributes shows not-found.
- **Saved states keep working.** A stored `{ name: "settings", section: "communities" }` opens the communities section; an unknown section decodes as no route and falls back to the start route, as every unknown state does. The frame's navigation entry ("Gemeinschaften", the community settings) and the start route are unchanged.

Consequences: a module adds a settings area with its id in `SETTINGS_SECTIONS` and its part in `appSurface`'s `sections`, nothing in the shell. Another screen with several areas of its own would need the same keying in the route outlet; today the settings screen is the only one. The frame marks its entry as the current page only on the communities section; whether the entry should become "Einstellungen" once more sections exist is the owner's to decide.
