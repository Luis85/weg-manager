import type { App } from "obsidian";
import type { Route } from "../../../src/application/routes";
import { openRoute } from "../../../src/infrastructure/obsidian/shell/open-route";

/**
 * The plugin's real `openRoute` on this app's workspace, for the tab and view scenario
 * (`tests/support/workspace-scenario.ts`): what the open-view command and the ribbon call, with or
 * without a route. The plugin itself has no command that passes a route yet.
 */
export const workspaceProbe = (app: App) => ({
  openRoute: (route?: Route) => openRoute(app.workspace, route),
});

export type WorkspaceProbe = ReturnType<typeof workspaceProbe>;
