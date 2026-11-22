import { describe, expect, it } from "vitest";
import {
  isCommunityChoice,
  kindSuggestions,
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
