// @ts-check
/** Mutation testing of domain and application (blueprint Task 10). Thresholds are never lowered. */
const config = {
  testRunner: "vitest",
  vitest: { configFile: "vitest.stryker.config.ts" },
  checkers: ["typescript"],
  tsconfigFile: "tsconfig.app.json",
  mutate: ["src/domain/**/*.ts", "src/application/**/*.ts"],
  thresholds: { high: 90, low: 80, break: 75 },
  incremental: true,
  incrementalFile: "reports/stryker-incremental.json",
  reporters: ["clear-text", "progress", "html", "json"],
  htmlReporter: { fileName: "reports/mutation/index.html" },
  jsonReporter: { fileName: "reports/mutation/mutation.json" },
  // Nothing here is needed to run the unit tests: the Obsidian download (~1.3 GB), agent worktrees
  // (they contain symlinks Stryker cannot copy), skills, docs and build output.
  ignorePatterns: [
    "/.obsidian-cache",
    "/.claude",
    "/docs",
    "/dist",
    "/release",
    "/coverage",
    "/harness",
  ],
  tempDirName: ".stryker-tmp",
  cleanTempDir: "always",
};

export default config;
