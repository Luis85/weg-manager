import type { DifficultFacts } from "./difficult-scenario";
import { DIFFICULT_NOTES } from "./difficult-notes";

/**
 * What Obsidian 1.15.1 and the `NoteStore` adapter make of `DIFFICULT_NOTES`, as the report of
 * `difficultScenario`, measured in the app (`difficult-frontmatter.e2e.ts`) and held against the
 * double (`obsidian-double.test.ts`). A change here is a finding about Obsidian or about the
 * adapter, never a test tweak.
 *
 * Per note: the metadata cache's `frontmatter` (`null` for none: then the note does not count as
 * having frontmatter), the last line of its `yaml` section (it always starts on line 0),
 * `parseYaml` of the block where it differs from the cache (a text or a list is no frontmatter,
 * an error has its name), and the update: `refused` with the adapter's reason, or the text then on
 * disk (`written`). A written update holds the note's patch (`name: Neu` unless the note says
 * otherwise), in the cache too; `read` gives the cache's frontmatter (`{}` for none). `.inf` reads
 * as `Infinity`, which JSON carries as `null`.
 */
type Measured = {
  readonly frontmatter: Record<string, unknown> | null;
  readonly end: number;
  readonly parsed?: unknown;
  readonly refused?: string;
  readonly written?: string;
};

const SCHEMA = "weg-manager.community/v1";
const NESTED = {
  adresse: { nummer: 12, ort: { plz: "01067", stadt: "Dresden" }, strasse: "Ahornweg" },
  flow_karte: { a: 1, b: ["x", "y"] },
  kontakte: [{ name: "Frau A", rolle: "Verwaltung" }, { name: "Herr B" }],
  leer_karte: {},
};
const BLOCKS = {
  behalten: "bleibt\n\n",
  eingerueckt: "  zwei mehr\n",
  gefaltet: "Teil eins Teil zwei\nAbsatz\n",
  kappen: "ohne Ende",
  literal: "Zeile eins\nZeile zwei\n",
};
const TYPES = {
  an: "on",
  datum: "2026-01-01",
  exp: 1000,
  gross: 12345678901234567000,
  ja: "yes",
  oktal: 15,
  text: "12",
  unendlich: null,
  zahl: 3,
  zeit: "2026-01-01T10:00:00Z",
};
const LINKS = {
  flow: ["[[A]]", "[[B]]"],
  liste: ["[[A]]", "[[B#Abschnitt]]"],
  objekt: "[[Ahornweg 12|AW 12]]",
  roh: [["Ahornweg 12"]],
};

const MEASURED: Readonly<Record<string, Measured>> = {
  verschachtelt: {
    frontmatter: { ...NESTED, name: "Verschachtelt", schema: SCHEMA },
    end: 15,
    written: `---\nschema: ${SCHEMA}\nname: Neu\nadresse:\n  strasse: Ahornweg\n  nummer: 12\n  ort:\n    plz: "01067"\n    stadt: Dresden\nkontakte:\n  - name: Frau A\n    rolle: Verwaltung\n  - name: Herr B\nleer_karte: {}\nflow_karte: {a: 1, b: [x, y]}\n---\nText\n`,
  },
  // A nested map replaced by a text: its lines go with it.
  "verschachtelt-patch": {
    frontmatter: { adresse: { ort: "Dresden" }, name: "Patch", schema: SCHEMA, zahl: 1 },
    end: 6,
    written: `---\nschema: ${SCHEMA}\nname: Patch\nadresse: Leipzig\nzahl: 2\n---\nText\n`,
  },
  "block-skalare": {
    frontmatter: { ...BLOCKS, name: "Block", schema: SCHEMA },
    end: 18,
    written: `---\nschema: ${SCHEMA}\nname: Neu\nliteral: |\n  Zeile eins\n  Zeile zwei\ngefaltet: >\n  Teil eins\n  Teil zwei\n\n  Absatz\nbehalten: |+\n  bleibt\n\nkappen: >-\n  ohne Ende\neingerueckt: |2\n    zwei mehr\n---\nText\n`,
  },
  "block-skalar-patch": {
    frontmatter: { literal: BLOCKS.literal, nach: "x", name: "Block", schema: SCHEMA },
    end: 7,
    written: `---\nschema: ${SCHEMA}\nname: Block\nliteral: neu\nnach: x\n---\nText\n`,
  },
  mehrzeilig: {
    frontmatter: {
      doppelt: "erste zweite",
      einfach: "eins\nzwei",
      name: "Mehrzeilig",
      schema: SCHEMA,
      schlicht: "erste Zeile zweite Zeile",
    },
    end: 10,
    written: `---\nschema: ${SCHEMA}\nname: Neu\nschlicht: erste Zeile\n  zweite Zeile\ndoppelt: "erste\n  zweite"\neinfach: 'eins\n\n  zwei'\n---\nText\n`,
  },
  // A value on two lines replaced by one: the continuation goes.
  "mehrzeilig-patch": {
    frontmatter: { nach: "x", name: "erste Zeile zweite Zeile", schema: SCHEMA },
    end: 5,
    written: `---\nschema: ${SCHEMA}\nname: Neu\nnach: x\n---\nText\n`,
  },
  // Unquoted, `[[…]]` is a list in a list.
  wikilinks: {
    frontmatter: {
      ...LINKS,
      name: "Links",
      schema: SCHEMA,
      verwalter: "[[Hausverwaltung Müller]]",
    },
    end: 10,
    written: `---\nschema: ${SCHEMA}\nname: Links\nverwalter: "[[Neue Verwaltung]]"\nobjekt: "[[Ahornweg 12|AW 12]]"\nroh: [[Ahornweg 12]]\nliste:\n  - "[[A]]"\n  - "[[B#Abschnitt]]"\nflow: ["[[A]]", "[[B]]"]\n---\nText\n`,
  },
  // The cache keeps `tags` and `aliases` as written: a text stays a text, `#a` stays in the item.
  "tags-text": {
    frontmatter: {
      aliases: "Eins",
      cssclasses: "breit",
      name: "Tags",
      schema: SCHEMA,
      tags: "a, b",
    },
    end: 6,
    written: `---\nschema: ${SCHEMA}\nname: Neu\ntags: a, b\naliases: Eins\ncssclasses: breit\n---\nText\n`,
  },
  "tags-listen": {
    frontmatter: {
      alias: "einer",
      aliases: ["Eins", "Zwei, Drei"],
      name: "Tags",
      schema: SCHEMA,
      tag: "einzeln",
      tags: ["#a", "b/c"],
    },
    end: 9,
    written: `---\nschema: ${SCHEMA}\nname: Tags\ntags:\n  - x\n  - "y"\naliases: [Eins, "Zwei, Drei"]\ntag: einzeln\nalias: einer\n---\nText\n`,
  },
  // Unquoted, `#a` is a comment, so `tags` is empty.
  "tags-raute": {
    frontmatter: { aliases: "#b", name: "Raute", schema: SCHEMA, tags: null },
    end: 5,
    written: `---\nschema: ${SCHEMA}\nname: Neu\ntags: #a\naliases: "#b"\n---\nText\n`,
  },
  kommentare: {
    frontmatter: {
      anker: "#kein Kommentar",
      farbe: "#ff0000",
      liste: ["a", "b"],
      name: "Kommentare",
      schema: SCHEMA,
    },
    end: 11,
    written: `---\n# Kopf\nschema: ${SCHEMA} # Typ\nname: Neu   # Name\nliste: # Liste\n  - a # erster\n  # dazwischen\n  - b\nfarbe: "#ff0000" # Farbe\nanker: '#kein Kommentar'\n# Ende\n---\nText\n`,
  },
  // A duplicate key is an error: no frontmatter, unreadable.
  doppelt: { frontmatter: null, end: 4, parsed: "YAMLParseError", refused: "NoteUnreadableError" },
  // Anchors resolve; a merge key stays a key `<<` (YAML 1.2 core). The line edit cannot rewrite
  // an anchored value, so the update is refused, never written wrong.
  anker: {
    frontmatter: {
      basis: { x: 1 },
      erweitert: { "<<": { x: 1 }, y: 2 },
      kopie: "Anker",
      name: "Anker",
      schema: SCHEMA,
    },
    end: 9,
    refused: "NoteWriteRefusedError",
  },
  leer: {
    frontmatter: {
      karte: {},
      leer: "",
      liste: [],
      name: null,
      nichts: null,
      schema: SCHEMA,
      tilde: null,
    },
    end: 8,
    written: `---\nschema: ${SCHEMA}\nname: Neu\nleer: ""\nliste: []\nkarte: {}\ntilde: ~\nnichts: null\n---\nText\n`,
  },
  "zitierte-eintraege": {
    frontmatter: { flow: ["x", "y"], liste: ["a", "b", "c: d"], name: "Zitiert", schema: SCHEMA },
    end: 8,
    written: `---\nschema: ${SCHEMA}\nname: Neu\nliste:\n  - "a"\n  - 'b'\n  - "c: d"\nflow: ['x', "y"]\n---\nText\n`,
  },
  "bom-crlf": {
    frontmatter: { adresse: { ort: "Dresden" }, liste: ["a"], name: "BOM", schema: SCHEMA },
    end: 7,
    written: `﻿---\r\nschema: ${SCHEMA}\r\nname: Neu\r\nadresse:\r\n  ort: Dresden\r\nliste:\r\n  - a\r\n---\r\nText\r\n`,
  },
  // A key `null` reads as "" (the parser's string of a null key); a list at column 0 is refused.
  einrueckung: {
    frontmatter: { "": ["c", "d"], name: "Einrückung", schema: SCHEMA, vier: ["a", "b"] },
    end: 9,
    refused: "NoteWriteRefusedError",
  },
  schluessel: {
    frontmatter: {
      "123": "zahl",
      einfach: 2,
      komplex: "wert",
      name: "Schlüssel",
      schema: SCHEMA,
      straße: "ß",
      true: "ja",
      zitiert: 1,
    },
    end: 10,
    refused: "NoteWriteRefusedError",
  },
  typen: {
    frontmatter: { ...TYPES, name: "Typen", schema: SCHEMA },
    end: 13,
    written: `---\nschema: ${SCHEMA}\nname: Neu\ntext: !!str 12\nzahl: !!int 3\ndatum: 2026-01-01\nzeit: 2026-01-01T10:00:00Z\noktal: 0o17\ngross: 12345678901234567890\nexp: 1e3\nunendlich: .inf\nja: yes\nan: on\n---\nText\n`,
  },
  // A tab after the colon separates; a tab that indents is an error.
  tab: {
    frontmatter: { name: "Tab", schema: SCHEMA },
    end: 3,
    written: `---\nschema: ${SCHEMA}\nname: Neu\n---\nText\n`,
  },
  "tab-einrueckung": {
    frontmatter: null,
    end: 5,
    parsed: "YAMLParseError",
    refused: "NoteUnreadableError",
  },
  // `...` ends the YAML document: what follows is an error.
  "dokument-ende": {
    frontmatter: null,
    end: 5,
    parsed: "YAMLParseError",
    refused: "NoteUnreadableError",
  },
  // A block of comments holds nothing: no frontmatter, but nothing broken either.
  "nur-kommentar": {
    frontmatter: null,
    end: 2,
    written: "---\n# nur ein Kommentar\nname: Neu\n---\nText\n",
  },
  skalar: { frontmatter: null, end: 2, parsed: "nur Text", refused: "NoteUnreadableError" },
  liste: { frontmatter: null, end: 3, parsed: ["a", "b"], refused: "NoteUnreadableError" },
  // An unknown tag is read as the plain value.
  "unbekanntes-tag": {
    frontmatter: { name: "Tag", schema: SCHEMA, wert: "x" },
    end: 4,
    written: `---\nschema: ${SCHEMA}\nname: Neu\nwert: !eigen x\n---\nText\n`,
  },
};

const facts = (name: string, text: string, patch: Record<string, unknown>): DifficultFacts => {
  const measured = MEASURED[name];
  if (measured === undefined) throw new Error(`nothing measured for ${name}`);
  const path = `Schwierig/${name}.md`;
  const { frontmatter, refused } = measured;
  const after = refused === undefined ? { ...frontmatter, ...patch } : frontmatter;
  return {
    name,
    frontmatter,
    position: frontmatter !== null,
    yaml: [0, measured.end],
    parsed: "parsed" in measured ? measured.parsed : frontmatter,
    read: { ok: true, value: { path, frontmatter: frontmatter ?? {} } },
    update:
      refused === undefined
        ? { ok: true, value: { path, frontmatter: after } }
        : { ok: false, tag: refused },
    written: measured.written ?? text,
    frontmatterAfter: after,
  };
};

export const DIFFICULT_FACTS = {
  notes: DIFFICULT_NOTES.map((note) =>
    facts(note.name, note.text, note.patch?.set ?? { name: "Neu" }),
  ),
  // Records: a readable map with `schema`, in path order.
  listed: DIFFICULT_NOTES.filter(
    (note) => MEASURED[note.name]?.frontmatter?.["schema"] !== undefined,
  )
    .map((note) => `Schwierig/${note.name}.md`)
    .toSorted(),
  // Broken YAML, or YAML that is no map; not a block that only holds comments.
  unreadable: {
    ok: true,
    value: [
      "Schwierig/dokument-ende.md",
      "Schwierig/doppelt.md",
      "Schwierig/liste.md",
      "Schwierig/skalar.md",
      "Schwierig/tab-einrueckung.md",
    ],
  },
};
