// Nimmt die Bildschirme des klickbaren Prototyps auf: 18 Desktop (1440 × 900) und 18 Mobil (390 × 844), jeweils scale 2.
// Aufruf aus dem Repo-Wurzelverzeichnis: node docs/design/prototype/screenshots.mjs [Filter, z. B. "D-09" oder "M-"]
// Ergebnis: docs/design/sitemap/assets/v2-P-<D|M>-<Nr>-<Name>.png
// Playwright ist keine Projektabhängigkeit; es wird über den normalen Modulpfad (NODE_PATH) gefunden.
// Die Schriften (Geist) lädt der Prototyp von Google Fonts; ohne Netz fällt er auf Systemschriften zurück.
//
// Die Bildschirme bauen aufeinander auf: Jeder Eintrag in SCREENS führt seine Schritte im Zustand
// des vorigen aus. So entsteht ein Durchlauf wie im Pilottest: Wochenarbeit, danach Ansichten im
// Zustand nach der Woche (Postausgang mit 4 Entwürfen, Woche ✓).
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const { chromium } = createRequire(import.meta.url)("playwright");

const dir = dirname(fileURLToPath(import.meta.url));
const page_url = pathToFileURL(join(dir, "WEG-Manager-Prototyp.html")).href;
const out = resolve(dir, "../sitemap/assets");
const filter = process.argv[2] ?? "";

const VIEWPORTS = [
  { key: "D", width: 1440, height: 900, mobile: false },
  { key: "M", width: 390, height: 844, mobile: true },
];

// Schritte: tap(selector) klickt das erste sichtbare Element, type(selector, text) tippt, key(name) drückt eine Taste.
const tap = (selector) => ({ tap: selector });
const type = (selector, text) => ({ type: selector, text });
const key = (name) => ({ key: name });
const act = (name, extra = "") => tap(`[data-act="${name}"]${extra}`);
const go = (route) => act("go", `[data-r="${route}"]`);

export const SCREENS = [
  { nr: "01", name: "Lage", steps: [] },
  { nr: "02", name: "Woche-Eingang", steps: [act("startWeek")] },
  {
    nr: "03",
    name: "Woche-Nachhalten",
    steps: [
      act("inDo", '[data-k="assign"]'), // Portalnachricht Kellerabdichtung → AW 041, Termin 02.12. übernommen
      act("inDo", '[data-k="assign"]'), // Prüfprotokoll → TG 052
      act("inC", '[data-c="TG"]'), // Anruf Hausmeister: Gemeinschaft wählen
      act("inDo", '[data-k="assign"]'), // → TG 066
      act("step", '[data-s="2"]'),
    ],
  },
  {
    nr: "04",
    name: "Woche-Entscheiden",
    steps: [
      act("wAns", '[data-id="AW 041"][data-k="nach"]'),
      act("wAns", '[data-id="TG 052"][data-k="nach"]'),
      act("wAns", '[data-id="TG 058"][data-k="in"]'),
      act("wAns", '[data-id="AW 063"][data-k="wait"]'),
      act("step", '[data-s="3"]'),
      act("choose", '[data-k="empf"]'), // Sonnensegel: Angebot B empfehlen, noch nicht bestätigt
    ],
  },
  {
    nr: "05",
    name: "Woche-Senden",
    steps: [
      act("confirm"),
      act("choose", '[data-k="info"]'),
      act("confirm"),
      act("choose", '[data-k="info"]'),
      act("confirm"),
      act("choose", '[data-k="schritt"]'),
      act("confirm"),
      act("choose", '[data-k="beheb"]'),
      act("confirm"),
      act("choose", '[data-k="selbst"]'),
      act("confirm"),
      act("step", '[data-s="4"]'),
    ],
  },
  {
    nr: "06",
    name: "Woche-Uebergabe",
    steps: [act("step", '[data-s="5"]'), type('[data-act-input="nhS"][data-i="0"]', "Antwort Kellerabdichtung")],
  },
  { nr: "07", name: "Postausgang", steps: [act("finishWeek"), go("post")] },
  { nr: "08", name: "Vorgaenge", steps: [go("vorgaenge")] },
  { nr: "09", name: "Vorgangsakte", steps: [act("akte", '[data-id="AW 041"]')] },
  { nr: "10", name: "Verlauf-Modal", steps: [tap("#view .tlb")] },
  { nr: "11", name: "Quelle-Modal", steps: [key("Escape"), act("srcOpen")] },
  { nr: "12", name: "Erfassen-Notiz", steps: [key("Escape"), act("erfassen", '[data-art="Notiz"]')] },
  {
    nr: "13",
    name: "Erfassen-Zusage",
    steps: [key("Escape"), act("erfassen", ":not([data-id])"), act("fSrc", '[data-v="Datei"]')],
  },
  { nr: "14", name: "Kontakte", steps: [key("Escape"), go("kontakte")] },
  { nr: "15", name: "Kontakt-Modal", steps: [act("kSel", '[data-id="k1"]')] },
  { nr: "16", name: "Kontakt-neu", steps: [key("Escape"), act("kNew")] },
  { nr: "17", name: "Einstellungen", steps: [key("Escape"), go("einst")] },
  { nr: "18", name: "Einstellungen-Wochenrhythmus", steps: [act("eSec", '[data-s="woche"]')] },
];

const fileName = (vp, s) => `v2-P-${vp.key}-${s.nr}-${s.name}.png`;

async function run(page, step) {
  if (step.tap) await page.locator(`${step.tap}:visible`).first().click();
  else if (step.type) await page.locator(`${step.type}:visible`).first().fill(step.text);
  else if (step.key) await page.keyboard.press(step.key);
}

const browser = await chromium.launch();
let errors = 0;
for (const vp of VIEWPORTS) {
  const wanted = SCREENS.filter((s) => fileName(vp, s).includes(filter));
  if (!wanted.length) continue;
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    colorScheme: "light",
    locale: "de-DE",
  });
  // Tour und Erst-Hinweise gelten als gesehen, damit sie die Aufnahmen nicht verdecken.
  await context.addInitScript(() => {
    localStorage.setItem("wm-tour", "1");
    for (const n of [1, 2, 3, 4, 5]) localStorage.setItem(`wm-wh-${n}`, "1");
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => {
    errors++;
    console.error(`[${vp.key}] Seitenfehler: ${e.message}`);
  });
  page.on("console", (m) => {
    if (m.type() === "error") {
      errors++;
      console.error(`[${vp.key}] Konsole: ${m.text()}`);
    }
  });
  await page.goto(page_url);
  await page.evaluate(() => document.fonts.ready);
  // Die Prototypleiste (Testaufgaben, Hell/Dunkel …) gehört nicht zur App und bleibt aus den Bildern.
  await page.addStyleTag({ content: ".pbar{display:none!important}" });
  await page.evaluate(() => window.dispatchEvent(new HashChangeEvent("hashchange")));

  for (const screen of SCREENS) {
    for (const step of screen.steps) await run(page, step);
    if (!wanted.includes(screen)) continue;
    await page.waitForFunction(() => !document.querySelector("#toastRoot")?.children.length, null, {
      timeout: 6000,
    });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    const path = join(out, fileName(vp, screen));
    await page.screenshot({ path });
    console.log(`${fileName(vp, screen)}`);
  }
  await context.close();
}
await browser.close();
if (errors) {
  console.error(`${errors} Fehler im Prototyp`);
  process.exit(1);
}
