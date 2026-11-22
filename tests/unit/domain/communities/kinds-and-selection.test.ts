import { describe, expect, it } from "vitest";
import {
  isCommunityChoice,
  kindSuggestions,
  selectableIds,
  selectedCommunity,
} from "../../../../src/domain/communities";

const BUILT_IN = [
  { kind: "WEG", unit_label: "Einheiten" },
  { kind: "Tiefgarage", unit_label: "Stellplätze" },
];

describe("kindSuggestions", () => {
  it("offers the built-in pairs when no community has one of its own", () => {
    expect(kindSuggestions(BUILT_IN, [])).toEqual(BUILT_IN);
  });

  it("adds the pairs other communities use, once each, after the built-in ones", () => {
    expect(
      kindSuggestions(BUILT_IN, [
        { kind: "Stellplatzgemeinschaft", unit_label: "Stellplätze" },
        { kind: "WEG", unit_label: "Einheiten" },
        { kind: "weg ", unit_label: " einheiten" },
        { kind: "WEG", unit_label: "Wohnungen" },
        { kind: "Stellplatzgemeinschaft", unit_label: "Stellplätze" },
      ]),
    ).toEqual([
      ...BUILT_IN,
      { kind: "Stellplatzgemeinschaft", unit_label: "Stellplätze" },
      { kind: "WEG", unit_label: "Wohnungen" },
    ]);
  });

  it("leaves out a pair with a missing or blank half", () => {
    expect(
      kindSuggestions(BUILT_IN, [
        { kind: "Haus" },
        { unit_label: "Wohnungen" },
        { kind: " ", unit_label: "Wohnungen" },
        { kind: "Haus", unit_label: "" },
        { kind: "Haus", unit_label: "  " },
      ]),
    ).toEqual(BUILT_IN);
  });
});

describe("selectedCommunity: the selection rule", () => {
  const A = "community-a";
  const B = "community-b";

  it("keeps the stored community while it exists", () => {
    expect(selectedCommunity(B, [A, B])).toBe(B);
    expect(selectedCommunity(A, [A])).toBe(A);
  });

  it("selects the only community when nothing is stored or the stored one is gone", () => {
    expect(selectedCommunity(undefined, [A])).toBe(A);
    expect(selectedCommunity(B, [A])).toBe(A);
  });

  it("selects none of two or more when nothing usable is stored", () => {
    expect(selectedCommunity(undefined, [A, B])).toBeUndefined();
    expect(selectedCommunity("community-gone", [A, B])).toBeUndefined();
    expect(selectedCommunity({ id: A }, [A, B])).toBeUndefined();
    expect(selectedCommunity(3, [A])).toBe(A);
  });

  it("selects none when there is no community", () => {
    expect(selectedCommunity(undefined, [])).toBeUndefined();
    expect(selectedCommunity(A, [])).toBeUndefined();
  });
});

/** A community without issues. */
const ok = (id: string | undefined) => ({ id, issues: [] });

describe("selectableIds: the communities the rule may select", () => {
  it("is each community without an issue, once, in the list's order", () => {
    expect(selectableIds([ok("community-b"), ok("community-a"), ok("community-b")])).toEqual([
      "community-b",
      "community-a",
    ]);
  });

  it("leaves out a community with any issue and one without an id", () => {
    expect(
      selectableIds([
        ok("community-a"),
        { id: "community-b", issues: [{ code: "color.unknown", key: "color" }] },
        { id: "community-c", issues: [{ code: "schema.newer", version: 2 }] },
        ok(undefined),
      ]),
    ).toEqual(["community-a"]);
  });
});

describe("isCommunityChoice: a stored selection worth keeping", () => {
  const UUID = "3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21";

  it("is a community's id, whether its note exists or not", () => {
    expect(isCommunityChoice(`community-${UUID}`)).toBe(true);
  });

  it("is not nothing, another type's id or no id", () => {
    expect(isCommunityChoice(undefined)).toBe(false);
    expect(isCommunityChoice(`item-${UUID}`)).toBe(false);
    expect(isCommunityChoice("community-gone")).toBe(false);
    expect(isCommunityChoice({ id: `community-${UUID}` })).toBe(false);
  });
});
