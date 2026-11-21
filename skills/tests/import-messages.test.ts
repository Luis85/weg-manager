import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { importMessages, type ImportOptions } from "../src/gmail/import.ts";
import { textOf, type JsonObject } from "../src/gmail/json.ts";

const NOW = "2026-11-15T16:00:00+00:00";

const message = (id = "m-17", account = "beirat@example.test"): JsonObject => ({
  gmail_message_id: id,
  gmail_thread_id: "t-4",
  subject: "Termin: Keller [intern]",
  from: "verwaltung@example.test",
  to: [account],
  received_at: "2026-11-14T10:00:00+01:00",
  body_text: "Bitte bis 20.11. antworten.",
  body_status: "complete",
  body_format: "plain",
  attachments: [{ filename: "rechnung.pdf", size: 12000 }],
});

const batch = (account = "beirat@example.test", messages = [message("m-17", account)]) => ({
  account_id: account,
  query: "after:2026/11/01 before:2026/11/16",
  messages,
});

let root: string;
let vault: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "gmail-import-"));
  vault = join(root, "vault");
  mkdirSync(vault);
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

const run = (data: unknown = batch(), options: ImportOptions = {}) =>
  importMessages(data, vault, { now: NOW, ...options });
const apply = (data: unknown = batch(), options: ImportOptions = {}) =>
  run(data, { ...options, apply: true });
const statuses = (data: unknown) => apply(data).results.map((row) => row["status"]);

const notes = (dir = vault): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return notes(path);
    return entry.name.endsWith(".md") ? [path] : [];
  });
const firstNote = (): string => readFileSync(notes()[0] ?? "", "utf8");
const legacy = (fields: string, body = "Nutzertext") => `---\n${fields}\n---\n${body}`;
const IDENTITY = "source: gmail\naccount_id: beirat@example.test\ngmail_message_id: m-17";

describe("preview and created notes", () => {
  it("previews without writing", () => {
    expect(run().results[0]?.["status"]).toBe("would_create");
    expect(readdirSync(vault)).toEqual([]);
  });

  it("writes portable metadata and the source text", () => {
    expect(apply().results[0]?.["status"]).toBe("created");
    const text = firstNote();
    for (const needle of [
      'type: "Email"',
      'schema: "weg-manager.gmail-message/v1"',
      'gmail_message_id: "m-17"',
      "community_id: null",
      'body_status: "complete"',
      'review_status: "unreviewed"',
      'attachment_content_status: "not_downloaded"',
      "Bitte bis 20.11. antworten.",
    ])
      expect(text).toContain(needle);
    expect(text).not.toContain("\ntags:");
    expect(notes()[0]).toContain("Termin");
  });

  it("uses the same note id in preview and apply", () => {
    expect(run().results[0]?.["note_id"]).toBe(apply().results[0]?.["note_id"]);
  });

  it("never claims a download from attachment metadata", () => {
    apply();
    expect(readdirSync(join(vault, "WEG-Manager/Eingang/Gmail"))).toHaveLength(1);
    expect(firstNote()).toContain("rechnung.pdf");
  });
});

describe("existing notes", () => {
  it("keeps manual changes and finds a renamed note", () => {
    apply();
    const [note = ""] = notes();
    const edited = `${readFileSync(note, "utf8")}\nEigene Notiz: prüfen.\n`;
    const moved = join(vault, "Umbenannte Notiz.md");
    writeFileSync(moved, edited);
    unlinkSync(note);
    expect(apply().results[0]?.["status"]).toBe("existing");
    expect(notes()).toHaveLength(1);
    expect(readFileSync(moved, "utf8")).toBe(edited);
  });

  it("does not duplicate a legacy note with plain identity fields", () => {
    writeFileSync(join(vault, "Alt.md"), legacy(IDENTITY));
    expect(statuses(batch())).toEqual(["existing"]);
    expect(notes()).toHaveLength(1);
  });

  it("reads quoted keys and trailing comments", () => {
    const fields =
      '"source": "gmail" # Herkunft\naccount_id: "beirat@example.test" # Konto\ngmail_message_id: m-17 # Nachricht';
    writeFileSync(join(vault, "Alt.md"), legacy(fields, "Erhalten"));
    expect(statuses(batch())).toEqual(["existing"]);
    expect(notes()).toHaveLength(1);
  });

  it("reports changed source content instead of overwriting", () => {
    apply();
    const before = firstNote();
    const changed = batch();
    changed.messages[0] = { ...message(), body_text: "Bitte bis 20.11. antworten. Neuer Inhalt." };
    expect(statuses(changed)).toEqual(["source_changed"]);
    expect(firstNote()).toBe(before);
  });

  it("blocks the import when two notes share an identity", () => {
    for (const name of ["a.md", "b.md"]) writeFileSync(join(vault, name), legacy(IDENTITY, "Text"));
    expect(statuses(batch())).toEqual(["conflict"]);
    expect(notes()).toHaveLength(2);
  });

  it("blocks deduplication when Gmail frontmatter is incomplete", () => {
    writeFileSync(
      join(vault, "Broken.md"),
      "---\nsource: gmail\naccount_id: beirat@example.test\n",
    );
    expect(statuses(batch())).toEqual(["conflict"]);
    expect(notes()).toHaveLength(1);
  });

  it("blocks deduplication when a note is not valid UTF-8", () => {
    writeFileSync(join(vault, "Kaputt.md"), Buffer.from([0x2d, 0x2d, 0x2d, 0x0a, 0xff, 0xfe]));
    const report = apply();
    expect(report.scan_problems).toEqual(["Kaputt.md"]);
    expect(report.results[0]?.["status"]).toBe("conflict");
  });

  it("does not overwrite an unrelated file at the target path", () => {
    const target = join(vault, textOf(run().results[0]?.["path"]));
    mkdirSync(join(target, ".."), { recursive: true });
    writeFileSync(target, "Keep this file");
    expect(statuses(batch())).toEqual(["conflict"]);
    expect(readFileSync(target, "utf8")).toBe("Keep this file");
  });

  it("does not follow a symlinked note outside the vault", () => {
    const outside = join(root, "outside.md");
    writeFileSync(outside, legacy(IDENTITY, "Private"));
    try {
      symlinkSync(outside, join(vault, "external.md"));
    } catch {
      return; // the platform does not allow symlinks
    }
    expect(statuses(batch())).toEqual(["created"]);
    expect(readFileSync(outside, "utf8").split("\n").at(-1)).toBe("Private");
  });

  it("ignores hidden folders when indexing", () => {
    mkdirSync(join(vault, ".trash"));
    writeFileSync(join(vault, ".trash", "Alt.md"), legacy(IDENTITY));
    expect(statuses(batch())).toEqual(["created"]);
  });
});

describe("batches", () => {
  it("creates a repeated search row once", () => {
    expect(statuses(batch(undefined, [message(), message()]))).toEqual([
      "created",
      "duplicate_in_batch",
    ]);
    expect(notes()).toHaveLength(1);
  });

  it("reports the same id with different content as conflicting", () => {
    const other = { ...message(), body_text: "anders" };
    expect(statuses(batch(undefined, [message(), other]))).toEqual([
      "created",
      "conflicting_batch_record",
    ]);
  });

  it("keeps different messages of one thread apart", () => {
    apply(batch(undefined, [message("m-17"), message("m-18")]));
    expect(notes()).toHaveLength(2);
  });

  it("keeps the same message id in two accounts apart", () => {
    apply();
    apply(batch("zweite@example.test"));
    expect(notes()).toHaveLength(2);
  });

  it("does not drop a valid record after a rejected one", () => {
    const invalid = { ...message(), gmail_message_id: null };
    expect(statuses(batch(undefined, [invalid, message()]))).toEqual(["invalid", "created"]);
    expect(notes()).toHaveLength(1);
  });

  it("counts results by status", () => {
    const report = apply(batch(undefined, [message(), message(), { gmail_message_id: "" }]));
    expect(report.counts).toEqual({ created: 1, duplicate_in_batch: 1, invalid: 1 });
  });
});
