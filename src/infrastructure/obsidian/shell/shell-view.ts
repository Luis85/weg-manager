import { ItemView, type ViewStateResult, type WorkspaceLeaf } from "obsidian";
import type { AppRuntime } from "../../../application/app-services";
import type { RouteLike } from "../../../application/shell";
import {
  loadSurface as importSurface,
  memoryNavigation,
  type MemoryNavigation,
  type SurfaceDefinition,
  type SurfaceLoader,
} from "../../../presentation/shell/host";

export const SHELL_VIEW_TYPE = "weg-manager-view";

/** The route inside a view state; anything that is no object has none. */
const routeIn = (state: unknown): unknown =>
  typeof state === "object" && state !== null ? (state as { route?: unknown }).route : undefined;

/**
 * One Vue surface per open view, showing the view's own route (ADR 0008 and its amendment).
 *
 * - Obsidian keeps the route: `getState()` returns it, so it is in the saved workspace layout, and
 *   `setState()` decodes it; an unknown or broken state gives the start route and never throws.
 *   Every change of the route asks Obsidian to save the layout.
 * - The history is the view's own, in memory, and not saved. The first state Obsidian sets (a
 *   restored layout, `openRoute` on a new view) is where it starts; a state set later on the open
 *   view (`openRoute` on it) is a navigation like one from inside the surface.
 * - `surfaces` holds the close of every open view, so bootstrap can close them all before it
 *   disposes the runtime. The close is registered before the surface module has loaded: a view
 *   closed or released while it loads never mounts.
 */
export class ShellView<R extends RouteLike> extends ItemView {
  /**
   * A fixed tab, not a navigable one: with `true`, Obsidian opens a file into this tab when it is
   * the active one (a click in the file explorer, `getLeaf(false)`), and the view would vanish.
   * The view keeps its own history instead of Obsidian's leaf history, which records only
   * navigable views.
   */
  override navigation = false;
  private close: (() => void) | undefined;
  private readonly routes: MemoryNavigation<R>;
  private started = false;

  constructor(
    leaf: WorkspaceLeaf,
    private readonly runtime: AppRuntime,
    private readonly surfaces: Set<() => void>,
    private readonly definition: SurfaceDefinition<R>,
    private readonly loadSurface: SurfaceLoader = importSurface,
  ) {
    super(leaf);
    this.routes = memoryNavigation(definition);
    this.routes.onChange(() => this.app.workspace.requestSaveLayout());
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
    return { ...super.getState(), route: this.routes.current() };
  }

  override async setState(state: unknown, result: ViewStateResult): Promise<void> {
    const route = this.definition.decode(routeIn(state));
    if (this.started) this.routes.navigate(route);
    else this.routes.reset(route);
    this.started = true;
    await super.setState(state, result);
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
      navigation: this.routes,
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
