import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";
import oxlint from "eslint-plugin-oxlint";
import vue from "eslint-plugin-vue";
import globals from "globals";
import tseslint from "typescript-eslint";
import vueParser from "vue-eslint-parser";

const LOC = { skipBlankLines: true, skipComments: true };
const TS_PROJECTS = [
  "./configs/tsconfig.app.json",
  "./configs/tsconfig.node.json",
  "./tests/e2e/tsconfig.json",
];

/**
 * eslint-plugin-obsidianmd scopes its source-file rules to JS/TS, so `.vue` files would get none
 * ("Core JS rules apply only to JS and TS files"). Re-scope the obsidianmd rules (and the
 * no-unsanitized innerHTML guard) of its TypeScript source blocks to SFCs, read from the exported
 * recommended config so they follow plugin upgrades. The Vue parser has `project`, so the
 * type-aware ones run too. Blocks keep their own `ignores` (tests, tool configs) and order, so
 * later severities and options win as they do for `.ts`. Not carried over: the JSON/plain-text
 * blocks (`validate-manifest`, `validate-license`, `depend/ban-dependencies`) need other
 * languages, and the third-party rules other than no-unsanitized are not Obsidian's.
 */
const TS_SOURCE = "**/*.{ts,cts,mts,tsx}";
const forVue = (/** @type {string} */ rule) =>
  rule.startsWith("obsidianmd/") || rule.startsWith("no-unsanitized/");
const tsSourceBlocks = obsidianmd.configs.recommended.filter(
  (config) => config.files?.length === 1 && config.files[0] === TS_SOURCE,
);
const unsanitized = tsSourceBlocks.find((config) => config.plugins?.["no-unsanitized"])?.plugins;
/** @param {import("eslint").Linter.Config} config */
const toVue = (config) => ({
  files: ["**/*.vue"],
  ignores: config.ignores ?? [],
  rules: Object.fromEntries(Object.entries(config.rules ?? {}).filter(([rule]) => forVue(rule))),
});
const obsidianmdForVue = [
  { files: ["**/*.vue"], plugins: { "no-unsanitized": unsanitized?.["no-unsanitized"] ?? {} } },
  ...tsSourceBlocks.map(toVue).filter((config) => Object.keys(config.rules).length > 0),
];

/** Vue's presets carry no `files`; scope them so `.ts` files keep the TypeScript parser. */
const vueOnly = vue.configs["flat/recommended"].map((config) =>
  config.files ? config : { ...config, files: ["**/*.vue"] },
);

export default defineConfig(
  {
    ignores: [
      "docs/**",
      ".claude/**",
      "skills/**",
      "node_modules/**",
      "dist/**",
      "release/**",
      "reports/**",
      ".stryker-tmp/**",
      ".superpowers/**",
      ".obsidian/**",
      ".obsidian-cache/**",
    ],
  },
  // Obsidian's review rules (guidelines, manifest, LICENSE); includes eslint and typescript-eslint presets.
  ...obsidianmd.configs.recommended,
  {
    files: ["**/*.ts", "**/*.mts", "**/*.mjs"],
    languageOptions: {
      parserOptions: { project: TS_PROJECTS, tsconfigRootDir: import.meta.dirname },
    },
  },
  ...vueOnly,
  {
    // Prettier owns template layout; these eslint-plugin-vue presets would fight it.
    files: ["**/*.vue"],
    rules: {
      "vue/max-attributes-per-line": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/multiline-html-element-content-newline": "off",
      "vue/html-indent": "off",
      "vue/html-closing-bracket-newline": "off",
      "vue/html-self-closing": "off",
      "vue/first-attribute-linebreak": "off",
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        project: TS_PROJECTS,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".vue"],
        sourceType: "module",
      },
      globals: globals.browser,
    },
  },
  ...obsidianmdForVue,
  {
    // Nuxt UI renders all markup; raw HTML would bypass Vue's escaping (Obsidian bans innerHTML).
    files: ["**/*.vue"],
    rules: { "vue/no-v-html": "error" },
  },
  {
    files: ["src/**/*.ts", "src/**/*.vue"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message: "Runtime config comes from SettingsService (data.json), never from process.env.",
        },
        {
          selector:
            "MemberExpression[object.type='MetaProperty'][property.name='env'][parent.type='MemberExpression'][parent.property.name!='MODE']",
          message: "Only import.meta.env.MODE is allowed in src/**.",
        },
      ],
    },
  },
  {
    files: ["scripts/**/*.mjs", "configs/**/*.ts", "configs/**/*.mjs", "*.config.mjs"],
    languageOptions: { globals: globals.node },
  },
  {
    // The harness is a plain browser page standing in for Obsidian: no activeDocument, no createEl.
    files: ["harness/**"],
    rules: {
      "obsidianmd/prefer-active-doc": "off",
      "obsidianmd/prefer-create-el": "off",
    },
  },
  {
    files: ["**/*.ts", "**/*.vue", "**/*.mjs"],
    ignores: ["tests/**"],
    rules: { "max-lines": ["error", { max: 400, ...LOC }] },
  },
  {
    files: ["tests/**/*.ts", "tests/**/*.vue"],
    rules: { "max-lines": ["error", { max: 450, ...LOC }] },
  },
  ...oxlint.buildFromOxlintConfigFile("./.oxlintrc.json"),
);
