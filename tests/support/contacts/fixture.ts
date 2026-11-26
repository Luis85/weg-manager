import { Layer } from "effect";
import { communityType } from "../../../src/domain/communities";
import { contactType } from "../../../src/domain/contacts";
import { sequentialIdGenerator } from "../../../src/infrastructure/memory/notes";
import { communityNote } from "../communities/fixture";
import { indexFixture } from "../notes/index-fixture";

export { indexed, ready, stored } from "../notes/record-fixture";
export { communityId, communityNote } from "../communities/fixture";

/** The id of the `n`-th record `sequentialIdGenerator` makes, as a contact id. */
export const contactId = (n: number) =>
  `contact-00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`;

export const FOLDER = "WEG Manager/Kontakte";
export const COMMUNITY_FOLDER = "WEG Manager/Gemeinschaften";

/** A valid contact note's frontmatter, a person with the board role in community 1. */
export const contactNote = (n: number, community: string, extra: Record<string, unknown> = {}) => ({
  schema: "weg-manager.contact/v1",
  id: contactId(n),
  name: `Kontakt ${n}`,
  kind: "person",
  roles: [`${community}:board`],
  ...extra,
});

/**
 * The contacts module over the note index (communities and contacts), the in-memory `NoteStore`
 * and a sequential id generator, with communities 101 and 102 in the vault. Its effects run under
 * `TestClock`: `indexed` moves the clock until the index has read every write.
 */
export const contactsFixture = (options: { readonly settings?: unknown } = {}) => {
  const index = indexFixture({ types: [communityType, contactType], settings: options.settings });
  index.memory.seed(`${COMMUNITY_FOLDER}/Ahornweg.md`, communityNote(101, { name: "Ahornweg" }));
  index.memory.seed(
    `${COMMUNITY_FOLDER}/Tiefgarage.md`,
    communityNote(102, { name: "Tiefgarage", short_code: "TG", color: "blue" }),
  );
  const ids = sequentialIdGenerator();
  const layer = Layer.mergeAll(index.layer, ids.layer);
  return { ...index, layer };
};
