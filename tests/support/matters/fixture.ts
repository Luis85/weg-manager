import { Layer } from "effect";
import { communityType } from "../../../src/domain/communities";
import { contactType } from "../../../src/domain/contacts";
import { matterType } from "../../../src/domain/matters";
import { sequentialIdGenerator } from "../../../src/infrastructure/memory/notes";
import { communityId, communityNote } from "../communities/fixture";
import { contactId, contactNote } from "../contacts/fixture";
import { indexFixture } from "../notes/index-fixture";

export { indexed, ready, stored } from "../notes/record-fixture";
export { communityId, communityNote } from "../communities/fixture";
export { contactId, contactNote } from "../contacts/fixture";

/** The id of the `n`-th record `sequentialIdGenerator` makes, as a matter id. */
export const matterId = (n: number) =>
  `matter-00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`;

export const FOLDER = "WEG Manager/Vorgänge";

/** Community 101 (AW) and contact 201 (the manager), as every matter fixture has them. */
export const AW = communityId(101);
export const MANAGER = contactId(201);

/** A valid matter note's frontmatter with number `n`; `extra` overrides any key. */
export const matterNote = (n: number, extra: Record<string, unknown> = {}) => ({
  schema: "weg-manager.matter/v1",
  id: matterId(n),
  number: n,
  community_id: AW,
  kind: "manager_promise",
  topic: "Beleuchtung",
  outcome: `Ergebnis ${n}`,
  responsible_id: MANAGER,
  status: "open",
  source: "Mail",
  next_step: "Nachfragen.",
  ...extra,
});

/**
 * The matters module over the note index (communities, contacts, matters), the in-memory
 * `NoteStore` and a sequential id generator, with community 101 and contact 201 in the vault.
 */
export const mattersFixture = () => {
  const index = indexFixture({ types: [communityType, contactType, matterType] });
  index.memory.seed(
    "WEG Manager/Gemeinschaften/Ahornweg.md",
    communityNote(101, { name: "Ahornweg", short_code: "AW" }),
  );
  index.memory.seed(
    "WEG Manager/Kontakte/Verwaltung.md",
    contactNote(201, AW, { name: "Verwaltung", kind: "company", roles: [`${AW}:manager`] }),
  );
  const ids = sequentialIdGenerator();
  return { ...index, layer: Layer.mergeAll(index.layer, ids.layer) };
};
