/** One entry of the left ribbon, as Obsidian 1.15 keeps it in `workspace.leftRibbon.items`. */
export type RibbonItem = {
  readonly id: string;
  icon: string;
  title: string;
  hidden: boolean;
  callback?: (event: MouseEvent) => unknown;
  buttonEl?: HTMLElement;
};

/**
 * The left ribbon as Obsidian 1.15.1 implements it: the item list, not the DOM, is the source of
 * truth. Removing a button element only detaches it; the next `onChange()` re-renders every item
 * that still has a `buttonEl`. Only `removeRibbonAction` (what `Plugin.addRibbonIcon` registers
 * for unload) releases an entry. Items stay in the list afterwards, without button or callback,
 * so the user's order and hidden state survive a re-enable.
 */
export class WorkspaceRibbon {
  readonly items: RibbonItem[] = [];

  addRibbonItemButton(
    id: string,
    icon: string,
    title: string,
    callback: (event: MouseEvent) => unknown,
  ): HTMLElement {
    const buttonEl = document.createElement("div");
    buttonEl.className = "side-dock-ribbon-action";
    buttonEl.setAttribute("aria-label", title);
    buttonEl.addEventListener("click", (event) => callback(event));
    const existing = this.items.find((item) => item.id === id);
    const item: RibbonItem = existing ?? { id, icon, title, hidden: false };
    Object.assign(item, { icon, title, callback, buttonEl });
    if (existing === undefined) this.items.push(item);
    this.onChange();
    return buttonEl;
  }

  removeRibbonAction(id: string): void {
    const item = this.items.find((entry) => entry.id === id);
    if (item === undefined) return;
    delete item.buttonEl;
    delete item.callback;
  }

  /** Re-renders the ribbon: every visible item's button is attached again. */
  onChange(): void {
    for (const item of this.items) {
      if (item.buttonEl === undefined) continue;
      if (item.hidden) item.buttonEl.remove();
      else if (!item.buttonEl.isConnected) document.body.append(item.buttonEl);
    }
  }
}
