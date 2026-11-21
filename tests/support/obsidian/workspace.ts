import { Events } from "./events";
import { WorkspaceRibbon } from "./ribbon";
import { WorkspaceLeaf, type ViewCreator } from "./views";

export class Workspace extends Events {
  readonly leaves: WorkspaceLeaf[] = [];
  readonly revealed: WorkspaceLeaf[] = [];
  readonly leftRibbon = new WorkspaceRibbon();
  private readonly creators = new Map<string, ViewCreator>();
  layoutReady = true;
  private readonly layoutCallbacks: (() => void)[] = [];

  registerViewCreator(type: string, creator: ViewCreator): void {
    this.creators.set(type, creator);
  }

  unregisterViewCreator(type: string): void {
    this.creators.delete(type);
  }

  viewCreator(type: string): ViewCreator | undefined {
    return this.creators.get(type);
  }

  hasViewType(type: string): boolean {
    return this.creators.has(type);
  }

  addLeaf(leaf: WorkspaceLeaf): WorkspaceLeaf {
    this.leaves.push(leaf);
    return leaf;
  }

  removeLeaf(leaf: WorkspaceLeaf): void {
    const index = this.leaves.indexOf(leaf);
    if (index !== -1) this.leaves.splice(index, 1);
  }

  getLeaf(_newLeaf?: boolean | "tab" | "split" | "window"): WorkspaceLeaf {
    return this.addLeaf(new WorkspaceLeaf(this));
  }

  getRightLeaf(_split: boolean): WorkspaceLeaf {
    return this.getLeaf();
  }

  getLeavesOfType(type: string): WorkspaceLeaf[] {
    return this.leaves.filter((leaf) => leaf.getViewState().type === type);
  }

  async revealLeaf(leaf: WorkspaceLeaf): Promise<void> {
    this.revealed.push(leaf);
  }

  onLayoutReady(callback: () => void): void {
    if (this.layoutReady) callback();
    else this.layoutCallbacks.push(callback);
  }

  /** Test helper: flips layout readiness and runs queued callbacks. */
  markLayoutReady(): void {
    this.layoutReady = true;
    for (const callback of this.layoutCallbacks.splice(0)) callback();
  }
}
