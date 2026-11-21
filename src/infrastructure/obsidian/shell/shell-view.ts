import { ItemView, type WorkspaceLeaf } from "obsidian";
import type { AppRuntime } from "../../../application/app-services";
import type { RouteLike } from "../../../application/shell";
import {
  loadSurface as importSurface,
  memoryNavigation,
  type SurfaceDefinition,
  type SurfaceLoader,
} from "../../../presentation/shell/host";

export const SHELL_VIEW_TYPE = "weg-manager-view";

/**
 * One Vue surface per open view. `surfaces` holds the close of every open view, so bootstrap
 * can close them all before it disposes the runtime. The close is registered before the surface
 * module has loaded: a view closed or released while it loads never mounts.
 */
export class ShellView<R extends RouteLike> extends ItemView {
  private close: (() => void) | undefined;

  constructor(
    leaf: WorkspaceLeaf,
    private readonly runtime: AppRuntime,
    private readonly surfaces: Set<() => void>,
    private readonly definition: SurfaceDefinition<R>,
    private readonly loadSurface: SurfaceLoader = importSurface,
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
    let closed = false;
    let release: (() => void) | undefined;
    const close = () => {
      closed = true;
      release?.();
    };
    this.close = close;
    this.surfaces.add(close);
    this.contentEl.empty();
    const { mountSurface } = await this.loadSurface();
    if (closed) return;
    release = mountSurface(this.contentEl, this.runtime, {
      surface: this.definition,
      navigation: memoryNavigation(this.definition),
    });
  }

  override async onClose(): Promise<void> {
    const close = this.close;
    this.close = undefined;
    if (close === undefined) return;
    this.surfaces.delete(close);
    close();
  }
}
