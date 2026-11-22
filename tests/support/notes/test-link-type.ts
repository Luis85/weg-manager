import { defineNoteType, reference, references, required, text } from "../../../src/domain/notes";

/**
 * A test-only type that refers to test items (`tests/support/notes/test-note-type.ts`): one item
 * by `item_id`, several by `item_ids`, as a contact refers to its communities.
 */
export const testLink = defineNoteType({
  type: "test-link",
  version: 1,
  fields: {
    title: required(text()),
    item_id: reference("test-item"),
    item_ids: references("test-item"),
  },
  migrations: {},
});

/** The id of the `n`-th test link. */
export const linkId = (n: number) =>
  `test-link-00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`;

/** A valid test link's frontmatter; `extra` overrides any key. */
export const linkNote = (n: number, extra: Record<string, unknown> = {}) => ({
  schema: "weg-manager.test-link/v1",
  id: linkId(n),
  title: `Link ${n}`,
  ...extra,
});
