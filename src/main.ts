import { Plugin } from "obsidian";
import { bootstrap, reportUnloadFailure, type BootstrapHandle } from "./bootstrap";
import "./styles/app.css";

/** Composition only: start the shell on load, release it on unload. */
export default class WegManagerPlugin extends Plugin {
  private handle: Promise<BootstrapHandle> | undefined;
  private abort: AbortController | undefined;

  override async onload(): Promise<void> {
    this.abort = new AbortController();
    this.handle = bootstrap(this, { signal: this.abort.signal });
    await this.handle;
  }

  /**
   * Obsidian calls this when `data.json` changed on disk outside Obsidian (Sync, another program),
   * then refreshes the settings tab. Waits for a load still in progress; after an unload or a
   * failed load there is nothing to reload.
   */
  override async onExternalSettingsChange(): Promise<void> {
    const handle = await this.handle?.catch(() => undefined);
    await handle?.reloadSettings();
  }

  override onunload(): void {
    this.abort?.abort();
    const handle = this.handle;
    this.handle = undefined;
    // A failed bootstrap has already reported itself; only a failing dispose is reported here.
    void handle?.then(
      (started) => started.dispose().catch(reportUnloadFailure),
      () => undefined,
    );
  }
}
