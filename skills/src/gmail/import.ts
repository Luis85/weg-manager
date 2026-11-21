import { randomUUID } from "node:crypto";
import {
  closeSync,
  constants,
  copyFileSync,
  existsSync,
  fsyncSync,
  linkSync,
  mkdirSync,
  openSync,
  realpathSync,
  statSync,
  unlinkSync,
  writeSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { isObject, textOf, type Json, type JsonObject } from "./json.ts";
import {
  accountId,
  fail,
  fingerprint,
  ImportInputError,
  normalize,
  noteId,
  rejectCredentials,
  timestamp,
} from "./normalize.ts";
import { markdown } from "./note.ts";
import { identityKey, inside, scanVault, type KnownNote } from "./vault.ts";

export const DEFAULT_DESTINATION = "WEG-Manager/Eingang/Gmail";
const MAX_MESSAGES = 1000;

export interface ImportOptions {
  readonly destination?: string;
  /** Create notes; without it the run is a read-only preview. */
  readonly apply?: boolean;
  /** Import time, ISO with time zone; defaults to now. */
  readonly now?: string;
}

export interface Report {
  account_id: string;
  mode: "apply" | "preview";
  mailbox_modified: false;
  scope: string;
  scan_problems: string[];
  results: JsonObject[];
  counts: Record<string, number>;
}

/** Statuses that make the command line exit with 2. */
export const BAD_STATUSES = new Set([
  "invalid",
  "conflict",
  "write_error",
  "source_changed",
  "conflicting_batch_record",
]);

/** `path.resolve` plus symlinks resolved in the part of the path that exists. */
const realish = (path: string): string => {
  const absolute = resolve(path);
  if (existsSync(absolute)) return realpathSync(absolute);
  const parent = dirname(absolute);
  return parent === absolute ? absolute : join(realish(parent), relative(parent, absolute));
};

const existingVault = (vault: string): string => {
  const path = realish(vault);
  return existsSync(path) && statSync(path).isDirectory()
    ? path
    : fail("User-approved vault must already exist");
};

const targetFolder = (vault: string, destination: string): string => {
  const parts = destination.split(/[\\/]/).filter((part) => part !== "" && part !== ".");
  const absolute = isAbsolute(destination) || /^[A-Za-z]:/.test(destination);
  if (absolute || parts.length === 0 || parts.includes(".."))
    fail("Destination must be a safe relative subfolder");
  const target = realish(join(vault, ...parts));
  return inside(vault, target) && target !== vault ? target : fail("Destination escapes vault");
};

const batchMessages = (batch: JsonObject): Json[] => {
  const messages = batch["messages"];
  return Array.isArray(messages) && messages.length <= MAX_MESSAGES
    ? messages
    : fail(`messages must contain at most ${MAX_MESSAGES} normalized records`);
};

const fileTitle = (subject: Json | undefined): string => {
  const raw = typeof subject === "string" && subject ? subject : "Ohne Betreff";
  const cleaned = raw
    // oxlint-disable-next-line no-control-regex -- control characters are not allowed in file names
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ")
    // oxlint-disable-next-line no-control-regex -- Python's whitespace includes these separators
    .replace(/[\s\x1c-\x1f\x85]+/g, " ");
  const trimmed = cleaned.replace(/^[ .]+|[ .]+$/g, "");
  return [...trimmed].slice(0, 70).join("") || "Ohne Betreff";
};

const noteFile = (target: string, data: JsonObject, id: string): string => {
  const when = data["received_at"] ?? data["sent_at"];
  const date = typeof when === "string" && when ? when.split("T")[0] : "undatiert";
  return join(target, `${date} - ${fileTitle(data["subject"])} - ${id.slice(-12)}.md`);
};

const errorCode = (error: unknown): string | undefined =>
  error instanceof Error && "code" in error ? String(error.code) : undefined;

/** Publishes `temporary` at `path` without ever replacing an existing file. */
const publish = (temporary: string, path: string): void => {
  try {
    linkSync(temporary, path);
  } catch (error) {
    // File systems without hard links (FAT, some network shares): exclusive copy instead.
    if (!["EPERM", "ENOTSUP", "ENOSYS", "EXDEV", "EOPNOTSUPP"].includes(errorCode(error) ?? ""))
      throw error;
    copyFileSync(temporary, path, constants.COPYFILE_EXCL);
  }
};

const writeNote = (target: string, vault: string, path: string, content: string): void => {
  mkdirSync(target, { recursive: true });
  if (realpathSync(target) !== target || !inside(vault, target))
    fail("Destination changed during import");
  const temporary = join(target, `.gmail-import-${randomUUID().replaceAll("-", "")}.tmp`);
  const fd = openSync(temporary, "wx");
  try {
    writeSync(fd, content, null, "utf8");
    fsyncSync(fd);
    closeSync(fd);
    publish(temporary, path);
  } finally {
    if (existsSync(temporary)) unlinkSync(temporary);
  }
};

const failure = (error: unknown): JsonObject => {
  if (errorCode(error) === "EEXIST")
    return { status: "conflict", reason: "Destination already exists; nothing overwritten" };
  const name = errorCode(error) ?? (error instanceof Error ? error.name : "Error");
  const message = error instanceof Error ? error.message : String(error);
  return { status: "write_error", reason: `${name}: ${message}` };
};

interface Context {
  readonly account: string;
  readonly vault: string;
  readonly target: string;
  readonly apply: boolean;
  readonly importedAt: string;
  readonly index: Map<string, KnownNote[]>;
  readonly problems: string[];
}

/** A conflict that stops creating a note, or `null` when the identity is free or known once. */
const blocked = (ctx: Context, known: readonly KnownNote[]): JsonObject | null => {
  if (ctx.problems.length > 0)
    return {
      status: "conflict",
      reason: "Existing Markdown could not be safely indexed; see scan_problems",
    };
  if (known.length > 1)
    return {
      status: "conflict",
      reason: "Multiple existing notes have this account/message identity",
    };
  return null;
};

const existingRow = (ctx: Context, note: KnownNote, hash: string): JsonObject => {
  const changed = Boolean(note.hash) && note.hash !== hash;
  return { status: changed ? "source_changed" : "existing", path: relative(ctx.vault, note.path) };
};

/** Previews or writes a note for an identity that has none yet. */
const create = (ctx: Context, data: JsonObject, id: string, hash: string): JsonObject => {
  const path = noteFile(ctx.target, data, id);
  const row: JsonObject = {
    status: "would_create",
    path: relative(ctx.vault, path),
    body_status: data["body_status"] ?? null,
  };
  if (!ctx.apply) return row;
  try {
    writeNote(ctx.target, ctx.vault, path, markdown(data, id, hash, ctx.importedAt));
    const key = identityKey(ctx.account, textOf(data["gmail_message_id"]));
    ctx.index.set(key, [...(ctx.index.get(key) ?? []), { path, hash }]);
    return { ...row, status: "created" };
  } catch (error) {
    return { ...row, ...failure(error) };
  }
};

/** Decides what to do with a message that is neither invalid nor repeated in the batch. */
const place = (ctx: Context, data: JsonObject, id: string, hash: string): JsonObject => {
  const known = ctx.index.get(identityKey(ctx.account, textOf(data["gmail_message_id"]))) ?? [];
  const [first] = known;
  return (
    blocked(ctx, known) ?? (first ? existingRow(ctx, first, hash) : create(ctx, data, id, hash))
  );
};

const countStatuses = (results: JsonObject[]): Record<string, number> => {
  const statuses = [...new Set(results.map((row) => textOf(row["status"])))].toSorted();
  return Object.fromEntries(
    statuses.map((status) => [status, results.filter((row) => row["status"] === status).length]),
  );
};

const prepare = (batch: unknown, vaultPath: string, options: ImportOptions) => {
  rejectCredentials(batch);
  const input = isObject(batch) ? batch : fail("Batch must be an object");
  const account = accountId(input["account_id"]);
  const messages = batchMessages(input);
  const vault = existingVault(vaultPath);
  const target = targetFolder(vault, options.destination ?? DEFAULT_DESTINATION);
  const now = options.now ?? new Date().toISOString();
  const importedAt = timestamp(now, "imported_at") ?? fail("imported_at needs a value");
  const { index, problems } = scanVault(vault);
  const apply = options.apply ?? false;
  const ctx: Context = { account, vault, target, apply, importedAt, index, problems };
  return { ctx, messages };
};

/** The result row for one raw record; `seen` tracks message ids already handled in this batch. */
const handle = (ctx: Context, raw: Json, seen: Map<string, string>): JsonObject => {
  const row: JsonObject = {
    gmail_message_id: isObject(raw) ? (raw["gmail_message_id"] ?? null) : null,
  };
  let data: JsonObject;
  try {
    data = normalize(raw, ctx.account);
  } catch (error) {
    if (!(error instanceof ImportInputError)) throw error;
    return { ...row, status: "invalid", reason: error.message };
  }
  const mid = textOf(data["gmail_message_id"]);
  const id = noteId(ctx.account, mid);
  const hash = fingerprint(data);
  const previous = seen.get(mid);
  seen.set(mid, hash);
  if (previous === undefined) return { ...row, note_id: id, ...place(ctx, data, id, hash) };
  const status = previous === hash ? "duplicate_in_batch" : "conflicting_batch_record";
  return { ...row, note_id: id, status };
};

/** Previews or applies the import of one normalized connector batch into the vault. */
export const importMessages = (
  batch: unknown,
  vaultPath: string,
  options: ImportOptions = {},
): Report => {
  const { ctx, messages } = prepare(batch, vaultPath, options);
  const seen = new Map<string, string>();
  const results = messages.map((raw) => handle(ctx, raw, seen));
  return {
    account_id: ctx.account,
    mode: ctx.apply ? "apply" : "preview",
    mailbox_modified: false,
    scope: "Only the supplied connector result set; no mailbox completeness claim",
    scan_problems: ctx.problems,
    results,
    counts: countStatuses(results),
  };
};
