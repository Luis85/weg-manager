import type { App } from "obsidian";
import type { ProbeApi } from "./probe-api";
import type { EventRecorder, RecorderOptions } from "./recorder";

/**
 * What a fidelity scenario gets: in real Obsidian the context `browser.executeObsidian` hands its
 * function, on the double an `App` of the double with the double's module and a stand-in for the
 * probe plugin. Types only: a scenario is serialised, so it may not import values; what it shares
 * with the other scenarios comes through the probe (`ScenarioProbe`).
 */
export type ScenarioContext = {
  readonly app: App;
  readonly obsidian: {
    normalizePath(path: string): string;
    stringifyYaml(value: unknown): string;
    parseYaml(yaml: string): unknown;
  };
  readonly plugins: unknown;
};

/** What the probe plugin (`plugins.noteStoreProbe`) gives a scenario, in both worlds. */
export type ScenarioProbe = {
  /** The real Obsidian `NoteStore` adapter as promise-returning calls (`probe-api.ts`). */
  readonly api: ProbeApi;
  /** A recorder of vault and metadata cache events on this app (`recorder.ts`). */
  readonly recorder: (options: RecorderOptions) => EventRecorder;
};

/**
 * One step of a scenario: what the call returned and every event, in order, until the step's
 * fence (`eventRecorder`). `done` in `events` marks where the call's promise settled.
 */
export type Step<A> = { readonly result: A; readonly events: readonly string[] };
