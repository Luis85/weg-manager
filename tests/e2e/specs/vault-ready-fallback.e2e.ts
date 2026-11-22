import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import { obsidianPage } from "wdio-obsidian-service";
import type { IndexCounts } from "../probe-plugin/host-events";
import type { StartupRecord } from "../probe-plugin/startup-recorder";
import { installConsoleSpy, pluginProblems } from "../support";

const PROBE_ID = "note-store-probe";
const NEVER = "Nie indexiert.md";
const ITEM = [
  "---",
  "schema: weg-manager.item/v1",
  "id: item-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21",
  "community_id: community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e22",
  "kind: point",
  "title: Nie indexiert",
  "---",
  "",
].join("\n");

/** The fallback's deadline, `VAULT_READY_DEADLINE` in `src/infrastructure/obsidian/shell/events.ts`. */
const DEADLINE_MS = 10_000;

type Probe = {
  readonly startup?: { record(): StartupRecord };
  readonly events?: { counts(): Promise<IndexCounts> };
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

/**
 * A Markdown file that Obsidian never indexes, which no file of Obsidian 1.15.1 was (null bytes, a
 * binary `.md`, 30 MB, excluded files, symlinks and an unreadable file all got an entry). Real
 * Obsidian cannot be made to skip a file, so the app's metadata cache is told to answer `null` for
 * one path, which is all the host event adapter reads. What stays real: the layout, the
 * `resolved` events, the timer and the Effect runtime of the probe's own adapter, started in the
 * running app, and Obsidian indexing the file for real once the answer is let go.
 */
const hideFromCache = (path: string) =>
  browser.executeObsidian(({ app }, hidden) => {
    const cache = app.metadataCache;
    const original = cache.getFileCache.bind(cache);
    (window as unknown as { wegCacheOriginal?: typeof original }).wegCacheOriginal = original;
    cache.getFileCache = (file) => (file.path === hidden ? null : original(file));
  }, path);

const showInCache = () =>
  browser.executeObsidian(({ app }) => {
    const target = window as unknown as {
      wegCacheOriginal?: typeof app.metadataCache.getFileCache;
    };
    const original = target.wegCacheOriginal;
    if (original !== undefined) app.metadataCache.getFileCache = original;
    delete target.wegCacheOriginal;
  });

/**
 * `VaultReady` after a deadline, in Obsidian: the probe's host event adapter (the plugin's real
 * `hostEventsLayer`) is started in a running app where one Markdown file has no cache entry. It
 * must publish `VaultReady` once, about `VAULT_READY_DEADLINE` after `LayoutReady`, with the index
 * built from the other notes, and the file must join the index when Obsidian indexes it later.
 * That the wait leaves no timer after an unload is proven on the double (`TestClock`), where the
 * timer can be inspected; in the app nothing observable is left once the probe is disabled.
 */
describe("VaultReady with a file that is never indexed", function () {
  this.timeout(90_000);

  it("publishes VaultReady once after the deadline, builds the index, and follows the file", async function () {
    await installConsoleSpy();
    await browser.executeObsidian(
      async ({ app }, path, text) => {
        await app.vault.create(path, text);
      },
      NEVER,
      ITEM,
    );
    await browser.waitUntil(
      async () =>
        browser.executeObsidian(({ app }, path) => {
          const file = app.vault.getFileByPath(path);
          return file !== null && app.metadataCache.getFileCache(file) !== null;
        }, NEVER),
      { timeout: 10_000, timeoutMsg: "Obsidian did not index the new note" },
    );
    await hideFromCache(NEVER);
    // The probe's adapter starts as in a plugin enabled in a running app.
    await obsidianPage.disablePlugin(PROBE_ID);
    await obsidianPage.enablePlugin(PROBE_ID);
    await browser.waitUntil(async () => ((await record()).counts["bus:LayoutReady"] ?? 0) > 0, {
      timeout: 10_000,
      timeoutMsg: "LayoutReady was not published",
    });

    // Half the deadline later the adapter still waits.
    await browser.pause(DEADLINE_MS / 2);
    const waiting = await record();
    expect(waiting.counts["bus:VaultReady"]).toBeUndefined();
    expect((await counts()).ready).toBe(false);

    await browser.waitUntil(async () => ((await record()).counts["bus:VaultReady"] ?? 0) > 0, {
      timeout: DEADLINE_MS * 2,
      timeoutMsg: "VaultReady was not published after the deadline",
    });
    // Long enough for a second VaultReady to show, if one came.
    await browser.pause(500);
    const fallback = await record();
    expect(fallback.counts["bus:VaultReady"]).toBe(1);
    const snapshot = fallback.snapshots.find((entry) => entry.at === "bus:VaultReady");
    expect(snapshot?.cached).toBe((snapshot?.markdown ?? 0) - 1);
    // Measured from the layout; never early, however loaded the machine is.
    const waited =
      (fallback.first["bus:VaultReady"] ?? 0) - (fallback.first["bus:LayoutReady"] ?? 0);
    expect(waited).toBeGreaterThanOrEqual(DEADLINE_MS - 500);
    const built = await counts();
    expect(built).toMatchObject({ ready: true, failed: false, items: 0 });

    // Obsidian gets to the file after all: the index follows its `changed`.
    await showInCache();
    await browser.executeObsidian(async ({ app }, path) => {
      const file = app.vault.getFileByPath(path);
      if (file === null) throw new Error(`no file at ${path}`);
      await app.vault.process(file, (text) => `${text}\n`);
    }, NEVER);
    await browser.waitUntil(async () => (await counts()).items === 1, {
      timeout: 10_000,
      timeoutMsg: "the index did not take the file Obsidian indexed late",
    });
    await browser.pause(500);
    const after = await record();
    expect(after.counts["bus:VaultReady"]).toBe(1);
    expect(await pluginProblems()).toEqual([]);

    await browser.executeObsidian(async ({ app }, path) => {
      const file = app.vault.getFileByPath(path);
      if (file !== null) await app.fileManager.trashFile(file);
    }, NEVER);
  });
});
