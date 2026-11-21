import type { Plugin } from "obsidian";

export const RIBBON_ICON = "layout-dashboard";
export const RIBBON_TITLE = "WEG Manager öffnen";

/** The part of Obsidian's left ribbon the public typings leave out (`WorkspaceRibbon` is empty). */
type RibbonInternals = { removeRibbonAction?: (id: string) => void };

/**
 * Releases the ribbon icon the way Obsidian's own unload does. Only for a failed bootstrap: on a
 * normal unload Obsidian does this itself. `el.remove()` alone is not enough, because the entry
 * stays in `workspace.leftRibbon.items` and the next re-render of the ribbon brings it back.
 */
export const releaseRibbonIcon = (plugin: Plugin, el: HTMLElement): void => {
  const ribbon = plugin.app.workspace.leftRibbon as unknown as RibbonInternals;
  ribbon.removeRibbonAction?.(`${plugin.manifest.id}:${RIBBON_TITLE}`);
  el.remove();
};
