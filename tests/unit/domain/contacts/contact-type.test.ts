import { describe, expect, it } from "vitest";
import {
  CONTACT_KINDS,
  CONTACT_LANGUAGES,
  CONTACT_ROLES,
  NAME_MAX_LENGTH,
  contactType,
  roleEntry,
} from "../../../../src/domain/contacts";

const ID = "contact-2b3c4d5e-6f70-4812-9a3b-4c5d6e7f8091";
const COMPANY = "contact-9a1d2c3b-4e5f-4a6b-8c7d-0e1f2a3b4c5d";
const AW = "community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21";
const TG = "community-7c0d5e2a-1b3f-4c8d-9e0a-2b4c6d8e0f1a";
const PATH = "WEG Manager/Kontakte/Erika Beispiel.md";
const NOTE = {
  schema: "weg-manager.contact/v1",
  id: ID,
  name: "Erika Beispiel",
  kind: "person",
  roles: [`${AW}:board`],
};
const decode = (frontmatter: Record<string, unknown>) =>
  contactType.decode({ path: PATH, frontmatter });

describe("the contact note type (weg-manager.contact/v1)", () => {
  it("is version 1 of `contact` with its keys in file order, filed in Kontakte", () => {
    expect(contactType.type).toBe("contact");
    expect(contactType.version).toBe(1);
    expect(contactType.folder).toBe("Kontakte");
    expect(contactType.keys).toEqual([
      "name",
      "kind",
      "organization_id",
      "roles",
      "email",
      "phone",
      "language",
      "private",
      "inactive",
    ]);
  });

  it("has the closed lists of kinds, roles and languages", () => {
    expect(CONTACT_KINDS).toEqual(["person", "company"]);
    expect(CONTACT_ROLES).toEqual([
      "board",
      "deputy",
      "owner",
      "manager",
      "other_board",
      "third_party",
      "agent",
    ]);
    expect(CONTACT_LANGUAGES).toEqual(["de", "de+en"]);
  });

  it("writes a role as `<community id>:<role>`", () => {
    expect(roleEntry(AW, "owner")).toBe(`${AW}:owner`);
  });

  it("reads a minimal note as an editable record, the flags unset", () => {
    expect(decode(NOTE)).toMatchObject({
      kind: "editable",
      id: ID,
      values: { name: "Erika Beispiel", kind: "person", roles: [`${AW}:board`] },
      issues: [],
    });
  });

  it("reads every field at its limits", () => {
    const full = {
      ...NOTE,
      name: "N".repeat(NAME_MAX_LENGTH),
      organization_id: COMPANY,
      roles: CONTACT_ROLES.map(
        (role, at) => `${at === 0 ? AW : TG.replace("0f1a", `0f${at}a`)}:${role}`,
      ),
      email: "erika@example.org",
      phone: "+49 30 1234567",
      language: "de+en",
      private: true,
      inactive: false,
    };
    expect(decode(full)).toMatchObject({ kind: "editable", issues: [] });
    for (const kind of CONTACT_KINDS)
      expect(decode({ ...NOTE, kind })).toMatchObject({ issues: [] });
    for (const language of CONTACT_LANGUAGES) {
      expect(decode({ ...NOTE, language })).toMatchObject({ issues: [] });
    }
  });

  it("names a missing required field and keeps the record editable", () => {
    const { name: _name, kind: _kind, roles: _roles, ...rest } = NOTE;
    expect(decode(rest)).toMatchObject({
      kind: "editable",
      issues: [
        { code: "field.missing", key: "name" },
        { code: "field.missing", key: "kind" },
        { code: "field.missing", key: "roles" },
      ],
    });
  });

  it("reads an empty role list as a list: that it needs an entry is a rule (`roles.missing`)", () => {
    expect(decode({ ...NOTE, roles: [] })).toMatchObject({ issues: [], values: { roles: [] } });
  });

  it("reports each broken value with its own code", () => {
    const cases: [Record<string, unknown>, string, string][] = [
      [{ name: "zwei\nZeilen" }, "name", "name.invalid"],
      [{ kind: "firma" }, "kind", "kind.unknown"],
      [{ organization_id: AW }, "organization_id", "field.reference"],
      [{ roles: ["board"] }, "roles", "roles.invalid"],
      [{ roles: [`${AW}:chef`] }, "roles", "roles.invalid"],
      [{ roles: [`${AW}:board`, `${AW.toUpperCase()}:owner`] }, "roles", "roles.invalid"],
      [{ email: "erika" }, "email", "email.invalid"],
      [{ email: "a@b@c" }, "email", "email.invalid"],
      [{ phone: "1".repeat(51) }, "phone", "phone.invalid"],
      [{ language: "en" }, "language", "language.unknown"],
      [{ private: "ja" }, "private", "field.checkbox"],
      [{ inactive: 1 }, "inactive", "field.checkbox"],
    ];
    for (const [change, key, code] of cases) {
      expect(decode({ ...NOTE, ...change }), `${key}: ${JSON.stringify(change)}`).toMatchObject({
        kind: "editable",
        issues: [{ key, code }],
      });
    }
  });

  it("shows a note of a newer version read-only", () => {
    expect(decode({ ...NOTE, schema: "weg-manager.contact/v2" })).toMatchObject({
      kind: "read-only",
      issues: [{ code: "schema.newer" }],
    });
  });
});
