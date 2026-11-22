import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import type { TFile } from "obsidian";
import { VANISHED_FACTS, vanishedScenario } from "../../support/notes/vanished-scenario";
import type { Outcome, ProbeApi } from "../../support/notes/probe-api";
import { installConsoleSpy, pluginProblems } from "../support";

type Probe = { readonly api?: ProbeApi };

/**
 * A note deleted from outside Obsidian (a person, Sync, an agent) while Obsidian still lists it:
 * the first write to it must say "note not found", not "write failed, try again".
 */
describe("a note deleted while Obsidian still lists it", function () {
  this.timeout(60_000);

  it("rejects vault.process with Node's ENOENT while the vault lists the file", async function () {
    await installConsoleSpy();
    const report = await browser.executeObsidian(vanishedScenario);
    expect(report).toEqual(VANISHED_FACTS);
  });

  it("makes the NoteStore adapter report NoteNotFoundError at the first attempt", async function () {
    // The window is the few milliseconds before the file watcher reports the delete, too short to
    // aim at from outside, so the vault is held at what it lists in that window: the file. What
    // `vault.process` does with the deleted file is Obsidian's own.
    const outcome = await browser.executeObsidian(async ({ app, plugins }, path) => {
      const api = (plugins as unknown as { noteStoreProbe?: { api?: unknown } }).noteStoreProbe
        ?.api as Probe["api"];
      if (api === undefined) throw new Error("the probe plugin is not loaded");
      type NodeRequire = (name: string) => {
        writeFileSync(path: string, text: string): void;
        unlinkSync(path: string): void;
        join(...parts: string[]): string;
      };
      const nodeRequire = (window as unknown as { require: NodeRequire }).require;
      const basePath = (app.vault.adapter as unknown as { basePath: string }).basePath;
      const onDisk = nodeRequire("path").join(basePath, path);
      // Written from outside and indexed first, so Obsidian's watcher has done with the file
      // (a note created through the vault and deleted at once can still be read by it, which
      // rejects with ENOENT, unhandled).
      const file = await new Promise<TFile>((done) => {
        const ref = app.metadataCache.on("changed", (changed) => {
          if (changed.path !== path) return;
          app.metadataCache.offref(ref);
          done(changed);
        });
        nodeRequire("fs").writeFileSync(onDisk, "---\na: 1\n---\n");
      });
      nodeRequire("fs").unlinkSync(onDisk);
      const listed = app.vault.getFileByPath.bind(app.vault);
      app.vault.getFileByPath = (wanted) => (wanted === path ? file : listed(wanted));
      try {
        return await api.update(path, { set: { a: 2 } });
      } finally {
        delete (app.vault as unknown as { getFileByPath?: unknown }).getFileByPath;
      }
    }, "Weg.md");
    expect(outcome as Outcome<unknown>).toEqual({ ok: false, tag: "NoteNotFoundError" });
    expect(await pluginProblems()).toEqual([]);
  });
});
