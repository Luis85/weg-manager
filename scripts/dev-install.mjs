// @ts-check
/**
 * Development loop: watch-build in development mode and copy every successful build into the
 * plugin folder of a test vault (OBSIDIAN_PLUGIN_DIR from .env.local), plus a `.hotreload` marker
 * for the Hot Reload plugin. Without OBSIDIAN_PLUGIN_DIR it builds once and explains the setup.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";
import { build } from "vite";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const target = process.env["OBSIDIAN_PLUGIN_DIR"];

/** @param {string} dir */
const install = (dir) => {
  mkdirSync(dir, { recursive: true });
  for (const name of readdirSync("dist")) copyFileSync(join("dist", name), join(dir, name));
  writeFileSync(join(dir, ".hotreload"), "");
  console.log(`dev: installed dist/ into ${dir}`);
};

if (target === undefined || target.trim() === "") {
  await build({ configFile: "configs/vite.config.ts", mode: "development" });
  console.log(
    [
      "dev: built dist/ once. To install into a test vault on every change, create .env.local with",
      "  OBSIDIAN_PLUGIN_DIR=<vault>/.obsidian/plugins/weg-manager",
      "and run `npm run dev` again.",
    ].join("\n"),
  );
} else {
  const dir = resolve(target);
  const watcher = /** @type {import("vite").Rolldown.RolldownWatcher} */ (
    await build({ configFile: "configs/vite.config.ts", mode: "development", build: { watch: {} } })
  );
  watcher.on("event", (/** @type {import("vite").Rolldown.RolldownWatcherEvent} */ event) => {
    if (event.code === "BUNDLE_END") install(dir);
    if (event.code === "ERROR") console.error("dev: build failed", event.error.message);
  });
}
