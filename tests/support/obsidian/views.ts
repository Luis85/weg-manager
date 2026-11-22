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

export abstract class View extends Component {
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
export abstract class ItemView extends View {
  readonly contentEl: HTMLElement;
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    const header = leaf.ownerDocument.createElement("div");
    this.contentEl = leaf.ownerDocument.createElement("div");
    this.containerEl.append(header, this.contentEl);
  }
}

export class WorkspaceLeaf {
  view: View | null = null;
  readonly containerEl: HTMLElement;
  private viewType: string | null = null;
  /** Like Obsidian, a `setViewState` while another one runs does nothing. */
  private working = false;

  constructor(
    private readonly workspace: Workspace,
    readonly ownerDocument: Document = document,
  ) {
    this.containerEl = ownerDocument.createElement("div");
    ownerDocument.body.append(this.containerEl);
  }

  get app(): App {
    return this.workspace.app;
  }

  /** Test helper: a leaf in another document, as in a pop-out window. */
  static openIn(workspace: Workspace, ownerDocument: Document): WorkspaceLeaf {
    return workspace.addLeaf(new WorkspaceLeaf(workspace, ownerDocument));
  }

  getViewState(): { type: string | null; state?: Record<string, unknown> } {
    return this.view === null
      ? { type: this.viewType }
      : { type: this.viewType, state: this.view.getState() };
  }

  /**
   * As Obsidian 1.15.1: a new view type creates and opens the view; then the view gets the state.
   * An open view of the same type is kept and only gets the new state.
   */
  async setViewState(state: ViewState): Promise<void> {
    if (this.working) return;
    this.working = true;
    try {
      const result: ViewStateResult = { history: false };
      if (this.view === null || state.type !== this.viewType) {
        await this.openView(state.type);
        result.history = true;
      }
      await this.view?.setState(state.state ?? {}, result);
    } finally {
      this.working = false;
    }
  }

  /** Test helper: the files opened in this leaf, with the state they were opened with. */
  readonly openedFiles: { readonly path: string; readonly state: unknown }[] = [];

  /** Opens a note in this leaf, as a file editor would; the double only records it. */
  async openFile(file: { readonly path: string }, state?: unknown): Promise<void> {
    this.openedFiles.push({ path: file.path, state });
  }

  async detach(): Promise<void> {
    await this.closeView();
    this.containerEl.remove();
    this.workspace.removeLeaf(this);
  }

  private async openView(type: string): Promise<void> {
    await this.closeView();
    const creator = this.workspace.viewCreator(type);
    if (creator === undefined) throw new Error(`no view registered for ${type}`);
    this.viewType = type;
    const view = creator(this);
    this.view = view;
    view.load();
    await view.onOpen();
  }

  private async closeView(): Promise<void> {
    const view = this.view;
    if (view === null) return;
    this.view = null;
    this.viewType = null;
    await view.onClose();
    view.unload();
    view.containerEl.remove();
  }
}
