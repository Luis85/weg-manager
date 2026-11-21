import { Component } from "./component";
import type { Workspace } from "./workspace";

export type ViewCreator = (leaf: WorkspaceLeaf) => View;

export abstract class View extends Component {
  readonly containerEl: HTMLElement;
  constructor(readonly leaf: WorkspaceLeaf) {
    super();
    this.containerEl = leaf.ownerDocument.createElement("div");
    leaf.containerEl.append(this.containerEl);
  }
  abstract getViewType(): string;
  abstract getDisplayText(): string;
  getIcon(): string {
    return "document";
  }
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

  constructor(
    private readonly workspace: Workspace,
    readonly ownerDocument: Document = document,
  ) {
    this.containerEl = ownerDocument.createElement("div");
    ownerDocument.body.append(this.containerEl);
  }

  /** Test helper: a leaf in another document, as in a pop-out window. */
  static openIn(workspace: Workspace, ownerDocument: Document): WorkspaceLeaf {
    return workspace.addLeaf(new WorkspaceLeaf(workspace, ownerDocument));
  }

  getViewState(): { type: string | null } {
    return { type: this.viewType };
  }

  async setViewState(state: { type: string; active?: boolean }): Promise<void> {
    await this.closeView();
    const creator = this.workspace.viewCreator(state.type);
    if (creator === undefined) throw new Error(`no view registered for ${state.type}`);
    this.viewType = state.type;
    const view = creator(this);
    this.view = view;
    view.load();
    await view.onOpen();
  }

  async detach(): Promise<void> {
    await this.closeView();
    this.containerEl.remove();
    this.workspace.removeLeaf(this);
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
