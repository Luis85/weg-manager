---
type: Entity
id: ENT-31
status: entwurf
scope: spaeter
category: stammdaten
wcs: spaeter
date: 2026-11-22
---

# ENT-31 · Anlage

## Zweck

Eine Anlage ist ein wartungspflichtiges technisches Bauteil des Gemeinschaftseigentums, z. B. Aufzug, Tor oder Lüftung. Sie hält Wartungsintervall, letzten Nachweis und Gewährleistung fest.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `installation-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. |
| Schemaversion | `schema` | Text | P | `weg-manager.installation/v1`. |
| Name (WCS-„id“) | `name` | Text | P | Z. B. „Aufzug Haus 1“, „Tiefgaragentor“. Eindeutig je Gemeinschaft. Nicht die technische `id`. |
| Gemeinschaft | `community_id` | Text (Verweis) | P | Eigentümerin ([[ENT-01 - Gemeinschaft]]). |
| Wartungsintervall | `maintenance_interval` | Text | P | Z. B. „jährlich“, „alle 6 Monate“. |
| Letzter Nachweis | `last_evidence_on` | Datum | O | Datum des letzten Wartungs- oder Prüfnachweises. |
| Vertrag | `agreement_id` | Text (Verweis) | O | Wartungsvertrag ([[ENT-29 - Vertrag]]). |
| Gewährleistung bis | `warranty_until` | Datum | O | Ende der Gewährleistung. |

## Beziehungen

Gehört genau einer [[ENT-01 - Gemeinschaft]]. Der Wartungsvertrag ist ein [[ENT-29 - Vertrag]]. Ein Nachweis ist ein [[ENT-08 - Dokument]] (Abnahme- oder Prüfprotokoll) und eine Unterlage der Soll-Liste ([[ENT-32 - Unterlage]]). Eine fällige Wartung oder eine auslaufende Gewährleistung kann einen [[ENT-04 - Vorgang]] mit [[ENT-05 - Termin]] auslösen. Eine Anlage kann Teil eines [[ENT-27 - Gemeingut]] sein.

## Regeln und Lebenszyklus

- Ist der letzte Nachweis älter als das Intervall, zeigt das Plugin einen Hinweis. Es stellt keinen Mangel fest.
- Ein neuer Nachweis ändert `last_evidence_on` und wird im Verlauf belegt.
- Eine stillgelegte Anlage bleibt erhalten.

## Datenschutz

Nicht personenbezogen.

## Abweichungen vom WCS

- Technische `id` und `schema` kommen hinzu. Die WCS-„id“ ist ein Name und wird zu `name`.
- Der Typname im Code ist `installation`. „Anlage“ heißt in unseren Docs auch die Anlage einer Nachricht ([[ENT-10 - Nachrichtenentwurf]]); das WCS-Glossar sagt hier „Anlage (technisch)“.

## Offene Punkte

- O-ENT31-1: Wartungsintervall strukturiert (Zahl und Einheit), damit „überfällig“ berechenbar ist? Das WCS führt Text.
- O-ENT31-2: Heißt das Objekt in der Oberfläche „Anlage“ oder „technische Anlage“, um die Verwechslung mit Nachrichtenanlagen zu vermeiden?
- O-ENT31-3: Letzter Nachweis als Datum oder als Verweis auf das Prüfprotokoll (`document_id`)?

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7, Roadmap-Vision v0.2): Objekt Anlage, Status später; Glossar Anlage (technisch) (V15), Gemeinschaftseigentum (§ 5 WEG). Keine PRD-Kennung und kein PBI im Backlog; verwandt mit [[F-16 - Operative Handwerkersteuerung]]. Regel: [[DF-12 - Gemeinschaftstrennung]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
