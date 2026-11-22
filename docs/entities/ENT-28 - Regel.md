---
type: Entity
id: ENT-28
status: entwurf
scope: spaeter
category: stammdaten
wcs: spaeter
date: 2026-11-22
---

# ENT-28 · Regel

## Zweck

Eine Regel ist eine geltende Vorgabe der Gemeinschaft aus Teilungserklärung, Gemeinschaftsordnung, Dienstbarkeit oder Beschluss, in einem Satz mit Fundstelle. Beispiele: Kostenschlüssel, Stimmrecht, Pflichtversicherung.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `regulation-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. |
| Schemaversion | `schema` | Text | P | `weg-manager.regulation/v1`. |
| Kennung (WCS-„id“) | `reference_code` | Text | P | Fachliche Kurzkennung, eindeutig je Gemeinschaft, z. B. „GO-07“. Nicht die technische `id`. |
| Gemeinschaft | `community_id` | Text (Verweis) | P | Geltungsbereich ([[ENT-01 - Gemeinschaft]]). |
| Thema | `topic` | Text (Code) | P | Siehe Wertelisten. |
| Kurztext | `summary` | Text | P | Die Regel in einem Satz. |
| Fundstelle | `citation` | Text | P | Urkunde, Paragraf, Seite oder Beschluss, z. B. „Gemeinschaftsordnung § 7, S. 12“. |
| Durch Gesetz überholt | `superseded_by_law` | Checkbox | O | Wahr, wenn die Regel seit dem WEMoG nicht mehr wirksam ist. |

## Wertelisten

Thema (geschlossen, aus dem WCS):

| Code | Anzeige |
| --- | --- |
| `cost_allocation` | Kostenschlüssel |
| `voting_right` | Stimmrecht |
| `structural_change` | bauliche Veränderung |
| `maintenance` | Instandhaltung |
| `mandatory_insurance` | Pflichtversicherung |
| `procedure` | Verfahren |

## Beziehungen

Gilt für genau eine [[ENT-01 - Gemeinschaft]]. Die Fundstelle verweist auf ein Dokument ([[ENT-08 - Dokument]]) oder einen [[ENT-25 - Beschluss]]. [[ENT-27 - Gemeingut]] nennt eine Regel als Fundstelle. [[ENT-30 - Police]] prüft ihre Deckung gegen Regeln mit Thema `mandatory_insurance`. [[ENT-36 - Kostenbuchung]] kann den Kostenschlüssel einer Regel übernehmen.

## Regeln und Lebenszyklus

- Eine Regel braucht immer eine Fundstelle. Ohne Fundstelle ist sie eine Frage, also ein [[ENT-04 - Vorgang]].
- Das Plugin bewertet nicht, ob eine Regel rechtlich wirksam ist. `superseded_by_law` setzt ein Mensch, mit Quelle im Verlauf.
- Eine Regel dieser Note ist eine Vorgabe der Gemeinschaft. Sie ist keine Produktregel aus `docs/business-rules` (DF-…).

## Datenschutz

Nicht personenbezogen.

## Abweichungen vom WCS

- Technische `id` und `schema` kommen hinzu. Die WCS-„id“ wird zum fachlichen Feld `reference_code`.
- Der Typname im Code ist `regulation`, damit er nicht mit den Produktregeln (Business Rules) verwechselt wird.

## Offene Punkte

- O-ENT28-1: Fundstelle nur als Text oder zusätzlich als Verweis auf Dokument und Beschluss (`document_id`, `resolution_id`)?
- O-ENT28-2: Ist der englische Typname `regulation` passend? Eintrag in `GLOSSARY.md` folgt mit dem ersten Schnitt.

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7, Roadmap-Vision v0.2): Objekt Regel, Status später; Glossar Gemeinschaftsordnung (V13, § 10 WEG), Kostenschlüssel (§ 16 Abs. 2 WEG), Teilungserklärung (§ 8 WEG). Keine PRD-Kennung und kein PBI im Backlog. Entscheidung: [[K-20 - WCS-Datenmodell als fachliche Grundlage]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
