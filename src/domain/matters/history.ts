import { isCalendarDate } from "../notes";
import type { CalendarDay } from "../shell";
import { MATTER_STATUSES, type MatterStatus } from "./matter-type";

/** The heading of a matter note's history section (DV-03, owner decision 26.11.2026). */
export const HISTORY_HEADING = "## Verlauf";

/** What kind of history entry it is (ENT-06). */
const ENTRY_KINDS = [
  "request",
  "acknowledgement",
  "reply",
  "new_date",
  "partial",
  "fulfilment",
  "dispatch",
  "status_change",
  "assessment",
  "note",
  "split",
  "merge",
] as const;
export type EntryKind = (typeof ENTRY_KINDS)[number];

/** The kinds a person adds by hand; a status change, a dispatch and an assessment have their own way. */
export const MANUAL_ENTRY_KINDS = [
  "request",
  "acknowledgement",
  "reply",
  "new_date",
  "partial",
  "fulfilment",
  "note",
] as const satisfies readonly EntryKind[];

/** The actor of an entry the board member did: the default actor (ENT-06). */
export const BOARD_ACTOR = "board";

/** The longest entry text. */
const ENTRY_TEXT_MAX_LENGTH = 500;

/**
 * One entry of a matter's history (ENT-06). `occurred_on` is when it happened, `undefined` when
 * that is not known (PBI-12 criterion 3); `recorded_on` when it was written down. `actor` is
 * `board` or a contact's id. Entries are never changed: a correction is a new entry that names the
 * one it corrects.
 */
export type HistoryEntry = {
  readonly id: string;
  readonly occurred_on: CalendarDay | undefined;
  readonly text: string;
  readonly kind: EntryKind;
  readonly actor: string;
  /** The new status of a status change. */
  readonly status?: MatterStatus | undefined;
  /** The due date a `new_date` entry replaced, or `none` when there was none (PBI-09). */
  readonly previous?: string | undefined;
  /** The other matters a `split` or `merge` entry names, by id (PBI-06, PBI-07). */
  readonly related?: readonly string[] | undefined;
  readonly source?: string | undefined;
  readonly corrects?: string | undefined;
  readonly recorded_on: CalendarDay;
};

/** A line of the section: an entry, or a line it cannot read, kept as written. */
export type HistoryLine =
  | { readonly kind: "entry"; readonly entry: HistoryEntry }
  | { readonly kind: "unreadable"; readonly line: string };

/** Text that cannot read as an inline field: brackets become parentheses, all of it one line. */
const clean = (text: string): string =>
  text.replace(/\[/g, "(").replace(/\]/g, ")").replace(/\s+/g, " ").trim();

/** One entry as its list item: day (`?` unknown), text, then the fields in a fixed order. */
export const formatEntry = (entry: HistoryEntry): string => {
  const fields: [string, string | undefined][] = [
    ["kind", entry.kind],
    ["actor", entry.actor],
    ["status", entry.status],
    ["previous", entry.previous],
    ["related", entry.related?.join(" ")],
    ["source", entry.source === undefined ? undefined : clean(entry.source)],
    ["corrects", entry.corrects],
    ["recorded", entry.recorded_on],
    ["id", entry.id],
  ];
  const written = fields.flatMap(([key, value]) =>
    value === undefined ? [] : [`[${key}:: ${value}]`],
  );
  return `- ${entry.occurred_on ?? "?"} ${clean(entry.text)} ${written.join(" ")}`;
};

const ITEM = /^- (\d{4}-\d{2}-\d{2}|\?) (.*?)((?: \[[a-z_]+:: [^\]]*\])+)\s*$/;
const FIELD = /\[([a-z_]+):: ([^\]]*)\]/g;

const isKind = (value: string | undefined): value is EntryKind =>
  (ENTRY_KINDS as readonly string[]).includes(value ?? "");
const isStatus = (value: string | undefined): value is MatterStatus =>
  (MATTER_STATUSES as readonly string[]).includes(value ?? "");

/** The fields every entry has, or `undefined` when one is missing or the kind is unknown. */
const requiredOf = (fields: ReadonlyMap<string | undefined, string | undefined>) => {
  const kind = fields.get("kind");
  const actor = fields.get("actor");
  const recorded = fields.get("recorded");
  const id = fields.get("id");
  const complete = actor !== undefined && recorded !== undefined && id !== undefined;
  return isKind(kind) && complete ? { kind, actor, recorded, id } : undefined;
};

/** The text fields an entry may carry, kept as written. */
const OPTIONAL_FIELDS = ["previous", "source", "corrects"] as const;

/** One list item as an entry, or `undefined` when it lacks what every entry has. */
const parseItem = (line: string): HistoryEntry | undefined => {
  const match = ITEM.exec(line);
  if (match === null) return undefined;
  const [, day, text, rest] = match as unknown as [string, string, string, string];
  const fields = new Map([...rest.matchAll(FIELD)].map((found) => [found[1], found[2]?.trim()]));
  const required = requiredOf(fields);
  if (required === undefined) return undefined;
  const { kind, actor, recorded, id } = required;
  const status = fields.get("status");
  const optional = Object.fromEntries(
    OPTIONAL_FIELDS.flatMap((key) => (fields.has(key) ? [[key, fields.get(key)]] : [])),
  ) as Pick<HistoryEntry, (typeof OPTIONAL_FIELDS)[number]>;
  const related = fields.get("related");
  return {
    id,
    occurred_on: day === "?" ? undefined : day,
    text: text.trim(),
    kind,
    actor,
    ...(isStatus(status) ? { status } : {}),
    ...(related === undefined ? {} : { related: related.split(" ").filter(Boolean) }),
    ...optional,
    recorded_on: recorded,
  };
};

/** The lines of a body without their line breaks; a `\r` stays with its line. */
const linesOf = (body: string): string[] => body.split("\n");

/** Whether `line` is a heading that ends the history section. */
const endsSection = (line: string): boolean => /^#{1,2}\s/.test(line);

/** The index of the history heading, and the index where its section ends. */
const sectionOf = (lines: readonly string[]): { start: number; end: number } | undefined => {
  const start = lines.findIndex((line) => line.trimEnd() === HISTORY_HEADING);
  if (start === -1) return undefined;
  const after = lines.slice(start + 1).findIndex(endsSection);
  return { start, end: after === -1 ? lines.length : start + 1 + after };
};

/**
 * The history of a matter's body (DV-03): every list item of the section "Verlauf", in file
 * order; an item it cannot read stays as written. Nothing outside the section counts.
 */
export const parseHistory = (body: string): readonly HistoryLine[] => {
  const lines = linesOf(body);
  const section = sectionOf(lines);
  if (section === undefined) return [];
  return lines
    .slice(section.start + 1, section.end)
    .map((line) => line.trimEnd())
    .filter((line) => line.startsWith("- "))
    .map((line): HistoryLine => {
      const entry = parseItem(line);
      return entry === undefined ? { kind: "unreadable", line } : { kind: "entry", entry };
    });
};

/**
 * `body` with `entry` added (append only, owner decision): after the section's last line with
 * text, before whatever follows it; a body without the section gets it at its end. New lines use
 * `eol`; every other byte stays.
 */
export const appendEntry = (body: string, entry: HistoryEntry, eol: string): string => {
  const item = formatEntry(entry);
  const lines = linesOf(body);
  const section = sectionOf(lines);
  if (section === undefined) {
    if (body === "") return `${HISTORY_HEADING}${eol}${eol}${item}${eol}`;
    const ended = body.endsWith("\n") ? body : `${body}${eol}`;
    return `${ended}${eol}${HISTORY_HEADING}${eol}${eol}${item}${eol}`;
  }
  const cr = eol === "\r\n" ? "\r" : "";
  let last = section.start;
  for (let index = section.start + 1; index < section.end; index += 1) {
    if ((lines[index] ?? "").trim() !== "") last = index;
  }
  const added = last === section.start ? [cr, `${item}${cr}`] : [`${item}${cr}`];
  return [...lines.slice(0, last + 1), ...added, ...lines.slice(last + 1)].join("\n");
};

/** The ids of the entries a later entry corrects: shown as corrected. */
export const correctedIds = (lines: readonly HistoryLine[]): ReadonlySet<string> =>
  new Set(
    lines.flatMap((line) =>
      line.kind === "entry" && line.entry.corrects !== undefined ? [line.entry.corrects] : [],
    ),
  );

/** Why an entry cannot be added. */
export type EntryIssue = "text.missing" | "text.invalid" | "occurred-on.invalid";

/** The rules of an entry a person adds: a text of at most 500 characters, a real day or none. */
export const validateEntry = (input: {
  readonly text: string;
  readonly occurred_on: string;
}): readonly EntryIssue[] => {
  const issues: EntryIssue[] = [];
  const text = clean(input.text);
  if (text === "") issues.push("text.missing");
  else if (text.length > ENTRY_TEXT_MAX_LENGTH) issues.push("text.invalid");
  const day = input.occurred_on.trim();
  if (day !== "" && !isCalendarDate(day)) issues.push("occurred-on.invalid");
  return issues;
};

/** Why a status change cannot be made. */
export type StatusChangeIssue =
  "status.unchanged" | "reason.missing" | "source.missing" | "done-on.missing" | "done-on.invalid";

/**
 * The rules of a status change (PBI-08): a status other than the current one and a reason; to
 * close a matter (done, obsolete) also the source it rests on, and for done the day it was done.
 * Reopening a closed matter needs only its reason (criterion 3).
 */
export const validateStatusChange = (input: {
  readonly from: MatterStatus | undefined;
  readonly to: MatterStatus;
  readonly reason: string;
  readonly source: string;
  readonly done_on: string;
}): readonly StatusChangeIssue[] => {
  if (input.to === input.from) return ["status.unchanged"];
  const issues: StatusChangeIssue[] = [];
  if (clean(input.reason) === "") issues.push("reason.missing");
  const closing = input.to === "done" || input.to === "obsolete";
  if (closing && clean(input.source) === "") issues.push("source.missing");
  if (input.to === "done") {
    const day = input.done_on.trim();
    if (day === "") issues.push("done-on.missing");
    else if (!isCalendarDate(day)) issues.push("done-on.invalid");
  }
  return issues;
};
