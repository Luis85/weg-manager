import { mkdirSync, writeFileSync } from "node:fs";
import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import type { IndexCounts } from "../probe-plugin/host-events";
import type { StartupRecord } from "../probe-plugin/startup-recorder";
import { installConsoleSpy, pluginProblems } from "../support";

/** The F-21 reference vault, written by `npm run vault:reference` (part of `test:e2e`). */
const REFERENCE_VAULT = "tests/e2e/vaults/reference";

/**
 * Generous bounds, not the targets: this container is not the F-21 reference machine. B-NFR-04
 * gives 300 ms for an interaction and 5 s for the first overview; the index's own share of the
 * start is measured at tens of milliseconds and an edit at about the batch delay (100 ms), so
 * these bounds fail only on a real regression, not on a slow runner.
 */
const READY_AFTER_VAULT_READY_MS = 1000;
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

/** Edits one Punkt's title from outside, as an editor or agent would: ms until the index shows it. */
const editShown = (title: string) =>
  browser.executeObsidian(async ({ app, plugins }, wanted) => {
    const events = (plugins as unknown as { noteStoreProbe?: Probe }).noteStoreProbe?.events;
    const file = app.vault
      .getMarkdownFiles()
      .filter((candidate) => candidate.path.includes("/Punkte/"))
      .toSorted((a, b) => (a.path < b.path ? -1 : 1))[0];
    if (events === undefined || file === undefined) throw new Error("nothing to edit");
    const shown = events.titleShown(file.path, wanted);
    const started = performance.now();
    await app.vault.process(file, (text) => text.replace(/^title: .*$/m, `title: ${wanted}`));
    return (await shown) - started;
  }, title);

const FULL = { ready: true, failed: false, communities: 2, items: 1998, unindexed: 0 };

const timings: Record<string, unknown> = {};

/**
 * The note index in real Obsidian on the F-21 reference vault (2,000 records, 200 plain notes),
 * through the probe plugin, which builds the index for the generator's two types beside the
 * plugin's host event adapter. Timings land in `reports/e2e/note-index-timings.json`.
 */
describe("the note index in Obsidian", function () {
  this.timeout(120_000);

  it("is ready shortly after VaultReady on a cold start, with every record", async function () {
    await browser.reloadObsidian({ vault: REFERENCE_VAULT });
    const cold = readiness(await whenIndexReady());
    expect(await counts()).toEqual(FULL);
    expect(cold.afterVaultReadyMs).toBeGreaterThanOrEqual(0);
    expect(cold.afterVaultReadyMs).toBeLessThan(READY_AFTER_VAULT_READY_MS);
    timings["cold"] = cold;
  });

  it("is ready shortly after VaultReady on a warm restart", async function () {
    await browser.reloadObsidian();
    const warm = readiness(await whenIndexReady());
    expect(await counts()).toEqual(FULL);
    expect(warm.afterVaultReadyMs).toBeGreaterThanOrEqual(0);
    expect(warm.afterVaultReadyMs).toBeLessThan(READY_AFTER_VAULT_READY_MS);
    timings["warm"] = warm;
  });

  it("shows an outside edit of one note within its bound", async function () {
    await installConsoleSpy();
    // One edit after the other: each waits until the one before has shown.
    const edits = await Array.from({ length: EDITS }, (_, n) => `Geändert ${n + 1}`).reduce<
      Promise<number[]>
    >(async (done, title) => [...(await done), await editShown(title)], Promise.resolve([]));
    for (const ms of edits) expect(ms).toBeLessThan(EDIT_SHOWN_MS);
    timings["editShownMs"] = edits;
    expect(await counts()).toEqual(FULL);
    expect(await pluginProblems()).toEqual([]);
    mkdirSync("reports/e2e", { recursive: true });
    writeFileSync("reports/e2e/note-index-timings.json", `${JSON.stringify(timings, null, 2)}\n`);
  });
});
