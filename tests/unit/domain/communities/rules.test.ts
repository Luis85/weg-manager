import { describe, expect, it } from "vitest";
import {
  colorOwners,
  communityValues,
  duplicateShortCodes,
  firstFreeColor,
  normalizeShortCode,
  validateCommunity,
  type CommunityInput,
} from "../../../../src/domain/communities";

const INPUT: CommunityInput = {
  name: "Ahornweg 12",
  short_code: "AW",
  color: "teal",
  kind: "WEG",
  unit_label: "Einheiten",
};
const TG = { name: "Tiefgarage", short_code: "TG", color: "violet" };

describe("normalizeShortCode", () => {
  it("trims and upper-cases what the user typed", () => {
    expect(normalizeShortCode(" aw1 ")).toBe("AW1");
    expect(normalizeShortCode("Tg")).toBe("TG");
  });
});

describe("communityValues: what a form saves", () => {
  it("trims every text and upper-cases the short code", () => {
    expect(
      communityValues({
        name: "  Ahornweg 12 ",
        short_code: " aw ",
        color: "teal",
        kind: " WEG ",
        unit_label: "Einheiten ",
      }),
    ).toEqual({
      name: "Ahornweg 12",
      short_code: "AW",
      color: "teal",
      kind: "WEG",
      unit_label: "Einheiten",
    });
  });

  it("leaves a blank field unset", () => {
    expect(
      communityValues({ name: " ", short_code: "", color: "", kind: "\t", unit_label: "" }),
    ).toEqual({
      name: undefined,
      short_code: undefined,
      color: undefined,
      kind: undefined,
      unit_label: undefined,
    });
  });
});

describe("validateCommunity", () => {
  it("accepts a valid community beside others with other codes and colours", () => {
    expect(validateCommunity(INPUT, { others: [TG, {}] })).toEqual([]);
  });

  it("accepts a lower-case short code, which it stores upper-case", () => {
    expect(validateCommunity({ ...INPUT, short_code: "aw" }, { others: [] })).toEqual([]);
  });

  it("names every missing and broken field, at most one issue each, in file order", () => {
    expect(
      validateCommunity(
        { name: "", short_code: "A", color: "cyan", kind: "", unit_label: "x".repeat(51) },
        { others: [] },
      ),
    ).toEqual([
      { key: "name", code: "field.missing" },
      { key: "short_code", code: "short-code.invalid" },
      { key: "color", code: "color.unknown", value: "cyan" },
      { key: "kind", code: "field.missing" },
      { key: "unit_label", code: "unit-label.invalid" },
    ]);
  });

  it("refuses a short code another community has, in any case", () => {
    expect(validateCommunity({ ...INPUT, short_code: "tg" }, { others: [TG] })).toEqual([
      { key: "short_code", code: "short-code.taken", value: "TG", other: "Tiefgarage" },
    ]);
  });

  it("refuses a colour another community uses", () => {
    expect(validateCommunity({ ...INPUT, color: "violet" }, { others: [TG] })).toEqual([
      { key: "color", code: "color.taken" },
    ]);
  });

  it("names both when short code and colour are taken", () => {
    expect(
      validateCommunity({ ...INPUT, short_code: "TG", color: "violet" }, { others: [TG] }),
    ).toEqual([
      { key: "short_code", code: "short-code.taken", value: "TG", other: "Tiefgarage" },
      { key: "color", code: "color.taken" },
    ]);
  });

  it("does not check a value the record already had, so an outside duplicate does not block a save", () => {
    const loaded = { short_code: "TG", color: "violet" };
    expect(
      validateCommunity({ ...INPUT, short_code: "TG", color: "violet" }, { others: [TG], loaded }),
    ).toEqual([]);
    expect(
      validateCommunity(
        { ...INPUT, short_code: "TG", color: "teal" },
        { others: [TG, { color: "teal" }], loaded },
      ),
    ).toEqual([{ key: "color", code: "color.taken" }]);
  });

  it("reports a broken short code as broken, not as taken", () => {
    expect(
      validateCommunity({ ...INPUT, short_code: "T" }, { others: [{ short_code: "T" }] }),
    ).toEqual([{ key: "short_code", code: "short-code.invalid" }]);
  });
});

describe("duplicateShortCodes", () => {
  it("lists each short code that more than one community has", () => {
    expect(
      duplicateShortCodes([
        { short_code: "AW" },
        { short_code: "TG" },
        { short_code: "AW" },
        {},
        {},
        { short_code: "BA" },
      ]),
    ).toEqual(new Set(["AW"]));
  });

  it("is empty when every code is unique", () => {
    expect(duplicateShortCodes([{ short_code: "AW" }, { short_code: "TG" }])).toEqual(new Set());
  });
});

describe("colorOwners", () => {
  it("gives each colour the others use with the short code of its first owner", () => {
    expect(colorOwners([TG, { color: "teal" }, {}, { color: "teal", short_code: "AW" }])).toEqual(
      new Map([
        ["violet", "TG"],
        ["teal", undefined],
      ]),
    );
  });
});

describe("firstFreeColor", () => {
  it("is the first colour of the palette no other community uses", () => {
    expect(firstFreeColor([])).toBe("teal");
    expect(firstFreeColor([{ color: "teal" }, TG])).toBe("blue");
  });

  it("is none when every colour is taken", () => {
    const all = ["teal", "violet", "blue", "rust", "slate", "amber", "pink", "olive"];
    expect(firstFreeColor(all.map((color) => ({ color })))).toBeUndefined();
  });
});

describe("validateCommunity: the data of an issue", () => {
  it("is the value as the rules saw it: trimmed, the short code upper-case", () => {
    expect(
      validateCommunity({ ...INPUT, short_code: " tg ", color: " cyan " }, { others: [TG] }),
    ).toEqual([
      { key: "short_code", code: "short-code.taken", value: "TG", other: "Tiefgarage" },
      { key: "color", code: "color.unknown", value: "cyan" },
    ]);
  });
});

describe("validateCommunity: the other community a taken short code belongs to", () => {
  it("names it by its short code when it has no valid name", () => {
    expect(
      validateCommunity({ ...INPUT, short_code: "TG" }, { others: [{ short_code: "TG" }] }),
    ).toEqual([{ key: "short_code", code: "short-code.taken", value: "TG", other: "TG" }]);
  });
});
