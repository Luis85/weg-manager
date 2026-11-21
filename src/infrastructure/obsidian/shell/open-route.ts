import type { Workspace } from "obsidian";
import type { RouteLike } from "../../../application/shell";
import { SHELL_VIEW_TYPE } from "./shell-view";

/**
 * Opens a route from outside the surface (a command, the ribbon): sets it in the first open view,
 * or in a new tab when none is open, and reveals that view. Setting it on an open view is a
 * navigation, so the view's history records it. Without a route, an open view keeps its own and a
 * new one starts on the start route.
 */
export const openRoute = async <R extends RouteLike>(
  workspace: Workspace,
  route?: R,
): Promise<void> => {
  const existing = workspace.getLeavesOfType(SHELL_VIEW_TYPE)[0];
  const leaf = existing ?? workspace.getLeaf(true);
  if (existing === undefined || route !== undefined) {
    await leaf.setViewState({
      type: SHELL_VIEW_TYPE,
      active: true,
      ...(route === undefined ? {} : { state: { route } }),
    });
  }
  await workspace.revealLeaf(leaf);
};
