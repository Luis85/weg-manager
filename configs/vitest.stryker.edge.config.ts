import { defineConfig } from "vitest/config";
import { ROOT, obsidianGuard, testAlias } from "./vitest.config.ts";
import { sharedConfig } from "./vite.shared.ts";

/**
 * Mutation testing of the edge layers runs the unit and the dom project, without coverage. The
 * projects repeat the ones in `vitest.config.ts`; Stryker reads this file instead of that one.
 */
export default defineConfig({
  root: ROOT,
  plugins: [obsidianGuard()],
  resolve: { alias: testAlias },
  test: {
    projects: [
      {
        test: { name: "unit", include: ["tests/unit/**/*.test.ts"], environment: "node" },
      },
      {
        plugins: [...(sharedConfig({ mode: "test" }).plugins ?? [])],
        define: sharedConfig({ mode: "test" }).define ?? {},
        test: {
          name: "dom",
          include: ["tests/dom/**/*.test.ts"],
          environment: "happy-dom",
          setupFiles: ["tests/support/dom-setup.ts"],
        },
      },
    ],
  },
});
