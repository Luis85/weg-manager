import { Schema } from "effect";
import {
  date,
  defineNoteType,
  lineOfText,
  number,
  reference,
  required,
  text,
  type RecordValues,
} from "../notes";

/** What kind of matter it is (ENT-04, closed; `third_party_promise` is ours). */
export const MATTER_KINDS = [
  "manager_promise",
  "third_party_promise",
  "board_deadline",
  "legal_deadline",
  "question",
  "board_task",
] as const;
export type MatterKind = (typeof MATTER_KINDS)[number];

/** Where a matter stands; "not kept" is a rating, never a status (ENT-04, O-ENT04-1). */
export const MATTER_STATUSES = ["open", "unclear", "done", "obsolete"] as const;
export type MatterStatus = (typeof MATTER_STATUSES)[number];

/** The source code of a visible source gap (DV-03). */
export const UNKNOWN_SOURCE = "unknown";

export const TOPIC_MAX_LENGTH = 80;
export const TEXT_MAX_LENGTH = 300;
const SOURCE_MAX_LENGTH = 100;

/** A matter number: a whole number from 1. */
const MatterNumber = Schema.Finite.check(
  Schema.makeFilter((value: number) => Number.isInteger(value) && value >= 1),
);

/** The number as people read it: the community's short code and at least three digits. */
export const shownNumber = (shortCode: string | undefined, value: number): string => {
  const digits = String(value).padStart(3, "0");
  return shortCode === undefined ? digits : `${shortCode} ${digits}`;
};

/**
 * The matter note, `weg-manager.matter/v1` (ADR 0007, PBI-05; contract page
 * `docs/contracts/DV-03 - Vorgang v1.md`). One matter, one community, one outcome; the check mark
 * is computed and never stored. New notes go to `<rootFolder>/Vorgänge/`, named by the outcome.
 */
export const matterType = defineNoteType({
  type: "matter",
  version: 1,
  folder: "Vorgänge",
  fields: {
    number: required(number({ schema: MatterNumber, issue: "number.invalid" })),
    community_id: required(reference("community")),
    kind: required(text({ schema: Schema.Literals(MATTER_KINDS), issue: "kind.unknown" })),
    topic: required(text({ schema: lineOfText(TOPIC_MAX_LENGTH), issue: "topic.invalid" })),
    outcome: required(text({ schema: lineOfText(TEXT_MAX_LENGTH), issue: "outcome.invalid" })),
    responsible_id: required(reference("contact")),
    promised_on: date(),
    due_on: date(),
    follow_up_on: date(),
    status: required(text({ schema: Schema.Literals(MATTER_STATUSES), issue: "status.unknown" })),
    done_on: date(),
    source: required(text({ schema: lineOfText(SOURCE_MAX_LENGTH), issue: "source.invalid" })),
    next_step: required(
      text({ schema: lineOfText(TEXT_MAX_LENGTH), issue: "next-step.invalid" }),
    ),
    message_ref: text({ schema: lineOfText(TEXT_MAX_LENGTH), issue: "message-ref.invalid" }),
    link: text({ schema: lineOfText(TEXT_MAX_LENGTH), issue: "link.invalid" }),
  },
  migrations: {},
});

export type MatterFields = typeof matterType.fields;

/** The key of a matter note's field. */
export type MatterKey = (typeof matterType.keys)[number];

/** A matter's values as a form saves them. */
export type MatterValues = RecordValues<MatterFields>;
