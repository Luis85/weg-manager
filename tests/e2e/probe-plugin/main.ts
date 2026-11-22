import { Plugin } from "obsidian";
import { probeApi, type ProbeApi } from "../../support/notes/probe-api";
import { eventRecorder, type RecorderOptions } from "../../support/notes/recorder";
import { hostEventsProbe } from "./host-events";
import { startupRecorder, type StartupRecorder } from "./startup-recorder";

/**
 * A second plugin that only the e2e suite installs (`wdio.conf.mts`). It builds real adapters
 * from `src/` on this vault, so a spec reaches them through
 * `browser.executeObsidian(({ plugins }) => plugins.noteStoreProbe.…)` without any hook in the
 * plugin itself:
 *
 * - `api`: the Obsidian `NoteStore` adapter as promise-returning calls;
 * - `recorder`: the fidelity scenarios' event recorder on this app (`tests/support/notes/recorder.ts`);
 * - `startup`: how Obsidian's workspace and metadata cache got ready from this plugin's `onload`
 *   on, and when the plugin's own host event adapter, run here on a runtime of its own, published
 *   `LayoutReady` and `VaultReady`, and when the note index on that runtime was first ready
 *   (`index:ready`);
 * - `events`: that runtime's note index for the reference vault's two types: counts, and the
 *   moment an edit shows in its snapshot.
 *
 * `npm run build:probe` bundles it into `tests/e2e/probe-plugin/dist/`.
 */
export default class NoteStoreProbe extends Plugin {
  api: ProbeApi | undefined;
  readonly recorder = (options: RecorderOptions) => eventRecorder(this.app, options);
  startup: StartupRecorder | undefined;
  /** The host event adapter and the note index on the probe's runtime. */
  events: ReturnType<typeof hostEventsProbe> | undefined;

  override onload(): void {
    const startup = startupRecorder(this.app);
    this.startup = startup;
    this.events = hostEventsProbe(
      this,
      (event) => {
        startup.event(event._tag);
      },
      () => {
        startup.mark("index:ready");
      },
    );
    this.api = probeApi(this.app);
  }

  override onunload(): void {
    void this.events?.dispose();
    this.events = undefined;
    this.startup?.dispose();
    this.startup = undefined;
    void this.api?.dispose();
    this.api = undefined;
  }
}
