import { describe, expect, it } from "vitest";
import {
  COMMUNITY_COLORS,
  LABEL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  communityType,
} from "../../../../src/domain/communities";

const ID = "community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21";
const PATH = "WEG Manager/Gemeinschaften/Ahornweg 12.md";
const NOTE = {
  schema: "weg-manager.community/v1",
  id: ID,
  name: "Ahornweg 12",
  short_code: "AW",
  color: "teal",
  kind: "WEG",
  unit_label: "Einheiten",
};
const decode = (frontmatter: Record<string, unknown>) =>
  communityType.decode({ path: PATH, frontmatter });

describe("the community note type (weg-manager.community/v1)", () => {
  it("is version 1 of `community` with the five keys in file order, filed in Gemeinschaften", () => {
    expect(communityType.type).toBe("community");
    expect(communityType.version).toBe(1);
    expect(communityType.folder).toBe("Gemeinschaften");
    expect(communityType.keys).toEqual(["name", "short_code", "color", "kind", "unit_label"]);
  });

  it("has the fixed palette of eight English colour names", () => {
    expect(COMMUNITY_COLORS).toEqual([
      "teal",
      "violet",
      "blue",
      "rust",
      "slate",
      "amber",
      "pink",
      "olive",
    ]);
  });

  it("reads a valid note as an editable record", () => {
    expect(decode({ ...NOTE, extra: "kept" })).toMatchObject({
      kind: "editable",
      id: ID,
      values: {
        name: "Ahornweg 12",
        short_code: "AW",
        color: "teal",
        kind: "WEG",
        unit_label: "Einheiten",
      },
      issues: [],
    });
  });

  it("accepts every palette colour, short codes of 2 to 5 of A–Z and 0–9, and texts at their limits", () => {
    for (const color of COMMUNITY_COLORS) {
      expect(decode({ ...NOTE, color })).toMatchObject({ kind: "editable", issues: [] });
    }
    for (const short_code of ["AB", "A1", "12345", "TG"]) {
      expect(decode({ ...NOTE, short_code })).toMatchObject({ issues: [] });
    }
    const long = {
      name: "N".repeat(NAME_MAX_LENGTH),
      kind: "K".repeat(LABEL_MAX_LENGTH),
      unit_label: "U".repeat(LABEL_MAX_LENGTH),
    };
    expect(decode({ ...NOTE, ...long })).toMatchObject({ issues: [] });
  });

  it("names a missing field and keeps the record editable", () => {
    const { name: _name, unit_label: _unit, ...rest } = NOTE;
    expect(decode(rest)).toMatchObject({
      kind: "editable",
      issues: [
        { code: "field.missing", key: "name" },
        { code: "field.missing", key: "unit_label" },
      ],
    });
  });

  it("names each broken field with its own code", () => {
    expect(
      decode({
        ...NOTE,
        name: " ",
        short_code: "aw",
        color: "cyan",
        kind: "K".repeat(LABEL_MAX_LENGTH + 1),
        unit_label: "Ein\nheiten",
      }),
    ).toMatchObject({
      kind: "editable",
      values: {},
      issues: [
        { code: "name.invalid", key: "name" },
        { code: "short-code.invalid", key: "short_code" },
        { code: "color.unknown", key: "color" },
        { code: "kind.invalid", key: "kind" },
        { code: "unit-label.invalid", key: "unit_label" },
      ],
    });
  });

  it("does not migrate cyan, a palette colour until 22.11.2026: it is an unknown colour now", () => {
    expect(COMMUNITY_COLORS).not.toContain("cyan");
    expect(decode({ ...NOTE, color: "cyan" })).toMatchObject({
      issues: [{ code: "color.unknown", key: "color" }],
    });
    expect(decode({ ...NOTE, color: "amber" })).toMatchObject({
      kind: "editable",
      values: { color: "amber" },
    });
  });

  it("refuses short codes that are too short, too long or not upper-case letters and digits", () => {
    for (const short_code of ["A", "ABCDEF", "a1", "Ä1", "A-1", " AW", 12]) {
      expect(decode({ ...NOTE, short_code })).toMatchObject({
        issues: [{ code: "short-code.invalid", key: "short_code" }],
      });
    }
  });

  it("refuses a name over the limit or with a control character", () => {
    for (const name of ["N".repeat(NAME_MAX_LENGTH + 1), "A\tB", "A\u007fB", ""]) {
      expect(decode({ ...NOTE, name })).toMatchObject({
        issues: [{ code: "name.invalid", key: "name" }],
      });
    }
  });

  it("reads a newer version read-only without interpreting its fields", () => {
    expect(decode({ ...NOTE, schema: "weg-manager.community/v2" })).toMatchObject({
      kind: "read-only",
      values: {},
      issues: [{ code: "schema.newer", version: 2 }],
    });
  });
});
