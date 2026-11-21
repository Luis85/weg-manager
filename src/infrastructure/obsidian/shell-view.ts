import { ItemView } from "obsidian";

export const SHELL_VIEW_TYPE = "weg-manager-view";

/** Placeholder until the Vue surface is mounted here. */
export class ShellView extends ItemView {
  getViewType(): string {
    return SHELL_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "WEG Manager";
  }

  override getIcon(): string {
    return "layout-dashboard";
  }
}
