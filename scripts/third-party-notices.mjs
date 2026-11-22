// @ts-check
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { OVERRIDES } from "./notice-overrides.mjs";

/** Generated from the packages in `dist/main.js` and `dist/styles.css`; see `npm run notices`. */
export const NOTICES_FILE = "THIRD-PARTY-NOTICES.txt";

/** Written by the build (`scripts/bundled-packages.mjs`); not checked in. */
export const PACKAGES_FILE = join("reports", "bundled-packages.json");

/** @typedef {{ kind: "license" | "notice"; text: string }} NoticeText */
/** @typedef {{ name: string; license: string; texts: NoticeText[] }} Entry */
/** @typedef {import("./notice-overrides.mjs").Override} Override */

/** Code points, not locale: the same order on every machine. */
const byName = (/** @type {string} */ a, /** @type {string} */ b) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * No byte order mark, LF line endings, no trailing blanks, no empty line around the text, one final newline.
 * @param {string} text
 */
export const normalizeText = (text) =>
  `${text
    .replace(/^﻿/, "")
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/^\n+/, "")
    .replace(/\n+$/, "")}\n`;

const LICENSE_FILE = /^(licen[cs]e|copying|unlicense)([-_.].*)?$/i;
const NOTICE_FILE = /^notice([-_.].*)?$/i;
const CODE_FILE = /\.(c?js|mjs|ts|tsx|json|d\.ts|map)$/i;

/**
 * The licence files and NOTICE files in the root of a package, licences first, each sorted.
 * @param {string} dir
 * @returns {{ file: string; kind: NoticeText["kind"] }[]}
 */
export const findNoticeFiles = (dir) => {
  const files = readdirSync(dir).filter(
    (file) => !CODE_FILE.test(file) && statSync(join(dir, file)).isFile(),
  );
  const named = (/** @type {RegExp} */ pattern) => files.filter((file) => pattern.test(file));
  return [
    ...named(LICENSE_FILE)
      .toSorted(byName)
      .map((file) => ({ file, kind: /** @type {const} */ ("license") })),
    ...named(NOTICE_FILE)
      .toSorted(byName)
      .map((file) => ({ file, kind: /** @type {const} */ ("notice") })),
  ];
};

const MIT_TEXT = (/** @type {string} */ copyright) => `MIT License

${copyright}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

const ISC_TEXT = (/** @type {string} */ copyright) => `ISC License

${copyright}

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
`;

/** Licences with a standard text that only needs a copyright line. */
const STANDARD_TEXTS = { MIT: MIT_TEXT, ISC: ISC_TEXT };

/**
 * @param {unknown} author the `author` field of a package.json
 * @returns {string | undefined} the name, without e-mail address and URL
 */
const authorName = (author) => {
  const raw =
    typeof author === "string" ? author : /** @type {{ name?: unknown }} */ (author)?.name;
  if (typeof raw !== "string") return undefined;
  const name = raw.replace(/<[^>]*>|\([^)]*\)/g, "").trim();
  return name === "" ? undefined : name;
};

/**
 * @param {unknown} field the `license` field of a package.json
 * @returns {string | undefined}
 */
const licenseId = (field) => {
  const id = typeof field === "string" ? field : /** @type {{ type?: unknown }} */ (field)?.type;
  return typeof id === "string" && id.trim() !== "" ? id.trim() : undefined;
};

/**
 * Reads what a package says about its licence: id from `package.json` (or the override), texts
 * from its licence and NOTICE files. Without a licence file the text is the override's, or the
 * standard MIT or ISC text with the author as copyright line; anything else fails.
 * @param {{ root: string; name: string; overrides?: Record<string, Override> }} options
 * @returns {Entry}
 */
export const readPackage = ({ root, name, overrides = OVERRIDES }) => {
  const dir = join(root, "node_modules", name);
  if (!existsSync(join(dir, "package.json"))) throw new Error(`${name}: not installed`);
  const json = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  const override = overrides[name];
  const declared = licenseId(json.license);
  if (declared !== undefined && override !== undefined && declared !== override.license) {
    throw new Error(
      `${name}: package.json says "${declared}" but the override says "${override.license}"; review the override`,
    );
  }
  const license = declared ?? override?.license;
  if (license === undefined) {
    throw new Error(`${name}: package.json has no "license" field and there is no override for it`);
  }
  /** @type {NoticeText[]} */
  const texts = findNoticeFiles(dir).map(({ file, kind }) => ({
    kind,
    text: normalizeText(readFileSync(join(dir, file), "utf8")),
  }));
  if (!texts.some((entry) => entry.kind === "license")) {
    texts.unshift({ kind: "license", text: standardText({ name, license, json, override }) });
  }
  return { name, license, texts };
};

/**
 * @param {{ name: string; license: string; json: { author?: unknown }; override: Override | undefined }} input
 * @returns {string}
 */
const standardText = ({ name, license, json, override }) => {
  if (override !== undefined && "text" in override) return normalizeText(override.text);
  const template = Object.hasOwn(STANDARD_TEXTS, license)
    ? STANDARD_TEXTS[/** @type {keyof typeof STANDARD_TEXTS} */ (license)]
    : undefined;
  const holder = authorName(json.author);
  const copyright =
    override !== undefined && "copyright" in override
      ? override.copyright
      : holder === undefined
        ? undefined
        : `Copyright (c) ${holder}`;
  if (template === undefined) {
    throw new Error(
      `${name}: no licence file, and "${license}" has no standard text in this script`,
    );
  }
  if (copyright === undefined) {
    throw new Error(
      `${name}: no licence file and no author in package.json to take the copyright line from`,
    );
  }
  return normalizeText(template(copyright));
};

const RULE = "=".repeat(80);

/**
 * The notices file: an index of the packages, then each distinct licence text once, with every
 * package it applies to. Texts that differ, such as the MIT text with another copyright line,
 * stay apart. Depends on nothing but the entries: no version, date or path.
 * @param {Entry[]} entries
 * @returns {string}
 */
export const renderNotices = (entries) => {
  const sorted = entries.toSorted((a, b) => byName(a.name, b.name));
  /** @type {Map<string, Entry[]>} */
  const groups = new Map();
  for (const entry of sorted) {
    const key = JSON.stringify(entry.texts);
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }
  const sections = [...groups.values()].map((members) => {
    const ids = [...new Set(members.map((member) => member.license))].toSorted(byName);
    const first = /** @type {Entry} */ (members[0]);
    const body = first.texts.map((text) =>
      text.kind === "notice" ? `NOTICE\n\n${text.text}` : text.text,
    );
    return [
      RULE,
      members.map((member) => member.name).join(", "),
      `Licence: ${ids.join(", ")}`,
      RULE,
      "",
      body.join("\n"),
    ].join("\n");
  });
  return [
    "Third-party notices for WEG Manager",
    "",
    "main.js and styles.css of this plugin contain code, styles and icon data from the",
    "packages below. This file lists them with their licence texts. It is generated by",
    "`npm run notices` from the packages the production build contains; do not edit it by hand.",
    "",
    `Packages (${sorted.length})`,
    "",
    ...sorted.map((entry) => `${entry.name} (${entry.license})`),
    "",
    ...sections.flatMap((section) => [section, ""]),
  ]
    .join("\n")
    .replace(/\n+$/, "\n");
};

/**
 * @param {string} root
 * @returns {{ ok: true; names: string[] } | { ok: false; message: string }}
 */
const bundledNames = (root) => {
  const listFile = join(root, PACKAGES_FILE);
  const mainFile = join(root, "dist", "main.js");
  if (!existsSync(listFile) || !existsSync(mainFile)) {
    return {
      ok: false,
      message: `${PACKAGES_FILE} or dist/main.js is missing; run "npm run build" first`,
    };
  }
  const list = JSON.parse(readFileSync(listFile, "utf8"));
  const hash = createHash("sha256").update(readFileSync(mainFile)).digest("hex");
  if (list.mainJsSha256 !== hash) {
    return {
      ok: false,
      message: `${PACKAGES_FILE} does not describe the current dist/main.js; run "npm run build" first`,
    };
  }
  return { ok: true, names: Object.keys(list.packages).toSorted(byName) };
};

/**
 * Write mode regenerates the file; check mode compares it with the one on disk and writes nothing.
 * @param {{ root: string; check: boolean }} options
 * @returns {{ ok: boolean; message: string }}
 */
export const runNotices = ({ root, check }) => {
  const listed = bundledNames(root);
  if (!listed.ok) return listed;
  /** @type {Entry[]} */
  const entries = [];
  /** @type {string[]} */
  const problems = [];
  for (const name of listed.names) {
    try {
      entries.push(readPackage({ root, name }));
    } catch (error) {
      problems.push(error instanceof Error ? error.message : String(error));
    }
  }
  if (problems.length > 0) {
    return { ok: false, message: `No notice can be written for:\n  ${problems.join("\n  ")}` };
  }
  const text = renderNotices(entries);
  const file = join(root, NOTICES_FILE);
  if (!check) {
    writeFileSync(file, text);
    return { ok: true, message: `${NOTICES_FILE} written: ${entries.length} packages` };
  }
  if (!existsSync(file) || readFileSync(file, "utf8") !== text) {
    return {
      ok: false,
      message: `${NOTICES_FILE} is out of date; run "npm run notices" and commit it`,
    };
  }
  return { ok: true, message: `${NOTICES_FILE} is current (${entries.length} packages)` };
};

const isCli =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const check = process.argv.includes("--check");
  const { ok, message } = runNotices({ root: ".", check });
  if (ok) console.log(`notices ✓ ${message}`);
  else console.error(`notices ✗ ${message}`);
  process.exitCode = ok ? 0 : 1;
}
