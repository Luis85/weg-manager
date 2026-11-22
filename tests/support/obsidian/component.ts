import type * as Obsidian from "obsidian";
import type { Uses } from "./conformance";
import type { EventRef } from "./events";

/** Mirrors Obsidian's `Component` lifecycle: unload runs `onunload`, then registrations in reverse order. */
export class Component implements Uses<
  Obsidian.Component,
  | "load"
  | "unload"
  | "onunload"
  | "addChild"
  | "removeChild"
  | "register"
  | "registerEvent"
  | "registerInterval"
> {
  private loaded = false;
  private readonly children: Component[] = [];
  private cleanups: (() => unknown)[] = [];
  /** Test helper: what the last `onload` returned (Obsidian awaits a plugin's async onload). */
  lastOnloadResult: void | Promise<void> = undefined;

  load(): void {
    if (this.loaded) return;
    this.loaded = true;
    this.lastOnloadResult = this.onload();
    for (const child of this.children) child.load();
  }

  onload(): void | Promise<void> {}

  unload(): void {
    if (!this.loaded) return;
    this.loaded = false;
    for (const child of this.children.toReversed()) child.unload();
    this.children.length = 0;
    this.onunload();
    const cleanups = this.cleanups.toReversed();
    this.cleanups = [];
    for (const cleanup of cleanups) cleanup();
  }

  onunload(): void {}

  get isLoaded(): boolean {
    return this.loaded;
  }

  addChild<T extends Component>(component: T): T {
    this.children.push(component);
    if (this.loaded) component.load();
    return component;
  }

  removeChild<T extends Component>(component: T): T {
    const index = this.children.indexOf(component);
    if (index !== -1) this.children.splice(index, 1);
    component.unload();
    return component;
  }

  register(cleanup: () => unknown): void {
    this.cleanups.push(cleanup);
  }

  registerEvent(ref: EventRef): void {
    this.register(() => ref.e.offref(ref));
  }

  registerDomEvent(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void {
    target.addEventListener(type, listener, options);
    this.register(() => target.removeEventListener(type, listener, options));
  }

  registerInterval(id: number): number {
    this.register(() => clearInterval(id));
    return id;
  }

  /** Test helper: number of registrations that unload would still release. */
  get pendingCleanups(): number {
    return this.cleanups.length;
  }
}
