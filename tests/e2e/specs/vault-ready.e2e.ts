import { mkdirSync, writeFileSync } from "node:fs";
import { stdout } from "node:process";
import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import { obsidianPage } from "wdio-obsidian-service";
import { READINESS_FACTS, readinessScenario } from "../../support/readiness-scenario";
import type { CacheSnapshot, StartupRecord } from "../probe-plugin/startup-recorder";
import { PLUGIN_ID, installConsoleSpy, pluginProblems } from "../support";

/** The F-21 reference vault, written by `npm run vault:reference` (part of `test:e2e`). */
const REFERENCE_VAULT = "tests/e2e/vaults/reference";
const MARKDOWN = 2200;
const WITH_FRONTMATTER = 2000;
const PROBE_ID = "note-store-probe";

type Probe = {
  readonly startup?: { record(): StartupRecord };
  readonly api?: { list(): Promise<{ ok: boolean; value?: readonly unknown[] }> };
};

/** What the probe plugin recorded since its `onload`. */
const record = async (): Promise<StartupRecord> => {
  const recorded = await browser.executeObsidian(
    ({ plugins }) =>
      (plugins as unknown as { noteStoreProbe?: Probe }).noteStoreProbe?.startup?.record() ?? null,
  );
  if (recorded === null) throw new Error("the probe plugin is not loaded");
  return recorded;
};

/** Waits until the probe's host event adapter has published `VaultReady`, and returns the record. */
const afterVaultReady = async (): Promise<StartupRecord> => {
  await browser.waitUntil(async () => ((await record()).counts["bus:VaultReady"] ?? 0) > 0, {
    timeout: 60_000,
    timeoutMsg: "VaultReady was not published",
  });
  return record();
};

/**
 * Makes Obsidian fire `resolved` once more, and waits until it has. `VaultReady` "comes once" is a
 * negative check: a second one would follow the next `resolved`, so waiting some time for it
 * could pass empty. Instead the check gets its positive sign: a plain note is edited (it keeps
 * the vault's counts), Obsidian's `resolved` that follows is seen by the recorder, and only then
 * the count of `VaultReady` is read.
 */
const resolvedAgain = async (): Promise<StartupRecord> => {
  const resolved = async () => (await record()).counts["metadataCache:resolved"] ?? 0;
  const before = await resolved();
  const edited = await browser.executeObsidian(async ({ app }) => {
    const plain = app.vault
      .getMarkdownFiles()
      .find((file) => app.metadataCache.getFileCache(file)?.frontmatter === undefined);
    if (plain === undefined) return false;
    await app.vault.process(plain, (text) => `${text}\nEdited after VaultReady.\n`);
    return true;
  });
  expect(edited).toBe(true);
  await browser.waitUntil(async () => (await resolved()) > before, {
    timeoutMsg: "Obsidian fired no `resolved` after the edit",
  });
  return record();
};

const find = (recorded: StartupRecord, name: string): CacheSnapshot | undefined =>
  recorded.snapshots.find((snapshot) => snapshot.at === name);

const at = (recorded: StartupRecord, name: string): CacheSnapshot => {
  const found = find(recorded, name);
  if (found === undefined) throw new Error(`no snapshot at ${name}`);
  return found;
};

const complete = { markdown: MARKDOWN, cached: MARKDOWN, frontmatter: WITH_FRONTMATTER };

/** `NoteStore.list` through the probe, timed inside Obsidian. */
const timedList = () =>
  browser.executeObsidian(async ({ plugins }) => {
    const api = (plugins as unknown as { noteStoreProbe?: Probe }).noteStoreProbe?.api;
    if (api === undefined) throw new Error("the probe plugin is not loaded");
    const started = performance.now();
    const listed = await api.list();
    return { ms: performance.now() - started, records: listed.value?.length ?? -1 };
  });

const timings: Record<string, unknown> = {};
const observed: Record<string, unknown> = {};

/**
 * What Obsidian did on this machine around the start, as numbers. How far the cache is when the
 * plugin loads, at the layout and at the first `resolved`, and how often `changed` and `resolved`
 * fire, depend on how fast Obsidian is here (a fast runner indexes more before the layout is
 * ready), so they are recorded and never asserted.
 */
const observation = (recorded: StartupRecord) => {
  const resolvedAt = find(recorded, "metadataCache:resolved");
  return {
    cachedAtOnload: at(recorded, "onload").cached,
    frontmatterAtLayoutReady: at(recorded, "bus:LayoutReady").frontmatter,
    cachedAtFirstResolved: resolvedAt?.cached ?? null,
    firstResolvedBeforeCacheComplete:
      resolvedAt === undefined ? null : resolvedAt.cached < MARKDOWN,
    changedEvents: recorded.counts["metadataCache:changed"] ?? 0,
    resolvedEvents: recorded.counts["metadataCache:resolved"] ?? 0,
  };
};

/**
 * `VaultReady` on the F-21 reference vault (2,200 notes, 2,000 with frontmatter), published by
 * the plugin's host event adapter, which the probe plugin runs on its own runtime from its
 * `onload` on. A cold start (a fresh copy of the vault, never indexed), a warm restart in the same
 * vault, and the adapter started in a running app.
 *
 * What the adapter guarantees is asserted: `VaultReady` comes once, never before the cache holds
 * every Markdown file, with the layout ready. What depends on Obsidian's speed on this machine is
 * recorded, not asserted (`reports/e2e/vault-ready-observations.json`, printed to the log): how
 * much was cached at `onload`, at the layout and at the first `resolved`, and whether that
 * `resolved` came before the cache was complete. The timings land in
 * `reports/e2e/vault-ready-timings.json`; they are reported, not yet enforced.
 */
describe("VaultReady in Obsidian", function () {
  this.timeout(120_000);

  after(function () {
    mkdirSync("reports/e2e", { recursive: true });
    writeFileSync("reports/e2e/vault-ready-timings.json", `${JSON.stringify(timings, null, 2)}\n`);
    writeFileSync(
      "reports/e2e/vault-ready-observations.json",
      `${JSON.stringify(observed, null, 2)}\n`,
    );
    stdout.write(`VaultReady observations on this machine: ${JSON.stringify(observed)}\n`);
  });

  it("waits on a cold start until every note's frontmatter is in the cache, and comes once", async function () {
    await browser.reloadObsidian({ vault: REFERENCE_VAULT });
    const cold = await afterVaultReady();
    // Never before the cache holds every note, whatever Obsidian's speed: the snapshot is taken
    // inside the publish. Obsidian's `changed` events are all done by then.
    expect(at(cold, "bus:VaultReady")).toMatchObject({ layoutReady: true, ...complete });
    expect(cold.first["bus:VaultReady"]).toBeGreaterThanOrEqual(
      cold.last["metadataCache:changed"] ?? Infinity,
    );
    observed["cold"] = observation(cold);
    // Once: a later `resolved` does not publish it again.
    const later = await resolvedAgain();
    expect(later.counts["bus:LayoutReady"]).toBe(1);
    expect(later.counts["bus:VaultReady"]).toBe(1);
    const listed = await timedList();
    expect(listed.records).toBe(WITH_FRONTMATTER);
    timings["cold"] = {
      layoutReadyMs: at(cold, "bus:LayoutReady").ms,
      vaultReadyMs: at(cold, "bus:VaultReady").ms,
      listMs: listed.ms,
    };
  });

  it("comes with LayoutReady on a warm restart, complete", async function () {
    await browser.reloadObsidian();
    const warm = await afterVaultReady();
    // Warm means Obsidian found its cache on disk and indexed nothing.
    expect(warm.counts["metadataCache:changed"]).toBeUndefined();
    expect(at(warm, "bus:VaultReady")).toMatchObject({ layoutReady: true, ...complete });
    observed["warm"] = observation(warm);
    const later = await resolvedAgain();
    expect(later.counts["bus:VaultReady"]).toBe(1);
    const listed = await timedList();
    expect(listed.records).toBe(WITH_FRONTMATTER);
    timings["warm"] = {
      layoutReadyMs: at(warm, "bus:LayoutReady").ms,
      vaultReadyMs: at(warm, "bus:VaultReady").ms,
      listMs: listed.ms,
    };
  });

  it("comes at once in a running app, where resolved does not fire again", async function () {
    await installConsoleSpy();
    // Re-enabling the plugin itself makes Obsidian fire nothing that the adapter waits for.
    await obsidianPage.disablePlugin(PLUGIN_ID);
    await obsidianPage.enablePlugin(PLUGIN_ID);
    // The probe's adapter starts the same way as the plugin's does after a re-enable.
    await obsidianPage.disablePlugin(PROBE_ID);
    await obsidianPage.enablePlugin(PROBE_ID);
    const running = await afterVaultReady();
    // Complete at once, with nothing but the layout and the cache to go by: whether Obsidian
    // fires a `resolved` after a re-enable is Obsidian's business, and recorded below.
    expect(at(running, "onload")).toMatchObject({ layoutReady: true, ...complete });
    expect(at(running, "bus:VaultReady")).toMatchObject(complete);
    expect(running.counts["bus:LayoutReady"]).toBe(1);
    observed["running"] = {
      resolvedEvents: running.counts["metadataCache:resolved"] ?? 0,
    };
    const later = await resolvedAgain();
    expect(later.counts["bus:VaultReady"]).toBe(1);
    expect(await pluginProblems()).toEqual([]);
  });

  it("fires changed, resolve and resolved around an edit as the double models it", async function () {
    expect(await browser.executeObsidian(readinessScenario, 400)).toEqual(READINESS_FACTS);
    const after = await record();
    expect(after.counts["bus:VaultReady"]).toBe(1);
  });
});
