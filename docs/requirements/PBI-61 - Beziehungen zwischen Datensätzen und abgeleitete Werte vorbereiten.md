---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 89000
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

# PBI-61 · Beziehungen zwischen Datensätzen und abgeleitete Werte vorbereiten

**Planungsstand:** Befund des Architektur-Reviews; eine Produktentscheidung steht aus · **Bezug:** `docs/plans/pre-feature-improvement-plan.md` (Abschnitt 8, Review-Runde vom 22.11.2026)

## User Story

Als Beirat möchte ich, dass Vorgänge und Personen zuverlässig zu ihrer Gemeinschaft gehören und Fristen richtig als überfällig erkannt werden, damit ich mich auf Listen und Hinweise verlassen kann.

## Ausgangslage

Befund des Architektur-Reviews (C2), geprüft am Code des Durchstichs:

- **Kein Verweis-Feld.** Der Codec (`defineNoteType`) kennt keine Feldart für einen Verweis auf einen anderen Datensatz. `community_id` wäre heute einfacher Text. Dass das Ziel fehlt, müsste jede Funktion als eigene Regel über mehrere Datensätze schreiben, so wie `duplicateShortCodes` heute.
- **Keine Suche nach `id`.** Ein Stand des Index hält die Notizen eines Typs als Liste. Die Route `punkt/<id>` (wird auf Vorgang umbenannt) und jede Verknüpfung müssten die Liste durchsuchen.
- **Kein „heute“.** Abgeleitete Werte wie „überfällig“ haben keine Quelle für das aktuelle Datum, die zur lokalen Mitternacht weiterschaltet.
- **Flache Schlüssel.** ADR 0007 erlaubt nur flache Schlüssel aus fünf Arten. Die Rolle eines Ansprechpartners je Gemeinschaft ([[docs/entities/ENT-02 - Person und Rolle]], offener Punkt O-D10 in `docs/design/handoff/09 - Offene Punkte vor Implementierung.md`) ist eine Liste von Paaren und passt so nicht hinein.

## Offene Entscheidung (vor dem Dateivertrag der Personen)

Wie wird die Rolle je Gemeinschaft gespeichert? Zur Wahl stehen:

1. ein eigener Notiztyp für die Zuordnung (ein Datensatz je Person und Gemeinschaft),
2. parallele Listen in der Notiz der Person,
3. kodierte Texte in einer Liste (zum Beispiel `gemeinschaft:rolle`).

Die Entscheidung gehört dem Produktverantwortlichen und wird als Nachtrag zu ADR 0007 festgehalten, bevor ein Dateivertrag unter `docs/contracts/` für Personen entsteht.

## Akzeptanzkriterien

1. Die Entscheidung zur Speicherung der Rolle je Gemeinschaft ist getroffen und in `docs/adr/0007-vault-data-access.md` nachgetragen.
2. Der Codec kennt eine Feldart für Verweise (Vorschlag des Reviews: `reference("community")`); ein fehlendes Ziel ist ein Hinweis-Code der Domäne, keine von Hand geschriebene Regel je Funktion.
3. Ein Stand des Index erlaubt die Suche nach `id` ohne Durchsuchen der Liste.
4. Es gibt einen Dienst für das aktuelle Datum (Vorschlag: `Today` mit aktuellem Wert und Änderungen zur lokalen Mitternacht), den Tests mit einer festen Uhr betreiben.
5. Jede neue Fähigkeit hat Tests in der Domäne beziehungsweise Anwendung; `npm run verify` endet mit Exit 0, und der Mutationstest der geänderten Dateien hat keine Überlebenden.

## Herkunft und Bezüge

Architektur-Review vom 22.11.2026, Option C2. ADR `docs/adr/0007-vault-data-access.md`, [[PBI-53 - Notizformat mit Schemaversion lesen und schreiben]], [[PBI-54 - Index der Notizen aufbauen und aktuell halten]].

## Kommentare

- 22.11.2026: Angelegt aus der Review-Runde nach dem Durchstich (vier unabhängige Reviews am Stand `0cb8292`). Die Befunde stammen aus den Review-Berichten und den Berichten der Umsetzer; nichts davon ist bisher umgesetzt, soweit die Note es nicht anders sagt.
