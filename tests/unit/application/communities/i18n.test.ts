import { Schema } from "effect";
import { describe, expect, it } from "vitest";
import {
  COMMUNITY_SETTINGS,
  CommunitiesRoute,
  InvalidCommunityError,
  communitiesDe,
  communitiesEn,
  describeCommunitiesError,
  describeCommunityIssue,
  isCommunitiesError,
  type CommunitiesCatalog,
  type CommunityNoteIssue,
} from "../../../../src/application/communities";
import { de, en } from "../../../../src/application/messages";
import { NoteNotFoundError } from "../../../../src/application/notes";
import { VaultReadError } from "../../../../src/application/shell";
import { describeError } from "../../../../src/application/user-messages";
import { COMMUNITY_KEYS, communityType } from "../../../../src/domain/communities";

/** Every text of a catalog, its functions called with samples, as plain data. */
const rendered = (catalog: CommunitiesCatalog) => ({
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
  conflict: {
    ...catalog.conflict,
    loaded: catalog.conflict.loaded("WEG"),
    mine: catalog.conflict.mine("Haus"),
    theirs: catalog.conflict.theirs("Tiefgarage"),
  },
  deletion: { ...catalog.deletion, detail: catalog.deletion.detail("Ahornweg 12") },
  issues: Object.fromEntries(
    Object.entries(catalog.issues).map(([code, text]) => [code, text("Feld")]),
  ),
});

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
        summary: "WEG · Einheiten",
        problems: "Notizen mit Problemen",
      },
      fields: {
        name: "Name",
        short_code: "Kürzel",
        color: "Farbe",
        kind: "Art",
        unit_label: "Einheitenbezeichnung",
      },
      noShortCode: "?",
      shortCodeHint: "2 bis 5 Zeichen aus A–Z und 0–9, nach dem Anlegen fest.",
      shortCodeFixed: "Das Kürzel ist nach dem Anlegen fest.",
      colors: {
        teal: "Petrol",
        violet: "Violett",
        blue: "Blau",
        rust: "Rost",
        slate: "Schiefer",
        cyan: "Cyan",
        pink: "Pink",
        olive: "Oliv",
      },
      colorTaken: "Petrol, schon vergeben",
      builtInKinds: [
        { kind: "WEG", unit_label: "Einheiten" },
        { kind: "Tiefgarage", unit_label: "Stellplätze" },
      ],
      suggestions: "Vorschläge",
      suggestion: "WEG · Einheiten",
      form: {
        createTitle: "Neue Gemeinschaft",
        editTitle: "Gemeinschaft bearbeiten",
        save: "Speichern",
        cancel: "Abbrechen",
      },
      conflict: {
        title: "Notiz inzwischen geändert",
        detail:
          "Diese Felder wurden auch außerhalb des Formulars geändert. Wähle je Feld den Wert, der gelten soll, und speichere.",
        loaded: "Beim Öffnen: WEG",
        mine: "Deine Eingabe: Haus",
        theirs: "In der Notiz: Tiefgarage",
        apply: "Auswahl speichern",
        empty: "(leer)",
      },
      deletion: {
        title: "Gemeinschaft löschen",
        detail: "„Ahornweg 12“ kommt in den Papierkorb, den du in Obsidian eingestellt hast.",
        confirm: "Löschen",
        cancel: "Abbrechen",
      },
      switcher: {
        label: "Gemeinschaft",
        choose: "Wähle die Gemeinschaft, in der du arbeitest.",
        none: "Noch keine Gemeinschaft",
      },
      issues: {
        "name.invalid":
          "„Feld“ ist leer, länger als 100 Zeichen oder mehrzeilig. Gib eine Zeile mit höchstens 100 Zeichen ein.",
        "short-code.invalid":
          "„Feld“ hat nicht 2 bis 5 Zeichen aus A–Z und 0–9. Gib ein solches Kürzel ein.",
        "short-code.taken": "Eine andere Gemeinschaft hat dieses Kürzel schon. Wähle ein anderes.",
        "short-code.duplicate":
          "Eine andere Gemeinschaft hat dasselbe Kürzel. Gib einer der beiden ein anderes.",
        "color.unknown": "„Feld“ ist keine Farbe der Palette. Wähle eine Farbe aus.",
        "color.taken": "Eine andere Gemeinschaft hat diese Farbe schon. Wähle eine andere.",
        "kind.invalid":
          "„Feld“ ist leer, länger als 50 Zeichen oder mehrzeilig. Gib eine Zeile mit höchstens 50 Zeichen ein.",
        "unit-label.invalid":
          "„Feld“ ist leer, länger als 50 Zeichen oder mehrzeilig. Gib eine Zeile mit höchstens 50 Zeichen ein.",
      },
      errors: {
        invalid: {
          title: "Gemeinschaft nicht gespeichert",
          detail:
            "Einige Angaben erfüllen die Regeln nicht. Korrigiere die markierten Felder und speichere erneut.",
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
        loading: "Loading communities …",
        empty: "Your communities appear here, such as a WEG and its underground car park.",
        edit: "Edit",
        remove: "Delete",
        editLabel: "Edit Ahornweg 12",
        removeLabel: "Delete Ahornweg 12",
        readOnly: "Read-only",
        summary: "WEG · Einheiten",
        problems: "Notes with problems",
      },
      fields: {
        name: "Name",
        short_code: "Short code",
        color: "Color",
        kind: "Kind",
        unit_label: "Unit label",
      },
      noShortCode: "?",
      shortCodeHint: "2 to 5 characters from A–Z and 0–9, fixed once created.",
      shortCodeFixed: "The short code is fixed once created.",
      colors: {
        teal: "Teal",
        violet: "Violet",
        blue: "Blue",
        rust: "Rust",
        slate: "Slate",
        cyan: "Cyan",
        pink: "Pink",
        olive: "Olive",
      },
      colorTaken: "Petrol, already taken",
      builtInKinds: [
        { kind: "WEG", unit_label: "Units" },
        { kind: "Underground car park", unit_label: "Parking spaces" },
      ],
      suggestions: "Suggestions",
      suggestion: "WEG · Einheiten",
      form: {
        createTitle: "New community",
        editTitle: "Edit community",
        save: "Save",
        cancel: "Cancel",
      },
      conflict: {
        title: "Note changed meanwhile",
        detail:
          "These fields were also changed outside the form. Choose the value that applies for each field, then save.",
        loaded: "When opened: WEG",
        mine: "Your input: Haus",
        theirs: "In the note: Tiefgarage",
        apply: "Save choice",
        empty: "(empty)",
      },
      deletion: {
        title: "Delete community",
        detail: "“Ahornweg 12” goes to the trash you set in Obsidian.",
        confirm: "Delete",
        cancel: "Cancel",
      },
      switcher: {
        label: "Community",
        choose: "Choose the community you work in.",
        none: "No community yet",
      },
      issues: {
        "name.invalid":
          "“Feld” is blank, longer than 100 characters or more than one line. Enter one line of at most 100 characters.",
        "short-code.invalid":
          "“Feld” isn't 2 to 5 characters from A–Z and 0–9. Enter such a short code.",
        "short-code.taken": "Another community already has this short code. Choose another one.",
        "short-code.duplicate":
          "Another community has the same short code. Give one of them another one.",
        "color.unknown": "“Feld” isn't a color of the palette. Choose a color.",
        "color.taken": "Another community already uses this color. Choose another one.",
        "kind.invalid":
          "“Feld” is blank, longer than 50 characters or more than one line. Enter one line of at most 50 characters.",
        "unit-label.invalid":
          "“Feld” is blank, longer than 50 characters or more than one line. Enter one line of at most 50 characters.",
      },
      errors: {
        invalid: {
          title: "Community not saved",
          detail: "Some entries break the rules. Correct the marked fields and save again.",
        },
      },
    });
  });

  it("labels the fields in the type's key order", () => {
    expect(Object.keys(communitiesDe.fields)).toEqual([...COMMUNITY_KEYS]);
    expect(COMMUNITY_KEYS).toEqual(communityType.keys);
  });
});

describe("describeCommunityIssue", () => {
  const ISSUES: CommunityNoteIssue[] = [
    { key: "name", code: "field.missing" },
    { key: "short_code", code: "short-code.taken" },
    { key: "unit_label", code: "unit-label.invalid" },
    { code: "schema.newer", version: 2 },
    { code: "id.duplicate", other: "Gemeinschaften/Kopie.md" },
  ];

  it("words record issues, field.missing and this module's codes with the field's label", () => {
    expect(ISSUES.map((issue) => describeCommunityIssue(issue, de))).toEqual([
      "„Name“ fehlt. Gib einen Wert ein.",
      "Eine andere Gemeinschaft hat dieses Kürzel schon. Wähle ein anderes.",
      "„Einheitenbezeichnung“ ist leer, länger als 50 Zeichen oder mehrzeilig. Gib eine Zeile mit höchstens 50 Zeichen ein.",
      "Die Notiz wurde mit einer neueren Version von WEG Manager gespeichert, etwa auf einem anderen Gerät, deshalb ist sie hier schreibgeschützt. Aktualisiere WEG Manager, um sie zu bearbeiten.",
      "Die Notiz „Gemeinschaften/Kopie.md“ hat dieselbe „id“, deshalb sind beide schreibgeschützt. Lösche die doppelte Notiz in Obsidian.",
    ]);
    expect(describeCommunityIssue({ key: "short_code", code: "short-code.invalid" }, en)).toBe(
      "“Short code” isn't 2 to 5 characters from A–Z and 0–9. Enter such a short code.",
    );
    expect(describeCommunityIssue({ key: "kind", code: "field.missing" }, en)).toBe(
      "“Kind” is missing. Enter a value.",
    );
  });
});

describe("communities errors", () => {
  const invalid = new InvalidCommunityError({ issues: [{ key: "name", code: "field.missing" }] });

  it("tells its own errors from the other modules'", () => {
    expect(isCommunitiesError(invalid)).toBe(true);
    expect(isCommunitiesError(new NoteNotFoundError())).toBe(false);
    expect(isCommunitiesError(new VaultReadError({ cause: new Error("x") }))).toBe(false);
  });

  it("words an invalid community as a warning, through describeError too", () => {
    const german = {
      severity: "warning",
      title: "Gemeinschaft nicht gespeichert",
      detail:
        "Einige Angaben erfüllen die Regeln nicht. Korrigiere die markierten Felder und speichere erneut.",
    };
    expect(describeCommunitiesError(invalid, communitiesDe)).toEqual(german);
    expect(describeError(invalid, de)).toEqual(german);
    expect(describeError(invalid, en)).toEqual({
      severity: "warning",
      title: "Community not saved",
      detail: "Some entries break the rules. Correct the marked fields and save again.",
    });
    expect(describeError(new NoteNotFoundError(), de).title).toBe("Notiz nicht gefunden");
  });
});

describe("the communities route", () => {
  it("is the community settings and decodes nothing else", () => {
    const decode = Schema.decodeUnknownOption(CommunitiesRoute);
    expect(COMMUNITY_SETTINGS).toEqual({ name: "settings", section: "communities" });
    expect(decode(COMMUNITY_SETTINGS)._tag).toBe("Some");
    expect(decode({ name: "settings", section: "other" })._tag).toBe("None");
    expect(decode({ name: "other", section: "communities" })._tag).toBe("None");
  });
});
