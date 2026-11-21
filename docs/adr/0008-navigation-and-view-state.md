# ADR 0008 · One view, typed routes

- Status: accepted; history and the place of the selection amended on 2026-11-21 (see the notes at the end)
- Date: 2026-11-21

## Context

The design (`docs/design/handoff/03 - Ansichten, Navigation und Befehle.md`) describes one Obsidian view with about eight internal screens, a community switch that holds across them, commands that open a screen, and state that survives a restart through `getState()`/`setState()`. The shell has one view with one panel and no navigation. Mobile is out of the MVP (owner decision, 2026-11-21).

## Decision

- **One registered view type.** Each open view has its own Vue app (ADR 0002) and its own current route. Two views can show two screens.
- **A route is data, not a URL.** `Route` is a typed union in the shell's application layer, with English names and at most the parameters a screen needs. It contains only routes that exist; there are no placeholder screens. The tracer slice adds the first: the community settings, which is also the start route until the overview exists.

  | Screen in the design | Route |
  | --- | --- |
  | `einstellungen/gemeinschaften` | `{ name: "settings", section: "communities" }` |

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
