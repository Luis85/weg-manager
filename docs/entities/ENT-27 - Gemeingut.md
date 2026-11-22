---
type: Entity
id: ENT-27
status: entwurf
scope: spaeter
category: stammdaten
wcs: spaeter
date: 2026-11-22
---

# ENT-27 · Gemeingut

## Zweck

Ein Gemeingut ist eine Fläche oder Anlage, die mehrere Grundstücke oder Gemeinschaften nutzen, z. B. Spielplatz, Wege oder Paketanlage. Es hält fest, wer berechtigt ist, wie die Kosten verteilt werden und wer die Rechnungen sammelt.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `shared-facility-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. |
| Schemaversion | `schema` | Text | P | `weg-manager.shared-facility/v1`. |
| Name (WCS-„id“) | `name` | Text | P | Z. B. „Spielplatz“, „Wege“, „Paketanlage“. Nicht die technische `id`. |
| Lage | `plot_id` | Text (Verweis) | P | [[ENT-23 - Grundstück]], auf dem das Gemeingut liegt. |
| Berechtigte | `entitled_community_ids`, `entitled_plot_ids` | Liste (Verweise) | P | Nutzer laut Urkunde: Gemeinschaften und/oder Grundstücke. Mindestens ein Eintrag in einer der beiden Listen. |
| Kostenschlüssel | `cost_allocation_key` | Text | P | Z. B. „je ein Achtel“. |
| Zahlende Gemeinschaft | `paying_community_id` | Text (Verweis) | O | Sammelstelle der Rechnungen ([[ENT-01 - Gemeinschaft]]). |
| Regel | `regulation_id` | Text (Verweis) | O | Fundstelle in Urkunde oder Dienstbarkeit ([[ENT-28 - Regel]]). |

## Beziehungen

Liegt auf einem [[ENT-23 - Grundstück]]. Berechtigt sind mehrere [[ENT-01 - Gemeinschaft]] oder Grundstücke. [[ENT-28 - Regel]] nennt die Fundstelle. [[ENT-36 - Kostenbuchung]] ordnet Kosten dem Gemeingut zu und belastet sie weiter (Durchlaufposten). Eine [[ENT-31 - Anlage]] kann Teil eines Gemeinguts sein, etwa eine Paketanlage.

## Regeln und Lebenszyklus

- Ein Gemeingut ist das einzige Objekt, das mehrere Gemeinschaften verbindet. Daten dazu stehen nur in der Gemeinschaft „Viertel“ oder sind ausdrücklich teilbar (WCS FR-V11). Interne Daten einer WEG gelangen nicht über das Gemeingut in eine andere ([[DF-12 - Gemeinschaftstrennung]]).
- Der Kostenschlüssel ist eine Angabe aus der Urkunde. Das Plugin rechnet damit nur in Kostenbuchungen, nie mit Beträgen einzelner Eigentümer.

## Datenschutz

Nicht personenbezogen. Berechtigte sind Gemeinschaften oder Grundstücke, nie Eigentümer.

## Abweichungen vom WCS

- Technische `id` und `schema` kommen hinzu. Die WCS-„id“ ist ein Name und wird zu `name`.
- Die gemischte WCS-Liste „Berechtigte“ wird in zwei Listen mit je einem Verweistyp geteilt, weil ein Verweis nach ADR 0007 einen Typ hat.

## Offene Punkte

- O-ENT27-1: Welcher Gemeinschaft gehört die Gemeingut-Notiz? Vorschlag: der Gemeinschaft „Viertel“; ohne Viertel der zahlenden Gemeinschaft.
- O-ENT27-2: Wird der Kostenschlüssel strukturiert (Bruch je Berechtigtem), damit Weiterbelastungen prüfbar werden? Hängt an O-ENT26-1 (gemeinsame Buchungslogik).
- O-ENT27-3: Fundstelle als Verweis auf eine Regel oder direkt als Text? Das WCS führt beides getrennt.

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7, Roadmap-Vision v0.2): Objekt Gemeingut, Status später; Glossar Gemeingut (V1), Viertel (FR-V11), Durchlaufposten (V2), Kostenschlüssel (§ 16 Abs. 2 WEG). Keine PRD-Kennung und kein PBI im Backlog. Regel: [[DF-12 - Gemeinschaftstrennung]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
