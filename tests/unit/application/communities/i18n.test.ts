import { describe, expect, it } from "vitest";
import {
  COMMUNITIES_SECTION,
  COMMUNITY_SETTINGS,
  InvalidCommunityError,
  communitiesDe,
  communitiesEn,
  describeCommunitiesError,
  describeCommunityIssue,
  type CommunitiesCatalog,
  type CommunityNoteIssue,
} from "../../../../src/application/communities";
import { de, en } from "../../../../src/application/messages";
import { NoteNotFoundError } from "../../../../src/application/notes";
import { VaultReadError } from "../../../../src/application/shell";
import { describeError } from "../../../../src/application/user-messages";
import { communityType } from "../../../../src/domain/communities";

/** Every text of a catalog, its functions called with samples, as plain data. */
const rendered = (catalog: CommunitiesCatalog) => {
  const { issues } = catalog;
  const plain = { key: "name", code: "name.invalid" } as const;
  return {
    ...catalog,
    screen: {
      ...catalog.screen,
      intro: catalog.screen.intro("WEG Manager/Gemeinschaften"),
      editLabel: catalog.screen.editLabel("Ahornweg 12"),
      removeLabel: catalog.screen.removeLabel("Ahornweg 12"),
      summary: catalog.screen.summary("WEG", "Einheiten"),
    },
    colorTaken: catalog.colorTaken("Petrol"),
    suggestion: catalog.suggestion({ kind: "WEG", unit_label: "Einheiten" }),
    issues: {
      "name.invalid": issues["name.invalid"](plain, "Feld"),
      "name.too-long": issues["name.too-long"]({ key: "name", code: "name.too-long" }, "Feld"),
      "short-code.invalid": issues["short-code.invalid"](
        { key: "short_code", code: "short-code.invalid" },
        "Feld",
      ),
      "short-code.taken": issues["short-code.taken"](
        { key: "short_code", code: "short-code.taken", value: "AW", other: "Ahornweg 12" },
        "Feld",
      ),
      "short-code.duplicate": issues["short-code.duplicate"](
        { key: "short_code", code: "short-code.duplicate", value: "AW", other: "Ahornweg 12" },
        "Feld",
      ),
      "color.unknown": issues["color.unknown"](
        { key: "color", code: "color.unknown", value: "cyan" },
        "Feld",
      ),
      "color.taken": issues["color.taken"]({ key: "color", code: "color.taken" }, "Feld"),
      "kind.invalid": issues["kind.invalid"]({ key: "kind", code: "kind.invalid" }, "Feld"),
      "unit-label.invalid": issues["unit-label.invalid"](
        { key: "unit_label", code: "unit-label.invalid" },
        "Feld",
      ),
    },
  };
};

describe("the communities catalog", () => {
  it("is the communities part of the app's catalog in both languages", () => {
    expect(de.communities).toBe(communitiesDe);
    expect(en.communities).toBe(communitiesEn);
  });

  it("has exact German texts", () => {
    expect(rendered(communitiesDe)).toEqual({
      route: "Gemeinschaften",
      screen: {
        title: "Gemeinschaften",
        intro: "Jede Gemeinschaft ist eine Notiz im Ordner „WEG Manager/Gemeinschaften“.",
        add: "Gemeinschaft anlegen",
        loading: "Gemeinschaften werden geladen …",
        empty: "Hier erscheinen deine Gemeinschaften, etwa eine WEG und ihre Tiefgarage.",
        edit: "Bearbeiten",
        remove: "Löschen",
        editLabel: "Ahornweg 12 bearbeiten",
        removeLabel: "Ahornweg 12 löschen",
        readOnly: "Schreibgeschützt",
        selected: "Aktuell",
        summary: "WEG (Einheiten)",
      },
      fields: {
        name: "Name",
        short_code: "Kürzel",
        color: "Farbe",
        kind: "Art",
        unit_label: "Einheitenbezeichnung",
      },
      noShortCode: "?",
      shortCodeHint: "2 bis 5 Buchstaben oder Ziffern, z. B. AW.",
      unitLabelHelp: "Wie die Einheiten heißen, z. B. Einheiten oder Stellplätze.",
      colors: {
        teal: "Petrol",
        violet: "Violett",
        blue: "Blau",
        rust: "Rostrot",
        slate: "Schiefergrau",
        amber: "Bernstein",
        pink: "Pink",
        olive: "Oliv",
      },
      colorTaken: "Petrol, schon vergeben",
      preview: "Vorschau",
      builtInKinds: [
        { kind: "WEG", unit_label: "Einheiten" },
        { kind: "Tiefgarage", unit_label: "Stellplätze" },
      ],
      suggestions: "Vorschläge:",
      suggestion: "WEG · Einheiten",
      form: {
        createTitle: "Neue Gemeinschaft",
        editTitle: "Gemeinschaft bearbeiten",
        save: "Speichern",
        cancel: "Abbrechen",
      },
      deletion: { title: "Gemeinschaft löschen" },
      switcher: {
        label: "Gemeinschaft",
        loading: "Wird geladen …",
        choose: "Wähle die Gemeinschaft, in der du arbeitest.",
        none: "Noch keine Gemeinschaft",
        unavailable:
          "Keine Gemeinschaft ist wählbar, solange ihre Angaben nicht stimmen. Korrigiere sie unter „Gemeinschaften“.",
      },
      missing: {
        name: "Gib einen Namen ein.",
        short_code: "Gib ein Kürzel ein.",
        color: "Wähle eine Farbe.",
        kind: "Gib eine Art ein oder wähle einen Vorschlag.",
        unit_label: "Gib an, wie die Einheiten heißen.",
      },
      issues: {
        "name.invalid": "Gib für „Feld“ eine Zeile mit höchstens 100 Zeichen ein.",
        "name.too-long":
          "„Feld“ ergibt einen zu langen Dateinamen, weil manche Zeichen mehr Platz brauchen. Kürze den Namen.",
        "short-code.invalid": "Das Kürzel braucht 2 bis 5 Buchstaben (A–Z) oder Ziffern.",
        "short-code.taken": "„Ahornweg 12“ hat schon das Kürzel AW. Wähle ein anderes.",
        "short-code.duplicate":
          "„Ahornweg 12“ hat dasselbe Kürzel AW. Gib einer der beiden ein anderes Kürzel.",
        "color.unknown": "Die gespeicherte Farbe „cyan“ gibt es nicht. Wähle eine Farbe.",
        "color.taken": "Eine andere Gemeinschaft hat diese Farbe schon. Wähle eine andere.",
        "kind.invalid": "Gib für „Feld“ eine Zeile mit höchstens 50 Zeichen ein.",
        "unit-label.invalid": "Gib für „Feld“ eine Zeile mit höchstens 50 Zeichen ein.",
      },
      errors: {
        invalid: {
          title: "Gemeinschaft nicht gespeichert",
          detail:
            "Einige Angaben fehlen oder passen nicht. Korrigiere die markierten Felder und speichere erneut.",
        },
      },
    });
  });

  it("has exact English texts", () => {
    expect(rendered(communitiesEn)).toEqual({
      route: "Communities",
      screen: {
        title: "Communities",
        intro: "Each community is a note in the folder “WEG Manager/Gemeinschaften”.",
        add: "Add community",
        loading: "Loading communities…",
        empty:
          "Your communities appear here, such as a homeowners' association (WEG) and its underground car park.",
        edit: "Edit",
        remove: "Delete",
        editLabel: "Edit Ahornweg 12",
        removeLabel: "Delete Ahornweg 12",
        readOnly: "Read-only",
        selected: "Current",
        summary: "WEG (Einheiten)",
      },
      fields: {
        name: "Name",
        short_code: "Short code",
        color: "Color",
        kind: "Kind",
        unit_label: "Unit label",
      },
      noShortCode: "?",
      shortCodeHint: "2–5 letters or digits, e.g. AW.",
      unitLabelHelp: "What the units are called, e.g. units or parking spaces.",
      colors: {
        teal: "Teal",
        violet: "Violet",
        blue: "Blue",
        rust: "Rust red",
        slate: "Slate gray",
        amber: "Amber",
        pink: "Pink",
        olive: "Olive",
      },
      colorTaken: "Petrol, already in use",
      preview: "Preview",
      builtInKinds: [
        { kind: "WEG", unit_label: "Units" },
        { kind: "Underground car park", unit_label: "Parking spaces" },
      ],
      suggestions: "Suggestions:",
      suggestion: "WEG · Einheiten",
      form: {
        createTitle: "New community",
        editTitle: "Edit community",
        save: "Save",
        cancel: "Cancel",
      },
      deletion: { title: "Delete community" },
      switcher: {
        label: "Community",
        loading: "Loading…",
        choose: "Choose the community you work in.",
        none: "No community yet",
        unavailable:
          "No community can be chosen while its entries are wrong. Fix them under “Communities”.",
      },
      missing: {
        name: "Enter a name.",
        short_code: "Enter a short code.",
        color: "Choose a color.",
        kind: "Enter a kind or choose a suggestion.",
        unit_label: "Enter what the units are called.",
      },
      issues: {
        "name.invalid": "Enter one line of at most 100 characters for “Feld”.",
        "name.too-long":
          "“Feld” makes a file name that is too long, because some characters take more space. Shorten the name.",
        "short-code.invalid": "The short code needs 2–5 letters (A–Z) or digits.",
        "short-code.taken": "“Ahornweg 12” already uses AW. Choose another short code.",
        "short-code.duplicate":
          "“Ahornweg 12” has the same short code AW. Give one of them a different short code.",
        "color.unknown": "The saved color “cyan” isn't available. Choose a color.",
        "color.taken": "Another community already uses this color. Choose another one.",
        "kind.invalid": "Enter one line of at most 50 characters for “Feld”.",
        "unit-label.invalid": "Enter one line of at most 50 characters for “Feld”.",
      },
      errors: {
        invalid: {
          title: "Community not saved",
          detail: "Some entries are missing or invalid. Fix the marked fields and save again.",
        },
      },
    });
  });

  it("labels the fields in the type's key order", () => {
    expect(Object.keys(communitiesDe.fields)).toEqual(communityType.keys);
  });
});

describe("describeCommunityIssue", () => {
  const ISSUES: CommunityNoteIssue[] = [
    { key: "name", code: "field.missing" },
    { key: "color", code: "field.missing" },
    { key: "short_code", code: "short-code.taken", value: "AW", other: "Ahornweg 12" },
    { key: "short_code", code: "short-code.duplicate", value: "AW", other: "Tiefgarage" },
    { key: "color", code: "color.unknown", value: "cyan" },
    { key: "name", code: "name.invalid" },
    { key: "short_code", code: "short-code.invalid" },
    { key: "color", code: "color.taken" },
    { key: "kind", code: "kind.invalid" },
    { key: "unit_label", code: "unit-label.invalid" },
    { code: "schema.newer", version: 2 },
    { code: "id.duplicate", other: "Gemeinschaften/Kopie.md" },
  ];

  it("words each issue with its data, a missing field by field, the others with their label", () => {
    expect(ISSUES.map((issue) => describeCommunityIssue(issue, de))).toEqual([
      "Gib einen Namen ein.",
      "Wähle eine Farbe.",
      "„Ahornweg 12“ hat schon das Kürzel AW. Wähle ein anderes.",
      "„Tiefgarage“ hat dasselbe Kürzel AW. Gib einer der beiden ein anderes Kürzel.",
      "Die gespeicherte Farbe „cyan“ gibt es nicht. Wähle eine Farbe.",
      "Gib für „Name“ eine Zeile mit höchstens 100 Zeichen ein.",
      "Das Kürzel braucht 2 bis 5 Buchstaben (A–Z) oder Ziffern.",
      "Eine andere Gemeinschaft hat diese Farbe schon. Wähle eine andere.",
      "Gib für „Art“ eine Zeile mit höchstens 50 Zeichen ein.",
      "Gib für „Einheitenbezeichnung“ eine Zeile mit höchstens 50 Zeichen ein.",
      "Die Notiz wurde mit einer neueren Version von WEG Manager gespeichert, etwa auf einem anderen Gerät, deshalb ist sie hier schreibgeschützt. Aktualisiere WEG Manager, um sie zu bearbeiten.",
      "Die Notiz „Gemeinschaften/Kopie.md“ hat dieselbe „id“, deshalb sind beide schreibgeschützt. Lösche die doppelte Notiz in Obsidian.",
    ]);
    expect(describeCommunityIssue({ key: "kind", code: "field.missing" }, en)).toBe(
      "Enter a kind or choose a suggestion.",
    );
    expect(describeCommunityIssue({ key: "kind", code: "kind.invalid" }, en)).toBe(
      "Enter one line of at most 50 characters for “Kind”.",
    );
  });
});

describe("communities errors", () => {
  const invalid = new InvalidCommunityError({ issues: [{ key: "name", code: "field.missing" }] });

  it("keeps the other community's name out of its message, which a defect would log", () => {
    const taken = new InvalidCommunityError({
      issues: [{ key: "short_code", code: "short-code.taken", value: "AW", other: "Ahornweg 12" }],
    });
    expect(taken.message).not.toContain("Ahornweg");
    expect(String(taken)).not.toContain("Ahornweg");
  });

  it("leaves the other modules' errors to their own describers", () => {
    expect(describeError(new NoteNotFoundError(), de).title).toBe("Notiz nicht gefunden");
    expect(describeError(new VaultReadError({ cause: new Error("x") }), de).title).toBe(
      "Notizen nicht lesbar",
    );
  });

  it("words an invalid community as a warning, through describeError too", () => {
    const german = {
      severity: "warning",
      title: "Gemeinschaft nicht gespeichert",
      detail:
        "Einige Angaben fehlen oder passen nicht. Korrigiere die markierten Felder und speichere erneut.",
    };
    expect(describeCommunitiesError(invalid, communitiesDe)).toEqual(german);
    expect(describeError(invalid, de)).toEqual(german);
    expect(describeError(invalid, en)).toEqual({
      severity: "warning",
      title: "Community not saved",
      detail: "Some entries are missing or invalid. Fix the marked fields and save again.",
    });
    expect(describeError(new NoteNotFoundError(), de).title).toBe("Notiz nicht gefunden");
  });
});

describe("the communities route", () => {
  it("is the settings screen on the communities section", () => {
    expect(COMMUNITIES_SECTION).toBe("communities");
    expect(COMMUNITY_SETTINGS).toEqual({ name: "settings", section: "communities" });
  });
});
