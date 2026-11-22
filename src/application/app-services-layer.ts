import { Layer } from "effect";
import type { AppServices } from "./app-services";
import { messagesLayer } from "./messages";
import { servicesLayerOf } from "./module";
import { APP_MODULES } from "./modules";
import { appNoteTypes } from "./note-types";
import {
  noteIndexLayer,
  type IdGenerator,
  type NoteOpener,
  type NoteStore,
  type NoteTypeRegistry,
} from "./notes";
import {
  EventBusLive,
  LoggerLive,
  SettingsServiceLive,
  type Clipboard,
  type DeviceStore,
  type HostInfo,
  type Incidents,
  type Language,
  type LogSink,
  type LoggerOptions,
  type Notifier,
  type SettingsStore,
  type ShellServices,
} from "./shell";

/**
 * What a host supplies to run the plugin: one adapter Layer per port (ADR 0002). The plugin gives
 * Obsidian's (`appLayer`), the harness the browser's, the tests in-memory ones; the services built
 * on them are the same everywhere (`appServicesLayer`). A new port is one field here, and each of
 * the three fails typecheck until it supplies an adapter.
 */
export type AppAdapters = {
  /** `data.json`. */
  readonly settingsStore: Layer.Layer<SettingsStore>;
  readonly notifier: Layer.Layer<Notifier>;
  readonly clipboard: Layer.Layer<Clipboard>;
  /** Plugin version, API version and platform, for the diagnostics. */
  readonly hostInfo: Layer.Layer<HostInfo>;
  readonly deviceStore: Layer.Layer<DeviceStore>;
  readonly incidents: Layer.Layer<Incidents>;
  /** Where the logger writes the entries it accepts. */
  readonly logSink: Layer.Layer<LogSink>;
  /** Built on the shell's services: the in-memory store publishes its writes on the event bus. */
  readonly noteStore: Layer.Layer<NoteStore, never, ShellServices>;
  readonly idGenerator: Layer.Layer<IdGenerator>;
  /** Opens a note for the user in the host, beside the plugin's view. */
  readonly noteOpener: Layer.Layer<NoteOpener>;
  /**
   * Publishes the host's events. Built last, so every service that subscribes to the event bus
   * while it is built (the note index) sees `LayoutReady` and `VaultReady`, which the adapter may
   * publish while it is built itself.
   */
  readonly hostEvents: Layer.Layer<never, never, ShellServices>;
};

export type AppServicesOptions = LoggerOptions & {
  /** The UI language of this load; it picks the `Messages` catalog. */
  readonly language: Language;
  /** The note types the index holds: the plugin's own (`appNoteTypes`) unless a test sets them. */
  readonly noteTypes?: NoteTypeRegistry;
};

/**
 * Every application service of one load, built from the host's adapters (ADR 0006): the shell's
 * services first (settings, then the logger on them, the event bus), the notes module's on them,
 * the feature modules' Layers from their manifests on both, the host event adapter last. Typed
 * `Layer<AppServices>`: a feature service that needs a service no module built before it fails
 * typecheck here, in one place.
 */
export const appServicesLayer = (
  adapters: AppAdapters,
  options: AppServicesOptions,
): Layer.Layer<AppServices> => {
  const ports = Layer.mergeAll(
    adapters.settingsStore,
    adapters.notifier,
    adapters.clipboard,
    adapters.hostInfo,
    adapters.deviceStore,
    adapters.incidents,
    messagesLayer(options.language),
  );
  const settings = SettingsServiceLive.pipe(Layer.provideMerge(ports));
  const logger = LoggerLive(options).pipe(Layer.provide(adapters.logSink));
  const shell = Layer.mergeAll(logger.pipe(Layer.provideMerge(settings)), EventBusLive);
  const notes = noteIndexLayer(options.noteTypes ?? appNoteTypes).pipe(
    Layer.provideMerge(
      Layer.mergeAll(adapters.noteStore, adapters.idGenerator, adapters.noteOpener).pipe(
        Layer.provideMerge(shell),
      ),
    ),
  );
  const features = servicesLayerOf(APP_MODULES).pipe(Layer.provideMerge(notes));
  return adapters.hostEvents.pipe(Layer.provideMerge(features));
};
