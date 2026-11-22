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
finished: 2026-11-22
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
triage: ""
---

# PBI-61 · Beziehungen zwischen Datensätzen und abgeleitete Werte vorbereiten

**Planungsstand:** Produktentscheidung getroffen am 22.11.2026 (eine Rolle je Ansprechpartner); Umsetzung nach dem Tag 0.2.0 · **Bezug:** `docs/plans/pre-feature-improvement-plan.md` (Abschnitt 8, Review-Runde vom 22.11.2026)

## User Story

Als Beirat möchte ich, dass Vorgänge und Personen zuverlässig zu ihrer Gemeinschaft gehören und Fristen richtig als überfällig erkannt werden, damit ich mich auf Listen und Hinweise verlassen kann.

## Ausgangslage

Befund des Architektur-Reviews (C2), geprüft am Code des Durchstichs:

- **Kein Verweis-Feld.** Der Codec (`defineNoteType`) kennt keine Feldart für einen Verweis auf einen anderen Datensatz. `community_id` wäre heute einfacher Text. Dass das Ziel fehlt, müsste jede Funktion als eigene Regel über mehrere Datensätze schreiben, so wie `duplicateShortCodes` heute.
- **Keine Suche nach `id`.** Ein Stand des Index hält die Notizen eines Typs als Liste. Die Route `vorgang/<id>` und jede Verknüpfung müssten die Liste durchsuchen.
- **Kein „heute“.** Abgeleitete Werte wie „überfällig“ haben keine Quelle für das aktuelle Datum, die zur lokalen Mitternacht weiterschaltet.
- **Flache Schlüssel.** ADR 0007 erlaubt nur flache Schlüssel aus fünf Arten. Die Rolle eines Ansprechpartners je Gemeinschaft ([[docs/entities/ENT-02 - Person und Rolle]], offener Punkt O-D10 in `docs/design/handoff/09 - Offene Punkte vor Implementierung.md`) ist eine Liste von Paaren und passt so nicht hinein.

## Entscheidung (22.11.2026)

Zur Wahl standen für eine Rolle je Gemeinschaft: ein eigener Notiztyp für die Zuordnung, parallele Listen oder kodierte Texte in einer Liste. Zuerst hatte der Produktverantwortliche entschieden, dass ein Kontakt eine Rolle hat (O-D10). Nach der Übernahme des WCS-Datenmodells hat er das am selben Tag geändert: **Eine Person hat je Gemeinschaft eine Rolle** ([[K-20 - WCS-Datenmodell als fachliche Grundlage]], [[ENT-02 - Person und Rolle]]).

Gespeichert wird das als **kodierte Liste**: ein Schlüssel `roles` in der Notiz der Person, je Eintrag `<id der Gemeinschaft>:<Rolle>`. Die Schlüssel bleiben flach und im Eigenschaften-Bereich von Obsidian bearbeitbar. Ein Eintrag nennt die `id` der Gemeinschaft, nie das Kürzel, weil das Kürzel änderbar wird. Ein fehlerhafter Eintrag oder eine unbekannte Gemeinschaft erscheint als Problem. Der Nachtrag zu ADR 0007 hält das fest.

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
- 22.11.2026 (Umsetzung): Kriterien 2 bis 5 erfüllt, damit alle fünf. Feldarten `reference("<typ>")` und `references("<typ>")`, fehlendes Ziel als `reference.missing` aus dem Index (`markMissingReferences`); Suche nach `id` über `byId` je Stand des Index; Dienst `Today` mit Adapter für Obsidian und Adapter im Speicher; `npm run verify` mit Exit 0, e2e grün, Mutationstest der geänderten Dateien ohne Überlebende. Nachträge in ADR 0002 und ADR 0007.
- 22.11.2026 (viertes Interview, Nachtrag zur abgeschlossenen Note): Drei Fragen, die die Umsetzung offen oder nur als gebautes Verhalten ließ, sind entschieden. (1) Ein Datensatz mit einem Verweis auf ein fehlendes Ziel wird trotzdem gespeichert; das Formular markiert das Feld, die Notiz steht unter den Datenproblemen (`reference.missing`), und das Speichern wird aus diesem Grund nie verweigert. (2) Ein Verweis wird nur als `id` des Ziels geschrieben; es gibt keine Wikilink-Eigenschaft neben der `id`, und Obsidians Graph und Rückverweise zeigen die Beziehung nicht. Das war die Frage „Wikilink neben der `id`“ in ADR 0007. (3) Nach dem Aufwachen des Rechners oder einer Änderung der Uhr darf `Today` das alte Datum bis zu einer Minute zeigen; weitere Arbeit entfällt. Nachträge: ADR 0007 (zu 1 und 2), ADR 0002 und `docs/engineering/architecture.md`, Abschnitt „Today“ (zu 3). Die Note bleibt `finished`.
