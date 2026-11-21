import { defineConfig } from "vitest/config";
import { ROOT, obsidianGuard, testAlias } from "./vitest.config.ts";

/** Mutation testing runs the fast node tests of the inner layers only, without coverage. */
export default defineConfig({
  root: ROOT,
  plugins: [obsidianGuard()],
  resolve: { alias: testAlias },
  test: {
    include: ["tests/unit/domain/**/*.test.ts", "tests/unit/application/**/*.test.ts"],
    environment: "node",
  },
});
