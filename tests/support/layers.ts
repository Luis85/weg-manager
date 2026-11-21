import { Effect, Layer } from "effect";
import { ClipboardError, StorageError, VaultReadError } from "../../src/application/errors";
import { EventBus, EventBusLive } from "../../src/application/event-bus";
import type { AppEvent } from "../../src/application/events";
import { messagesLayer } from "../../src/application/i18n";
import {
  Clipboard,
  HostInfo,
  Incidents,
  LogSink,
  Logger,
  Notifier,
  SettingsStore,
  VaultReader,
  type LogEntry,
} from "../../src/application/ports";
import type { UserMessage } from "../../src/application/user-messages";

/** A gate that holds an effect until `release()`; `held()` counts waiting effects. */
const gate = () => {
  let open = true;
  let waiting: (() => void)[] = [];
  const pass = Effect.callback<void>((resume) => {
    if (open) return resume(Effect.void);
    waiting.push(() => resume(Effect.void));
  });
  return {
    pass,
    hold: () => {
      open = false;
    },
    release: () => {
      open = true;
      const queued = waiting;
      waiting = [];
      for (const resume of queued) resume();
    },
    held: () => waiting.length,
  };
};

export type StoreOptions = {
  readonly initial?: unknown;
  readonly failLoad?: boolean;
  readonly failSave?: boolean;
};

/**
 * A settings store backed by memory; `saved()` lists every value written, in order.
 * `writeExternally` replaces the content as Sync or another program would, without a save.
 */
export const inMemoryStore = (options: StoreOptions = {}) => {
  const saved: unknown[] = [];
  const saves = gate();
  let stored = options.initial;
  let failLoad = options.failLoad ?? false;
  let failSave = options.failSave ?? false;
  const layer = Layer.succeed(SettingsStore)({
    load: Effect.suspend(() =>
      failLoad
        ? Effect.fail(new StorageError({ cause: new Error("load failed") }))
        : Effect.sync(() => stored),
    ),
    save: (data: unknown) =>
      Effect.andThen(
        saves.pass,
        Effect.suspend(() =>
          failSave
            ? Effect.fail(new StorageError({ cause: new Error("save failed") }))
            : Effect.sync(() => {
                saved.push(data);
                stored = data;
              }),
        ),
      ),
  });
  return {
    layer,
    saved: () => [...saved],
    writeExternally: (data: unknown) => {
      stored = data;
    },
    setFailLoad: (value: boolean) => {
      failLoad = value;
    },
    /** Holds every save until `releaseSaves()`. */
    holdSaves: saves.hold,
    releaseSaves: saves.release,
    setFailSave: (value: boolean) => {
      failSave = value;
    },
  };
};

/** Records every notification instead of showing it. */
export const recordingNotifier = () => {
  const messages: UserMessage[] = [];
  const layer = Layer.succeed(Notifier)({
    notify: (message: UserMessage) =>
      Effect.sync(() => {
        messages.push(message);
      }),
  });
  return { layer, messages: () => [...messages] };
};

/** A vault whose markdown file count is fixed, failing, or changed by the test. */
export const controllableVault = (initial: number | "fail") => {
  let state = initial;
  const reads = gate();
  const layer = Layer.succeed(VaultReader)({
    markdownFileCount: Effect.andThen(
      reads.pass,
      Effect.suspend(() =>
        state === "fail"
          ? Effect.fail(new VaultReadError({ cause: new Error("vault unavailable") }))
          : Effect.succeed(state),
      ),
    ),
  });
  return {
    layer,
    /** Holds every read until `release()`; `held()` counts waiting reads. */
    hold: reads.hold,
    release: reads.release,
    held: reads.held,
    set: (next: number | "fail") => {
      state = next;
    },
  };
};

export const fixedVault = (count: number | "fail") => controllableVault(count).layer;

/** A logger that records every entry regardless of level (for code that only emits logs). */
export const recordingLogger = () => {
  const entries: LogEntry[] = [];
  const layer = Layer.succeed(Logger)({
    log: (entry: LogEntry) =>
      Effect.sync(() => {
        entries.push(entry);
      }),
    recent: Effect.sync(() => entries.map((entry) => ({ ...entry, at: 0 }))),
  });
  return { layer, entries: () => [...entries] };
};

/** A log sink that records what the application logger forwards. */
export const recordingSink = () => {
  const entries: LogEntry[] = [];
  const layer = Layer.succeed(LogSink)({
    write: (entry: LogEntry) => {
      entries.push(entry);
    },
  });
  return { layer, entries: () => [...entries] };
};

/** Incident ids `T-1`, `T-2`, … */
export const sequentialIncidents = () => {
  let next = 0;
  return Layer.succeed(Incidents)({
    nextId: Effect.sync(() => {
      next += 1;
      return `T-${next}`;
    }),
  });
};

export const recordingClipboard = (options: { readonly fail?: boolean } = {}) => {
  const writes: string[] = [];
  const layer = Layer.succeed(Clipboard)({
    write: (text: string) =>
      options.fail
        ? Effect.fail(new ClipboardError({ cause: new Error("clipboard blocked") }))
        : Effect.sync(() => {
            writes.push(text);
          }),
  });
  return { layer, writes: () => [...writes] };
};

/** The German catalog: the product's primary language, so the exact-text tests pin German. */
export const testMessages = messagesLayer("de");

export const testHostInfo = Layer.succeed(HostInfo)({
  pluginVersion: "0.1.0",
  apiVersion: "1.15.1",
  platform: "test",
});

/** The real `EventBusLive`, recording every published event; `failNextPublish` makes one publish die. */
export const recordingEventBus = () => {
  const published: AppEvent[] = [];
  let failNext = false;
  const layer = Layer.effect(
    EventBus,
    EventBus.useSync((bus) =>
      EventBus.of({
        ...bus,
        publish: (event) =>
          Effect.suspend(() => {
            if (failNext) {
              failNext = false;
              return Effect.die(new Error("publish failed"));
            }
            published.push(event);
            return bus.publish(event);
          }),
      }),
    ),
  ).pipe(Layer.provideMerge(EventBusLive));
  return {
    layer,
    published: () => [...published],
    failNextPublish: () => {
      failNext = true;
    },
  };
};
