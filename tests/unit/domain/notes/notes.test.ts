import { describe, expect, it } from "vitest";
import {
  RECORD_SCHEMA_PREFIX,
  clashName,
  isRecordFrontmatter,
  noteNameIssue,
} from "../../../../src/domain/notes";

describe("isRecordFrontmatter", () => {
  it("recognises a record by a schema that starts with weg-manager.", () => {
    expect(RECORD_SCHEMA_PREFIX).toBe("weg-manager.");
    expect(isRecordFrontmatter({ schema: "weg-manager.community/v1" })).toBe(true);
    expect(isRecordFrontmatter({ schema: "weg-manager." })).toBe(true);
  });

  it.each([
    ["no schema", {}],
    ["another prefix", { schema: "other.community/v1" }],
    ["the prefix later in the text", { schema: "x-weg-manager.community/v1" }],
    ["the prefix without its dot", { schema: "weg-manager" }],
    ["a schema that is not a string", { schema: 1 }],
    ["a list", { schema: ["weg-manager.community/v1"] }],
  ])("is false for %s", (_label, frontmatter) => {
    expect(isRecordFrontmatter(frontmatter)).toBe(false);
  });
});

describe("noteNameIssue", () => {
  it.each(["Ahornweg 12", "Gemeinschaft (2)", "a.b", "ä-ö_ü", "x."])("accepts %j", (name) => {
    expect(noteNameIssue(name)).toBeUndefined();
  });

  it.each(["", " ", "\t"])("calls %j empty", (name) => {
    expect(noteNameIssue(name)).toBe("empty");
  });

  it.each(["a/b", "a\\b", "a:b", "a*b", "a?b", 'a"b', "a<b", "a>b", "a|b", "/"])(
    "rejects the forbidden character in %j",
    (name) => {
      expect(noteNameIssue(name)).toBe("forbidden-character");
    },
  );

  it.each([".hidden", "..x"])("rejects the leading dot of %j", (name) => {
    expect(noteNameIssue(name)).toBe("leading-dot");
  });
});

describe("clashName", () => {
  it("keeps the name for the first attempt and adds (n) from the second on", () => {
    expect(clashName("Ahornweg", 1)).toBe("Ahornweg");
    expect(clashName("Ahornweg", 2)).toBe("Ahornweg (2)");
    expect(clashName("Ahornweg", 10)).toBe("Ahornweg (10)");
  });
});
