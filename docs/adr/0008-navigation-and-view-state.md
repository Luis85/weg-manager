# ADR 0008 · One view, typed routes

- Status: accepted
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
- **The community selection is one service for all views.** It has a current value and a stream, like settings. It is stored per device in Obsidian's vault-scoped local storage through a port, not in `data.json`, so Sync does not switch the community on another device. A selection whose community is gone falls back to none.
- **The app frame** (navigation, community switch, route outlet) belongs to the shell. Its layout follows the width of its container, because an Obsidian pane can be narrow on a desktop too.

## Consequences

- A screen is added by a new member of `Route`, a case in the outlet and, if wanted, a command. Typecheck fails until the outlet handles it.
- Routes are not shareable links. Obsidian URIs for deep links would be a separate decision.
- State that should survive a restart must be in the route or in a service. Form input is lost when a view closes; a draft store is decided with the first long form.
- The view tests grow by state restore, and the Obsidian test double by `getState`/`setState` and local storage.
