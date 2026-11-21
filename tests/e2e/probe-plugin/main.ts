import { Plugin } from "obsidian";
import { probeApi, type ProbeApi } from "../../support/notes/probe-api";

/**
 * A second plugin that only the e2e suite installs (`wdio.conf.mts`): it builds the real Obsidian
 * `NoteStore` adapter on this vault and exposes it as `api`, so a spec can call it through
 * `browser.executeObsidian(({ plugins }) => plugins.noteStoreProbe.api.…)`. The plugin itself has
 * no such hook. `npm run build:probe` bundles it into `tests/e2e/probe-plugin/dist/`.
 */
export default class NoteStoreProbe extends Plugin {
  api: ProbeApi | undefined;

  override onload(): void {
    this.api = probeApi(this.app);
  }

  override onunload(): void {
    void this.api?.dispose();
    this.api = undefined;
  }
}
