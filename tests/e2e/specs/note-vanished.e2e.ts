import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
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
    const report = await browser.executeObsidian(vanishedScenario, 300);
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
      const file = await app.vault.create(path, "---\na: 1\n---\n");
      await new Promise((resolve) => setTimeout(resolve, 300));
      type NodeRequire = (name: string) => {
        unlinkSync(path: string): void;
        join(...parts: string[]): string;
      };
      const nodeRequire = (window as unknown as { require: NodeRequire }).require;
      const basePath = (app.vault.adapter as unknown as { basePath: string }).basePath;
      nodeRequire("fs").unlinkSync(nodeRequire("path").join(basePath, path));
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
