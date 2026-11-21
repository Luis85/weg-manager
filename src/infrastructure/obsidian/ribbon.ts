import type { Plugin } from "obsidian";

export const RIBBON_ICON = "layout-dashboard";

/** The part of Obsidian's left ribbon the public typings leave out (`WorkspaceRibbon` is empty). */
type RibbonInternals = { removeRibbonAction?: (id: string) => void };

/**
 * Releases the ribbon icon the way Obsidian's own unload does. Only for a failed bootstrap: on a
 * normal unload Obsidian does this itself. `el.remove()` alone is not enough, because the entry
 * stays in `workspace.leftRibbon.items` and the next re-render of the ribbon brings it back.
 */
export const releaseRibbonIcon = (plugin: Plugin, el: HTMLElement, title: string): void => {
  const ribbon = plugin.app.workspace.leftRibbon as unknown as RibbonInternals;
  // Obsidian keys an entry by plugin id and title, so this is the title of this load's icon.
  ribbon.removeRibbonAction?.(`${plugin.manifest.id}:${title}`);
  el.remove();
};
