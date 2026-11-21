import type { NoteTypeRegistry } from "../../../src/application/notes";
import { communityType } from "../../../src/domain/communities";
import { date, defineNoteType, required, text } from "../../../src/domain/notes";

/**
 * The two types of the F-21 reference vault (`scripts/reference-vault.mjs`), for the index's
 * budget tests and the e2e probe: the plugin's own `community` type, and the test-only `item`,
 * declared as the generator writes it, for the types not built yet.
 */
export const referenceCommunity = communityType;

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
