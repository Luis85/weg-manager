// The public face of the shell's Obsidian adapters (ADR 0006): composition imports only this.
export { registerCommands } from "./commands";
export { hostLanguage } from "./language";
export { showMessage } from "./notices";
export { addRibbonIcon } from "./ribbon";
export { runSafely } from "./run";
export { mirrorSettings } from "./settings-mirror";
export { ShellSettingTab } from "./settings-tab";
export { shellLayer, type ShellLayerOptions } from "./shell-layer";
export { openRoute } from "./open-route";
export { SHELL_VIEW_TYPE, ShellView } from "./shell-view";
