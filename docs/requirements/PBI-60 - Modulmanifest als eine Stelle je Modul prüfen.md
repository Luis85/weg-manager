---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 88000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-05-Obsidian]]"
release: ""
status: ""
started: ""
finished: ""
horizon: ""
start: ""
due: ""
risk: ""
priority: ""
assignee: ""
iteration: ""
entities: []
business-rules: []
decisions: []
hypotheses: []
pages: []
user-flows: []
dependsOn: []
triage: needs-triage
---

# PBI-60 · Modulmanifest als eine Stelle je Modul prüfen

**Planungsstand:** Option aus dem Architektur-Review, noch nicht entschieden · **Bezug:** `docs/plans/pre-feature-improvement-plan.md` (Abschnitt 8, Review-Runde vom 22.11.2026)

## User Story

Als Beirat möchte ich, dass eine neue Funktion an möglichst wenigen gemeinsamen Stellen eingetragen wird, damit beim Ausbau nichts vergessen wird, was erst im Betrieb auffällt.

## Ausgangslage

Befund des Architektur-Reviews (C1): Ein neues Modul trägt sich heute an etwa zwölf gemeinsamen Stellen ein:

- `eslint.config.mjs` und `configs/fallow.json` (Modullisten und Zonen),
- `src/application/errors.ts`, `user-messages.ts`, `messages.ts`, `app-services.ts`, `note-types.ts`, `routes.ts`,
- `src/presentation/app-surface.ts`,
- die Verdrahtung der Dienste, das Harness und die Test-Laufzeit,
- bei neuen Komponenten oder Icons zusätzlich die `@source`-Listen in `src/styles/app.css` und `SHELL_ICONS` in `configs/vite.shared.ts`.

Der Vorschlag: ein Eintrag je Modul (`{ noteTypes, routes, catalogs, describe, tags, layer }`), der einmal zusammengesetzt wird. Das würde die Zahl der Stellen auf ein bis zwei senken. Der Preis: Der Eintrag koppelt die Teile aller Schichten in einem Objekt, und das späte Laden der Oberfläche muss davon getrennt bleiben.

Seit dem Review hat sich die Lage geändert:

- PR #28: Eine Fehlerart, die in der Tag-Liste ihres Moduls fehlt, ist ein Typfehler. Ein Notiztyp, der in `appNoteTypes` fehlt, lässt einen Unit-Test scheitern. Die Tabelle in `docs/engineering/adding-a-feature.md` nennt je Zeile, was sie durchsetzt.
- PR #33: Die Dienste werden an einer Stelle zusammengesetzt (`src/application/app-services-layer.ts`); Plugin, Harness und Tests liefern nur noch Adapter. Befehle kommen aus `appCommands`.
- Offen bleibt: Die Modullisten in `eslint.config.mjs` und die vier Schichtregeln in `configs/fallow.json` nennen jedes Modul von Hand, weil fallow keinen Platzhalter kennt. Den Navigationseintrag und die Rahmenteile in `app-surface.ts` prüft nichts.

## Akzeptanzkriterien

1. Der Produktverantwortliche hat entschieden, ob ein Modulmanifest eingeführt wird oder ob die heutigen Kompositionsdateien bleiben.
2. Fällt die Entscheidung für das Manifest: Ein neues Modul trägt sich an höchstens zwei gemeinsamen Stellen ein, das Fehlen eines Teils scheitert an Typprüfung oder Test, und der Start des Plugins lädt weiterhin kein Vue (der Test zum späten Laden der Oberfläche bleibt grün).
3. Fällt die Entscheidung dagegen: Die Note wird mit Begründung geschlossen, und `docs/engineering/adding-a-feature.md` nennt die verbleibenden ungeprüften Zeilen ausdrücklich.
4. `npm run verify` endet mit Exit 0.

## Offene Entscheidung

Manifest ja oder nein. Sinnvoller Zeitpunkt: wenn das zweite Fachmodul (Personen oder Vorgänge) eingetragen wird und der Aufwand der Stellen an einem echten Fall sichtbar ist.

## Herkunft und Bezüge

Architektur-Review vom 22.11.2026, Option C1. ADR `docs/adr/0006-module-structure.md`. Vorarbeit: PR #28 und PR #33. [[PBI-51 - Plugin-Code in Module gliedern]].

## Kommentare

- 22.11.2026: Angelegt aus der Review-Runde nach dem Durchstich (vier unabhängige Reviews am Stand `0cb8292`). Die Befunde stammen aus den Review-Berichten und den Berichten der Umsetzer; nichts davon ist bisher umgesetzt, soweit die Note es nicht anders sagt.
