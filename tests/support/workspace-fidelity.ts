/**
 * What Obsidian 1.15.1 does in `workspaceScenario` (`workspace-scenario.ts`), measured in three
 * runs, the same in each (`tests/e2e/specs/workspace.e2e.ts`) and held against the double
 * (`tests/dom/workspace-fidelity.test.ts`). A change here is a finding about Obsidian.
 */
const COMMUNITIES = { name: "settings", section: "communities" };
const ISSUES = { name: "settings", section: "data-issues" };

const view = (route: unknown, deferred = false) => ({
  type: "weg-manager-view",
  deferred,
  built: !deferred,
  route,
  file: null,
});
const NEW_TAB = { type: "empty", deferred: false, built: true, route: null, file: null };
const NOTE = { type: "markdown", deferred: false, built: true, route: null, file: "Tabs.md" };

export const WORKSPACE_FACTS = {
  // Obsidian starts with a new tab, and `openRoute`'s `getLeaf(true)` opens the view in it.
  start: NEW_TAB,
  open: { views: [view(COMMUNITIES)], inStartTab: true, active: view(COMMUNITIES) },
  // An open view is revealed, not opened twice.
  openAgain: [view(COMMUNITIES)],
  // The plugin's tab is not navigable, so `getLeaf(false)` opens a new tab and activates it…
  getLeafFalseFromPlugin: { isPlugin: false, leaf: NEW_TAB, active: true },
  // …which `getLeaf("tab")` reuses while it is still a new tab…
  getLeafTabFromNewTab: { reused: true },
  openFile: { leaf: NOTE, active: true },
  // …and a note's tab `getLeaf(false)` reuses, while `getLeaf("tab")` opens another.
  getLeafFalseFromNote: { reused: true },
  getLeafTabFromNote: { reused: false, leaf: NEW_TAB },
  secondView: [view(COMMUNITIES), view(ISSUES)],
  // A route goes to the first view, which becomes active; the second keeps its own.
  openRouteWithTwo: { views: [view(COMMUNITIES), view(ISSUES)], active: true },
  closed: [view(COMMUNITIES)],
  // `revealLeaf` brings the plugin's tab to the front but leaves the note the active leaf.
  revealBackground: { active: NOTE },
  // A restored layout builds the tab in front and defers the others: the plugin sees its type
  // and saved route, and a view that is not built (an empty container, no `ShellView`).
  restored: { views: [view(ISSUES, true), view(COMMUNITIES, true)], active: NOTE },
  // A route opened into a deferred tab builds the view on that route, not the saved one.
  openRouteIntoDeferred: {
    views: [view(COMMUNITIES), view(COMMUNITIES, true)],
    active: true,
  },
  // `revealLeaf`, as `openRoute` calls it without a route, builds a deferred view on its saved
  // route and leaves the active leaf.
  revealDeferred: { views: [view(COMMUNITIES), view(COMMUNITIES)], activeIsFirst: true },
};
