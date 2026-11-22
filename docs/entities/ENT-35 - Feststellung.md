---
type: Entity
id: ENT-35
status: entwurf
scope: spaeter
category: bewegungsdaten
wcs: v1-offen
date: 2026-11-22
---

# ENT-35 · Feststellung

## Zweck

Eine Feststellung ist eine Auffälligkeit aus der Jahresprüfung mit genauer Quelle (Dokument und Seite). Meist ist sie eine Frage an die Verwaltung. Jede Feststellung wird ein Vorgang.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `finding-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. Das WCS kennt keine eigene Kennung. |
| Schemaversion | `schema` | Text | P | `weg-manager.finding/v1`. |
| Prüfvorgang | `annual_audit_id` | Text (Verweis) | P | [[ENT-34 - Prüfvorgang]], in dem die Feststellung entstand. Gemeinschaft und Jahr folgen daraus. |
| Quelle: Dokument | `source_document_id` | Text (Verweis) | P | [[ENT-08 - Dokument]], in dem die Auffälligkeit steht, z. B. die Jahresabrechnung. |
| Quelle: Seite | `source_page` | Text | P | Seite oder Fundstelle im Dokument, z. B. „S. 4, Position 12“. |
| Vorgang | `matter_id` | Text (Verweis) | P | [[ENT-04 - Vorgang]], der die Feststellung nachhält. |

## Beziehungen

Gehört genau einem [[ENT-34 - Prüfvorgang]] und damit genau einer [[ENT-01 - Gemeinschaft]]. Die Quelle ist ein [[ENT-08 - Dokument]], über [[ENT-07 - Quelle]] zuordenbar. Jede Feststellung wird genau ein [[ENT-04 - Vorgang]], meist der Art Frage. Antwort und Klärung laufen im Vorgang: [[ENT-06 - Verlaufseintrag]], [[ENT-13 - Eskalation]].

## Regeln und Lebenszyklus

- Ohne Dokument und Seite keine Feststellung ([[DF-08 - Quellenabdeckung]]).
- Eine Feststellung legt genau einen Vorgang an. Status, Termin und Eskalation führt der Vorgang, nicht die Feststellung.
- Eine Feststellung ist ein Sachstand, keine Bewertung der Verwaltung ([[DF-11 - Sachstand und Bewertung]]). Eine Bewertung gehört in die Bewertungsschicht ([[ENT-16 - Beiratsbewertung]]).
- Eine Feststellung wird nicht gelöscht. Erweist sie sich als unbegründet, wird ihr Vorgang hinfällig.

## Datenschutz

Nur gemeinschaftsweite Angaben. Steht die Auffälligkeit in einer Einzelabrechnung eines anderen Eigentümers, wird sie ohne Namen und Einheit beschrieben, oder sie bleibt im privaten Bereich.

## Abweichungen vom WCS

- Technische `id` und `schema` kommen hinzu.
- Im WCS ist die Feststellung ein Unterfeld des Prüfvorgangs (`feststellung.quelle`, `feststellung.vorgang`). Hier ist sie eine eigene Note mit Verweis auf den Prüfvorgang, weil jede Feststellung einen eigenen Vorgang bekommt.
- Die WCS-Quelle „Dokument + Seite“ wird in zwei Felder geteilt.

## Offene Punkte

- O-ENT35-1 (erledigt): Entschieden am 22.11.2026 vom Produktverantwortlichen: Erster Schritt nach dem MVP, wie O-ENT34-1.
- O-ENT35-2: Braucht die Feststellung einen eigenen Text, oder trägt der Vorgang ihn allein? Das WCS nennt kein Textfeld.
- O-ENT35-3: Entsteht der Vorgang automatisch mit der Feststellung oder als Vorschlag mit Bestätigung?

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7, Roadmap-Vision v0.2): Prüfvorgang und Feststellung (Jahresprüfung, v1 laut Q8 offen); Glossar Feststellung (FR-P2). Keine PRD-Kennung und kein PBI im Backlog. Regeln: [[DF-08 - Quellenabdeckung]], [[DF-11 - Sachstand und Bewertung]], [[DF-12 - Gemeinschaftstrennung]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
