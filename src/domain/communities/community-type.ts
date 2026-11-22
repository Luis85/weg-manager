import { Schema } from "effect";
import { defineNoteType, lineOfText, required, text, type RecordValues } from "../notes";

/**
 * The fixed palette of community colours (PBI-56): English names in the note, shades per theme in
 * the plugin's stylesheet, so the plugin can change a shade without touching a note.
 */
export const COMMUNITY_COLORS = [
  "teal",
  "violet",
  "blue",
  "rust",
  "slate",
  "amber",
  "pink",
  "olive",
] as const;
export type CommunityColor = (typeof COMMUNITY_COLORS)[number];

/** The longest name; it is also the file name, so it stays well below every file system's limit. */
export const NAME_MAX_LENGTH = 100;

/** The longest kind and unit label. */
export const LABEL_MAX_LENGTH = 50;

/** Two to five upper-case letters A–Z or digits (PBI-56). */
const SHORT_CODE_PATTERN = /^[A-Z0-9]{2,5}$/;

/**
 * The community note, `weg-manager.community/v1` (ADR 0007, PBI-56; contract page
 * `docs/contracts/DV-01 - Gemeinschaft v1.md`). Every field is required: a community has a
 * name, a short code, a colour, a kind and a unit label. Each broken value reports its own code.
 * New notes go to `<rootFolder>/Gemeinschaften/`.
 */
export const communityType = defineNoteType({
  type: "community",
  version: 1,
  folder: "Gemeinschaften",
  fields: {
    name: required(text({ schema: lineOfText(NAME_MAX_LENGTH), issue: "name.invalid" })),
    short_code: required(
      text({
        schema: Schema.String.check(Schema.isPattern(SHORT_CODE_PATTERN)),
        issue: "short-code.invalid",
      }),
    ),
    color: required(text({ schema: Schema.Literals(COMMUNITY_COLORS), issue: "color.unknown" })),
    kind: required(text({ schema: lineOfText(LABEL_MAX_LENGTH), issue: "kind.invalid" })),
    unit_label: required(
      text({ schema: lineOfText(LABEL_MAX_LENGTH), issue: "unit-label.invalid" }),
    ),
  },
  migrations: {},
});

export type CommunityFields = typeof communityType.fields;

/** The key of a community note's field. */
export type CommunityKey = (typeof communityType.keys)[number];

/** A community's values as a form saves them. */
export type CommunityValues = RecordValues<CommunityFields>;
