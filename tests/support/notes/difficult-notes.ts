/**
 * Notes with frontmatter as people, other plugins (Dataview, Templater) and agents write it, for
 * the scenario "note with difficult frontmatter" (`difficult-scenario.ts`). Each is created in the
 * folder `Schwierig/` under its name; `patch` is the update the scenario then sends through the
 * `NoteStore` adapter (by default `name` set to "Neu").
 */
export type DifficultNote = {
  readonly name: string;
  readonly text: string;
  readonly patch?: { readonly set?: Record<string, unknown>; readonly remove?: readonly string[] };
};

const SCHEMA = "schema: weg-manager.community/v1";

const block = (...lines: readonly string[]) => `---\n${lines.join("\n")}\n---\nText\n`;

export const DIFFICULT_NOTES: readonly DifficultNote[] = [
  {
    name: "verschachtelt",
    text: block(
      SCHEMA,
      "name: Verschachtelt",
      "adresse:",
      "  strasse: Ahornweg",
      "  nummer: 12",
      "  ort:",
      '    plz: "01067"',
      "    stadt: Dresden",
      "kontakte:",
      "  - name: Frau A",
      "    rolle: Verwaltung",
      "  - name: Herr B",
      "leer_karte: {}",
      "flow_karte: {a: 1, b: [x, y]}",
    ),
  },
  {
    name: "verschachtelt-patch",
    text: block(SCHEMA, "name: Patch", "adresse:", "  ort: Dresden", "zahl: 1"),
    patch: { set: { zahl: 2, adresse: "Leipzig" } },
  },
  {
    name: "block-skalare",
    text: block(
      SCHEMA,
      "name: Block",
      "literal: |",
      "  Zeile eins",
      "  Zeile zwei",
      "gefaltet: >",
      "  Teil eins",
      "  Teil zwei",
      "",
      "  Absatz",
      "behalten: |+",
      "  bleibt",
      "",
      "kappen: >-",
      "  ohne Ende",
      "eingerueckt: |2",
      "    zwei mehr",
    ),
  },
  {
    name: "block-skalar-patch",
    text: block(SCHEMA, "name: Block", "literal: |", "  Zeile eins", "  Zeile zwei", "nach: x"),
    patch: { set: { literal: "neu" } },
  },
  {
    name: "mehrzeilig",
    text: block(
      SCHEMA,
      "name: Mehrzeilig",
      "schlicht: erste Zeile",
      "  zweite Zeile",
      'doppelt: "erste',
      '  zweite"',
      "einfach: 'eins",
      "",
      "  zwei'",
    ),
  },
  {
    name: "mehrzeilig-patch",
    text: block(SCHEMA, "name: erste Zeile", "  zweite Zeile", "nach: x"),
  },
  {
    name: "wikilinks",
    text: block(
      SCHEMA,
      "name: Links",
      'verwalter: "[[Hausverwaltung Müller]]"',
      'objekt: "[[Ahornweg 12|AW 12]]"',
      "roh: [[Ahornweg 12]]",
      "liste:",
      '  - "[[A]]"',
      '  - "[[B#Abschnitt]]"',
      'flow: ["[[A]]", "[[B]]"]',
    ),
    patch: { set: { verwalter: "[[Neue Verwaltung]]" } },
  },
  {
    name: "tags-text",
    text: block(SCHEMA, "name: Tags", "tags: a, b", "aliases: Eins", "cssclasses: breit"),
  },
  {
    name: "tags-listen",
    text: block(
      SCHEMA,
      "name: Tags",
      "tags:",
      '  - "#a"',
      "  - b/c",
      'aliases: [Eins, "Zwei, Drei"]',
      "tag: einzeln",
      "alias: einer",
    ),
    patch: { set: { tags: ["x", "y"] } },
  },
  {
    name: "tags-raute",
    text: block(SCHEMA, "name: Raute", "tags: #a", 'aliases: "#b"'),
  },
  {
    name: "kommentare",
    text: block(
      "# Kopf",
      `${SCHEMA} # Typ`,
      "name: Kommentare   # Name",
      "liste: # Liste",
      "  - a # erster",
      "  # dazwischen",
      "  - b",
      'farbe: "#ff0000" # Farbe',
      "anker: '#kein Kommentar'",
      "# Ende",
    ),
  },
  {
    name: "doppelt",
    text: block(SCHEMA, "name: Erst", "name: Zweit"),
  },
  {
    name: "anker",
    text: block(
      SCHEMA,
      "name: &n Anker",
      "kopie: *n",
      "basis: &b",
      "  x: 1",
      "erweitert:",
      "  <<: *b",
      "  y: 2",
    ),
  },
  {
    name: "leer",
    text: block(SCHEMA, "name:", 'leer: ""', "liste: []", "karte: {}", "tilde: ~", "nichts: null"),
  },
  {
    name: "zitierte-eintraege",
    text: block(
      SCHEMA,
      "name: Zitiert",
      "liste:",
      '  - "a"',
      "  - 'b'",
      '  - "c: d"',
      "flow: ['x', \"y\"]",
    ),
  },
  {
    name: "bom-crlf",
    text: `﻿---\r\n${SCHEMA}\r\nname: BOM\r\nadresse:\r\n  ort: Dresden\r\nliste:\r\n  - a\r\n---\r\nText\r\n`,
  },
  {
    name: "einrueckung",
    text: block(SCHEMA, "name: Einrückung", "vier:", "    - a", "    - b", "null:", "- c", "- d"),
  },
  {
    name: "schluessel",
    text: block(
      SCHEMA,
      "name: Schlüssel",
      '"zitiert": 1',
      "'einfach': 2",
      "123: zahl",
      "true: ja",
      "straße: ß",
      "? komplex",
      ": wert",
    ),
  },
  {
    name: "typen",
    text: block(
      SCHEMA,
      "name: Typen",
      "text: !!str 12",
      "zahl: !!int 3",
      "datum: 2026-01-01",
      "zeit: 2026-01-01T10:00:00Z",
      "oktal: 0o17",
      "gross: 12345678901234567890",
      "exp: 1e3",
      "unendlich: .inf",
      "ja: yes",
      "an: on",
    ),
  },
  { name: "tab", text: block(SCHEMA, "name:\tTab") },
  { name: "tab-einrueckung", text: block(SCHEMA, "name: Tab", "adresse:", "\tort: Dresden") },
  { name: "dokument-ende", text: block(SCHEMA, "name: Ende", "...", "noch: da") },
  { name: "nur-kommentar", text: block("# nur ein Kommentar") },
  { name: "skalar", text: block("nur Text") },
  { name: "liste", text: block("- a", "- b") },
  { name: "unbekanntes-tag", text: block(SCHEMA, "name: Tag", "wert: !eigen x") },
];
