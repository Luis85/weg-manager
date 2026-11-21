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
  tempDirName: ".stryker-tmp",
  cleanTempDir: "always",
};

export default config;
