import { ItemView, type ViewStateResult, type WorkspaceLeaf } from "obsidian";
import type { AppRuntime } from "../../../application/app-services";
import { reportDefect, type RouteLike } from "../../../application/shell";
import {
  loadSurface as importSurface,
  type SurfaceDefinition,
  type SurfaceLoader,
  type ViewNavigation,
} from "../../../presentation/shell/host";
import { runSafely } from "./run";

export const SHELL_VIEW_TYPE = "weg-manager-view";

/** The route inside a view state; anything that is no object has none. */
const routeIn = (state: unknown): unknown =>
  typeof state === "object" && state !== null ? (state as { route?: unknown }).route : undefined;

/**
 * One Vue surface per open view, showing the view's own route (ADR 0008).
 *
 * - Obsidian keeps the route: `getState()` returns it, so it is in the saved workspace layout, and
 *   `setState()` decodes it; an unknown or broken state gives the start route and never throws.
 * - A navigation from inside the surface goes through `leaf.setViewState`, so Obsidian records it
 *   in the leaf's history and its back and forward buttons work. Obsidian records only views that
 *   are `navigation` views. A changed route also asks Obsidian to save the layout.
 * - `surfaces` holds the close of every open view, so bootstrap can close them all before it
 *   disposes the runtime. The close is registered before the surface module has loaded: a view
 *   closed or released while it loads never mounts.
 */
export class ShellView<R extends RouteLike> extends ItemView {
  override navigation = true;
  private close: (() => void) | undefined;
  private route: R;
  private readonly listeners = new Set<(route: R) => void>();

  constructor(
    leaf: WorkspaceLeaf,
    private readonly runtime: AppRuntime,
    private readonly surfaces: Set<() => void>,
    private readonly definition: SurfaceDefinition<R>,
    private readonly loadSurface: SurfaceLoader = importSurface,
  ) {
    super(leaf);
    this.route = definition.start;
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

  override getState(): Record<string, unknown> {
    return { ...super.getState(), route: this.route };
  }

  override async setState(state: unknown, result: ViewStateResult): Promise<void> {
    const route = this.definition.decode(routeIn(state));
    if (!this.definition.equals(route, this.route)) {
      this.route = route;
      result.history = true;
      for (const listener of this.listeners) listener(route);
      this.app.workspace.requestSaveLayout();
    }
    await super.setState(state, result);
  }

  /** What the surface sees of this view: the route, and the way to change it through Obsidian. */
  private readonly navigationOfView: ViewNavigation<R> = {
    current: () => this.route,
    navigate: (route) => {
      void this.leaf
        .setViewState({ type: SHELL_VIEW_TYPE, state: { route } })
        .catch((cause: unknown) => runSafely(this.runtime, reportDefect(cause)));
    },
    onChange: (listener) => {
      this.listeners.add(listener);
      return () => {
        this.listeners.delete(listener);
      };
    },
  };

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
      navigation: this.navigationOfView,
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
