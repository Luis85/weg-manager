---
type: Entity
id: ENT-30
status: entwurf
scope: spaeter
category: stammdaten
wcs: spaeter
date: 2026-11-22
---

# ENT-30 · Police

## Zweck

Eine Police ist ein Versicherungsvertrag der Gemeinschaft, z. B. Gebäude- oder Haftpflichtversicherung. Sie hält Deckung, Summen, Selbstbehalt und Laufzeit fest und zeigt, ob die Pflichtdeckung laut Regel erfüllt ist.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `insurance-policy-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. |
| Schemaversion | `schema` | Text | P | `weg-manager.insurance-policy/v1`. |
| Policennummer (WCS-„id“) | `policy_number` | Text | P | Nummer des Versicherers. Nicht die technische `id`. |
| Gemeinschaft | `community_id` | Text (Verweis) | P | Versicherungsnehmerin ([[ENT-01 - Gemeinschaft]]). |
| Sparte | `line` | Text (Code) | P | Siehe Wertelisten. |
| Gefahren | `perils` | Liste Text | O | Z. B. „Feuer“, „Leitungswasser“, „Sturm“. |
| Summe | `sum_insured_cents` | Zahl | O | Versicherungssumme in ganzen Cent (EUR). |
| Wert 1914 | `value_1914` | Zahl | O | Versicherungswert 1914 in Mark, ohne Umrechnung. |
| Unterversicherungsverzicht | `underinsurance_waiver` | Checkbox | O | Ob der Versicherer auf den Einwand der Unterversicherung verzichtet. |
| Selbstbehalt | `deductible_cents` | Zahl | O | Selbstbehalt je Schaden in ganzen Cent (EUR). |
| Laufzeit | `term_ends_on` | Datum | P | Ende der laufenden Vertragsperiode. |
| Kündigungsfrist | `notice_period` | Text | P | Z. B. „3 Monate zum Ablauf“. Vor der Frist erinnert ein Vorgang. |
| Pflichtdeckung erfüllt | `mandatory_cover_met` | Checkbox | A | Abgleich mit den Regeln mit Thema `mandatory_insurance`. Berechnet, nicht gespeichert. |

A-Felder berechnet das Plugin. Sie stehen nach ADR 0007 nicht in der Notiz.

## Wertelisten

Sparte (geschlossen, aus dem WCS):

| Code | Anzeige |
| --- | --- |
| `building` | Gebäude |
| `liability` | Haftpflicht |
| `water_damage` | Gewässerschaden |
| `fire_construction` | Feuer (Bauzeit) |
| `other` | Sonstiges |

## Beziehungen

Gehört genau einer [[ENT-01 - Gemeinschaft]]. Das Original ist ein [[ENT-08 - Dokument]]. [[ENT-28 - Regel]] mit Thema Pflichtversicherung ist der Maßstab für `mandatory_cover_met`. Die Kündigungsfrist kann einen [[ENT-05 - Termin]] und einen [[ENT-04 - Vorgang]] auslösen. Die Police ist eine Unterlage der Soll-Liste ([[ENT-32 - Unterlage]]).

## Regeln und Lebenszyklus

- `mandatory_cover_met` ist ein Hinweis aus dem Abgleich, keine Rechtsauskunft. Fehlt eine Regel, ist der Wert unbekannt, nicht falsch.
- Eine Erinnerung vor der Frist ist ein Vorgang mit Termin. Das Plugin kündigt nie selbst.
- Eine abgelaufene Police bleibt erhalten; eine Nachfolgepolice ist eine neue Notiz.

## Datenschutz

Nicht personenbezogen. Schadensfälle einzelner Eigentümer gehören nicht in die Police.

## Abweichungen vom WCS

- Technische `id` und `schema` kommen hinzu. Die WCS-„id“ wird zum fachlichen Feld `policy_number`.
- Die WCS-Doppelfelder „summe / wert1914“ und „laufzeit / kuendigungsfrist“ werden in je zwei Felder geteilt.
- Beträge in ganzen Cent wie bei [[ENT-20 - Zahlungseintrag]]; der Wert 1914 bleibt in Mark.
- Eine Ablage für das Original nennt das WCS nicht. Sie läuft wie beim Vertrag über ein Dokument (siehe O-ENT30-2).

## Offene Punkte

- O-ENT30-1: Laufzeit als Enddatum oder als Beginn und Ende? Das WCS nennt ein Datum.
- O-ENT30-2: Braucht die Police ein Pflichtfeld `document_id` wie der Vertrag?
- O-ENT30-3: Wie wird die Pflichtdeckung verglichen, wenn die Regel nur als Satz vorliegt? Vorschlag: Sparte und Gefahren gegen eine Liste in der Regel.

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7, Roadmap-Vision v0.2): Objekt Police, Status später; Glossar Police (V9). Keine PRD-Kennung und kein PBI im Backlog. Regel: [[DF-12 - Gemeinschaftstrennung]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
