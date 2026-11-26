import { NAME_MAX_LENGTH } from "../../../domain/contacts";
import type { ContactsCatalog } from "./catalog";

/** German, du-form: first the cause, then the action (handoff HO-06). */
export const contactsDe: ContactsCatalog = {
  route: "Kontakte",
  screen: {
    title: "Kontakte",
    intro: (folder) => `Jeder Kontakt ist eine Notiz im Ordner „${folder}“.`,
    add: "Kontakt anlegen",
    loading: "Kontakte werden geladen …",
    empty:
      "Hier erscheinen Personen und Firmen mit ihrer Rolle je Gemeinschaft, etwa die Verwaltung.",
    edit: "Bearbeiten",
    editLabel: (name) => `${name} bearbeiten`,
    readOnly: "Schreibgeschützt",
    showInactive: "Nicht mehr verwendete zeigen",
    hiddenInactive: (count) =>
      count === 1
        ? "1 nicht mehr verwendeter Kontakt ausgeblendet"
        : `${count} nicht mehr verwendete Kontakte ausgeblendet`,
    private: "Privat",
    inactive: "Nicht mehr verwendet",
    worksFor: (company) => `bei ${company}`,
    people: (names) => `Personen: ${names}`,
    roleIn: (role, community) => `${role} (${community})`,
  },
  fields: {
    name: "Name",
    kind: "Art",
    organization_id: "Firma",
    roles: "Rollen",
    email: "E-Mail",
    phone: "Telefon",
    language: "Sprache",
    private: "Privat",
    inactive: "Nicht mehr verwendet",
  },
  kinds: { person: "Person", company: "Firma" },
  roles: {
    board: "Beirat",
    deputy: "Vertretung",
    owner: "Eigentümer",
    manager: "Verwaltung",
    other_board: "Beirat andere Gemeinschaft",
    third_party: "Dritte",
    agent: "Agent",
  },
  languages: { de: "Deutsch", "de+en": "Deutsch und Englisch" },
  form: {
    createTitle: "Neuer Kontakt",
    editTitle: "Kontakt bearbeiten",
    save: "Speichern",
    cancel: "Abbrechen",
    community: "Gemeinschaft",
    role: "Rolle",
    addRole: "Rolle hinzufügen",
    removeRole: (community) => `Rolle in ${community} entfernen`,
    noRole: "Noch keine Rolle",
    noCommunities: "Lege zuerst unter „Einstellungen“ eine Gemeinschaft an.",
    noCompany: "Keine Firma",
    newCompany: "Neue Firma …",
    newCompanyName: "Name der neuen Firma",
    newCompanyHint: "Die Firma wird beim Speichern als eigener Kontakt angelegt.",
    noLanguage: "Nicht angegeben",
    privateLocked: "Eigentümer sind immer privat.",
    privateHelp:
      "Aus privaten Kontakten übernimmt das Plugin nichts in Entwürfe, Karten oder Berichte.",
    inactiveHelp:
      "Der Kontakt bleibt erhalten, damit ältere Vorgänge und Nachrichten nachvollziehbar sind.",
    sameName: (names) =>
      `Es gibt schon einen Kontakt mit diesem Namen: ${names}. Prüfe, ob du ihn meinst.`,
  },
  missing: {
    name: "Gib einen Namen ein.",
    kind: "Wähle, ob es eine Person oder eine Firma ist.",
    roles: "Gib mindestens eine Rolle in einer Gemeinschaft an.",
  },
  issues: {
    "name.invalid": (_, label) =>
      `Gib für „${label}“ eine Zeile mit höchstens ${NAME_MAX_LENGTH} Zeichen ein.`,
    "name.too-long": (_, label) =>
      `„${label}“ ergibt einen zu langen Dateinamen, weil manche Zeichen mehr Platz brauchen. Kürze den Namen.`,
    "kind.unknown": () => "Die Art ist weder Person noch Firma. Wähle eine.",
    "organization.not-company": () =>
      "Nur eine Person kann zu einer Firma gehören, und nur zu einem Kontakt der Art Firma. Wähle eine Firma oder keine.",
    "roles.invalid": () =>
      "Eine Rolle hat nicht die Form Gemeinschaft und Rolle. Wähle Gemeinschaft und Rolle neu.",
    "roles.missing": () => "Gib mindestens eine Rolle in einer Gemeinschaft an.",
    "roles.duplicate-community": () =>
      "Für eine Gemeinschaft sind zwei Rollen angegeben. Lass je Gemeinschaft eine Rolle stehen.",
    "roles.community-missing": () =>
      "Eine Rolle nennt eine Gemeinschaft, die es nicht mehr gibt. Wähle eine andere oder entferne die Rolle.",
    "email.invalid": () => "Die E-Mail-Adresse braucht ein @ mit Text davor und danach.",
    "phone.invalid": () => "Gib die Telefonnummer in einer Zeile mit höchstens 50 Zeichen ein.",
    "language.unknown": () => "Diese Sprache kennt das Plugin nicht. Wähle eine aus der Liste.",
    "private.missing": () =>
      "Ein Eigentümer ist nicht als privat markiert. Setze die Markierung „Privat“.",
  },
  errors: {
    invalid: {
      title: "Kontakt nicht gespeichert",
      detail:
        "Einige Angaben fehlen oder passen nicht. Korrigiere die markierten Felder und speichere erneut.",
    },
  },
};
