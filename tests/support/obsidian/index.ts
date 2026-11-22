import type * as Obsidian from "obsidian";

/** In-memory double for the parts of the `obsidian` API this plugin uses. Opt in per suite with
 * `vi.mock("obsidian", () => import("@test/obsidian"))`. */
export { App } from "./app";
export { Component } from "./component";
export { Events, type EventRef } from "./events";
export {
  Notice,
  clearNotices,
  failNextNotice,
  recordedNotices,
  type RecordedNotice,
} from "./notice";
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
export {
  ItemView,
  View,
  WorkspaceLeaf,
  type ViewCreator,
  type ViewState,
  type ViewStateResult,
} from "./views";
export { FileManager } from "./file-manager";
export { MetadataCache, type CachedMetadata } from "./metadata-cache";
export { normalizePath } from "./paths";
export { TAbstractFile, TFile, TFolder, Vault } from "./vault";
export { YAMLParseError, parseYaml, stringifyYaml } from "./yaml";
export { Workspace } from "./workspace";
export { WorkspaceRibbon, type RibbonItem } from "./ribbon";
export { installDomExtensions } from "./dom";

export const apiVersion: typeof Obsidian.apiVersion = "1.15.1";

// `resourcePathPrefix` is not modelled: the plugin does not read it.
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
} satisfies Omit<typeof Obsidian.Platform, "resourcePathPrefix">;

/** Marks the element so tests can see which icon was requested. */
export const setIcon: typeof Obsidian.setIcon = (el, icon) => {
  el.dataset["icon"] = icon;
};
export { DEFAULT_TEST_LANGUAGE, getLanguage, setLanguage } from "./language";
