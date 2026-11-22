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
triage: ready-for-agent
---

# PBI-61 · Beziehungen zwischen Datensätzen und abgeleitete Werte vorbereiten

**Planungsstand:** Produktentscheidung getroffen am 22.11.2026 (eine Rolle je Ansprechpartner); Umsetzung nach dem Tag 0.2.0 · **Bezug:** `docs/plans/pre-feature-improvement-plan.md` (Abschnitt 8, Review-Runde vom 22.11.2026)

## User Story

Als Beirat möchte ich, dass Punkte und Ansprechpartner zuverlässig zu ihrer Gemeinschaft gehören und Fristen richtig als überfällig erkannt werden, damit ich mich auf Listen und Hinweise verlassen kann.

## Ausgangslage

Befund des Architektur-Reviews (C2), geprüft am Code des Durchstichs:

- **Kein Verweis-Feld.** Der Codec (`defineNoteType`) kennt keine Feldart für einen Verweis auf einen anderen Datensatz. `community_id` wäre heute einfacher Text. Dass das Ziel fehlt, müsste jede Funktion als eigene Regel über mehrere Datensätze schreiben, so wie `duplicateShortCodes` heute.
- **Keine Suche nach `id`.** Ein Stand des Index hält die Notizen eines Typs als Liste. Die Route `punkt/<id>` und jede Verknüpfung müssten die Liste durchsuchen.
- **Kein „heute“.** Abgeleitete Werte wie „überfällig“ haben keine Quelle für das aktuelle Datum, die zur lokalen Mitternacht weiterschaltet.
- **Flache Schlüssel.** ADR 0007 erlaubt nur flache Schlüssel aus fünf Arten. Die Rolle eines Ansprechpartners je Gemeinschaft ([[docs/design/entities/ENT-02 - Ansprechpartner]], offener Punkt O-D10 in `docs/design/handoff/09 - Offene Punkte vor Implementierung.md`) ist eine Liste von Paaren und passt so nicht hinein.

## Entscheidung (22.11.2026)

Zur Wahl standen für eine Rolle je Gemeinschaft: ein eigener Notiztyp für die Zuordnung, parallele Listen oder kodierte Texte in einer Liste. Der Produktverantwortliche hat die Frage davor entschieden (O-D10): **Ein Ansprechpartner hat eine Rolle**, dazu die Liste der Gemeinschaften, für die er zuständig ist. Hat dieselbe Person in zwei Gemeinschaften verschiedene Rollen, steht das in der Notiz des Ansprechpartners. Eine Rolle je Gemeinschaft kann später mit einer neuen Schemaversion folgen.

Damit bleibt die Notiz eines Ansprechpartners flach: ein Schlüssel für die Rolle (Code), ein Schlüssel mit der Liste der `id`s der Gemeinschaften. ADR 0007 bleibt bei flachen Schlüsseln; der Nachtrag vom 22.11.2026 hält das fest.

## Akzeptanzkriterien

1. Die Entscheidung zur Rolle ist getroffen und in `docs/adr/0007-vault-data-access.md` nachgetragen (erledigt am 22.11.2026).
2. Der Codec kennt eine Feldart für Verweise (Vorschlag des Reviews: `reference("community")`); ein fehlendes Ziel ist ein Hinweis-Code der Domäne, keine von Hand geschriebene Regel je Funktion.
3. Ein Stand des Index erlaubt die Suche nach `id` ohne Durchsuchen der Liste.
4. Es gibt einen Dienst für das aktuelle Datum (Vorschlag: `Today` mit aktuellem Wert und Änderungen zur lokalen Mitternacht), den Tests mit einer festen Uhr betreiben.
5. Jede neue Fähigkeit hat Tests in der Domäne beziehungsweise Anwendung; `npm run verify` endet mit Exit 0, und der Mutationstest der geänderten Dateien hat keine Überlebenden.

## Herkunft und Bezüge

Architektur-Review vom 22.11.2026, Option C2. ADR `docs/adr/0007-vault-data-access.md`, [[PBI-53 - Notizformat mit Schemaversion lesen und schreiben]], [[PBI-54 - Index der Notizen aufbauen und aktuell halten]].

## Kommentare

- 22.11.2026: Angelegt aus der Review-Runde nach dem Durchstich (vier unabhängige Reviews am Stand `0cb8292`). Die Befunde stammen aus den Review-Berichten und den Berichten der Umsetzer; nichts davon ist bisher umgesetzt, soweit die Note es nicht anders sagt.
- 22.11.2026 (Interview nach der Review-Runde): Entscheidung „eine Rolle je Ansprechpartner“ eingetragen, O-D10 geschlossen, Nachtrag in ADR 0007; `triage` auf `ready-for-agent`. Die Kriterien 2 bis 5 werden nach dem Tag 0.2.0 umgesetzt, während der Produktverantwortliche die Vorabversion prüft.
