import { afterEach, describe, expect, it } from "vitest";
import { de } from "../../../../src/application/messages";
import { AW, matterId, matterNote } from "../../../support/matters/fixture";
import { closeAll, openMatters, vault } from "../../../support/matters/screen";
import type { Memory } from "../../../support/communities/screen";

afterEach(closeAll);

const t = de.matters.sources;
const SOURCES = "WEG Manager/Quellen";

/** A source note of matter 5; `extra` overrides any key. */
const sourceNote = (extra: Record<string, unknown> = {}) => ({
  schema: "weg-manager.source/v1",
  id: "source-00000000-0000-4000-8000-000000000071",
  subject: "Angebot",
  kind: "mail",
  community_id: AW,
  matter_ids: [matterId(5)],
  received_on: "2026-11-20",
  origin: "Mail der Verwaltung",
  ...extra,
});

/** The matters screen with matter 5, its history open; `seed` adds notes. */
const withHistory = async (seed: (notes: Memory) => void = () => undefined) => {
  const screen = await openMatters((notes) => {
    vault(["A.md", matterNote(5, { outcome: "Lampe ersetzt" }), ""])(notes);
    seed(notes);
  });
  await screen.until(() => expect(screen.names()).toEqual(["Lampe ersetzt"]));
  await screen.click(screen.q("matter-history-toggle"));
  await screen.until(() => expect(screen.q("matter-sources")).toBeDefined());
  return screen;
};

/** Picks `files` in the file input, as the system dialog would. */
const pickFiles = async (screen: Awaited<ReturnType<typeof withHistory>>, files: File[]) => {
  const input = screen.q("source-files") as HTMLInputElement;
  Object.defineProperty(input, "files", { value: files, configurable: true });
  input.dispatchEvent(new Event("change"));
  await screen.until(() => expect(screen.q("source-mode")).toBeDefined());
};

describe("a matter's sources (PBI-11)", () => {
  it("captures a mail with its text and an image, filed by the rule and shown", async () => {
    const screen = await withHistory();
    expect(screen.text("matter-sources")).toContain(t.none);
    await screen.click(screen.q("source-add"));
    await screen.type("source-subject", "Angebot Beleuchtung");
    await screen.type("source-received_on", "2026-11-20");
    await screen.type("source-origin", "Mail der Verwaltung");
    const text = screen.q("source-text")?.querySelector("textarea") ?? screen.q("source-text");
    (text as HTMLTextAreaElement).value = "Anbei das Angebot.";
    text?.dispatchEvent(new Event("input"));
    await pickFiles(screen, [
      new File([new Uint8Array([1, 2])], "foto.JPG", { type: "image/jpeg" }),
    ]);
    const target = `${SOURCES}/AW/2026-11-20 Mail Angebot Beleuchtung.jpg`;
    await screen.until(() => expect(screen.text("source-targets")).toContain(target));
    expect((screen.q("source-move") as HTMLInputElement).disabled).toBe(true);
    expect(screen.text("source-mode")).toContain(t.form.moveUnavailable);
    await screen.click(screen.q("source-save"));
    await screen.until(() => expect(screen.q("source-form")).toBeUndefined());
    await screen.until(() => expect(screen.text("source-title")).toBe("Angebot Beleuchtung"));
    await screen.until(() => expect(screen.text("source-body")).toBe("Anbei das Angebot."));
    await screen.until(() => expect(screen.q("source-image")).toBeDefined());
    expect(screen.text("source-file")).toContain(target);
    expect(screen.files.paths()).toEqual([target]);
  });

  it("refuses a source without its origin and writes nothing", async () => {
    const screen = await withHistory();
    await screen.click(screen.q("source-add"));
    await screen.type("source-subject", "Anruf");
    await screen.click(screen.q("source-save"));
    expect(screen.text("source-form")).toContain(t.missing.origin);
    expect(screen.files.paths()).toEqual([]);
  });

  it("marks an original that is gone, and shows a web link as a link", async () => {
    const screen = await withHistory((notes) =>
      notes.seed(
        `${SOURCES}/Angebot.md`,
        sourceNote({
          link: "https://portal.example.org/nachricht/7",
          files: ["[[WEG Manager/Quellen/AW/fehlt.pdf]]"],
        }),
        "Text der Nachricht\n",
      ),
    );
    await screen.until(() => expect(screen.q("source-missing")).toBeDefined());
    expect(screen.text("source-missing")).toBe(t.missingFile);
    expect(screen.q("source-open")).toBeUndefined();
    const link = screen.q("source-link") as HTMLAnchorElement;
    expect(link.href).toBe("https://portal.example.org/nachricht/7");
    expect(screen.text("source-body")).toBe("Text der Nachricht");
  });

  it("opens an original in Obsidian", async () => {
    const screen = await withHistory((notes) =>
      notes.seed(
        `${SOURCES}/Angebot.md`,
        sourceNote({ files: ["[[WEG Manager/Quellen/AW/Angebot.pdf]]"] }),
      ),
    );
    screen.files.seed("WEG Manager/Quellen/AW/Angebot.pdf");
    await screen.click(screen.q("matter-history-toggle"));
    await screen.click(screen.q("matter-history-toggle"));
    await screen.until(() => expect(screen.q("source-open")).toBeDefined());
    await screen.click(screen.q("source-open"));
    await screen.until(() =>
      expect(screen.files.opened()).toEqual(["WEG Manager/Quellen/AW/Angebot.pdf"]),
    );
  });
});
