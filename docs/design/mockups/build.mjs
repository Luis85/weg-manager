// Rendert jede Mockup-Quelle in diesem Ordner als PNG nach docs/design/sitemap/assets.
// Aufruf aus dem Repo-Wurzelverzeichnis: node docs/design/mockups/build.mjs [Dateifilter]
// Jede Quelle trägt im <head>: <meta name="mockup" content="out=v2-…png; width=1440; height=1024; scale=2">
// Lädt nichts aus dem Netz: Schriften und Styles kommen aus shared.css und der Datei selbst.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

// Playwright ist keine Projektabhängigkeit; es wird über den normalen Modulpfad (NODE_PATH) gefunden.
const { chromium } = createRequire(import.meta.url)("playwright");

const dir = dirname(fileURLToPath(import.meta.url));
const out = resolve(dir, "../sitemap/assets");
const filter = process.argv[2] ?? "";

const sources = readdirSync(dir)
  .filter((name) => name.endsWith(".html") && name.includes(filter))
  .sort();

const meta = (html, file) => {
  const match = html.match(/<meta name="mockup" content="([^"]+)"/);
  if (!match) throw new Error(`${file}: <meta name="mockup"> fehlt`);
  const fields = Object.fromEntries(
    match[1].split(";").map((part) => part.trim().split("=").map((s) => s.trim())),
  );
  return {
    out: fields.out,
    width: Number(fields.width ?? 1440),
    height: Number(fields.height ?? 1024),
    scale: Number(fields.scale ?? 2),
  };
};

const browser = await chromium.launch();
let failed = 0;
for (const file of sources) {
  const html = readFileSync(join(dir, file), "utf8");
  const { out: name, width, height, scale } = meta(html, file);
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale });
  const page = await context.newPage();
  const external = [];
  page.on("request", (request) => {
    const url = request.url();
    if (!url.startsWith("file:") && !url.startsWith("data:")) external.push(url);
  });
  await page.goto(pathToFileURL(join(dir, file)).href);
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollHeight > window.innerHeight + 1,
  );
  if (external.length > 0) {
    failed += 1;
    console.error(`${file}: lädt aus dem Netz: ${external.join(", ")}`);
  }
  if (overflow) console.warn(`${file}: Inhalt höher als ${height} px, wird abgeschnitten`);
  await page.screenshot({ path: join(out, name) });
  await context.close();
  console.log(`ok ${file} → ${name}`);
}
await browser.close();
process.exitCode = failed > 0 ? 1 : 0;
