process.env.TZ = "UTC";

import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

const OBSIDIAN_GUARD = "\0obsidian-guard";

/** Any import of the real `obsidian` package in tests fails loudly unless the suite opts into the test double. */
export function obsidianGuard(): Plugin {
  return {
    name: "obsidian-guard",
    enforce: "pre",
    resolveId(id) {
      return id === "obsidian" ? OBSIDIAN_GUARD : null;
    },
    load(id) {
      return id === OBSIDIAN_GUARD
        ? 'throw new Error("OBSIDIAN_REQUIRES_TEST_DOUBLE: add vi.mock(\\"obsidian\\", () => import(\\"@test/obsidian\\"))");'
        : null;
    },
  };
}

export const testAlias = {
  "@test/obsidian": fileURLToPath(new URL("./tests/support/obsidian/index.ts", import.meta.url)),
};

const ci = Boolean(process.env["TF_BUILD"]);

export default defineConfig({
  plugins: [obsidianGuard()],
  resolve: { alias: testAlias },
  test: {
    reporters: ci ? ["default", ["junit", { outputFile: "reports/junit.xml" }]] : ["default"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,vue}"],
      exclude: ["src/main.ts", "src/styles/**", "src/env.d.ts"],
      reporter: ["text", "html", "cobertura"],
      reportsDirectory: "coverage",
      thresholds: { lines: 90, statements: 90, functions: 90, branches: 85 },
    },
    projects: [
      {
        plugins: [obsidianGuard()],
        resolve: { alias: testAlias },
        test: { name: "unit", include: ["tests/unit/**/*.test.ts"], environment: "node" },
      },
      {
        plugins: [obsidianGuard()],
        resolve: { alias: testAlias },
        test: { name: "dom", include: ["tests/dom/**/*.test.ts"], environment: "happy-dom" },
      },
    ],
  },
});
