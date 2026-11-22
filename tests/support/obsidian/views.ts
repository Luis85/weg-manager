import type * as Obsidian from "obsidian";
import type { Uses } from "./conformance";
import type { App } from "./app";
import { Component } from "./component";
import type { Workspace } from "./workspace";

export type ViewCreator = (leaf: WorkspaceLeaf) => View;

/** The result of `View.setState`, which the view fills in (`ViewStateResult`). */
export type ViewStateResult = { history: boolean };

export type ViewState = {
  readonly type: string;
  readonly state?: Record<string, unknown>;
  readonly active?: boolean;
};

export abstract class View
  extends Component
  implements
    Uses<
      Obsidian.View,
      | "containerEl"
      | "leaf"
      | "app"
      | "navigation"
      | "getViewType"
      | "getDisplayText"
      | "getIcon"
      | "getState"
      | "setState"
    >
{
  readonly containerEl: HTMLElement;
  /** Whether the view is navigable: Obsidian then opens files into its tab. */
  navigation = false;
  constructor(readonly leaf: WorkspaceLeaf) {
    super();
    this.containerEl = leaf.ownerDocument.createElement("div");
    leaf.containerEl.append(this.containerEl);
  }
  get app(): App {
    return this.leaf.app;
  }
  abstract getViewType(): string;
  abstract getDisplayText(): string;
  getIcon(): string {
    return "document";
  }
  getState(): Record<string, unknown> {
    return {};
  }
  async setState(_state: unknown, _result: ViewStateResult): Promise<void> {}
  async onOpen(): Promise<void> {}
  async onClose(): Promise<void> {}
}

/** Like Obsidian: `containerEl.children[1]` is `contentEl`. */
export abstract class ItemView extends View implements Uses<Obsidian.ItemView, "contentEl"> {
  readonly contentEl: HTMLElement;
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    const header = leaf.ownerDocument.createElement("div");
    this.contentEl = leaf.ownerDocument.createElement("div");
    this.containerEl.append(header, this.contentEl);
  }
}

/**
 * Obsidian's own views, as far as the plugin meets them: the new tab (`empty`) and a note
 * (`markdown`, its state `{ file }`). Both are navigable, so `getLeaf(false)` opens into them.
 */
class BuiltInView extends ItemView {
  override navigation = true;
  private state: Record<string, unknown> = {};
  constructor(
    leaf: WorkspaceLeaf,
    private readonly type: "empty" | "markdown",
  ) {
    super(leaf);
  }
  getViewType(): string {
    return this.type;
  }
  getDisplayText(): string {
    const file = this.state["file"];
    return this.type === "empty" || typeof file !== "string" ? "New tab" : file;
  }
  override getState(): Record<string, unknown> {
    return { ...this.state };
  }
  override async setState(state: unknown): Promise<void> {
    this.state = typeof state === "object" && state !== null ? { ...state } : {};
  }
}

/**
 * The view of a leaf in the background since Obsidian 1.7: the view of its type is not built until
 * the tab is shown (`loadIfDeferred`, `revealLeaf`, a `setViewState`). It answers to its type and
 * keeps the saved state, and its container is empty (measured in 1.15.1).
 */
class DeferredView extends View {
  constructor(
    leaf: WorkspaceLeaf,
    readonly saved: { readonly type: string; readonly state: Record<string, unknown> },
  ) {
    super(leaf);
  }
  getViewType(): string {
    return this.saved.type;
  }
  getDisplayText(): string {
    return this.saved.type;
  }
  override getState(): Record<string, unknown> {
    return { ...this.saved.state };
  }
}

const BUILT_IN = new Set(["empty", "markdown"]);

export class WorkspaceLeaf implements Uses<
  Obsidian.WorkspaceLeaf,
  "view" | "getViewState" | "setViewState" | "openFile" | "detach" | "isDeferred" | "loadIfDeferred"
> {
  view: View;
  readonly containerEl: HTMLElement;
  private viewType = "empty";
  /** Like Obsidian, a `setViewState` while another one runs does nothing. */
  private working = false;

  constructor(
    private readonly workspace: Workspace,
    readonly ownerDocument: Document = document,
  ) {
    this.containerEl = ownerDocument.createElement("div");
    ownerDocument.body.append(this.containerEl);
    this.view = new BuiltInView(this, "empty");
  }

  get app(): App {
    return this.workspace.app;
  }

  /** Test helper: a leaf in another document, as in a pop-out window. */
  static openIn(workspace: Workspace, ownerDocument: Document): WorkspaceLeaf {
    return workspace.addLeaf(new WorkspaceLeaf(workspace, ownerDocument));
  }

  /** Double-internal: a leaf restored in the background, as `changeLayout` restores one. */
  static deferred(workspace: Workspace, saved: ViewState): WorkspaceLeaf {
    const leaf = workspace.addLeaf(new WorkspaceLeaf(workspace));
    leaf.view.containerEl.remove();
    leaf.viewType = saved.type;
    leaf.view = new DeferredView(leaf, { type: saved.type, state: { ...saved.state } });
    return leaf;
  }

  get isDeferred(): boolean {
    return this.view instanceof DeferredView;
  }

  /** Builds the view of a deferred leaf with its saved state, as showing the tab does. */
  async loadIfDeferred(): Promise<void> {
    if (this.view instanceof DeferredView) await this.setViewState(this.view.saved);
  }

  getViewState(): { type: string; state: Record<string, unknown> } {
    return { type: this.viewType, state: this.view.getState() };
  }

  /**
   * As Obsidian 1.15.1: a new view type creates and opens the view; then the view gets the state.
   * An open view of the same type is kept and only gets the new state. A deferred leaf builds its
   * view with the state given here, not the saved one. `active` makes the leaf the active one.
   */
  async setViewState(state: ViewState): Promise<void> {
    if (this.working) return;
    this.working = true;
    try {
      const result: ViewStateResult = { history: false };
      if (this.isDeferred || state.type !== this.viewType) {
        await this.openView(state.type);
        result.history = true;
      }
      await this.view.setState(state.state ?? {}, result);
      if (state.active === true) this.workspace.setActiveLeaf(this);
    } finally {
      this.working = false;
    }
  }

  /** Test helper: the files opened in this leaf, with the state they were opened with. */
  readonly openedFiles: { readonly path: string; readonly state: unknown }[] = [];

  /** Opens a note in this leaf: it becomes a `markdown` leaf; `{ active: true }` activates it. */
  async openFile(
    file: { readonly path: string },
    state?: { readonly active?: boolean },
  ): Promise<void> {
    this.openedFiles.push({ path: file.path, state });
    await this.setViewState({ type: "markdown", state: { file: file.path } });
    if (state?.active === true) this.workspace.setActiveLeaf(this);
  }

  /** As in Obsidian, the leaf is gone at once; its view closes after (`detach` returns nothing). */
  detach(): void {
    this.workspace.removeLeaf(this);
    this.containerEl.remove();
    void this.closeView();
  }

  private async openView(type: string): Promise<void> {
    const creator = this.workspace.viewCreator(type);
    if (!BUILT_IN.has(type) && creator === undefined) {
      throw new Error(`no view registered for ${type}`);
    }
    await this.closeView();
    this.view.containerEl.remove();
    this.viewType = type;
    if (creator === undefined) {
      this.view = new BuiltInView(this, type === "markdown" ? "markdown" : "empty");
      return;
    }
    const view = creator(this);
    this.view = view;
    view.load();
    await view.onOpen();
  }

  /** Closes the view; the leaf shows a new tab (`empty`) until another view opens. */
  private async closeView(): Promise<void> {
    const view = this.view;
    this.viewType = "empty";
    this.view = new BuiltInView(this, "empty");
    if (!(view instanceof DeferredView)) {
      await view.onClose();
      view.unload();
    }
    view.containerEl.remove();
  }
}
