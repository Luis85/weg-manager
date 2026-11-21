export type EventRef = { readonly off: () => void };

type Handler = (...args: unknown[]) => unknown;

/** Obsidian's `Events` mixin: `on` returns a ref that `offref` (or `Component.registerEvent`) releases. */
export class Events {
  private readonly handlers = new Map<string, Set<Handler>>();

  on(name: string, callback: Handler): EventRef {
    const set = this.handlers.get(name) ?? new Set<Handler>();
    set.add(callback);
    this.handlers.set(name, set);
    return { off: () => set.delete(callback) };
  }

  off(name: string, callback: Handler): void {
    this.handlers.get(name)?.delete(callback);
  }

  offref(ref: EventRef): void {
    ref.off();
  }

  trigger(name: string, ...args: unknown[]): void {
    // Copy first: a handler may unsubscribe while the event is dispatched.
    for (const handler of Array.from(this.handlers.get(name) ?? [])) handler(...args);
  }

  listenerCount(name?: string): number {
    if (name !== undefined) return this.handlers.get(name)?.size ?? 0;
    let total = 0;
    for (const set of this.handlers.values()) total += set.size;
    return total;
  }
}
