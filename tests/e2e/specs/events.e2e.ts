import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import { obsidianPage } from "wdio-obsidian-service";
import { PLUGIN_ID, ROOT, installConsoleSpy, openView, pluginProblems } from "../support";

type Counts = Record<"vault" | "metadataCache" | "workspace", Record<string, number>>;

/**
 * Handlers per event name on Obsidian's internal `Events` map (`emitter._`, 1.15.1). Internal API:
 * if it changes, this helper fails loudly instead of passing with zeros.
 */
const handlerCounts = (): Promise<Counts> =>
  browser.executeObsidian(({ app }) => {
    const count = (emitter: unknown, names: readonly string[]) => {
      const map = (emitter as { _?: Record<string, unknown[]> })._;
      if (map === undefined || typeof map !== "object") throw new Error("Events._ not found");
      return Object.fromEntries(names.map((name) => [name, map[name]?.length ?? 0]));
    };
    return {
      vault: count(app.vault, ["create", "modify", "delete", "rename"]),
      metadataCache: count(app.metadataCache, ["changed", "resolved"]),
      workspace: count(app.workspace, ["file-open", "css-change"]),
    };
  });

const difference = (more: Counts, less: Counts): Counts => {
  const diff = (a: Record<string, number>, b: Record<string, number>) =>
    Object.fromEntries(Object.entries(a).map(([name, value]) => [name, value - (b[name] ?? 0)]));
  return {
    vault: diff(more.vault, less.vault),
    metadataCache: diff(more.metadataCache, less.metadataCache),
    workspace: diff(more.workspace, less.workspace),
  };
};

const COMMUNITY = [
  "---",
  "schema: weg-manager.community/v1",
  "id: community-00000000-0000-4000-8000-000000000001",
  "name: Neu",
  "short_code: NEU",
  "color: teal",
  "kind: WEG",
  "unit_label: Einheiten",
  "---",
  "",
].join("\n");

const ONE_EACH: Counts = {
  vault: { create: 1, modify: 1, delete: 1, rename: 1 },
  metadataCache: { changed: 1, resolved: 1 },
  workspace: { "file-open": 1, "css-change": 1 },
};

describe("host events in Obsidian", function () {
  it("registers one listener per host event and removes them all on disable", async function () {
    await installConsoleSpy();
    const enabled = await handlerCounts();
    await obsidianPage.disablePlugin(PLUGIN_ID);
    const disabled = await handlerCounts();
    expect(difference(enabled, disabled)).toEqual(ONE_EACH);

    for (let cycle = 1; cycle <= 2; cycle += 1) {
      await obsidianPage.enablePlugin(PLUGIN_ID);
      expect(difference(await handlerCounts(), disabled)).toEqual(ONE_EACH);
      await obsidianPage.disablePlugin(PLUGIN_ID);
      expect(await handlerCounts()).toEqual(disabled);
    }
    await obsidianPage.enablePlugin(PLUGIN_ID);
  });

  it("handles creating, changing, renaming and deleting a note without a problem", async function () {
    await browser.executeObsidian(async ({ app }) => {
      const file = await app.vault.create("Events probe.md", "# Probe\n");
      await app.vault.modify(file, "# Probe\n\ntags: [a]\n");
      await app.workspace.getLeaf(true).openFile(file);
      await app.fileManager.renameFile(file, "Events probe 2.md");
      await app.vault.delete(file);
    });
    // Let the metadata cache and the event bus settle before reading the console.
    await browser.pause(500);
    expect(await pluginProblems()).toEqual([]);
  });

  it("updates the open view's communities when community notes come, move and go", async function () {
    await openView();
    const names = () =>
      browser
        .$(ROOT)
        .$$("[data-testid=community-name]")
        .map((element) => element.getText());
    const listed = (expected: readonly string[]) =>
      browser.waitUntil(async () => JSON.stringify(await names()) === JSON.stringify(expected), {
        timeoutMsg: `the view never listed ${JSON.stringify(expected)}`,
      });
    await expect(browser.$(ROOT).$("[data-testid=communities-empty]")).toBeDisplayed();
    await browser.executeObsidian(async ({ app }, text) => {
      await app.vault.create("Neu.md", text);
    }, COMMUNITY);
    await listed(["Neu"]);
    await browser.executeObsidian(async ({ app }) => {
      const file = app.vault.getFileByPath("Neu.md");
      if (file) await app.fileManager.renameFile(file, "Notizen/Verschoben.md");
    });
    await listed(["Neu"]);
    await browser.executeObsidian(async ({ app }) => {
      const file = app.vault.getFileByPath("Notizen/Verschoben.md");
      if (file) await app.fileManager.renameFile(file, "Notizen/Verschoben.txt");
    });
    await expect(browser.$(ROOT).$("[data-testid=communities-empty]")).toBeDisplayed();
    await browser.executeObsidian(async ({ app }) => {
      const file = app.vault.getFileByPath("Notizen/Verschoben.txt");
      if (file) await app.vault.delete(file);
    });
    expect(await pluginProblems()).toEqual([]);
  });
});
