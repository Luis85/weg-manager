import { describe, expect, it } from "vitest";
import { isRecordFrontmatter } from "../../../../src/domain/notes/notes";
import { parseSchemaMarker, schemaMarker } from "../../../../src/domain/notes/schema-marker";

describe("schemaMarker", () => {
  it("builds weg-manager.<type>/v<n>", () => {
    expect(schemaMarker("community", 1)).toBe("weg-manager.community/v1");
    expect(schemaMarker("test-item", 12)).toBe("weg-manager.test-item/v12");
  });
});

describe("parseSchemaMarker", () => {
  it.each([
    ["weg-manager.community/v1", "community", 1],
    ["weg-manager.test-item/v3", "test-item", 3],
    ["weg-manager.a-b-c/v10", "a-b-c", 10],
    ["weg-manager.x/v9007199254740991", "x", 9_007_199_254_740_991],
  ])("reads %j as type %j at version %j", (value, type, version) => {
    expect(parseSchemaMarker(value)).toEqual({ kind: "record", type, version });
  });

  it.each([
    ["no value", undefined],
    ["null", null],
    ["a number", 1],
    ["a list", ["weg-manager.community/v1"]],
    ["another prefix", "other.community/v1"],
    ["the prefix later in the text", "x-weg-manager.community/v1"],
    ["the prefix without its dot", "weg-manager"],
    ["an upper-case prefix", "WEG-Manager.community/v1"],
  ])("is not a record for %s", (_label, value) => {
    expect(parseSchemaMarker(value)).toEqual({ kind: "none" });
  });

  it.each([
    "weg-manager.",
    "weg-manager.community",
    "weg-manager.community/",
    "weg-manager.community/v",
    "weg-manager.community/1",
    "weg-manager.community/v0",
    "weg-manager.community/v01",
    "weg-manager.community/v-1",
    "weg-manager.community/v1.5",
    "weg-manager.community/v1 ",
    "weg-manager.community/v1x",
    "weg-manager.community/vx1",
    "weg-manager.community/v9007199254740993",
    "weg-manager./v1",
    "weg-manager.Community/v1",
    "weg-manager.community-/v1",
    "weg-manager.-community/v1",
    "weg-manager.community--item/v1",
    "weg-manager.community_item/v1",
    "weg-manager.community2/v1",
    "weg-manager. community/v1",
    "weg-manager.weg-manager.community/v1",
    "weg-manager.community/v1/v2",
  ])("calls %j malformed", (value) => {
    expect(parseSchemaMarker(value)).toEqual({ kind: "malformed" });
  });

  it("reads back what it builds", () => {
    expect(parseSchemaMarker(schemaMarker("unit-label", 7))).toEqual({
      kind: "record",
      type: "unit-label",
      version: 7,
    });
  });
});

describe("isRecordFrontmatter uses the same parser", () => {
  it("counts a malformed marker as a record, so it is shown with its issue", () => {
    expect(isRecordFrontmatter({ schema: "weg-manager.community/v0" })).toBe(true);
    expect(isRecordFrontmatter({ schema: "weg-manager.community/v1" })).toBe(true);
    expect(isRecordFrontmatter({ schema: "WEG-Manager.community/v1" })).toBe(false);
  });
});
