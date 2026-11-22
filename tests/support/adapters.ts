import { Layer } from "effect";
import type { AppAdapters } from "../../src/application/app-services-layer";
import type { DeviceValue } from "../../src/application/shell";
import { memoryNoteStore, sequentialIdGenerator } from "../../src/infrastructure/memory/notes";
import { deviceStoreInMemory } from "../../src/infrastructure/memory/shell";
import {
  inMemoryStore,
  recordingClipboard,
  recordingNotifier,
  recordingSink,
  sequentialIncidents,
  testHostInfo,
  type StoreOptions,
} from "./layers";

export type TestAdaptersOptions = {
  readonly store?: StoreOptions;
  /** What the device store holds at start, e.g. a stored community selection. */
  readonly device?: Readonly<Record<string, DeviceValue>>;
  /** The host event adapter; none by default, so a test publishes `VaultReady` itself. */
  readonly hostEvents?: AppAdapters["hostEvents"];
};

/**
 * In-memory adapters for every port, as `appServicesLayer` takes them, with handles to inspect
 * them: `store` (`data.json`), `notifier`, `clipboard`, `logger` (what the log sink received; the
 * runtime's logger runs in development mode, so every level), and `notes`, the in-memory
 * `NoteStore`.
 */
export const testAdapters = (options: TestAdaptersOptions = {}) => {
  const store = inMemoryStore(options.store);
  const notifier = recordingNotifier();
  const clipboard = recordingClipboard();
  const logger = recordingSink();
  const notes = memoryNoteStore();
  const adapters: AppAdapters = {
    settingsStore: store.layer,
    notifier: notifier.layer,
    clipboard: clipboard.layer,
    hostInfo: testHostInfo,
    deviceStore: deviceStoreInMemory(options.device),
    incidents: sequentialIncidents(),
    logSink: logger.layer,
    noteStore: notes.layer,
    idGenerator: sequentialIdGenerator().layer,
    hostEvents: options.hostEvents ?? Layer.empty,
  };
  return { adapters, store, notifier, clipboard, logger, notes };
};
