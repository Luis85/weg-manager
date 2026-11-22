import type * as Obsidian from "obsidian";
import type { App } from "./app";
import type { Plugin } from "./plugin";
import { View, type WorkspaceLeaf } from "./views";
import type { Workspace } from "./workspace";

/**
 * Where plugin code is handed the double. The double implements only what the plugin uses, and
 * each of its classes declares that part of the real class (`implements Uses<…>`, see
 * `conformance.ts`), so the type check compares every member the plugin calls with
 * `node_modules/obsidian/obsidian.d.ts`. What it leaves out (the rest of each class, and the
 * classes' nominal identity) is why these few functions cast, in this one place, instead of every
 * test casting with `as never`.
 */
export const asObsidian = (app: App): Obsidian.App => app as unknown as Obsidian.App;

export const asObsidianPlugin = (plugin: Plugin): Obsidian.Plugin =>
  plugin as unknown as Obsidian.Plugin;

export const asObsidianWorkspace = (workspace: Workspace): Obsidian.Workspace =>
  workspace as unknown as Obsidian.Workspace;

export const asObsidianLeaf = (leaf: WorkspaceLeaf): Obsidian.WorkspaceLeaf =>
  leaf as unknown as Obsidian.WorkspaceLeaf;

/** The double's `View` class where a scenario takes Obsidian's, as `getActiveViewOfType(View)`. */
export const obsidianView = View as unknown as typeof Obsidian.View;

/** A view the plugin builds (typed against `obsidian`), handed back to the double's leaf. */
export const asDoubleView = (view: Obsidian.View): View => view as unknown as View;

/** The plugin's view of type `T` behind a double's leaf, as the plugin built it. */
export const viewOf = <T>(leaf: WorkspaceLeaf | undefined): T => leaf?.view as unknown as T;
