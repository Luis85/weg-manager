import { Schema } from "effect";
import {
  date,
  defineNoteType,
  draftValues,
  lineOfText,
  list,
  recordFileName,
  reference,
  references,
  required,
  text,
  type FormInput,
} from "../notes";
import { TEXT_MAX_LENGTH } from "./matter-type";

/** What a source is (ENT-07, PBI-11): a mail, a letter, a portal message, a conversation, … */
export const SOURCE_KINDS = [
  "mail",
  "letter",
  "portal",
  "conversation",
  "meeting",
  "document",
  "other",
] as const;
export type SourceKind = (typeof SOURCE_KINDS)[number];

/** The kind's word in a filed original's name (WCS filing rule `JJJJ-MM-TT Art Thema`). */
const FILE_LABELS: Readonly<Record<SourceKind, string>> = {
  mail: "Mail",
  letter: "Brief",
  portal: "Portal",
  conversation: "Gespräch",
  meeting: "Versammlung",
  document: "Dokument",
  other: "Quelle",
};

/** The sources folder of a community without a short code (DV-05); a community always has one. */
export const NO_SHORT_CODE_FOLDER = "Ohne Kürzel";

const SUBJECT_MAX_LENGTH = 120;
const ORIGIN_MAX_LENGTH = 100;

/**
 * The source note, `weg-manager.source/v1` (ENT-07, PBI-11; contract page
 * `docs/contracts/DV-05 - Quelle v1.md`): one capture of a message, a conversation or an original,
 * with its origin, for one community and the matters it backs. The message text is the note's
 * body; `files` refers to the originals by wikilink, which Obsidian keeps on a rename. New notes
 * go to `<rootFolder>/Quellen/`, named by the subject.
 */
export const sourceType = defineNoteType({
  type: "source",
  version: 1,
  folder: "Quellen",
  fields: {
    subject: required(text({ schema: lineOfText(SUBJECT_MAX_LENGTH), issue: "subject.invalid" })),
    kind: required(text({ schema: Schema.Literals(SOURCE_KINDS), issue: "kind.unknown" })),
    community_id: required(reference("community")),
    matter_ids: references("matter"),
    received_on: date(),
    origin: required(text({ schema: lineOfText(ORIGIN_MAX_LENGTH), issue: "origin.invalid" })),
    message_ref: text({ schema: lineOfText(TEXT_MAX_LENGTH), issue: "message-ref.invalid" }),
    link: text({ schema: lineOfText(TEXT_MAX_LENGTH), issue: "link.invalid" }),
    files: list(),
  },
  migrations: {},
});

export type SourceFields = typeof sourceType.fields;
export type SourceKey = (typeof sourceType.keys)[number];
export type SourceInput = FormInput<SourceFields>;

/** One field's issue of a source, language-free (ADR 0005). */
export const SourceFieldIssue = Schema.Struct({
  key: Schema.Literals(sourceType.keys),
  code: Schema.Literals([
    "field.missing",
    "field.reference",
    "field.references",
    "field.date",
    "field.list",
    "subject.invalid",
    "kind.unknown",
    "origin.invalid",
    "message-ref.invalid",
    "link.invalid",
    "matter.other-community",
  ]),
});
export type SourceFieldIssue = typeof SourceFieldIssue.Type;

/** The values a form saves: every text trimmed, a blank one unset. */
export const sourceValues = (input: SourceInput) => draftValues(sourceType, input);

/**
 * The rules a source must meet to be saved (PBI-11): the field rules of the note type, then only
 * matters of its own community (DF-12). Form and use case call it.
 */
export const validateSource = (
  input: SourceInput,
  context: { readonly matterCommunities: ReadonlyMap<string, string> },
): readonly SourceFieldIssue[] => {
  const draft = sourceValues(input);
  const issues: SourceFieldIssue[] = sourceType
    .check(draft)
    // `check` reports the type's own keys only.
    .map((issue) => ({ key: issue.key as SourceKey, code: issue.code }));
  const other = (draft.matter_ids ?? []).some((id) => {
    const owner = context.matterCommunities.get(id);
    return owner !== undefined && owner !== draft.community_id;
  });
  if (other && !issues.some((issue) => issue.key === "matter_ids")) {
    issues.push({ key: "matter_ids", code: "matter.other-community" });
  }
  return issues;
};

/** The extension of a file name in lower case, with its dot; none when it has none. */
const extensionOf = (name: string): string => {
  const dot = name.lastIndexOf(".");
  return dot <= 0 ? "" : name.slice(dot).toLowerCase();
};

/**
 * The name a filed original gets (WCS filing rule, owner decision 26.11.2026): `JJJJ-MM-TT Art
 * Thema` with the original's extension, unsafe characters replaced as in a note's name.
 */
export const filedName = (
  day: string,
  kind: SourceKind,
  subject: string,
  original: string,
): string => {
  const base = `${day} ${FILE_LABELS[kind]}`;
  return `${recordFileName(`${base} ${subject}`, base)}${extensionOf(original)}`;
};

/** How a source refers to an original: a wikilink to its vault path. */
export const fileLink = (path: string): string => `[[${path}]]`;

/** The vault path a `files` entry refers to: a wikilink's target without its alias, or the text. */
export const linkedPath = (entry: string): string => {
  const match = /^\[\[([^\]|]+)(?:\|[^\]]*)?\]\]$/.exec(entry.trim());
  return match?.[1]?.trim() ?? entry.trim();
};

/** Whether a link is a web address, shown as a link, rather than a path in the vault. */
export const isWebLink = (link: string): boolean => /^https?:\/\//i.test(link.trim());
