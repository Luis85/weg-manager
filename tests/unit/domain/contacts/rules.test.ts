import { describe, expect, it } from "vitest";
import {
  contactRuleIssues,
  contactValues,
  hasOwnerRole,
  parseRole,
  sameNameContacts,
  validateContact,
  type ContactInput,
} from "../../../../src/domain/contacts";

const AW = "community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21";
const TG = "community-7c0d5e2a-1b3f-4c8d-9e0a-2b4c6d8e0f1a";
const FIRM = "contact-9a1d2c3b-4e5f-4a6b-8c7d-0e1f2a3b4c5d";
const PERSON = "contact-2b3c4d5e-6f70-4812-9a3b-4c5d6e7f8091";

const input = (change: Partial<ContactInput> = {}): ContactInput => ({
  name: "Erika Beispiel",
  kind: "person",
  organization_id: "",
  roles: [`${AW}:board`],
  email: "",
  phone: "",
  language: "",
  private: false,
  inactive: false,
  ...change,
});

const context = {
  others: [
    { id: FIRM, name: "Hausverwaltung Beispiel", kind: "company" as const },
    { id: PERSON, name: "Max Muster", kind: "person" as const },
  ],
  communities: new Set([AW, TG]),
};

describe("parseRole and hasOwnerRole", () => {
  it("reads an entry into community and role, and nothing else", () => {
    expect(parseRole(`${AW}:owner`)).toEqual({ community: AW, role: "owner" });
    expect(parseRole("board")).toBeUndefined();
    expect(parseRole(`${AW}:chef`)).toBeUndefined();
  });

  it("finds an owner role in a list", () => {
    expect(hasOwnerRole([`${AW}:board`, `${TG}:owner`])).toBe(true);
    expect(hasOwnerRole([`${AW}:board`])).toBe(false);
    expect(hasOwnerRole(undefined)).toBe(false);
  });
});

describe("contactValues", () => {
  it("trims texts, drops blank ones and saves the flags only when set", () => {
    expect(
      contactValues(input({ name: "  Erika  ", email: " e@x.de ", private: false, inactive: true })),
    ).toEqual({
      name: "Erika",
      kind: "person",
      organization_id: undefined,
      roles: [`${AW}:board`],
      email: "e@x.de",
      phone: undefined,
      language: undefined,
      private: undefined,
      inactive: true,
    });
  });
});

describe("contactRuleIssues", () => {
  it("needs at least one role and one role per community", () => {
    expect(contactRuleIssues({ kind: "person", roles: [] }, context)).toEqual([
      { key: "roles", code: "roles.missing" },
    ]);
    expect(
      contactRuleIssues({ kind: "person", roles: [`${AW}:board`, `${AW}:owner`] }, context),
    ).toContainEqual({ key: "roles", code: "roles.duplicate-community" });
  });

  it("refuses a role in a community that does not exist", () => {
    const gone = "community-00000000-0000-4000-8000-000000000009";
    expect(contactRuleIssues({ kind: "person", roles: [`${gone}:board`] }, context)).toEqual([
      { key: "roles", code: "roles.community-missing" },
    ]);
  });

  it("asks for the private mark on an owner (PBI-02 criterion 10)", () => {
    expect(contactRuleIssues({ kind: "person", roles: [`${AW}:owner`] }, context)).toEqual([
      { key: "private", code: "private.missing" },
    ]);
    expect(
      contactRuleIssues({ kind: "person", roles: [`${AW}:owner`], private: true }, context),
    ).toEqual([]);
  });

  it("lets a person name a company, never a person, and a company name nothing", () => {
    expect(
      contactRuleIssues({ kind: "person", roles: [`${AW}:manager`], organization_id: FIRM }, context),
    ).toEqual([]);
    expect(
      contactRuleIssues({ kind: "person", roles: [`${AW}:manager`], organization_id: PERSON }, context),
    ).toEqual([{ key: "organization_id", code: "organization.not-company" }]);
    expect(
      contactRuleIssues({ kind: "company", roles: [`${AW}:manager`], organization_id: FIRM }, context),
    ).toEqual([{ key: "organization_id", code: "organization.not-company" }]);
  });

  it("leaves a reference to no known contact to the index (`reference.missing`)", () => {
    const unknown = "contact-00000000-0000-4000-8000-000000000009";
    expect(
      contactRuleIssues({ kind: "person", roles: [`${AW}:board`], organization_id: unknown }, context),
    ).toEqual([]);
  });
});

describe("validateContact", () => {
  it("passes a valid person", () => {
    expect(validateContact(input(), context)).toEqual([]);
  });

  it("reports the field rules first, then the rules between records, one issue per field", () => {
    expect(
      validateContact(input({ name: "", kind: "firma", roles: [], email: "nope" }), context),
    ).toEqual([
      { key: "name", code: "field.missing" },
      { key: "kind", code: "kind.unknown" },
      { key: "roles", code: "field.missing" },
      { key: "email", code: "email.invalid" },
    ]);
    expect(validateContact(input({ roles: [`${AW}:owner`] }), context)).toEqual([
      { key: "private", code: "private.missing" },
    ]);
  });

  it("refuses a name too long for a file name, unless the contact had it", () => {
    const name = "日".repeat(100);
    expect(validateContact(input({ name }), context)).toEqual([
      { key: "name", code: "name.too-long" },
    ]);
    expect(validateContact(input({ name }), { ...context, loaded: { name } })).toEqual([]);
  });
});

describe("sameNameContacts", () => {
  it("finds others of the same name, ignoring case, blanks and the contact itself", () => {
    expect(sameNameContacts("  max muster ", context.others)).toEqual([context.others[1]]);
    expect(sameNameContacts("Max Muster", context.others, PERSON)).toEqual([]);
    expect(sameNameContacts("", context.others)).toEqual([]);
  });
});
