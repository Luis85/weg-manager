import { resolve } from "node:path";
import { env } from "node:process";
import { parseObsidianVersions } from "wdio-obsidian-service";

/**
 * End-to-end tests in a real Obsidian app (docs/design/research/Testing research - Obsidian
 * end-to-end tests.md). Runs `dist/` as installed plugin; `npm run test:e2e` builds first.
 */
const rootDir = resolve(import.meta.dirname, "../..");
const cacheDir = resolve(rootDir, ".obsidian-cache");

// Latest app on the latest installer. OBSIDIAN_VERSIONS overrides it, e.g. "earliest/earliest"
// for minAppVersion on the oldest installer it accepts.
const versions = await parseObsidianVersions(env["OBSIDIAN_VERSIONS"] ?? "latest/latest", {
  cacheDir,
});
// CI keys its download cache on this line (.github/workflows/ci.yml).
if (env["CI"]) process.stdout.write(`obsidian-cache-key: ${JSON.stringify(versions)}\n`);

export const config: WebdriverIO.Config = {
  rootDir,
  runner: "local",
  framework: "mocha",
  specs: ["./tests/e2e/specs/**/*.e2e.ts"],
  maxInstances: Number(env["WDIO_MAX_INSTANCES"] ?? 2),
  capabilities: versions.map(([appVersion, installerVersion]) => ({
    browserName: "obsidian",
    "wdio:obsidianOptions": {
      appVersion,
      installerVersion,
      plugins: ["dist"],
      vault: "tests/e2e/vaults/basic",
    },
    // Without a stored choice Obsidian takes its language from Chromium's locale, so the whole app
    // starts German, as for a German user, and the plugin follows it. The specs assert German
    // texts; language.e2e.ts switches to English itself.
    "goog:chromeOptions": { args: ["--lang=de"] },
  })),
  services: ["obsidian"],
  reporters: ["obsidian"],
  mochaOpts: { ui: "bdd", timeout: 60_000 },
  waitforInterval: 250,
  waitforTimeout: 5_000,
  logLevel: "warn",
  outputDir: resolve(rootDir, "reports/e2e"),
  cacheDir,
  injectGlobals: false,
};
