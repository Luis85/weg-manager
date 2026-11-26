import { browser, expect } from "@wdio/globals";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "mocha";
import { community, fileText, writeNote } from "../communities";
import { MANAGER, writeCommunityAndManager } from "../matters";
import { ROOT, installConsoleSpy, openView, pluginProblems } from "../support";
import { de } from "../texts";

const AW = community(1, { name: "Ahornweg", short_code: "AW" });
const lines = (...parts: string[]) => [...parts, ""].join("\n");
/** A 1×1 PNG, the smallest image Obsidian shows. */
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);
const OUTSIDE = mkdtempSync(join(tmpdir(), "weg-quellen-"));
const TARGET = "WEG Manager/Quellen/AW/2026-11-20 Mail Angebot Beleuchtung.png";

/** Whether a file lies at `path` in the vault, note or not. */
const inVault = (path: string) =>
  browser.executeObsidian(({ app }, file) => app.vault.getFileByPath(file) !== null, path);

/**
 * PBI-11: a mail with its text and an original picked outside the vault is captured for a matter
 * in real Obsidian; moved, the original leaves its folder once the copy is in the sources folder;
 * the matter shows the source with its image and the vault path.
 */
describe("sources", function () {
  it("captures a mail with an original from outside the vault, moved into the vault", async function () {
    await installConsoleSpy();
    await writeCommunityAndManager(AW);
    await writeNote(
      "WEG Manager/Vorgänge/Lampe ersetzt.md",
      lines(
        "---",
        "schema: weg-manager.matter/v1",
        "id: matter-00000000-0000-4000-8000-000000000001",
        "number: 5",
        `community_id: ${AW.id}`,
        "kind: manager_promise",
        "topic: Beleuchtung",
        "outcome: Lampe ersetzt",
        `responsible_id: ${MANAGER}`,
        "status: open",
        "source: Mail",
        "next_step: Angebot prüfen",
        "---",
      ),
    );
    const original = join(OUTSIDE, "scan.PNG");
    writeFileSync(original, PNG);
    await openView();
    const root = browser.$(ROOT);
    await root.$("[data-testid=frame-navigation]").$(`button*=${de.matters.route}`).click();
    await root.$("[data-testid=matter-history-toggle]").click();
    await root.$("[data-testid=source-add]").click();
    await root.$("[data-testid=source-subject]").setValue("Angebot Beleuchtung");
    await root.$("[data-testid=source-received_on]").setValue("2026-11-20");
    await root.$("[data-testid=source-origin]").setValue("Mail der Verwaltung");
    await root.$("[data-testid=source-text]").setValue("Anbei das Angebot.");
    await root.$("[data-testid=source-files]").setValue(original);
    await expect(root.$("[data-testid=source-targets]")).toHaveText(
      expect.stringContaining(TARGET),
    );
    await expect(root.$("[data-testid=source-move]")).toBeEnabled();
    await root.$("[data-testid=source-move]").click();
    await root.$("[data-testid=source-save]").click();
    await expect(root.$("[data-testid=source-form]")).not.toExist();
    await browser.waitUntil(() => inVault(TARGET));
    await browser.waitUntil(() => !existsSync(original));
    const note = (await fileText("WEG Manager/Quellen/Angebot Beleuchtung.md")) ?? "";
    expect(note).toContain("schema: weg-manager.source/v1\n");
    expect(note).toContain(`  - "[[${TARGET}]]"\n`);
    expect(note).toContain("matter_ids:\n  - matter-00000000-0000-4000-8000-000000000001\n");
    expect(note.trimEnd().endsWith("Anbei das Angebot.")).toBe(true);
  });

  it("shows the source on the matter with its text, image and vault path", async function () {
    const root = browser.$(ROOT);
    await expect(root.$("[data-testid=source-title]")).toHaveText("Angebot Beleuchtung");
    await expect(root.$("[data-testid=source-body]")).toHaveText("Anbei das Angebot.");
    await expect(root.$("[data-testid=source-image]")).toBeDisplayed();
    await expect(root.$("[data-testid=source-file]")).toHaveText(expect.stringContaining(TARGET));
  });

  it("copies an original by default and keeps it outside, never over the first", async function () {
    const root = browser.$(ROOT);
    const original = join(OUTSIDE, "noch ein scan.png");
    writeFileSync(original, PNG);
    await root.$("[data-testid=source-add]").click();
    await root.$("[data-testid=source-subject]").setValue("Angebot Beleuchtung");
    await root.$("[data-testid=source-received_on]").setValue("2026-11-20");
    await root.$("[data-testid=source-origin]").setValue("Mail der Verwaltung");
    await root.$("[data-testid=source-files]").setValue(original);
    const second = TARGET.replace(".png", " (2).png");
    await expect(root.$("[data-testid=source-targets]")).toHaveText(
      expect.stringContaining(second),
    );
    await root.$("[data-testid=source-save]").click();
    await browser.waitUntil(() => inVault(second));
    expect(existsSync(original)).toBe(true);
    expect(await inVault(TARGET)).toBe(true);
  });

  it("keeps the link when the original is renamed in Obsidian (criterion 3)", async function () {
    const renamed = "WEG Manager/Quellen/AW/Angebot umbenannt.png";
    await browser.executeObsidian(
      async ({ app }, from, to) => {
        // As with "Automatically update internal links" on; off, the link breaks and the
        // matter marks the file as missing, which is the repair hint of criterion 3.
        (app.vault as unknown as { setConfig(key: string, value: unknown): void }).setConfig(
          "alwaysUpdateLinks",
          true,
        );
        const file = app.vault.getFileByPath(from);
        if (file !== null) await app.fileManager.renameFile(file, to);
      },
      TARGET,
      renamed,
    );
    // Obsidian writes the updated link in its shortest form, `[[Angebot umbenannt.png]]`.
    await browser.waitUntil(async () =>
      ((await fileText("WEG Manager/Quellen/Angebot Beleuchtung.md")) ?? "").includes(
        "Angebot umbenannt.png",
      ),
    );
    const root = browser.$(ROOT);
    await expect(root.$("[data-testid=matter-sources]")).toHaveText(
      expect.stringContaining(renamed),
    );
    await expect(root.$("[data-testid=source-missing]")).not.toExist();
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
