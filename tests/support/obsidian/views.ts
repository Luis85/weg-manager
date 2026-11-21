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
  /** Set by the leaf's history when it goes back or forward; nothing is recorded then. */
  readonly popstate?: boolean;
};

/** What the leaf's history keeps of one step. */
export type HistoryState = { readonly state: ViewState };

export abstract class View extends Component {
  readonly containerEl: HTMLElement;
  /** Whether the view is navigable: only then does the leaf record its history (Obsidian 1.15.1). */
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

/**
 * The leaf's back and forward stacks, as Obsidian 1.15.1 keeps them (`leaf.history`, not in the
 * public API): a recorded step clears the forward stack; going back or forward sets the stored
 * view state again with `popstate`, so the step is not recorded twice.
 */
export class LeafHistory {
  backHistory: HistoryState[] = [];
  forwardHistory: HistoryState[] = [];

  constructor(private readonly leaf: WorkspaceLeaf) {}

  pushState(entry: HistoryState): void {
    this.backHistory.push(entry);
    this.forwardHistory = [];
  }

  back(): Promise<void> {
    return this.go(this.backHistory, this.forwardHistory);
  }

  forward(): Promise<void> {
    return this.go(this.forwardHistory, this.backHistory);
  }

  private async go(from: HistoryState[], to: HistoryState[]): Promise<void> {
    const target = from.pop();
    if (target === undefined) return;
    to.push(this.leaf.getHistoryState());
    await this.leaf.setViewState({ ...target.state, popstate: true });
  }
}

export class WorkspaceLeaf {
  view: View | null = null;
  readonly containerEl: HTMLElement;
  readonly history = new LeafHistory(this);
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

  getHistoryState(): HistoryState {
    const { type, state } = this.getViewState();
    return { state: { type: type ?? "empty", ...(state === undefined ? {} : { state }) } };
  }

  /**
   * As Obsidian 1.15.1: a new view type creates and opens the view; then the view gets the state.
   * A step is recorded when the view asks for it (`result.history`), is navigable, and the step
   * did not come from the history itself.
   */
  async setViewState(state: ViewState): Promise<void> {
    if (this.working) return;
    this.working = true;
    try {
      const previous = this.view === null ? undefined : this.getHistoryState();
      const result: ViewStateResult = { history: false };
      if (this.view === null || state.type !== this.viewType) {
        await this.openView(state.type);
        result.history = true;
      }
      await this.view?.setState(state.state ?? {}, result);
      if (state.popstate === true) result.history = false;
      if (result.history && previous !== undefined) this.record(previous);
    } finally {
      this.working = false;
    }
  }

  async detach(): Promise<void> {
    await this.closeView();
    this.containerEl.remove();
    this.workspace.removeLeaf(this);
  }

  /** Only a navigable view is recorded, and never the same state twice in a row. */
  private record(previous: HistoryState): void {
    if (this.view?.navigation !== true) return;
    const last = this.history.backHistory.at(-1);
    if (last !== undefined && JSON.stringify(last.state) === JSON.stringify(previous.state)) return;
    this.history.pushState(previous);
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
