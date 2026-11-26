import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import {
  InvalidContactError,
  contactList,
  createContact,
  updateContact,
} from "../../../../src/application/contacts";
import { NoteStore } from "../../../../src/application/notes";
import type { ContactInput } from "../../../../src/domain/contacts";
import {
  FOLDER,
  communityId,
  contactId,
  contactNote,
  contactsFixture,
  indexed,
  ready,
  stored,
} from "../../../support/contacts/fixture";

const AW = communityId(101);
const TG = communityId(102);

const INPUT: ContactInput = {
  name: "Erika Beispiel",
  kind: "person",
  organization_id: "",
  roles: [`${AW}:board`],
  email: " erika@example.org ",
  phone: "",
  language: "",
  private: false,
  inactive: false,
};

const first = Effect.map(contactList, ({ records }) => {
  const [contact] = records;
  if (contact === undefined) throw new Error("no contact");
  return contact;
});

describe("createContact", () => {
  it.effect("writes the note into Kontakte, keys in contract order, flags only when set", () => {
    const fixture = contactsFixture();
    return Effect.gen(function* () {
      yield* ready;
      const note = yield* createContact(INPUT);
      assert.strictEqual(note.path, `${FOLDER}/Erika Beispiel.md`);
      assert.deepStrictEqual(Object.entries((yield* stored(note.path)).frontmatter), [
        ["schema", "weg-manager.contact/v1"],
        ["id", contactId(1)],
        ["name", "Erika Beispiel"],
        ["kind", "person"],
        ["roles", [`${AW}:board`]],
        ["email", "erika@example.org"],
      ]);
      assert.strictEqual(fixture.memory.body(note.path), "");
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("refuses broken input with every issue and writes nothing", () => {
    const fixture = contactsFixture();
    return Effect.gen(function* () {
      yield* ready;
      const error = yield* Effect.flip(
        createContact({ ...INPUT, name: " ", roles: [`${AW}:owner`] }),
      );
      assert.deepStrictEqual(
        error,
        new InvalidContactError({
          issues: [
            { key: "name", code: "field.missing" },
            { key: "private", code: "private.missing" },
          ],
        }),
      );
      const notes = yield* NoteStore.use((store) => store.list);
      assert.deepStrictEqual(
        notes.map((note) => note.path).filter((path) => path.startsWith(FOLDER)),
        [],
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("refuses a role in a community that does not exist", () => {
    const fixture = contactsFixture();
    return Effect.gen(function* () {
      yield* ready;
      const gone = communityId(999);
      const error = yield* Effect.flip(createContact({ ...INPUT, roles: [`${gone}:board`] }));
      assert.deepStrictEqual(
        error,
        new InvalidContactError({ issues: [{ key: "roles", code: "roles.community-missing" }] }),
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("creates a named new company first and links the person to it (criterion 4)", () => {
    const fixture = contactsFixture();
    return Effect.gen(function* () {
      yield* ready;
      const note = yield* createContact(
        { ...INPUT, roles: [`${AW}:manager`, `${TG}:owner`], private: true },
        { newCompany: " Hausverwaltung Beispiel " },
      );
      const company = yield* stored(`${FOLDER}/Hausverwaltung Beispiel.md`);
      assert.deepStrictEqual(company.frontmatter, {
        schema: "weg-manager.contact/v1",
        id: contactId(1),
        name: "Hausverwaltung Beispiel",
        kind: "company",
        roles: [`${AW}:manager`, `${TG}:third_party`],
      });
      const person = yield* stored(note.path);
      assert.strictEqual(person.frontmatter["organization_id"], contactId(1));
      assert.strictEqual(person.frontmatter["private"], true);
    }).pipe(Effect.provide(fixture.layer));
  });
});

describe("contactList", () => {
  it.effect("marks a role in a missing community and an owner without the private mark", () => {
    const fixture = contactsFixture();
    fixture.memory.seed(
      `${FOLDER}/A.md`,
      contactNote(1, AW, { name: "A", roles: [`${communityId(999)}:board`] }),
    );
    fixture.memory.seed(
      `${FOLDER}/B.md`,
      contactNote(2, AW, { name: "B", roles: [`${TG}:owner`] }),
    );
    return Effect.gen(function* () {
      yield* ready;
      const { records } = yield* contactList;
      assert.deepStrictEqual(
        records.map((contact) => [contact.values.name, contact.issues]),
        [
          ["A", [{ key: "roles", code: "roles.community-missing" }]],
          ["B", [{ key: "private", code: "private.missing" }]],
        ],
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("marks an organisation that is a person, and leaves a valid company alone", () => {
    const fixture = contactsFixture();
    fixture.memory.seed(`${FOLDER}/F.md`, contactNote(1, AW, { name: "F", kind: "company" }));
    fixture.memory.seed(`${FOLDER}/P.md`, contactNote(2, AW, { name: "P" }));
    fixture.memory.seed(
      `${FOLDER}/X.md`,
      contactNote(3, AW, { name: "X", organization_id: contactId(1) }),
    );
    fixture.memory.seed(
      `${FOLDER}/Y.md`,
      contactNote(4, AW, { name: "Y", organization_id: contactId(2) }),
    );
    return Effect.gen(function* () {
      yield* ready;
      const { records } = yield* contactList;
      assert.deepStrictEqual(
        records.map((contact) => [contact.values.name, contact.issues.map((issue) => issue.code)]),
        [
          ["F", []],
          ["P", []],
          ["X", []],
          ["Y", ["organization.not-company"]],
        ],
      );
    }).pipe(Effect.provide(fixture.layer));
  });
});

describe("updateContact", () => {
  it.effect("saves changed fields only, removes an unset flag and keeps unknown keys", () => {
    const fixture = contactsFixture();
    fixture.memory.seed(
      `${FOLDER}/Kontakt 1.md`,
      contactNote(1, AW, { inactive: true, note_key: "bleibt" }),
    );
    return Effect.gen(function* () {
      yield* ready;
      const contact = yield* first;
      yield* updateContact(contact, {
        name: "Kontakt 1",
        kind: "person",
        organization_id: "",
        roles: [`${AW}:board`, `${TG}:deputy`],
        email: "",
        phone: "",
        language: "de",
        private: false,
        inactive: false,
      });
      assert.deepStrictEqual((yield* stored(`${FOLDER}/Kontakt 1.md`)).frontmatter, {
        schema: "weg-manager.contact/v1",
        id: contactId(1),
        name: "Kontakt 1",
        kind: "person",
        roles: [`${AW}:board`, `${TG}:deputy`],
        note_key: "bleibt",
        language: "de",
      });
      yield* indexed;
    }).pipe(Effect.provide(fixture.layer));
  });
});
