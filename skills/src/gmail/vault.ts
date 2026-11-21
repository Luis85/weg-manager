import { closeSync, openSync, readSync, readdirSync, realpathSync } from "node:fs";
import { extname, isAbsolute, join, relative } from "node:path";
import { scalar, type Json, type JsonObject } from "./json.ts";
import { accountId, fail } from "./normalize.ts";

/** An existing Gmail note: where it is and which source hash it recorded. */
export interface KnownNote {
  readonly path: string;
  readonly hash: Json;
}

export interface VaultScan {
  /** Notes by `account + NUL + gmail_message_id`. */
  readonly index: Map<string, KnownNote[]>;
  /** Vault-relative paths of Markdown that could not be read or indexed safely. */
  readonly problems: string[];
}

const HEAD_CHARS = 131_072;
/** Python's whitespace: JavaScript's `\s` lacks the information separators and NEL. */
export const WS = String.raw`[\s\x1c-\x1f\x85]`;
const FIELD = /^(?:"([a-z][a-z0-9_]*)"|'([a-z][a-z0-9_]*)'|([a-z][a-z0-9_]*)):\s*(.*)$/;
// oxlint-disable-next-line no-control-regex -- line breaks as Python's splitlines() sees them
const LINES = /[\n\v\f\x1c-\x1e\x85\u2028\u2029]/;

export const identityKey = (account: string, id: string): string => `${account}\0${id}`;

export const inside = (root: string, path: string): boolean => {
  const rel = relative(root, path);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
};

/** Length of the buffer up to the last complete UTF-8 character. */
const completeLength = (buffer: Buffer, length: number): number => {
  let end = length;
  while (end > 0 && ((buffer[end - 1] ?? 0) & 0xc0) === 0x80) end--;
  const lead = buffer[end - 1] ?? 0;
  return end > 0 && lead >= 0xc0 ? end - 1 : length;
};

/** The first characters of a note, BOM removed and newlines normalized; throws on invalid UTF-8. */
const readHead = (path: string): string => {
  const buffer = Buffer.alloc(HEAD_CHARS * 4);
  const fd = openSync(path, "r");
  let length: number;
  try {
    length = readSync(fd, buffer, 0, buffer.length, 0);
  } finally {
    closeSync(fd);
  }
  const end = length === buffer.length ? completeLength(buffer, length) : length;
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(buffer.subarray(0, end));
  return decoded.replace(/\r\n?/g, "\n").slice(0, HEAD_CHARS);
};

type Frontmatter = JsonObject | "broken" | null;

/** The key of a frontmatter line, written bare, single- or double-quoted. */
const fieldName = (match: RegExpExecArray): string => match[1] ?? match[2] ?? match[3] ?? "";

const frontmatter = (head: string): Frontmatter => {
  if (!head.startsWith("---\n")) return null;
  const end = /^---\s*$/m.exec(head.slice(4));
  if (!end) return new RegExp(`^source:${WS}*["']?gmail`, "m").test(head) ? "broken" : null;
  const fields: JsonObject = {};
  for (const line of head.slice(4, 4 + end.index).split(LINES)) {
    const match = FIELD.exec(line);
    if (match) fields[fieldName(match)] = scalar(match[4] ?? "");
  }
  return fields;
};

/** Markdown files below `dir`, without hidden folders and without following symlinks. */
const markdownFiles = (vault: string, dir: string, found: string[]): string[] => {
  const entries = readdirSync(dir, { withFileTypes: true }).toSorted((a, b) =>
    a.name < b.name ? -1 : 1,
  );
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    const folder = entry.isDirectory() && !entry.name.startsWith(".");
    if (folder && realpathSync(path) === path && inside(vault, path))
      markdownFiles(vault, path, found);
    if (entry.isFile() && extname(entry.name).toLowerCase() === ".md") found.push(path);
  }
  return found;
};

const identity = (fields: JsonObject): string => {
  const id = fields["gmail_message_id"];
  return identityKey(
    accountId(fields["account_id"]),
    typeof id === "string" && id ? id : fail("missing identity"),
  );
};

const readFields = (path: string): Frontmatter => {
  try {
    return frontmatter(readHead(path));
  } catch {
    return "broken";
  }
};

/** Indexes every readable Gmail note in the vault by account and message id. */
export const scanVault = (vault: string): VaultScan => {
  const index = new Map<string, KnownNote[]>();
  const problems: string[] = [];
  for (const path of markdownFiles(vault, vault, [])) {
    const fields = readFields(path);
    if (fields === "broken") problems.push(relative(vault, path));
    if (fields === null || fields === "broken" || fields["source"] !== "gmail") continue;
    try {
      const key = identity(fields);
      const note = { path, hash: fields["source_content_sha256"] ?? null };
      index.set(key, [...(index.get(key) ?? []), note]);
    } catch {
      problems.push(relative(vault, path));
    }
  }
  return { index, problems };
};
