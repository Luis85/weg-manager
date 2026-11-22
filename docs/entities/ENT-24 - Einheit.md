---
type: Entity
id: ENT-24
status: entwurf
scope: spaeter
category: stammdaten
wcs: spaeter
date: 2026-11-22
---

# ENT-24 · Einheit

## Zweck

Eine Einheit ist eine Wohnung, ein Stellplatz oder eine Gewerbeeinheit mit Sondereigentum und Miteigentumsanteil (MEA). Sie ist die Grundlage für Kostenschlüssel und oft für das Stimmrecht.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `unit-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. |
| Schemaversion | `schema` | Text | P | `weg-manager.unit/v1`. |
| Nummer (WCS-„id“) | `unit_number` | Text | P | Nummer laut Teilungserklärung, z. B. „Whg 1.2“ oder „Stellplatz 4“. Eindeutig je Gemeinschaft. Nicht die technische `id`. |
| Gemeinschaft | `community_id` | Text (Verweis) | P | [[ENT-01 - Gemeinschaft]], zu der die Einheit gehört. |
| Art | `kind` | Text (Code) | P | `apartment`, `parking_space`, `commercial` (siehe Wertelisten). |
| MEA | `ownership_share` | Zahl | O | Miteigentumsanteil in Tausendsteln, z. B. `42` für 42/1000. |
| Privat | `owner_data_private` | Checkbox | A | Immer wahr. Sagt: Der Eigentümerbezug liegt nur im privaten Bereich, nie in dieser Notiz. Berechnet, nicht gespeichert. |

A-Felder berechnet das Plugin. Sie stehen nach ADR 0007 nicht in der Notiz.

## Wertelisten

Art (geschlossen, aus dem WCS):

| Code | Anzeige |
| --- | --- |
| `apartment` | Wohnung |
| `parking_space` | Stellplatz |
| `commercial` | Gewerbe |

## Beziehungen

Gehört genau einer [[ENT-01 - Gemeinschaft]]. Die Einheitenbezeichnung der Gemeinschaft (`unit_label`, z. B. „Stellplätze“) benennt die Einheiten in der Oberfläche. Kostenschlüssel nach MEA in [[ENT-28 - Regel]] und [[ENT-36 - Kostenbuchung]] beziehen sich auf die Summe der Anteile, nicht auf einzelne Eigentümer. Einen Grundstücksbezug ([[ENT-23 - Grundstück]]) kennt das WCS nicht.

## Regeln und Lebenszyklus

Eine Einheit ändert sich nur durch eine geänderte Teilungserklärung. Die Summe der MEA einer Gemeinschaft soll 1000 ergeben. Eine Abweichung ist ein Hinweis, kein Fehler, solange Einheiten fehlen. Gemeinschaftstrennung gilt ([[DF-12 - Gemeinschaftstrennung]]).

## Datenschutz

Die Einheit selbst (Nummer, Art, MEA) ist Bestandsangabe. Der Eigentümerbezug ist personenbezogen. Er liegt nur im privaten Bereich und nie im Modell dieser Notiz: kein Eigentümername, kein Kontakt, kein Verweis auf eine Person. Er gelangt nie in Entwürfe, Karten, Berichte oder das Repository (WCS NFR-2, FR-E3, FR-E4; [[DF-10 - Vertraulichkeitsprüfung]]).

## Abweichungen vom WCS

- Technische `id` und `schema` kommen hinzu. Die WCS-„id“ wird zum fachlichen Feld `unit_number`.
- Das WCS-Feld „privat“ wird nicht gespeichert. Es ist eine feste Aussage über die Ablage des Eigentümerbezugs.

## Offene Punkte

- O-ENT24-1: Wo und wie liegt der private Eigentümerbezug? Hängt am Speicherort der Bewertungsschicht und der privaten Daten (WCS-Liste „Private Daten“, FR-E3, WCS-PRD Q1).
- O-ENT24-2: Personen als Objekt oder weiter als Rolle? Die Datenschutzgrenze für Eigentümerdaten ist zu klären (offener Punkt des WCS, siehe [[ENT-02 - Person und Rolle]]).
- O-ENT24-3: Ist die Art eine geschlossene Liste, obwohl die Art der Gemeinschaft freier Text ist ([[K-20 - WCS-Datenmodell als fachliche Grundlage]])? Vorschlag: geschlossen, weil Kostenschlüssel davon abhängen können.

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7, Roadmap-Vision v0.2): Objekt Einheit, Status später; Glossar Einheit, MEA, Sondereigentum (§§ 1, 5, 16 WEG). Datenschutzregel NFR-2, FR-E4. Keine PRD-Kennung und kein PBI im Backlog. Regeln: [[DF-10 - Vertraulichkeitsprüfung]], [[DF-12 - Gemeinschaftstrennung]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
