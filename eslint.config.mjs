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

/**
 * Module boundaries (ADR 0006), the second axis next to oxlint's layer rules. Both axes use
 * `no-restricted-imports`, and a later oxlint override replaces an earlier one's options instead of
 * adding to them, so a module rule there would switch off the layer rule of the same files. This
 * block runs after the oxlint block, which turns the rule off in ESLint.
 *
 * - Modules in dependency order: `shell`, then `notes`, then the feature modules. A new module
 *   is one entry here; its folders need no further rule.
 * - Every import into a module folder from outside it goes through the folder's `index.ts`
 *   (`../shell`, never `../shell/ports`), also between layers of the same module.
 * - `presentation/shell` has a second entry, the Vue-free `host.ts`, for the code that runs at
 *   plugin load (`bootstrap`, the Obsidian adapters, the composition files in `src/presentation/`).
 *   That code may not import a module's presentation `index.ts` (it loads Vue) except as types:
 *   the shell's or a feature's. Each presentation module has a Vue-free entry, `screens.ts`, which
 *   only `src/presentation/*.ts` imports (`app-surface.ts`); it loads the module's components
 *   through `import()` and imports no Vue, `.vue` file or presentation `index.ts` as a value.
 * - `application/notes` has a second entry, `adapter.ts`, the kit of the `NoteStore` adapters,
 *   which only `src/infrastructure/**` may import (`kitOutside`, `kitElsewhere`).
 * - A core module imports no module listed after it: `shell` none, `notes` only `shell`. Feature
 *   modules may import each other's index.
 * - Nothing in `src/` imports the in-memory adapters (`src/infrastructure/memory/`): they serve the
 *   tests and the harness and must never reach `main.js`.
 */
const CORE_MODULES = ["shell", "notes"];
const FEATURE_MODULES = ["communities"];
const MODULES = [...CORE_MODULES, ...FEATURE_MODULES];
/** The second entries: `presentation/shell/host.ts` and `application/notes/adapter.ts`. */
const SECOND_ENTRY = { shell: "host", notes: "adapter" };
/** Each module's entries besides its `index.ts`: its second entry and `extra`. */
const pastIndexWith = (/** @type {string[]} */ extra) =>
  MODULES.map((module) => {
    const second = SECOND_ENTRY[/** @type {keyof typeof SECOND_ENTRY} */ (module)];
    const entries = ["index", ...(second === undefined ? [] : [second]), ...extra];
    return {
      regex: `(^|/)${module}/(?!(${entries.join("|")})$)`,
      message: `Import module ${module} only through its index.ts (ADR 0006).`,
    };
  });
const pastIndex = [
  ...pastIndexWith([]),
  {
    regex: "(^|/)(?<!presentation/)shell/host$",
    message: "Only presentation/shell has a host.ts entry (ADR 0006).",
  },
];
/**
 * In `src/presentation/` the shell's folder is `./shell`, so `./shell/host` is its host entry, and
 * each module's `screens.ts` is an entry of the composition.
 */
const pastIndexInPresentation = pastIndexWith(["screens"]);
/** A module's presentation `index.ts`, which loads Vue; deeper paths fail `pastIndex` already. */
const PRESENTATION_INDEX = `(${MODULES.join("|")})(/index)?$`;
/** Code that runs at plugin load: it loads Vue only through `loadSurface` (Lazy presentation). */
const PLUGIN_LOAD_FILES = ["src/main.ts", "src/bootstrap.ts", "src/infrastructure/**/*.ts"];
/** @returns {import("eslint").Linter.Config} */
const vueFreeAtLoad = (/** @type {string[]} */ files, /** @type {string} */ regex) => ({
  files,
  rules: {
    "@typescript-eslint/no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            regex,
            allowTypeImports: true,
            message:
              "Plugin-load code imports presentation/shell/host; a presentation index.ts loads Vue (ADR 0006).",
          },
        ],
      },
    ],
  },
});
const testOnly = {
  regex: "(^|/)memory(/|$)",
  message: "The in-memory adapters are for tests and the harness only (ADR 0007).",
};
/**
 * `application/notes/adapter.ts` is the kit of the `NoteStore` adapters (writes as commands, the
 * line edit, paths): only `src/infrastructure/**` imports it, so a feature reaches the vault
 * through `NoteStore` alone. Elsewhere every `notes/adapter` is refused; in the infrastructure only
 * one of another layer than application.
 */
const INFRASTRUCTURE = "src/infrastructure/";
const kitOutside = {
  regex: "(^|/)notes/adapter$",
  message:
    "Only src/infrastructure/** imports notes/adapter, the NoteStore adapters' kit; features use NoteStore (ADR 0006).",
};
const kitElsewhere = {
  regex: "(^|/)(?<!application/)notes/adapter$",
  message: "Only application/notes has an adapter.ts entry (ADR 0006).",
};
const kitRule = (/** @type {boolean} */ infrastructure) =>
  infrastructure ? kitElsewhere : kitOutside;
const moduleFolders = (/** @type {string} */ module) => [
  `src/domain/${module}/**`,
  `src/application/${module}/**`,
  `src/infrastructure/obsidian/${module}/**`,
  `src/infrastructure/memory/${module}/**`,
  `src/presentation/${module}/**`,
];
/** @returns {import("eslint").Linter.RulesRecord} */
const restrict = (/** @type {{ regex: string; message: string }[]} */ patterns) => ({
  "no-restricted-imports": ["error", { patterns }],
});
/** A core module's folders, split by whether the kit is theirs to import. */
const coreBlocks = (/** @type {string} */ module, /** @type {number} */ index) =>
  [false, true].map((infrastructure) => ({
    files: moduleFolders(module).filter(
      (folder) => folder.startsWith(INFRASTRUCTURE) === infrastructure,
    ),
    rules: restrict([
      ...pastIndex,
      kitRule(infrastructure),
      testOnly,
      ...MODULES.slice(index + 1).map((later) => ({
        regex: `(^|/)${later}(/|$)`,
        message: `Module ${module} never imports ${later}: feature → notes → shell (ADR 0006).`,
      })),
    ]),
  }));
/** @type {import("eslint").Linter.Config[]} */
const moduleBoundaries = [
  {
    files: ["src/**/*.ts", "src/**/*.vue"],
    rules: restrict([...pastIndex, kitOutside, testOnly]),
  },
  { files: [`${INFRASTRUCTURE}**/*.ts`], rules: restrict([...pastIndex, kitElsewhere, testOnly]) },
  {
    files: ["src/presentation/*.ts"],
    rules: restrict([...pastIndexInPresentation, kitOutside, testOnly]),
  },
  vueFreeAtLoad(PLUGIN_LOAD_FILES, `(^|/)presentation/${PRESENTATION_INDEX}`),
  vueFreeAtLoad(["src/presentation/*.ts"], `^\\./${PRESENTATION_INDEX}`),
  vueFreeAtLoad(
    ["src/presentation/*/screens.ts"],
    `^(vue|@vue/.*|@nuxt/.*|@tanstack/.*|.*\\.vue|\\./index|\\.\\./${PRESENTATION_INDEX})$`,
  ),
  ...CORE_MODULES.flatMap(coreBlocks),
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
      "**/dist/**",
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
  {
    // Needs type information, so oxlint cannot own it (oxlint owns eqeqeq and no-non-null-assertion).
    files: ["**/*.ts", "**/*.mts", "**/*.vue"],
    plugins: { "@typescript-eslint": tseslint.plugin },
    rules: { "@typescript-eslint/switch-exhaustiveness-check": "error" },
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
  ...moduleBoundaries,
);
