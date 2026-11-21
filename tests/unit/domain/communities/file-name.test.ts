import { assert as fcAssert, property, string } from "fast-check";
import { describe, expect, it } from "vitest";
import { communityFileName, followsName } from "../../../../src/domain/communities";
import { noteNameIssue } from "../../../../src/domain/notes";

describe("communityFileName", () => {
  it("is the community's name when the name is a usable file name", () => {
    expect(communityFileName("Ahornweg 12", "AW")).toBe("Ahornweg 12");
    expect(communityFileName("Tiefgarage Ahornweg (Süd)", "TG")).toBe("Tiefgarage Ahornweg (Süd)");
  });

  it("replaces each run of characters a file name or a wikilink cannot hold with a hyphen", () => {
    expect(communityFileName("Ahornweg 12/14", "AW")).toBe("Ahornweg 12-14");
    expect(communityFileName('WEG: "Ahorn" <A|B>?*', "AW")).toBe("WEG- -Ahorn- -A-B-");
    expect(communityFileName("A\\B", "AW")).toBe("A-B");
    expect(communityFileName("Haus #3 ^a [b]", "AW")).toBe("Haus -3 -a -b-");
    expect(communityFileName("A//B", "AW")).toBe("A-B");
    expect(communityFileName("/Ahorn", "AW")).toBe("-Ahorn");
  });

  it("collapses white space and drops leading and trailing dots and spaces", () => {
    expect(communityFileName("  Ahornweg   12  ", "AW")).toBe("Ahornweg 12");
    expect(communityFileName("..Ahornweg.", "AW")).toBe("Ahornweg");
    expect(communityFileName(". . Ahornweg . .", "AW")).toBe("Ahornweg");
  });

  it("falls back to the short code when nothing usable is left", () => {
    expect(communityFileName("...", "AW")).toBe("AW");
    expect(communityFileName("   ", "TG")).toBe("TG");
  });

  it("always gives a name the note store accepts", () => {
    fcAssert(
      property(string({ maxLength: 120, unit: "binary" }), (name) => {
        expect(noteNameIssue(communityFileName(name, "AW"))).toBeUndefined();
        expect(communityFileName(name, "AW")).not.toMatch(/[#^[\]]/);
      }),
    );
  });
});

describe("followsName: the file still carries the name the plugin gave it", () => {
  it("holds for the name's file name, also with a clash suffix", () => {
    expect(followsName("Ahornweg 12", "Ahornweg 12", "AW")).toBe(true);
    expect(followsName("Ahornweg 12 (2)", "Ahornweg 12", "AW")).toBe(true);
    expect(followsName("Ahornweg 12 (17)", "Ahornweg 12", "AW")).toBe(true);
    expect(followsName("Ahornweg 12 (100)", "Ahornweg 12", "AW")).toBe(true);
    expect(followsName("WEG (2)", "WEG (2)", "AW")).toBe(true);
    expect(followsName("Ahornweg 12-14", "Ahornweg 12/14", "AW")).toBe(true);
    expect(followsName("AW", "...", "AW")).toBe(true);
  });

  it("ignores case and Unicode form, as Windows and macOS do", () => {
    expect(followsName("ahornweg 12", "Ahornweg 12", "AW")).toBe(true);
    expect(followsName("Süd", "Süd", "AW")).toBe(true);
  });

  it("does not hold for a name the user gave the file", () => {
    expect(followsName("Unsere WEG", "Ahornweg 12", "AW")).toBe(false);
    expect(followsName("Ahornweg 12 (1)", "Ahornweg 12", "AW")).toBe(false);
    expect(followsName("Ahornweg 12 (2a)", "Ahornweg 12", "AW")).toBe(false);
    expect(followsName("Ahornweg 12 (02)", "Ahornweg 12", "AW")).toBe(false);
    expect(followsName("Ahornweg 12 alt", "Ahornweg 12", "AW")).toBe(false);
    expect(followsName("Ahornweg (2) 12", "Ahornweg 12", "AW")).toBe(false);
    expect(followsName("x Ahornweg 12", "Ahornweg 12", "AW")).toBe(false);
  });
});
