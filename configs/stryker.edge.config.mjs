// @ts-check
/**
 * Mutation testing of the edge layers that the gated run skips: the Obsidian and in-memory
 * adapters, the presentation `.ts` files and `bootstrap.ts`. Informational: no `break` threshold,
 * and never part of `verify` or the pre-push hook. It has its own report and incremental file, so
 * it never disturbs the gated run's cache. The tests are the unit and the dom project.
 */
const config = {
  testRunner: "vitest",
  vitest: { configFile: "configs/vitest.stryker.edge.config.ts" },
  checkers: ["typescript"],
  tsconfigFile: "configs/tsconfig.app.json",
  mutate: [
    "src/infrastructure/obsidian/**/*.ts",
    "src/infrastructure/memory/**/*.ts",
    "src/presentation/**/*.ts",
    "src/bootstrap.ts",
  ],
  // No `break`: the score is read, not enforced.
  thresholds: { high: 90, low: 80, break: null },
  incremental: true,
  incrementalFile: "reports/stryker-edge-incremental.json",
  reporters: ["clear-text", "progress", "html", "json"],
  htmlReporter: { fileName: "reports/mutation-edge/index.html" },
  jsonReporter: { fileName: "reports/mutation-edge/mutation.json" },
  // Nothing here is needed to run the tests (see stryker.config.mjs).
  ignorePatterns: [
    "/.obsidian-cache",
    "/.claude",
    "/docs",
    "/dist",
    "/release",
    "/coverage",
    "/tests/harness",
  ],
  // The folder every linter and formatter already ignores; two Stryker runs in one checkout at once
  // would share it, so run the gated and the edge run one after the other.
  tempDirName: ".stryker-tmp",
  cleanTempDir: "always",
};

export default config;
