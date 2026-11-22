import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import type { TFile } from "obsidian";
import { VANISHED_FACTS, vanishedScenario } from "../../support/notes/vanished-scenario";
import type { Outcome, ProbeApi } from "../../support/notes/probe-api";
import { installConsoleSpy, pluginProblems } from "../support";

type Problem = Awaited<ReturnType<typeof pluginProblems>>[number];

/**
 * Electron reports Node's own failed open of a file this spec deleted as an unhandled rejection,
 * now and then, under load (four in eight runs with the CPU busy, none on an idle machine): its
 * stack has only `node:internal/…/promises` frames, no frame of Obsidian or the plugin, it is a
 * different object from the ENOENT that `vault.process` hands on (which the adapter handles, as
 * the outcome shows), and no `rejectionhandled` follows. That one is not this plugin's, so it is
 * left out; every other problem, and the same error for any other path, still fails the spec.
 * The spy runs from the first case on, so the later checks also see the first case's file.
 */
const withoutNodeOpenOf = (problems: readonly Problem[], paths: readonly string[]): Problem[] =>
  problems.filter(
    (problem) =>
      !(
        problem.kind === "unhandledrejection" &&
        problem.text.startsWith("Error: ENOENT: no such file or directory, open '") &&
        paths.some((path) => problem.text.endsWith(`/${path}'`)) &&
        problem.stack !== undefined &&
        problem.stack
          .split("\n")
          .slice(1)
          .every((frame) => frame.includes("(node:internal/"))
      ),
  );

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
    expect(outcome as Outcome<unknown>).toEqual({
      ok: false,
      kind: "fail",
      tag: "NoteNotFoundError",
    });
    expect(withoutNodeOpenOf(await pluginProblems(), ["Verschwunden.md", "Weg.md"])).toEqual([]);
  });

  it("leaves a broken note deleted outside out of the adapter's unreadable notes", async function () {
    // As above, the vault and its metadata cache are held at what they show in the watcher's
    // window: the deleted file listed, with its broken block. Obsidian still keeps the file's old
    // text then (`cachedRead`, `VANISHED_FACTS`), so only a read of the disk sees it is gone.
    const outcome = await browser.executeObsidian(async ({ app, plugins }, folder) => {
      const api = (plugins as unknown as { noteStoreProbe?: { api?: unknown } }).noteStoreProbe
        ?.api as Probe["api"];
      if (api === undefined) throw new Error("the probe plugin is not loaded");
      type NodeRequire = (name: string) => {
        writeFileSync(path: string, text: string): void;
        unlinkSync(path: string): void;
        mkdirSync(path: string): void;
        join(...parts: string[]): string;
      };
      const nodeRequire = (window as unknown as { require: NodeRequire }).require;
      const basePath = (app.vault.adapter as unknown as { basePath: string }).basePath;
      const onDisk = (path: string) => nodeRequire("path").join(basePath, path);
      const broken = "---\nschema: [unclosed\n---\n";
      const indexed = (paths: readonly string[]) =>
        new Promise<TFile[]>((done) => {
          const seen = new Map<string, TFile>();
          const ref = app.metadataCache.on("changed", (changed) => {
            if (!paths.includes(changed.path)) return;
            seen.set(changed.path, changed);
            if (seen.size < paths.length) return;
            app.metadataCache.offref(ref);
            done(paths.map((path) => seen.get(path) as TFile));
          });
        });
      const kept = `${folder}/Kaputt.md`;
      const gone = `${folder}/Weg.md`;
      const both = indexed([kept, gone]);
      nodeRequire("fs").mkdirSync(onDisk(folder));
      nodeRequire("fs").writeFileSync(onDisk(kept), broken);
      nodeRequire("fs").writeFileSync(onDisk(gone), broken);
      const [, file] = await both;
      if (file === undefined) throw new Error("no file");
      const cache = app.metadataCache.getFileCache(file);
      nodeRequire("fs").unlinkSync(onDisk(gone));
      const listed = app.vault.getMarkdownFiles.bind(app.vault);
      const cached = app.metadataCache.getFileCache.bind(app.metadataCache);
      app.vault.getMarkdownFiles = () => [...listed().filter((other) => other.path !== gone), file];
      app.metadataCache.getFileCache = (wanted) => (wanted === file ? cache : cached(wanted));
      try {
        return await api.unreadable(folder);
      } finally {
        delete (app.vault as unknown as { getMarkdownFiles?: unknown }).getMarkdownFiles;
        delete (app.metadataCache as unknown as { getFileCache?: unknown }).getFileCache;
      }
    }, "Verschwunden");
    expect(outcome as Outcome<unknown>).toEqual({ ok: true, value: ["Verschwunden/Kaputt.md"] });
    expect(
      withoutNodeOpenOf(await pluginProblems(), [
        "Verschwunden.md",
        "Weg.md",
        "Verschwunden/Weg.md",
      ]),
    ).toEqual([]);
  });
});
