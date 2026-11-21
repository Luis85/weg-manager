import type { Plugin } from "obsidian";
import type { SettingsMirror } from "./settings-mirror";

/** Keeps the ribbon icon in step with the `showRibbonIcon` setting. Returns a stop function. */
export const bindRibbonIcon = (
  plugin: Plugin,
  mirror: SettingsMirror,
  onClick: () => unknown,
): (() => void) => {
  let icon: HTMLElement | undefined;
  const apply = (visible: boolean) => {
    if (visible && icon === undefined) {
      icon = plugin.addRibbonIcon("layout-dashboard", "WEG Manager öffnen", () => onClick());
    } else if (!visible && icon !== undefined) {
      icon.remove();
      icon = undefined;
    }
  };
  apply(mirror.settings().showRibbonIcon);
  const unsubscribe = mirror.subscribe((settings) => apply(settings.showRibbonIcon));
  return () => {
    unsubscribe();
    apply(false);
  };
};
