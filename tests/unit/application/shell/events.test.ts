import { describe, expect, it } from "vitest";
import { AppEvent } from "../../../../src/application/events";
import { changesMarkdownFiles } from "../../../../src/application/shell/events";

const md = { extension: "md" };
const png = { extension: "png" };
const rename = (path: string, oldPath: string, extension: string) =>
  changesMarkdownFiles(AppEvent.FileRenamed({ path, oldPath, extension }));

describe("changesMarkdownFiles", () => {
  it("is true when a Markdown file appears or disappears", () => {
    expect(changesMarkdownFiles(AppEvent.FileCreated({ path: "a.md", ...md }))).toBe(true);
    expect(changesMarkdownFiles(AppEvent.FileDeleted({ path: "a.md", ...md }))).toBe(true);
  });

  it("is true for a rename into or out of Markdown and false within it", () => {
    expect(rename("a.md", "a.txt", "md")).toBe(true);
    expect(rename("a.txt", "a.md", "txt")).toBe(true);
    expect(rename("b.md", "a.md", "md")).toBe(false);
    expect(rename("b.png", "a.png", "png")).toBe(false);
  });

  it("is false for other files and for events that keep the set of files", () => {
    expect(changesMarkdownFiles(AppEvent.FileCreated({ path: "a.png", ...png }))).toBe(false);
    expect(changesMarkdownFiles(AppEvent.FileModified({ path: "a.md", ...md }))).toBe(false);
    expect(changesMarkdownFiles(AppEvent.MetadataChanged({ path: "a.md", ...md }))).toBe(false);
    expect(changesMarkdownFiles(AppEvent.LayoutReady())).toBe(false);
    expect(changesMarkdownFiles(AppEvent.ActiveFileChanged({ path: null }))).toBe(false);
    expect(changesMarkdownFiles(AppEvent.ColorSchemeChanged({ scheme: "dark" }))).toBe(false);
  });
});
