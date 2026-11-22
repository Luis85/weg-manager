import type { App, View, WorkspaceLeaf } from "obsidian";
import type { WorkspaceProbe } from "./shell/workspace-probe";

/**
 * Tabs and views as the plugin meets them: its view opened through the plugin's real `openRoute`
 * (`plugins.noteStoreProbe.workspace`, what the open-view command and the ribbon call),
 * `getLeaf(false)` and `getLeaf("tab")` from a new tab, a note and the plugin's tab, a second
 * view, closing, a background tab revealed, and a layout restored with the plugin's tabs in the
 * background, which Obsidian 1.7 and later defers, then a route opened into one deferred tab and
 * the other revealed. Runs unchanged in real Obsidian (`tests/e2e/specs/workspace.e2e.ts`) and on
 * the double with the real plugin loaded (`tests/dom/workspace-fidelity.test.ts`); both compare
 * with `WORKSPACE_FACTS`. Nothing here waits on focus or on a drawn frame: every step reads state
 * the workspace has once its promise has settled. `executeObsidian` serialises the function, so
 * it uses only its arguments.
 */
export const workspaceScenario = async ({
  app,
  obsidian,
  plugins,
}: {
  readonly app: App;
  readonly obsidian: { readonly View: typeof View };
  readonly plugins: unknown;
}) => {
  const probe = (plugins as { readonly noteStoreProbe: { readonly workspace: WorkspaceProbe } })
    .noteStoreProbe.workspace;
  const workspace = app.workspace;
  const type = "weg-manager-view";
  const communities = { name: "settings" as const, section: "communities" as const };
  const issues = { name: "settings" as const, section: "data-issues" as const };
  const note =
    app.vault.getFileByPath("Tabs.md") ?? (await app.vault.create("Tabs.md", "# Tabs\n"));
  /** A leaf as the plugin sees it; `built` is false for a deferred view, whose container is empty. */
  // oxlint-disable-next-line unicorn/consistent-function-scoping -- the function is serialised whole
  const seen = (leaf: WorkspaceLeaf | null) =>
    leaf === null
      ? null
      : {
          type: leaf.getViewState().type,
          deferred: leaf.isDeferred,
          built: leaf.view.containerEl.childElementCount > 0,
          route: leaf.getViewState().state?.["route"] ?? null,
          file: leaf.getViewState().state?.["file"] ?? null,
        };
  /** The active leaf, as the d.ts recommends finding it (`activeLeaf` is deprecated). */
  const active = () => workspace.getActiveViewOfType(obsidian.View)?.leaf ?? null;
  const views = () => workspace.getLeavesOfType(type).map(seen);
  const first = () => {
    const leaf = workspace.getLeavesOfType(type)[0];
    if (leaf === undefined) throw new Error("no plugin view");
    return leaf;
  };

  const start = active();
  const report: Record<string, unknown> = { start: seen(start) };
  await probe.openRoute();
  report["open"] = {
    views: views(),
    inStartTab: first() === start,
    active: seen(active()),
  };
  await probe.openRoute();
  report["openAgain"] = views();

  const plugin = first();
  const fromPlugin = workspace.getLeaf(false);
  report["getLeafFalseFromPlugin"] = {
    isPlugin: fromPlugin === plugin,
    leaf: seen(fromPlugin),
    active: active() === fromPlugin,
  };
  const tab = workspace.getLeaf("tab");
  report["getLeafTabFromNewTab"] = { reused: tab === fromPlugin };
  await tab.openFile(note, { active: true });
  report["openFile"] = { leaf: seen(tab), active: active() === tab };
  report["getLeafFalseFromNote"] = { reused: workspace.getLeaf(false) === tab };
  const another = workspace.getLeaf("tab");
  report["getLeafTabFromNote"] = { reused: another === tab, leaf: seen(another) };

  await another.setViewState({ type, active: true, state: { route: issues } });
  report["secondView"] = views();
  await probe.openRoute(communities);
  report["openRouteWithTwo"] = { views: views(), active: active() === plugin };
  another.detach();
  report["closed"] = views();

  workspace.setActiveLeaf(tab, { focus: false });
  await workspace.revealLeaf(plugin);
  report["revealBackground"] = { active: seen(active()) };

  // Two plugin tabs in the background, the note in front; the layout saved and restored.
  await plugin.setViewState({ type, state: { route: issues } });
  await workspace.getLeaf("tab").setViewState({ type, state: { route: communities } });
  workspace.setActiveLeaf(tab, { focus: false });
  await workspace.changeLayout(workspace.getLayout());
  report["restored"] = { views: views(), active: seen(active()) };

  // The route opened into the first, deferred, tab; the second revealed as `openRoute` reveals.
  await probe.openRoute(communities);
  const [opened, other] = workspace.getLeavesOfType(type);
  report["openRouteIntoDeferred"] = {
    views: views(),
    active: active() === opened,
  };
  if (other !== undefined) await workspace.revealLeaf(other);
  report["revealDeferred"] = { views: views(), activeIsFirst: active() === opened };
  // As plain JSON on both sides: `executeObsidian` turns `undefined` into `null` and sorts keys.
  return JSON.parse(JSON.stringify(report)) as typeof report;
};
