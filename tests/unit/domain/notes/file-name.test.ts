import { assert as fcAssert, property, string } from "fast-check";
import { describe, expect, it } from "vitest";
import { followsTitle, noteNameIssue, recordFileName } from "../../../../src/domain/notes";

describe("recordFileName", () => {
  it("is the record's title when the title is a usable file name", () => {
    expect(recordFileName("Ahornweg 12", "AW")).toBe("Ahornweg 12");
    expect(recordFileName("Tiefgarage Ahornweg (Süd)", "TG")).toBe("Tiefgarage Ahornweg (Süd)");
  });

  it("replaces each run of characters a file name or a wikilink cannot hold with a hyphen", () => {
    expect(recordFileName("Ahornweg 12/14", "AW")).toBe("Ahornweg 12-14");
    expect(recordFileName('WEG: "Ahorn" <A|B>?*', "AW")).toBe("WEG- -Ahorn- -A-B-");
    expect(recordFileName("A\\B", "AW")).toBe("A-B");
    expect(recordFileName("Haus #3 ^a [b]", "AW")).toBe("Haus -3 -a -b-");
    expect(recordFileName("A//B", "AW")).toBe("A-B");
    expect(recordFileName("/Ahorn", "AW")).toBe("-Ahorn");
  });

  it("collapses white space and drops leading and trailing dots and spaces", () => {
    expect(recordFileName("  Ahornweg   12  ", "AW")).toBe("Ahornweg 12");
    expect(recordFileName("..Ahornweg.", "AW")).toBe("Ahornweg");
    expect(recordFileName(". . Ahornweg . .", "AW")).toBe("Ahornweg");
  });

  it("falls back to the given name when nothing usable is left", () => {
    expect(recordFileName("...", "AW")).toBe("AW");
    expect(recordFileName("   ", "TG")).toBe("TG");
  });

  it("always gives a name the note store accepts", () => {
    fcAssert(
      property(string({ maxLength: 120, unit: "binary" }), (name) => {
        expect(noteNameIssue(recordFileName(name, "AW"))).toBeUndefined();
        expect(recordFileName(name, "AW")).not.toMatch(/[#^[\]]/);
      }),
    );
  });
});

describe("followsTitle: the file still carries the name the plugin gave it for the title", () => {
  it("holds for the title's file name, also with a clash suffix", () => {
    expect(followsTitle("Ahornweg 12", "Ahornweg 12", "AW")).toBe(true);
    expect(followsTitle("Ahornweg 12 (2)", "Ahornweg 12", "AW")).toBe(true);
    expect(followsTitle("Ahornweg 12 (17)", "Ahornweg 12", "AW")).toBe(true);
    expect(followsTitle("Ahornweg 12 (100)", "Ahornweg 12", "AW")).toBe(true);
    expect(followsTitle("WEG (2)", "WEG (2)", "AW")).toBe(true);
    expect(followsTitle("Ahornweg 12-14", "Ahornweg 12/14", "AW")).toBe(true);
    expect(followsTitle("AW", "...", "AW")).toBe(true);
  });

  it("ignores case and Unicode form, as Windows and macOS do", () => {
    expect(followsTitle("ahornweg 12", "Ahornweg 12", "AW")).toBe(true);
    expect(followsTitle("Süd", "Süd", "AW")).toBe(true);
  });

  it("does not hold for a name the user gave the file", () => {
    expect(followsTitle("Unsere WEG", "Ahornweg 12", "AW")).toBe(false);
    expect(followsTitle("Ahornweg 12 (1)", "Ahornweg 12", "AW")).toBe(false);
    expect(followsTitle("Ahornweg 12 (2a)", "Ahornweg 12", "AW")).toBe(false);
    expect(followsTitle("Ahornweg 12 (02)", "Ahornweg 12", "AW")).toBe(false);
    expect(followsTitle("Ahornweg 12 alt", "Ahornweg 12", "AW")).toBe(false);
    expect(followsTitle("Ahornweg (2) 12", "Ahornweg 12", "AW")).toBe(false);
    expect(followsTitle("x Ahornweg 12", "Ahornweg 12", "AW")).toBe(false);
  });
});
