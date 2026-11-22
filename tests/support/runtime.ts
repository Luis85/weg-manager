import { Effect, ManagedRuntime } from "effect";
import type { AppRuntime } from "../../src/application/app-services";
import { appServicesLayer } from "../../src/application/app-services-layer";
import { AppEvent } from "../../src/application/events";
import { appNoteTypes } from "../../src/application/note-types";
import type { NoteTypeRegistry } from "../../src/application/notes";
import { EventBus } from "../../src/application/shell/event-bus";
import type { Language } from "../../src/application/shell/i18n/catalog";
import { testAdapters, type TestAdaptersOptions } from "./adapters";
import { controllableRead } from "./layers";

export type TestRuntimeOptions = Omit<TestAdaptersOptions, "hostEvents"> & {
  /** What `source.read` gives: a number or a `VaultReadError`; 3 by default. */
  readonly source?: number | "fail";
  /** The UI language; German by default, so the exact-text tests pin the product's language. */
  readonly language?: Language;
  /** Note types the index holds beside the plugin's own (`appNoteTypes`), e.g. test types. */
  readonly noteTypes?: NoteTypeRegistry;
};

/**
 * An `AppRuntime` built as the plugin builds it (`appServicesLayer`), over the in-memory adapters
 * (`testAdapters`), plus handles to inspect them. No host event adapter runs: `vaultReady()`
 * publishes what it would once Obsidian's cache holds every note.
 */
export const testRuntime = (options: TestRuntimeOptions = {}) => {
  const { adapters, ...handles } = testAdapters(options);
  const source = controllableRead(options.source ?? 3);
  const runtime: AppRuntime = ManagedRuntime.make(
    appServicesLayer(adapters, {
      language: options.language ?? "de",
      developmentMode: true,
      noteTypes: [...appNoteTypes, ...(options.noteTypes ?? [])],
    }),
  );
  const vaultReady = () =>
    runtime.runPromise(
      EventBus.use((bus) =>
        Effect.andThen(bus.publish(AppEvent.LayoutReady()), bus.publish(AppEvent.VaultReady())),
      ),
    );
  return { runtime, source, vaultReady, ...handles };
};
