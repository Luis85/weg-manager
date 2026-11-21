import { mkdirSync, writeFileSync } from "node:fs";
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

/** Waits until the probe's host event adapter has published `VaultReady`, then a little longer. */
const afterVaultReady = async (): Promise<StartupRecord> => {
  await browser.waitUntil(async () => ((await record()).counts["bus:VaultReady"] ?? 0) > 0, {
    timeout: 60_000,
    timeoutMsg: "VaultReady was not published",
  });
  // Long enough for a second VaultReady to show, if one came.
  await browser.pause(500);
  return record();
};

const at = (recorded: StartupRecord, name: string): CacheSnapshot => {
  const found = recorded.snapshots.find((snapshot) => snapshot.at === name);
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

/**
 * `VaultReady` on the F-21 reference vault (2,200 notes, 2,000 with frontmatter), published by
 * the plugin's host event adapter, which the probe plugin runs on its own runtime from its
 * `onload` on. A cold start (a fresh copy of the vault, never indexed), a warm restart in the same
 * vault, and the adapter started in a running app. The timings land in
 * `reports/e2e/vault-ready-timings.json`; they are reported, not yet enforced.
 */
describe("VaultReady in Obsidian", function () {
  this.timeout(120_000);

  it("waits on a cold start until every note's frontmatter is in the cache, and comes once", async function () {
    await browser.reloadObsidian({ vault: REFERENCE_VAULT });
    const cold = await afterVaultReady();
    // Cold: nothing is cached when the probe loads, and Obsidian indexes every note.
    expect(at(cold, "onload")).toMatchObject({ cached: 0 });
    expect(cold.counts["metadataCache:changed"]).toBe(MARKDOWN);
    // The layout is ready long before the cache is: LayoutReady alone would read a partial vault.
    expect(at(cold, "bus:LayoutReady").frontmatter).toBeLessThan(WITH_FRONTMATTER);
    // `resolved` already fired while most notes still waited.
    expect(at(cold, "metadataCache:resolved").cached).toBeLessThan(MARKDOWN);
    expect(at(cold, "bus:VaultReady")).toMatchObject({ layoutReady: true, ...complete });
    expect(cold.counts["bus:LayoutReady"]).toBe(1);
    expect(cold.counts["bus:VaultReady"]).toBe(1);
    expect(cold.first["bus:VaultReady"]).toBeGreaterThanOrEqual(
      cold.last["metadataCache:changed"] ?? Infinity,
    );
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
    expect(warm.counts["metadataCache:changed"]).toBeUndefined();
    expect(at(warm, "bus:VaultReady")).toMatchObject({ layoutReady: true, ...complete });
    expect(warm.counts["bus:VaultReady"]).toBe(1);
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
    expect(running.counts["metadataCache:resolved"]).toBeUndefined();
    expect(at(running, "onload")).toMatchObject({ layoutReady: true, ...complete });
    expect(at(running, "bus:VaultReady")).toMatchObject(complete);
    expect(running.counts["bus:LayoutReady"]).toBe(1);
    expect(running.counts["bus:VaultReady"]).toBe(1);
    expect(await pluginProblems()).toEqual([]);
  });

  it("fires changed, resolve and resolved around an edit as the double models it", async function () {
    expect(await browser.executeObsidian(readinessScenario, 400)).toEqual(READINESS_FACTS);
    const after = await record();
    expect(after.counts["bus:VaultReady"]).toBe(1);
    mkdirSync("reports/e2e", { recursive: true });
    writeFileSync("reports/e2e/vault-ready-timings.json", `${JSON.stringify(timings, null, 2)}\n`);
  });
});
