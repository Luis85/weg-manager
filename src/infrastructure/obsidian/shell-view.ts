import { ItemView, type WorkspaceLeaf } from "obsidian";
import type { AppRuntime } from "../../application/app-services";
import { mountSurface } from "../../presentation/mount";

export const SHELL_VIEW_TYPE = "weg-manager-view";

/**
 * One Vue surface per open view. `surfaces` holds the close of every open view, so bootstrap
 * can close them all before it disposes the runtime.
 */
export class ShellView extends ItemView {
  private close: (() => void) | undefined;

  constructor(
    leaf: WorkspaceLeaf,
    private readonly runtime: AppRuntime,
    private readonly surfaces: Set<() => void>,
  ) {
    super(leaf);
  }

  getViewType(): string {
    return SHELL_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "WEG Manager";
  }

  override getIcon(): string {
    return "layout-dashboard";
  }

  override async onOpen(): Promise<void> {
    if (this.close !== undefined) return;
    const close = mountSurface(this.contentEl, this.runtime);
    this.close = close;
    this.surfaces.add(close);
  }

  override async onClose(): Promise<void> {
    const close = this.close;
    this.close = undefined;
    if (close === undefined) return;
    this.surfaces.delete(close);
    close();
  }
}
