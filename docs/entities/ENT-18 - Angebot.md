---
type: Entity
id: ENT-18
status: entwurf
scope: spaeter
category: bewegungsdaten
wcs: keine
date: 2026-11-22
---

# ENT-18 · Angebot

## Zweck

Eine fachlich vergleichbare Angebotsfassung eines Anbieters mit nachvollziehbarem Leistungs- und Quellenstand. Das WCS führt kein Angebotsobjekt. Angebotsfragen sind dort Vorgänge; die Freigabe läuft über ein Budget mit Zustimmung des Beirats ([[ENT-26 - Budget]]).

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `offer-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. |
| Schema | `schema` | Text | P | `weg-manager.offer/v1` (vorgeschlagen). |
| Anbieter | `supplier_id` | Text | P | Person mit Rolle „Dritte“ ([[ENT-02 - Person und Rolle]]). |
| Gemeinschaft | `community_id` | Text | P | Genau eine Gemeinschaft. |
| Vorgang | `matter_id` | Text | O | Zugehöriger Vorgang oder Themenkontext. |
| Angebotsfassung | `version` | Text | P | Fassung des Angebots. |
| Leistungsbeschreibung | Body | Text | O | Beziehungsweise deren referenzierter Stand. |
| Betrag | `amount_eur` | Zahl | O | Betrag in EUR. Fehlt er, bleibt er unbekannt. |
| Termin | `offered_on` | Datum | O | Ausführungstermin laut Angebot ([[ENT-05 - Termin]]). |
| Ausschlüsse | `exclusions` | Text | O | |
| Angebotsbindung | `valid_until` | Datum | O | |
| Quelle und Original | `source`, `link` | Text | P | Beleg ([[ENT-07 - Quelle]], [[ENT-08 - Dokument]]). |
| Auswahlbegründung | `selection_reason` | Text | O | Dokumentierte Begründung einer Auswahl. |
| Budget | `budget_id` | Text | O | Später: das ermächtigende Budget ([[ENT-26 - Budget]]). |

**Abbildung auf das WCS:** Angebotsfrage = Vorgang der Art Frage; Freigabe = Budget mit `zustimmung_beirat`; Auftrag = Vertrag der Art Sonstiges oder Wartung ([[ENT-29 - Vertrag]]).

## Beziehungen

Anbieter über [[ENT-02 - Person und Rolle]]; Termine über [[ENT-05 - Termin]]. [[ENT-07 - Quelle]] und [[ENT-08 - Dokument]] belegen die Angebotsfassung. Der zugehörige Vorgang verbindet das Angebot mit dem Anliegen. Eine bereits im System erstellte Anfrage ist keine Voraussetzung. Später ist das Angebot mit Budget, Vertrag und Kostenbuchung verknüpft.

[[ENT-04 - Vorgang]], [[ENT-19 - Rechnung]], [[ENT-26 - Budget]], [[ENT-29 - Vertrag]], [[ENT-36 - Kostenbuchung]].

## Regeln und Lebenszyklus

- Fehlende Werte bleiben unbekannt ([[DF-17 - Angebotsfassungen und Vergleich]]).
- Alte Leistungsstände werden sichtbar, frühere Originalfassungen nicht still ersetzt.
- Null, ein oder mehrere Angebote bleiben bearbeitbar; keine pauschale Mindestzahl und keine automatische Auswahl.
- Alternative Angebote werden nicht zu einer Auftragssumme addiert.

## Datenschutz

Anbieter sind Gegenüber; ihre Kontaktdaten folgen [[ENT-02 - Person und Rolle]]. Angebote enthalten keine Eigentümerdaten.

## Abweichungen vom WCS

Das WCS kennt kein Angebotsobjekt. Die Note bleibt als unsere Ergänzung eigenständig. Sie konkretisiert den späteren Ausbau und erweitert nicht den aktuellen MVP.

## Offene Punkte

- **O-ENT18-1:** Die Leistungsfassung ist vorerst Bestandteil des Angebots, keine eigene Entität.
- **O-ENT18-2:** Anfrage- und Auftragsmodell sowie die endgültige Beziehung zum bisherigen Handwerkervorgang werden vor Umsetzung konkretisiert.
- **O-ENT18-3:** Zusammenführung mit [[ENT-26 - Budget]] und [[ENT-29 - Vertrag]] prüfen, wenn diese gebaut werden. Technische Speicherung und endgültiger Umfang bleiben offen.

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (Roadmap-Vision v0.2): Budget V3, Vertrag. PBI-38 und historisches PRD 1.0, FR-07 (Git-Commit `b3a1cc2`, Pfad `docs/history/02-MVP-PRD-v1.0.md`); der frühere operative Umfang bleibt späterer Ausbau. Unser [MVP-PRD](../02-MVP-PRD.md): Systemgrenze (eigener RFQ- und Vergleichsprozess später). Regel: [[DF-17 - Angebotsfassungen und Vergleich]].

[[PBI-38 - Angebote fachlich vergleichen]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
