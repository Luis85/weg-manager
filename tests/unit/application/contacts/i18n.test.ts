import { describe, expect, it } from "vitest";
import {
  InvalidContactError,
  describeContactIssue,
  describeContactsError,
} from "../../../../src/application/contacts";
import { de, en } from "../../../../src/application/messages";

describe("the contacts catalog", () => {
  it("words the error as a warning in both languages", () => {
    const error = new InvalidContactError({ issues: [] });
    expect(describeContactsError(error, de.contacts)).toEqual({
      severity: "warning",
      title: "Kontakt nicht gespeichert",
      detail:
        "Einige Angaben fehlen oder passen nicht. Korrigiere die markierten Felder und speichere erneut.",
    });
    expect(describeContactsError(error, en.contacts).title).toBe("Contact not saved");
  });

  it("words its own codes, a missing field in its own words and a missing company", () => {
    const words = (issue: Parameters<typeof describeContactIssue>[0]) =>
      describeContactIssue(issue, de);
    expect(words({ key: "private", code: "private.missing" })).toBe(
      "Ein Eigentümer ist nicht als privat markiert. Setze die Markierung „Privat“.",
    );
    expect(words({ key: "roles", code: "field.missing" })).toBe(
      "Gib mindestens eine Rolle in einer Gemeinschaft an.",
    );
    expect(words({ key: "email", code: "email.invalid" })).toBe(
      "Die E-Mail-Adresse braucht ein @ mit Text davor und danach.",
    );
    expect(words({ key: "organization_id", code: "reference.missing", id: "contact-x" })).toContain(
      "Firma",
    );
    expect(describeContactIssue({ key: "private", code: "private.missing" }, en)).toBe(
      'An owner is not marked private. Set the mark "Private".',
    );
  });

  it("names every role in both languages", () => {
    expect(Object.keys(de.contacts.roles)).toEqual(Object.keys(en.contacts.roles));
    expect(de.contacts.roles.owner).toBe("Eigentümer");
    expect(en.contacts.roles.third_party).toBe("Third party");
  });
});
