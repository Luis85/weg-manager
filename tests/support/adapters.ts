import { Layer } from "effect";
import type { AppAdapters } from "../../src/application/app-services-layer";
import type { DeviceValue } from "../../src/application/shell";
import type { CalendarDay } from "../../src/domain/shell";
import {
  memoryLocalFiles,
  memoryNoteStore,
  memoryVaultFiles,
  sequentialIdGenerator,
} from "../../src/infrastructure/memory/notes";
import { deviceStoreInMemory, memoryToday } from "../../src/infrastructure/memory/shell";
import {
  inMemoryStore,
  recordingClipboard,
  recordingNotifier,
  recordingSink,
  sequentialIncidents,
  testHostInfo,
  type StoreOptions,
} from "./layers";

/** The day the tests' `Today` starts on unless a test sets another. */
const TEST_TODAY: CalendarDay = "2026-11-22";

export type TestAdaptersOptions = {
  readonly store?: StoreOptions;
  /** What the device store holds at start, e.g. a stored community selection. */
  readonly device?: Readonly<Record<string, DeviceValue>>;
  /** The host event adapter; none by default, so a test publishes `VaultReady` itself. */
  readonly hostEvents?: AppAdapters["hostEvents"];
  /** The local day `Today` starts on; `TEST_TODAY` by default. */
  readonly today?: CalendarDay;
};

/**
 * In-memory adapters for every port, as `appServicesLayer` takes them, with handles to inspect
 * them: `store` (`data.json`), `notifier`, `clipboard`, `logger` (what the log sink received; the
 * runtime's logger runs in development mode, so every level), `notes`, the in-memory
 * `NoteStore`, and `today`, whose `set` makes another day the day.
 */
export const testAdapters = (options: TestAdaptersOptions = {}) => {
  const store = inMemoryStore(options.store);
  const notifier = recordingNotifier();
  const clipboard = recordingClipboard();
  const logger = recordingSink();
  const notes = memoryNoteStore();
  const files = memoryVaultFiles();
  const localFiles = memoryLocalFiles();
  const today = memoryToday(options.today ?? TEST_TODAY);
  const adapters: AppAdapters = {
    settingsStore: store.layer,
    notifier: notifier.layer,
    clipboard: clipboard.layer,
    hostInfo: testHostInfo,
    deviceStore: deviceStoreInMemory(options.device),
    incidents: sequentialIncidents(),
    logSink: logger.layer,
    today: today.layer,
    noteStore: notes.layer,
    idGenerator: sequentialIdGenerator().layer,
    noteOpener: notes.opener,
    vaultFiles: files.layer,
    localFiles: localFiles.layer,
    hostEvents: options.hostEvents ?? Layer.empty,
  };
  return { adapters, store, notifier, clipboard, logger, notes, files, localFiles, today };
};
