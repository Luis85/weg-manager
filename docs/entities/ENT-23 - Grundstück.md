---
type: Entity
id: ENT-23
status: entwurf
scope: spaeter
category: stammdaten
wcs: spaeter
date: 2026-11-22
---

# ENT-23 · Grundstück

## Zweck

Ein Grundstück ist eine Fläche im Grundbuch, die einer Gemeinschaft gehört. Es verortet Gemeingüter und zeigt, welche Grundstücke eine Gemeinschaft umfasst.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `plot-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. Einmal vergeben, nie geändert. |
| Schemaversion | `schema` | Text | P | `weg-manager.plot/v1`. Erkennt die Notiz als Grundstück. |
| Schlüssel (WCS-„id“) | `plot_code` | Text | P | Fachlicher Kurzschlüssel, eindeutig je Gemeinschaft, z. B. `G1`. Nicht die technische `id`. |
| Bezeichnung | `designation` | Text | P | Flurstück oder Anschrift, z. B. „Flurstück 12/3“ oder „Lindenstraße 12“. |
| Gemeinschaft | `community_id` | Text (Verweis) | P | Eigentümergemeinschaft des Grundstücks ([[ENT-01 - Gemeinschaft]]). |

## Beziehungen

Ein Grundstück gehört genau einer [[ENT-01 - Gemeinschaft]]. Das WCS führt die Liste der Grundstücke zusätzlich an der Gemeinschaft (`grundstuecke`). Ein [[ENT-27 - Gemeingut]] liegt auf einem Grundstück und kann mehrere Grundstücke als Berechtigte nennen. [[ENT-24 - Einheit]] hat im WCS keinen Grundstücksbezug.

## Regeln und Lebenszyklus

Ein Grundstück ändert sich selten. Es wird angelegt, berichtigt und bei Teilung oder Vereinigung im Grundbuch ersetzt. Gemeinschaftstrennung gilt ([[DF-12 - Gemeinschaftstrennung]]): Ein Grundstück gehört nie zwei Gemeinschaften zugleich.

## Datenschutz

Nicht personenbezogen. Die Anschrift einer Wohnanlage ist Bestandsangabe. Im Repository stehen nur neutrale Beispiele.

## Abweichungen vom WCS

- Technische `id` und `schema` nach ADR 0007 kommen hinzu. Die WCS-„id“ wird zum fachlichen Feld `plot_code`.
- Die Liste `grundstuecke` an der Gemeinschaft wird nicht doppelt gespeichert. Sie ergibt sich aus `community_id` der Grundstücke (siehe O-ENT23-1).

## Offene Punkte

- O-ENT23-1: In welche Richtung wird der Bezug gespeichert? Vorschlag: nur `community_id` am Grundstück; die Liste an der Gemeinschaft wird berechnet.
- O-ENT23-2: Braucht es `plot_code` neben der technischen `id` und der Bezeichnung? Das WCS verlangt einen eindeutigen Schlüssel, nennt aber keinen Zweck.
- O-ENT23-3: Gehört ein Grundstück im Viertel zu einer WEG oder zur Gemeinschaft „Viertel“? Hängt an der Frage, welche Daten das Viertel teilen darf (WCS FR-V11).

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7, Roadmap-Vision v0.2): Objekt Grundstück, Status später; Bezug Viertel und Gemeingut (FR-V11, V1). Keine PRD-Kennung und kein PBI im Backlog. Regel: [[DF-12 - Gemeinschaftstrennung]]. Entscheidung: [[K-20 - WCS-Datenmodell als fachliche Grundlage]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
