import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  bundledPackages,
  collectPackages,
  cssImportPackages,
  iconPackagesOf,
  packageNameOfPath,
  packageNameOfSpecifier,
} from "../../../scripts/bundled-packages.mjs";

const dirs: string[] = [];
const temp = () => {
  const dir = mkdtempSync(join(tmpdir(), "bundled-"));
  dirs.push(dir);
  return dir;
};

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** The text of `virtual:nuxt-ui-icons` as Nuxt UI generates it: the collections as a JSON string. */
const iconsModule = (...prefixes: string[]) =>
  `let _initialized = false\nexport function init(addIcon) {\n  const collections = JSON.parse(${JSON.stringify(
    JSON.stringify(prefixes.map((prefix) => ({ prefix, icons: { check: { body: "<path/>" } } }))),
  )})\n}`;

describe("packageNameOfPath", () => {
  it.each([
    ["/repo/node_modules/vue/dist/vue.runtime.esm-bundler.js", "vue"],
    ["/repo/node_modules/@vue/shared/dist/shared.esm-bundler.js", "@vue/shared"],
    ["/repo/node_modules/vue/dist/x.js?v=abc123", "vue"],
    ["/repo/node_modules/a/node_modules/@s/b/index.js", "@s/b"],
    ["/repo/node_modules/.pnpm/x@1.0.0/node_modules/x/index.js", "x"],
    ["C:\\repo\\node_modules\\reka-ui\\dist\\index.js", "reka-ui"],
  ])("takes the package of %s", (path, name) => {
    expect(packageNameOfPath(path)).toBe(name);
  });

  it.each([
    "/repo/src/main.ts",
    "\0rolldown/runtime.js",
    "virtual:nuxt-ui-icons",
    "/repo/node_modules/.nuxt-ui/ui/button.ts",
    "/repo/node_modules/",
  ])("has no package for %s", (path) => {
    expect(packageNameOfPath(path)).toBeNull();
  });
});

describe("packageNameOfSpecifier", () => {
  it.each([
    ["tailwindcss/theme.css", "tailwindcss"],
    ["tailwindcss", "tailwindcss"],
    ["@nuxt/ui", "@nuxt/ui"],
    ["@nuxt/ui/some/file.css", "@nuxt/ui"],
  ])("takes the package of %s", (specifier, name) => {
    expect(packageNameOfSpecifier(specifier)).toBe(name);
  });

  it.each([
    "./tokens.css",
    "../a.css",
    "/abs/a.css",
    "#build/ui.css",
    "node:fs",
    "https://x.y/a.css",
    "@",
  ])("has no package for %s", (specifier) => {
    expect(packageNameOfSpecifier(specifier)).toBeNull();
  });
});

describe("cssImportPackages", () => {
  const files: Record<string, string> = {
    "/s/app.css": [
      '@import "tailwindcss/theme.css" layer(theme) prefix(wm);',
      "@import url('x-pkg/a.css');",
      "@import './tokens.css';",
      '@plugin "@scope/plug";',
      '/* @import "commented-out"; */',
      '@source "../presentation";',
    ].join("\n"),
    "/s/tokens.css": '@import "other"; @import "./app.css";',
  };
  const read = (file: string) => files[file];

  it("lists the packages a style sheet imports, following relative imports", () => {
    expect(cssImportPackages("/s/app.css", read)).toEqual([
      "@scope/plug",
      "other",
      "tailwindcss",
      "x-pkg",
    ]);
  });

  it("ignores a relative import that cannot be read", () => {
    expect(
      cssImportPackages("/s/tokens.css", (file) =>
        file === "/s/app.css" ? undefined : files[file],
      ),
    ).toEqual(["other"]);
  });
});

describe("iconPackagesOf", () => {
  it("names the @iconify-json package of every bundled collection", () => {
    expect(iconPackagesOf(iconsModule("lucide", "tabler"))).toEqual([
      "@iconify-json/lucide",
      "@iconify-json/tabler",
    ]);
  });

  it("has none when icons are not bundled", () => {
    expect(iconPackagesOf("export function init() {}")).toEqual([]);
  });

  it("fails on a format it does not know, rather than dropping the icons", () => {
    expect(() => iconPackagesOf('export function init() { addIcon("a", {}) }')).toThrow(
      "virtual:nuxt-ui-icons",
    );
  });
});

describe("collectPackages", () => {
  it("merges modules, icons and style sheets and records why each package is there", () => {
    expect(
      collectPackages({
        moduleIds: [
          "/r/node_modules/vue/dist/a.js",
          "/r/node_modules/vue/dist/b.js?x=1",
          "/r/src/main.ts",
          "/r/src/styles/app.css",
        ],
        iconsCode: iconsModule("lucide"),
        readCss: (file) =>
          file.endsWith("app.css") ? '@import "tailwindcss/theme.css";' : undefined,
      }),
    ).toEqual({
      "@iconify-json/lucide": ["icons"],
      tailwindcss: ["css"],
      vue: ["js"],
    });
  });

  it("lists every reason when a package is there for more than one", () => {
    const packages = collectPackages({
      moduleIds: ["/r/node_modules/@nuxt/ui/dist/a.js", "/r/src/app.css"],
      readCss: () => '@import "@nuxt/ui";',
    });
    expect(packages).toEqual({ "@nuxt/ui": ["css", "js"] });
  });
});

const chunk = (moduleIds: string[]) => ({ type: "chunk", fileName: "main.js", moduleIds });

/** The two hooks of the plugin, callable without a bundler. */
const hooksOf = (options: Parameters<typeof bundledPackages>[0]) =>
  bundledPackages(options) as unknown as {
    transform: (code: string, id: string) => unknown;
    writeBundle: (options: { dir: string }, bundle: object) => void;
  };

describe("bundledPackages plugin", () => {
  it("writes the package list with the hash of the bundle it describes", () => {
    const dir = temp();
    const outFile = join(dir, "reports", "bundled-packages.json");
    writeFileSync(join(dir, "main.js"), "bundle text");
    const plugin = hooksOf({ outFile });
    plugin.transform(iconsModule("lucide"), "virtual:nuxt-ui-icons");
    plugin.writeBundle(
      { dir },
      { "main.js": chunk(["/r/node_modules/vue/dist/a.js"]), "styles.css": { type: "asset" } },
    );
    expect(JSON.parse(readFileSync(outFile, "utf8"))).toEqual({
      mainJsSha256: createHash("sha256").update("bundle text").digest("hex"),
      packages: { "@iconify-json/lucide": ["icons"], vue: ["js"] },
    });
  });

  it("writes nothing when disabled", () => {
    const dir = temp();
    const outFile = join(dir, "bundled-packages.json");
    writeFileSync(join(dir, "main.js"), "x");
    hooksOf({ outFile, enabled: false }).writeBundle({ dir }, { "main.js": chunk([]) });
    expect(existsSync(outFile)).toBe(false);
  });
});
