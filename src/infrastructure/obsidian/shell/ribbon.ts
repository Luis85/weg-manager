import type { Plugin } from "obsidian";
import { PRODUCT_NAME } from "../../../application/shell";

const RIBBON_ICON = "layout-dashboard";

/**
 * Adds the ribbon icon that opens the view. Its title is the product name in every language:
 * Obsidian keys a ribbon entry by `<plugin id>:<title>`, so a translated title would make it forget
 * the icon's position and hidden state on a language switch. Obsidian removes the icon on a normal
 * unload, but not after a failed `onload`, so bootstrap adds it only after everything that can fail.
 */
export const addRibbonIcon = (plugin: Plugin, open: () => unknown): HTMLElement =>
  plugin.addRibbonIcon(RIBBON_ICON, PRODUCT_NAME, () => open());
