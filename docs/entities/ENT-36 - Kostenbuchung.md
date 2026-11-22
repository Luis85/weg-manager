---
type: Entity
id: ENT-36
status: entwurf
scope: spaeter
category: bewegungsdaten
wcs: spaeter
date: 2026-11-22
---

# ENT-36 · Kostenbuchung

## Zweck

Eine Kostenbuchung hält gemeinschaftsweite Kosten fest: wer zahlt, an wen sie weiterbelastet werden und welchem Gemeingut oder Budget sie zugeordnet sind. Der Abgleichstatus zeigt, ob die Buchung belegt ist.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `cost-posting-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. Das WCS kennt keine eigene Kennung. |
| Schemaversion | `schema` | Text | P | `weg-manager.cost-posting/v1`. |
| Datum | `posted_on` | Datum | P | Buchungs- oder Rechnungsdatum. |
| Betrag | `amount_cents` | Zahl | P | Betrag in ganzen Cent (EUR). Nur gemeinschaftsweite Beträge. |
| Quelle | `paying_community_id` | Text (Verweis) | P | Zahlende [[ENT-01 - Gemeinschaft]]. |
| Ziel | `target_community_ids` | Liste (Verweise) | O | Gemeinschaften, an die weiterbelastet wird (Durchlaufposten). |
| Schlüssel | `cost_allocation_key` | Text | O | Kostenschlüssel der Weiterbelastung, z. B. „je ein Achtel“. |
| Gemeingut | `shared_facility_id` | Text (Verweis) | O | Zuordnung zu [[ENT-27 - Gemeingut]]. |
| Budget | `budget_id` | Text (Verweis) | O | Zuordnung zu [[ENT-26 - Budget]]. |
| Abgleichstatus | `reconciliation_status` | Text (Code) | A | `posted`, `deviating`, `missing`. Berechnet, nicht gespeichert. |

A-Felder berechnet das Plugin. Sie stehen nach ADR 0007 nicht in der Notiz.

## Wertelisten

Abgleichstatus (geschlossen, aus dem WCS):

| Code | Anzeige | Bedeutung (Vorschlag) |
| --- | --- | --- |
| `posted` | gebucht | Passende [[ENT-37 - Kontobewegung]] gefunden. |
| `deviating` | abweichend | Kontobewegung gefunden, Betrag oder Datum weicht ab. |
| `missing` | fehlt | Keine Kontobewegung gefunden. |

## Beziehungen

- Zahlende und Ziel-Gemeinschaften sind [[ENT-01 - Gemeinschaft]]. Zuordnung zu [[ENT-27 - Gemeingut]] und [[ENT-26 - Budget]]; der Verbrauch eines Budgets ist die Summe seiner Kostenbuchungen.
- Der Abgleich läuft gegen [[ENT-37 - Kontobewegung]].
- **Abgrenzung zu [[ENT-19 - Rechnung]]:** Die Rechnung erfasst ein Rechnungsdokument und seine Betragsbasis, um einen dokumentierten Rest zu verfolgen. Die Kostenbuchung verteilt Kosten auf Gemeinschaften, Gemeingüter und Budgets. Eine Rechnung kann Grundlage einer Kostenbuchung sein; ob das ein Verweis ist, ist offen (O-ENT36-2).
- Der Beleg ist ein [[ENT-08 - Dokument]].

## Regeln und Lebenszyklus

- Nur gemeinschaftsweite Beträge. Aus Abrechnungen werden keine Beträge einzelner Eigentümer übernommen.
- Weiterbelastung: Die Summe der Anteile an die Ziel-Gemeinschaften folgt dem Schlüssel. Abweichungen zeigt das Plugin als Hinweis.
- Eine Kostenbuchung wird berichtigt, nicht gelöscht; die Korrektur steht im Verlauf.
- Dies ist keine Finanzbuchhaltung (PRD Systemgrenze, [[ENT-19 - Rechnung]]).

## Datenschutz

Nicht personenbezogen, solange nur gemeinschaftsweite Beträge gebucht werden. Kein Bezug auf Einheiten oder Eigentümer.

## Abweichungen vom WCS

- Technische `id` und `schema` kommen hinzu.
- Das WCS-Feld „quelle“ heißt `paying_community_id`, damit es nicht mit [[ENT-07 - Quelle]] verwechselt wird.
- Das WCS-Doppelfeld „gemeingut / budget“ wird in zwei Verweise geteilt.
- Beträge in ganzen Cent wie bei [[ENT-20 - Zahlungseintrag]].

## Offene Punkte

- O-ENT36-1 (erledigt): Entschieden am 22.11.2026 vom Produktverantwortlichen: Ein gemeinsames Finanz-Feature nach dem MVP baut Kostenbuchung, Kontobewegung und Budget mit derselben Buchungslogik. Kostenbuchung löst [[ENT-19 - Rechnung]] ab, Kontobewegung löst [[ENT-20 - Zahlungseintrag]] ab.
- O-ENT36-2 (erledigt): Entschieden am 22.11.2026 vom Produktverantwortlichen: Die Kostenbuchung löst die Rechnung ab; die Betragsbasis und Versionierung aus ENT-19 gehen in die Kostenbuchung über.
- O-ENT36-3: Braucht die Kostenbuchung eine Beschreibung oder Kostenart? Das WCS nennt keine.
- O-ENT36-4: Wie ordnet der Abgleich eine Kontobewegung zu (Betrag, Datum, Verwendungszweck)? Gilt die Grenze für Sammelzahlungen aus [[DF-21 - Unklare Zuordnung und Sammelzahlungen]] auch hier?

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7, Roadmap-Vision v0.2): Objekt Kostenbuchung, Status später; Glossar Durchlaufposten (V2), Kostenschlüssel (§ 16 Abs. 2 WEG); Roadmap-Frage 2. Unser PRD: Systemgrenze „Buchhaltung“ später. Feature: [[F-17 - Rechnungen und Zahlungen führen]]. Regeln: [[DF-12 - Gemeinschaftstrennung]], [[DF-18 - Rechnungsbasis und dokumentierter Rest]], [[DF-21 - Unklare Zuordnung und Sammelzahlungen]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
