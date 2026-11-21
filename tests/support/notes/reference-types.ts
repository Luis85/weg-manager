import type { NoteTypeRegistry } from "../../../src/application/notes";
import { date, defineNoteType, required, text } from "../../../src/domain/notes";

/**
 * The two types of the F-21 reference vault (`scripts/reference-vault.mjs`), declared as the
 * generator writes them, for the index's budget tests and the e2e probe. Test-only: `community`
 * is specified by its own slice, and `item` stands for the types not built yet.
 */
export const referenceCommunity = defineNoteType({
  type: "community",
  version: 1,
  fields: {
    name: required(text()),
    short_code: required(text()),
    color: text(),
    kind: text(),
    unit_label: text(),
  },
  migrations: {},
});

export const referenceItem = defineNoteType({
  type: "item",
  version: 1,
  fields: {
    community_id: required(text()),
    kind: required(text()),
    number: text(),
    title: required(text()),
    status: text(),
    date: date(),
  },
  migrations: {},
});

export const REFERENCE_TYPES: NoteTypeRegistry = [referenceCommunity, referenceItem];
