/** In-memory double for the parts of the `obsidian` API this plugin uses. Opt in per suite with
 * `vi.mock("obsidian", () => import("@test/obsidian"))`. */
export { App } from "./app";
export { Component } from "./component";
export { Events, type EventRef } from "./events";
export { Notice, clearNotices, recordedNotices, type RecordedNotice } from "./notice";
export {
  Plugin,
  TEST_MANIFEST,
  createTestPlugin,
  type Command,
  type PluginManifest,
  type PluginRegistry,
} from "./plugin";
export {
  DropdownComponent,
  PluginSettingTab,
  Setting,
  SettingTab,
  TextComponent,
  ToggleComponent,
  settingsIn,
} from "./settings";
export { ItemView, View, WorkspaceLeaf, type ViewCreator } from "./views";
export { Vault, type TFile } from "./vault";
export { Workspace } from "./workspace";
export { installDomExtensions } from "./dom";

export const apiVersion = "1.14.4";

export const Platform = {
  isDesktop: true,
  isMobile: false,
  isDesktopApp: true,
  isMobileApp: false,
  isIosApp: false,
  isAndroidApp: false,
  isPhone: false,
  isTablet: false,
  isMacOS: false,
  isWin: false,
  isLinux: true,
  isSafari: false,
};

/** Marks the element so tests can see which icon was requested. */
export const setIcon = (el: HTMLElement, icon: string): void => {
  el.dataset["icon"] = icon;
};
