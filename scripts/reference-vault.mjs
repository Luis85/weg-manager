// @ts-check
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The desktop reference profile of F-21 for the note index: two communities, 200 Punkte and
 * 2,000 notes with frontmatter in total, plus plain Markdown notes without frontmatter. The
 * profile's 1,000 attachments are left out: the index reads frontmatter only, never a binary.
 */
export const REFERENCE_PROFILE = Object.freeze({
  communities: 2,
  points: 200,
  records: 2000,
  plain: 200,
});

/** @typedef {{ seed?: number; points?: number; records?: number; plain?: number }} Options */
/** @typedef {{ name: string; shortCode: string; color: string }} Community */

/** @type {readonly Community[]} */
const COMMUNITIES = [
  { name: "Ahornweg 12", shortCode: "AW", color: "teal" },
  { name: "Birkenallee 3", shortCode: "BA", color: "violet" },
];

const TOPICS = [
  "Dachrinne",
  "Heizung",
  "Treppenhaus",
  "Aufzug",
  "Fenster",
  "Garten",
  "Tiefgarage",
  "Fassade",
  "Wasserschaden",
  "Hausordnung",
  "Rauchmelder",
  "Klingelanlage",
];
const STATUSES = ["open", "in_progress", "done"];

/**
 * Mulberry32: a small seeded generator, so the same seed gives the same vault byte for byte. No
 * clock and no `Math.random`.
 * @param {number} seed
 */
const generator = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let next = state;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
};

/** @typedef {ReturnType<typeof generator>} Random */

/** @param {Random} random @param {number} count */
const below = (random, count) => Math.floor(random() * count);

/** @template T @param {Random} random @param {readonly T[]} items @returns {T} */
const pick = (random, items) => /** @type {T} */ (items[below(random, items.length)]);

/** A version 4 UUID from the generator. @param {Random} random */
const uuid = (random) => {
  const hex = Array.from({ length: 32 }, () => below(random, 16).toString(16));
  hex[12] = "4";
  hex[16] = (8 + below(random, 4)).toString(16);
  const text = hex.join("");
  return `${text.slice(0, 8)}-${text.slice(8, 12)}-${text.slice(12, 16)}-${text.slice(16, 20)}-${text.slice(20)}`;
};

/** @param {number} value @param {number} width */
const padded = (value, width) => String(value).padStart(width, "0");

/** @param {Random} random */
const dateIn2026 = (random) =>
  `2026-${padded(1 + below(random, 12), 2)}-${padded(1 + below(random, 28), 2)}`;

/**
 * A note's text with the given flat frontmatter. Every value here is plain YAML text: no colon,
 * no quote, no leading sign.
 * @param {readonly (readonly [string, string])[]} frontmatter
 * @param {string} body
 */
const note = (frontmatter, body) =>
  `---\n${frontmatter.map(([key, value]) => `${key}: ${value}\n`).join("")}---\n\n${body}`;

/**
 * The reference vault as vault paths mapped to file texts, sorted by path. Records follow the
 * file contract of ADR 0007: `schema: weg-manager.<type>/v1`, `id: <type>-<uuid>`, English
 * snake_case keys, a `community_id` on everything but communities. Only `community` is specified
 * so far, so every other record is of the generic type `item`, with `kind: point` for the
 * Punkte; the generator follows the real types as they are built.
 * @param {Options} [options]
 * @returns {Map<string, string>}
 */
export const referenceVault = (options = {}) => {
  const { seed = 1, ...profile } = options;
  const { communities, points, records, plain } = { ...REFERENCE_PROFILE, ...profile };
  if (records < communities + points) {
    throw new Error(
      `records (${records}) must hold the communities (${communities}) and the points (${points})`,
    );
  }
  const random = generator(seed);
  /** @type {[string, string][]} */
  const files = [];
  const ids = COMMUNITIES.slice(0, communities).map((community) => {
    const id = `community-${uuid(random)}`;
    files.push([
      `WEG Manager/Gemeinschaften/${community.name}.md`,
      note(
        [
          ["schema", "weg-manager.community/v1"],
          ["id", id],
          ["name", community.name],
          ["short_code", community.shortCode],
          ["color", community.color],
          ["kind", "WEG"],
          ["unit_label", "Einheiten"],
        ],
        `# ${community.name}\n`,
      ),
    ]);
    return { id, shortCode: community.shortCode };
  });
  const items = records - communities;
  for (let index = 1; index <= items; index += 1) {
    const isPoint = index <= points;
    const number = isPoint ? index : index - points;
    const community = pick(random, ids);
    const topic = pick(random, TOPICS);
    /** @type {[string, string][]} */
    const head = [
      ["schema", "weg-manager.item/v1"],
      ["id", `item-${uuid(random)}`],
      ["community_id", community.id],
    ];
    if (isPoint) {
      const label = `P-${padded(number, 3)}`;
      files.push([
        `WEG Manager/Punkte/${community.shortCode}/${label}.md`,
        note(
          [
            ...head,
            ["kind", "point"],
            ["number", label],
            ["title", topic],
            ["status", pick(random, STATUSES)],
            ["date", dateIn2026(random)],
          ],
          `# ${label} ${topic}\n\nDer Beirat prüft das Thema ${topic}.\n`,
        ),
      ]);
    } else {
      const label = `Notiz ${padded(number, 4)}`;
      files.push([
        `WEG Manager/Notizen/${community.shortCode}/${label}.md`,
        note(
          [...head, ["kind", "note"], ["title", topic], ["date", dateIn2026(random)]],
          `# ${label}\n\nNotiz zum Thema ${topic}.\n`,
        ),
      ]);
    }
  }
  for (let index = 1; index <= plain; index += 1) {
    const label = `Gedanke ${padded(index, 4)}`;
    files.push([`Privat/${label}.md`, `# ${label}\n\nEin Gedanke zu ${pick(random, TOPICS)}.\n`]);
  }
  files.sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));
  return new Map(files);
};

/**
 * Writes the reference vault into `target`, replacing whatever the folder held.
 * @param {string} target
 * @param {Options} [options]
 * @returns {{ files: number; records: number; plain: number }}
 */
export const writeReferenceVault = (target, options = {}) => {
  const vault = referenceVault(options);
  rmSync(target, { recursive: true, force: true });
  let plain = 0;
  for (const [path, text] of vault) {
    const file = join(target, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, text);
    if (!text.startsWith("---\n")) plain += 1;
  }
  return { files: vault.size, records: vault.size - plain, plain };
};

const isCli =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const target = process.argv[2];
  if (target === undefined) {
    console.error("usage: node scripts/reference-vault.mjs <target folder>");
    process.exitCode = 1;
  } else {
    const written = writeReferenceVault(resolve(target));
    console.log(
      `reference-vault ✓ ${written.files} notes (${written.records} records, ${written.plain} plain) in ${target}`,
    );
  }
}
