import type { App, EventRef } from "obsidian";
import type { Step } from "./scenario-context";

type VaultEvent = "create" | "modify" | "delete" | "rename";
type CacheEvent = "changed" | "resolve" | "resolved" | "deleted";

/** Which events a scenario records, and how it names the metadata cache's. */
export type RecorderOptions = {
  readonly vault?: readonly VaultEvent[];
  readonly cache?: readonly CacheEvent[];
  /** Put before a metadata cache event's name: `metadataCache:` gives `metadataCache:changed A.md`. */
  readonly cachePrefix?: string;
};

/** The note a fence edits; its own events are never recorded. */
const SENTINEL = "Zaun.md";

/**
 * Records the vault's and the metadata cache's events step by step, for the fidelity scenarios.
 * The probe plugin hands it to a scenario in real Obsidian (`plugins.noteStoreProbe.recorder`),
 * and the unit tests on the double, so both worlds record the same way.
 *
 * A step ends on a fence, never on a timer: `fence()` writes a new text into `Zaun.md` and waits
 * for that text's `changed`, the sentinel's `resolve` and the `resolved` after it. Obsidian's
 * metadata cache parses files in the order they were written and resolves them in the same order,
 * so by then every event the step caused has fired, however long it took (measured in 1.15.1:
 * `resolve` may lag behind the next file's `changed`, which is why the fence waits for the
 * sentinel's `resolve` and not its `changed`). Only events of the vault's own writes are fenced:
 * the file watcher's reports of outside changes come on their own time.
 */
export const eventRecorder = (app: App, options: RecorderOptions) => {
  const events: string[] = [];
  let recording = false;
  const fenceState = {
    mark: null as string | null,
    changed: false,
    resolve: false,
    wake: (): void => undefined,
  };
  const record = (path: string, event: string) => {
    if (recording && path !== SENTINEL) events.push(event);
  };
  const named = (event: string, path: string) =>
    `${options.cachePrefix ?? ""}${event}${path === "" ? "" : ` ${path}`}`;
  const vaultRef = (event: VaultEvent): EventRef => {
    switch (event) {
      case "create":
        return app.vault.on("create", (file) => record(file.path, `vault:create ${file.path}`));
      case "modify":
        return app.vault.on("modify", (file) => record(file.path, `vault:modify ${file.path}`));
      case "delete":
        return app.vault.on("delete", (file) => record(file.path, `vault:delete ${file.path}`));
      case "rename":
        return app.vault.on("rename", (file, old) =>
          record(file.path, `vault:rename ${old} -> ${file.path}`),
        );
    }
  };
  const cacheRef = (event: CacheEvent): EventRef => {
    switch (event) {
      case "changed":
        return app.metadataCache.on("changed", (file) =>
          record(file.path, named("changed", file.path)),
        );
      case "resolve":
        return app.metadataCache.on("resolve", (file) =>
          record(file.path, named("resolve", file.path)),
        );
      case "resolved":
        return app.metadataCache.on("resolved", () => record("", named("resolved", "")));
      case "deleted":
        return app.metadataCache.on("deleted", (file) =>
          record(file.path, named("deleted", file.path)),
        );
    }
  };
  const vaultRefs = (options.vault ?? []).map(vaultRef);
  const cacheRefs = [
    ...(options.cache ?? []).map(cacheRef),
    app.metadataCache.on("changed", (file, data) => {
      if (file.path === SENTINEL && data === fenceState.mark) fenceState.changed = true;
    }),
    app.metadataCache.on("resolve", (file) => {
      if (file.path !== SENTINEL || !fenceState.changed) return;
      fenceState.resolve = true;
      recording = false;
    }),
    app.metadataCache.on("resolved", () => {
      if (fenceState.resolve) fenceState.wake();
    }),
  ];

  const fence = async (): Promise<void> => {
    const sentinel = app.vault.getFileByPath(SENTINEL) ?? (await app.vault.create(SENTINEL, ""));
    await new Promise<void>((wake) => {
      Object.assign(fenceState, { mark: null, changed: false, resolve: false });
      fenceState.wake = wake;
      // A text the sentinel has never held, whoever fenced last: its own text and one more dot.
      app.vault
        .process(sentinel, (text) => {
          fenceState.mark = `${text}.`;
          return fenceState.mark;
        })
        .catch(() => wake());
    });
    recording = false;
  };

  /** Runs one step: its result, and its events up to the fence, `done` where its promise settled. */
  const step = async <A>(
    run: () => Promise<A>,
    keep: (event: string) => boolean = () => true,
  ): Promise<Step<A>> => {
    events.length = 0;
    recording = true;
    const result = await run();
    events.push("done");
    await fence();
    return { result, events: events.filter(keep) };
  };

  return {
    fence,
    step,
    dispose: () => {
      for (const ref of vaultRefs) app.vault.offref(ref);
      for (const ref of cacheRefs) app.metadataCache.offref(ref);
    },
  };
};

export type EventRecorder = ReturnType<typeof eventRecorder>;
