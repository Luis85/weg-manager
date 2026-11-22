import type { App } from "./app";
import { Events } from "./events";
import { WorkspaceRibbon } from "./ribbon";
import { WorkspaceLeaf, type View, type ViewCreator, type ViewState } from "./views";

type LeafRequest = boolean | "tab" | "split" | "window" | undefined;

/** What `getLayout` gives and `changeLayout` takes in the double: the tabs, and the active one. */
type Layout = { readonly leaves: readonly ViewState[]; readonly active: number };

const isLayout = (value: unknown): value is Layout =>
  typeof value === "object" && value !== null && "leaves" in value && "active" in value;

/**
 * Obsidian's workspace as 1.15.1 behaves for what the plugin does with it (checked by
 * `tests/support/workspace-scenario.ts` in the app), one tab group of the main area:
 *
 * - It starts with one new tab (`empty`), the active leaf.
 * - `getLeaf(false)` is the active leaf when that is navigable (a new tab, a note), else a new
 *   tab; `getLeaf(true)` and `getLeaf("tab")` reuse the active leaf when it is a new tab, else
 *   open one. A tab they open becomes the active leaf.
 * - `setViewState({ active: true })` and `openFile(file, { active: true })` make the leaf active;
 *   `revealLeaf` brings a leaf to the front and builds a deferred view, but leaves the active leaf
 *   as it is.
 * - `changeLayout(getLayout())` closes every view and restores the tabs: the active one built, the
 *   others deferred (since Obsidian 1.7 a background tab's view is built when it is shown).
 *
 * Not modelled: tab groups, splits, sidebars and pop-out windows (`WorkspaceLeaf.openIn` puts a
 * leaf in another document, nothing more), and Obsidian's own layout format.
 */
export class Workspace extends Events {
  readonly leaves: WorkspaceLeaf[] = [];
  readonly revealed: WorkspaceLeaf[] = [];
  readonly leftRibbon = new WorkspaceRibbon();
  private active: WorkspaceLeaf | null = null;
  private started = false;
  private readonly creators = new Map<string, ViewCreator>();
  layoutReady = true;
  private readonly layoutCallbacks: (() => void)[] = [];
  /** Test helper: how often `requestSaveLayout` was called. */
  layoutSaves = 0;
  /** Obsidian debounces the save; the double counts the requests. */
  readonly requestSaveLayout = Object.assign(
    () => {
      this.layoutSaves += 1;
    },
    { cancel: () => undefined, run: () => undefined },
  );

  constructor(readonly app: App) {
    super();
  }

  /** The active leaf; at first the new tab Obsidian starts with (made when first asked for). */
  get activeLeaf(): WorkspaceLeaf | null {
    this.start();
    return this.active;
  }

  set activeLeaf(leaf: WorkspaceLeaf | null) {
    this.started = true;
    this.active = leaf;
  }

  /** The new tab Obsidian starts with, made lazily: only a test with a DOM has leaves. */
  private start(): void {
    if (this.started || typeof document === "undefined") return;
    this.started = true;
    this.active = this.addLeaf(new WorkspaceLeaf(this));
  }

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
    if (this.activeLeaf === leaf) this.activeLeaf = this.leaves.at(-1) ?? null;
  }

  /** Test helper: what each `getLeaf` call asked for, in order. */
  readonly leafRequests: LeafRequest[] = [];

  getLeaf(newLeaf?: LeafRequest): WorkspaceLeaf {
    this.leafRequests.push(newLeaf);
    const active = this.activeLeaf;
    const type = active?.getViewState().type;
    const reuse =
      newLeaf === undefined || newLeaf === false
        ? active !== null && active.view.navigation
        : (newLeaf === true || newLeaf === "tab") && type === "empty";
    if (reuse && active !== null) return active;
    const leaf = this.addLeaf(new WorkspaceLeaf(this));
    this.activeLeaf = leaf;
    return leaf;
  }

  getRightLeaf(_split: boolean): WorkspaceLeaf {
    return this.addLeaf(new WorkspaceLeaf(this));
  }

  getLeavesOfType(type: string): WorkspaceLeaf[] {
    if (type === "empty") this.start();
    return this.leaves.filter((leaf) => leaf.getViewState().type === type);
  }

  iterateAllLeaves(callback: (leaf: WorkspaceLeaf) => unknown): void {
    this.start();
    for (const leaf of this.leaves.slice()) callback(leaf);
  }

  /** The active leaf's view when it is a `type`, as Obsidian's `getActiveViewOfType`. */
  getActiveViewOfType<T extends View>(type: abstract new (...args: never[]) => T): T | null {
    const view = this.activeLeaf?.view;
    return view instanceof type ? view : null;
  }

  setActiveLeaf(leaf: WorkspaceLeaf, _params?: { readonly focus?: boolean }): void {
    if (this.leaves.includes(leaf)) this.activeLeaf = leaf;
  }

  async revealLeaf(leaf: WorkspaceLeaf): Promise<void> {
    this.revealed.push(leaf);
    await leaf.loadIfDeferred();
  }

  getLayout(): Record<string, unknown> {
    const active = this.activeLeaf === null ? -1 : this.leaves.indexOf(this.activeLeaf);
    return { leaves: this.leaves.map((leaf) => leaf.getViewState()), active };
  }

  async changeLayout(layout: unknown): Promise<void> {
    if (!isLayout(layout)) throw new Error("test double: not a layout from getLayout");
    await Promise.all([...this.leaves].map((leaf) => leaf.detach()));
    const restored = layout.leaves.map((saved, index) =>
      index === layout.active
        ? this.addLeaf(new WorkspaceLeaf(this))
        : WorkspaceLeaf.deferred(this, saved),
    );
    const active = restored[layout.active];
    const saved = layout.leaves[layout.active];
    if (active !== undefined && saved !== undefined) {
      await active.setViewState({ ...saved, active: true });
    }
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
