import { Plugin } from "obsidian";
import { probeApi, type ProbeApi } from "../../support/notes/probe-api";
import { hostEventsProbe } from "./host-events";
import { startupRecorder, type StartupRecorder } from "./startup-recorder";

/**
 * A second plugin that only the e2e suite installs (`wdio.conf.mts`). It builds real adapters
 * from `src/` on this vault, so a spec reaches them through
 * `browser.executeObsidian(({ plugins }) => plugins.noteStoreProbe.…)` without any hook in the
 * plugin itself:
 *
 * - `api`: the Obsidian `NoteStore` adapter as promise-returning calls;
 * - `startup`: how Obsidian's workspace and metadata cache got ready from this plugin's `onload`
 *   on, and when the plugin's own host event adapter, run here on a runtime of its own, published
 *   `LayoutReady` and `VaultReady`.
 *
 * `npm run build:probe` bundles it into `tests/e2e/probe-plugin/dist/`.
 */
export default class NoteStoreProbe extends Plugin {
  api: ProbeApi | undefined;
  startup: StartupRecorder | undefined;
  private events: ReturnType<typeof hostEventsProbe> | undefined;

  override onload(): void {
    const startup = startupRecorder(this.app);
    this.startup = startup;
    this.events = hostEventsProbe(this, (event) => {
      startup.event(event._tag);
    });
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
