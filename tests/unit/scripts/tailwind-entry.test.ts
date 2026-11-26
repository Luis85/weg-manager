import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  NUXT_UI_COMPONENTS,
  NUXT_UI_THEMES,
  TAILWIND_ENTRY,
  tailwindEntry,
} from "../../../configs/tailwind-entry";

/** Every checked-in stylesheet of the plugin. */
const stylesheets = (folder: string): string[] =>
  readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) return stylesheets(path);
    return entry.name.endsWith(".css") ? [path] : [];
  });

/** At-rules of Tailwind and its plugins that a plain CSS linter does not know. */
const TAILWIND_AT_RULES =
  /@(source|theme|apply|utility|variant|custom-variant|plugin|config|reference)\b/;

describe("the Tailwind entry (configs/tailwind-entry.ts)", () => {
  it("keeps every Tailwind at-rule out of the checked-in CSS (Obsidian's review lints it)", () => {
    const found = stylesheets("src").filter((file) =>
      TAILWIND_AT_RULES.test(readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "")),
    );
    expect(found).toEqual([]);
  });

  it("is what app.css imports", () => {
    const app = readFileSync("src/styles/app.css", "utf8");
    const imported = /@import "([^"]+tailwind\.css)";/.exec(app)?.[1] ?? "";
    expect(resolve("src/styles", imported)).toBe(resolve(TAILWIND_ENTRY));
  });

  it("scans the presentation and only the Nuxt UI components the plugin renders", () => {
    const text = tailwindEntry();
    expect(text).toContain(`{${NUXT_UI_THEMES.join(",")}}.ts`);
    expect(text).toContain(`{${NUXT_UI_COMPONENTS.join(",")}}.vue`);
    for (const component of NUXT_UI_COMPONENTS) {
      expect(existsSync(`node_modules/@nuxt/ui/dist/runtime/components/${component}.vue`)).toBe(
        true,
      );
    }
  });

  it("refers to folders that are there, relative to where it is written", () => {
    const folders = [...tailwindEntry().matchAll(/@source (?:not )?"([^"{]+)"/g)].map(
      (match) => match[1] ?? "",
    );
    expect(folders.length).toBeGreaterThan(0);
    const missing = folders.filter(
      (folder) => !existsSync(resolve(dirname(TAILWIND_ENTRY), folder)),
    );
    expect(missing).toEqual([]);
  });
});
