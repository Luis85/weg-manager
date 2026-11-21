type Handler = (...args: unknown[]) => unknown;

/** As in Obsidian 1.15.1: the ref knows its emitter (`e`), so `Component.registerEvent` can release it. */
export type EventRef = { readonly e: Events; readonly name: string; readonly fn: Handler };

/**
 * Obsidian's `Events` mixin as 1.15.1 implements it: `on` returns a ref, `offref` removes exactly
 * that ref (by identity) and does nothing for a ref that is already gone, so releasing a ref twice,
 * through `offref` and through `Component.registerEvent`, is harmless.
 */
export class Events {
  private readonly handlers = new Map<string, EventRef[]>();

  on(name: string, callback: Handler): EventRef {
    const ref: EventRef = { e: this, name, fn: callback };
    this.handlers.set(name, [...(this.handlers.get(name) ?? []), ref]);
    return ref;
  }

  off(name: string, callback: Handler): void {
    const remaining = (this.handlers.get(name) ?? []).filter((ref) => ref.fn !== callback);
    this.store(name, remaining);
  }

  offref(ref: EventRef): void {
    const remaining = (this.handlers.get(ref.name) ?? []).filter((entry) => entry !== ref);
    this.store(ref.name, remaining);
  }

  trigger(name: string, ...args: unknown[]): void {
    // `on`, `off` and `offref` replace the array, so a handler may unsubscribe while dispatching.
    for (const ref of this.handlers.get(name) ?? []) ref.fn(...args);
  }

  listenerCount(name?: string): number {
    if (name !== undefined) return this.handlers.get(name)?.length ?? 0;
    let total = 0;
    for (const refs of this.handlers.values()) total += refs.length;
    return total;
  }

  private store(name: string, refs: EventRef[]): void {
    if (refs.length > 0) this.handlers.set(name, refs);
    else this.handlers.delete(name);
  }
}
