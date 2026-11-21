import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";
import oxlint from "eslint-plugin-oxlint";
import vue from "eslint-plugin-vue";
import globals from "globals";
import tseslint from "typescript-eslint";
import vueParser from "vue-eslint-parser";

const LOC = { skipBlankLines: true, skipComments: true };
const TS_PROJECTS = ["./tsconfig.app.json", "./tsconfig.node.json"];

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
      "tests/skills/**",
      "node_modules/**",
      "dist/**",
      "release/**",
      "coverage/**",
      "reports/**",
      ".stryker-tmp/**",
      ".superpowers/**",
      ".obsidian/**",
    ],
  },
  // Obsidian's review rules (guidelines, manifest, LICENSE); includes eslint and typescript-eslint presets.
  ...obsidianmd.configs.recommended,
  {
    files: ["**/*.ts", "**/*.mjs"],
    languageOptions: {
      parserOptions: { project: TS_PROJECTS, tsconfigRootDir: import.meta.dirname },
    },
  },
  ...vueOnly,
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
    files: ["scripts/**/*.mjs", "*.config.ts", "*.config.mjs", "vite.*.ts", "vitest.*.ts"],
    languageOptions: { globals: globals.node },
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
