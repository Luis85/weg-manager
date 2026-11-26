import { describe, expect, it } from "vitest";
import {
  SOURCE_KINDS,
  fileLink,
  filedName,
  isWebLink,
  linkedPath,
  sourceType,
  validateSource,
} from "../../../../src/domain/matters";

const AW = "community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21";
const TG = "community-00000000-0000-4000-8000-000000000066";
const MATTER = "matter-5d6e7f80-9a1b-4c2d-8e3f-4a5b6c7d8e9f";
const input = (extra: Partial<Record<string, unknown>> = {}) => ({
  subject: "Angebot Beleuchtung",
  kind: "mail",
  community_id: AW,
  matter_ids: [MATTER],
  received_on: "2026-11-26",
  origin: "Mail der Verwaltung",
  message_ref: "",
  link: "",
  files: [],
  ...extra,
});

describe("the source note type (weg-manager.source/v1)", () => {
  it("is version 1 of `source` with its keys in file order, filed in Quellen", () => {
    expect([sourceType.type, sourceType.version, sourceType.folder]).toEqual([
      "source",
      1,
      "Quellen",
    ]);
    expect(sourceType.keys).toEqual([
      "subject",
      "kind",
      "community_id",
      "matter_ids",
      "received_on",
      "origin",
      "message_ref",
      "link",
      "files",
    ]);
    expect(SOURCE_KINDS).toEqual([
      "mail",
      "letter",
      "portal",
      "conversation",
      "meeting",
      "document",
      "other",
    ]);
  });
});

describe("the source rules (PBI-11)", () => {
  it("passes a source with its origin and refuses one without", () => {
    expect(validateSource(input() as never, { matterCommunities: new Map() })).toEqual([]);
    expect(
      validateSource(input({ origin: " " }) as never, { matterCommunities: new Map() }),
    ).toEqual([{ key: "origin", code: "field.missing" }]);
  });

  it("refuses a matter of another community", () => {
    const context = { matterCommunities: new Map([[MATTER, TG]]) };
    expect(validateSource(input() as never, context)).toEqual([
      { key: "matter_ids", code: "matter.other-community" },
    ]);
  });
});

describe("filing an original (WCS filing rule)", () => {
  it("names it day, kind and subject, with the original's extension in lower case", () => {
    expect(filedName("2026-11-26", "mail", "Angebot Beleuchtung", "scan_0042.PDF")).toBe(
      "2026-11-26 Mail Angebot Beleuchtung.pdf",
    );
    expect(filedName("2026-11-26", "conversation", "Treppenhaus", "foto")).toBe(
      "2026-11-26 Gespräch Treppenhaus",
    );
  });

  it("replaces characters no file name may hold", () => {
    expect(filedName("2026-11-26", "letter", "Mahnung: 2/2026", "a.png")).toBe(
      "2026-11-26 Brief Mahnung- 2-2026.png",
    );
  });

  it("refers to a file by a wikilink, which Obsidian keeps on a rename", () => {
    const link = fileLink("WEG Manager/Quellen/AW/2026-11-26 Mail Angebot.pdf");
    expect(link).toBe("[[WEG Manager/Quellen/AW/2026-11-26 Mail Angebot.pdf]]");
    expect(linkedPath(link)).toBe("WEG Manager/Quellen/AW/2026-11-26 Mail Angebot.pdf");
    expect(linkedPath("[[Ablage/Plan.pdf|Plan]]")).toBe("Ablage/Plan.pdf");
    expect(linkedPath("Ablage/Plan.pdf")).toBe("Ablage/Plan.pdf");
  });

  it("knows a web link from a vault path", () => {
    expect(isWebLink("https://portal.example.org/nachricht/7")).toBe(true);
    expect(isWebLink("Ablage/Plan.pdf")).toBe(false);
  });
});
