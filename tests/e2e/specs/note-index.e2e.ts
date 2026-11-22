import { mkdirSync, writeFileSync } from "node:fs";
import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import type { IndexCounts } from "../probe-plugin/host-events";
import type { StartupRecord } from "../probe-plugin/startup-recorder";
import { installConsoleSpy, pluginProblems } from "../support";

/** The F-21 reference vault, written by `npm run vault:reference` (part of `test:e2e`). */
const REFERENCE_VAULT = "tests/e2e/vaults/reference";

/**
 * The one bound here is a promise of the docs: PBI-54 batches the index's reads after 100 ms of
 * quiet and at most after 1 s (`INDEX_BATCH_MAX`), so an outside edit shows within that of
 * Obsidian's `changed` for the file. The time from the write is recorded, not asserted: it adds
 * Obsidian's file watcher and indexing, which no doc of ours bounds. How soon
 * the index is ready after `VaultReady` promises no doc (B-NFR-04's five seconds are for the first
 * overview on the reference machine), so it is recorded in `reports/e2e/note-index-timings.json`
 * and only its order is asserted: the index is ready after `VaultReady`, never before.
 */
const EDIT_SHOWN_MS = 1000;
const EDITS = 3;

type Probe = {
  readonly startup?: { record(): StartupRecord };
  readonly events?: {
    counts(): Promise<IndexCounts>;
    titleShown(path: string, title: string): Promise<number>;
  };
};

const record = async (): Promise<StartupRecord> => {
  const recorded = await browser.executeObsidian(
    ({ plugins }) =>
      (plugins as unknown as { noteStoreProbe?: Probe }).noteStoreProbe?.startup?.record() ?? null,
  );
  if (recorded === null) throw new Error("the probe plugin is not loaded");
  return recorded;
};

const counts = () =>
  browser.executeObsidian(async ({ plugins }) => {
    const events = (plugins as unknown as { noteStoreProbe?: Probe }).noteStoreProbe?.events;
    if (events === undefined) throw new Error("the probe plugin is not loaded");
    return events.counts();
  });

/** Waits until the probe's index has published its first build, and returns the record. */
const whenIndexReady = async (): Promise<StartupRecord> => {
  await browser.waitUntil(async () => ((await record()).counts["index:ready"] ?? 0) > 0, {
    timeout: 60_000,
    timeoutMsg: "the note index never became ready",
  });
  return record();
};

/** Milliseconds from `VaultReady` to the index's first published build, and from `onload`. */
const readiness = (recorded: StartupRecord) => {
  const vaultReady = recorded.first["bus:VaultReady"] ?? Infinity;
  const ready = recorded.first["index:ready"] ?? Infinity;
  return { vaultReadyMs: vaultReady, indexReadyMs: ready, afterVaultReadyMs: ready - vaultReady };
};

/**
 * Edits one Punkt's title from outside, as an editor or agent would (Node's `fs`, so Obsidian's own
 * file watcher finds the change, not a call of the vault API). Two times come back: from the write
 * to the index showing it (it includes the watcher's debounce and Obsidian's own indexing, which
 * no doc of ours bounds; recorded only), and from the metadata cache's `changed` for the file to
 * the index showing it (what the batch delay and `INDEX_BATCH_MAX` promise).
 */
const editShown = (title: string) =>
  browser.executeObsidian(async ({ app, plugins }, wanted) => {
    const events = (plugins as unknown as { noteStoreProbe?: Probe }).noteStoreProbe?.events;
    const file = app.vault
      .getMarkdownFiles()
      .filter((candidate) => candidate.path.includes("/Punkte/"))
      .toSorted((a, b) => (a.path < b.path ? -1 : 1))[0];
    if (events === undefined || file === undefined) throw new Error("nothing to edit");
    type NodeRequire = (name: string) => {
      readFileSync(path: string, encoding: string): string;
      writeFileSync(path: string, text: string): void;
      join(...parts: string[]): string;
    };
    const nodeRequire = (window as unknown as { require: NodeRequire }).require;
    const basePath = (app.vault.adapter as unknown as { basePath: string }).basePath;
    const onDisk = nodeRequire("path").join(basePath, file.path);
    const changedAt = new Promise<number>((done) => {
      const ref = app.metadataCache.on("changed", (changed) => {
        if (changed.path !== file.path) return;
        app.metadataCache.offref(ref);
        done(performance.now());
      });
    });
    const shown = events.titleShown(file.path, wanted);
    const fs = nodeRequire("fs");
    const written = performance.now();
    fs.writeFileSync(
      onDisk,
      fs.readFileSync(onDisk, "utf8").replace(/^title: .*$/m, `title: ${wanted}`),
    );
    const [indexed, changed] = await Promise.all([shown, changedAt]);
    return { fromWriteMs: indexed - written, fromChangedMs: indexed - changed };
  }, title);

type Edit = { readonly fromWriteMs: number; readonly fromChangedMs: number };

const FULL = { ready: true, failed: false, communities: 2, items: 1998, unindexed: 0 };

const timings: Record<string, unknown> = {};

/**
 * The note index in real Obsidian on the F-21 reference vault (2,000 records, 200 plain notes),
 * through the probe plugin, which builds the index for the generator's two types beside the
 * plugin's host event adapter. Timings land in `reports/e2e/note-index-timings.json`.
 */
describe("the note index in Obsidian", function () {
  this.timeout(120_000);

  it("is ready after VaultReady on a cold start, with every record", async function () {
    await browser.reloadObsidian({ vault: REFERENCE_VAULT });
    const cold = readiness(await whenIndexReady());
    expect(await counts()).toEqual(FULL);
    expect(cold.afterVaultReadyMs).toBeGreaterThanOrEqual(0);
    timings["cold"] = cold;
  });

  it("is ready after VaultReady on a warm restart", async function () {
    await browser.reloadObsidian();
    const warm = readiness(await whenIndexReady());
    expect(await counts()).toEqual(FULL);
    expect(warm.afterVaultReadyMs).toBeGreaterThanOrEqual(0);
    timings["warm"] = warm;
  });

  it("shows an outside edit of one note within its bound", async function () {
    await installConsoleSpy();
    // One edit after the other: each waits until the one before has shown.
    const edits = await Array.from({ length: EDITS }, (_, n) => `Geändert ${n + 1}`).reduce<
      Promise<Edit[]>
    >(async (done, title) => [...(await done), await editShown(title)], Promise.resolve([]));
    for (const edit of edits) expect(edit.fromChangedMs).toBeLessThan(EDIT_SHOWN_MS);
    timings["editShown"] = edits;
    expect(await counts()).toEqual(FULL);
    expect(await pluginProblems()).toEqual([]);
    mkdirSync("reports/e2e", { recursive: true });
    writeFileSync("reports/e2e/note-index-timings.json", `${JSON.stringify(timings, null, 2)}\n`);
  });
});
