---
type: Entity
id: ENT-26
status: entwurf
scope: spaeter
category: stammdaten
wcs: spaeter
date: 2026-11-22
---

# ENT-26 · Budget

## Zweck

Ein Budget ist ein durch Beschluss freigegebener Betrag für ein Wirtschaftsjahr. Es hält fest, wer beauftragen darf, ob der Beirat vorher zustimmen muss und wann die Ermächtigung verfällt.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `budget-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. Das WCS kennt keine eigene Kennung. |
| Schemaversion | `schema` | Text | P | `weg-manager.budget/v1`. |
| Beschluss | `resolution_id` | Text (Verweis) | P | Ermächtigende Grundlage ([[ENT-25 - Beschluss]]). |
| Jahr | `fiscal_year` | Zahl | P | Wirtschaftsjahr, z. B. `2027`. |
| Höhe | `amount_cents` | Zahl | P | Freigegebene Summe in ganzen Cent (EUR), z. B. `500000` für 5.000 EUR. |
| Verbrauch | `consumed_cents` | Zahl | A | Summe der zugeordneten [[ENT-36 - Kostenbuchung]]. Berechnet, nicht gespeichert. |
| Beauftragt durch | `commissioned_by_role` | Text (Code) | P | Rolle, die beauftragen darf, meist Verwaltung. Code aus der Rollenliste von [[ENT-02 - Person und Rolle]]. |
| Zustimmung Beirat | `board_approval_required` | Checkbox | P | Ob vor der Beauftragung die Zustimmung des Beirats nötig ist. |
| Verfall | `expires_on` | Datum | O | Ende der Ermächtigung, z. B. Jahresende. |

A-Felder berechnet das Plugin. Sie stehen nach ADR 0007 nicht in der Notiz.

## Beziehungen

Beruht auf genau einem [[ENT-25 - Beschluss]]; die Gemeinschaft folgt aus dem Beschluss ([[ENT-01 - Gemeinschaft]]). [[ENT-36 - Kostenbuchung]] und [[ENT-37 - Kontobewegung]] können einem Budget zugeordnet sein. Ein Vorgang ([[ENT-04 - Vorgang]]) kann eine Beauftragung aus dem Budget nachhalten.

## Regeln und Lebenszyklus

- Ohne Beschluss kein Budget.
- Der Verbrauch ergibt sich nur aus gemeinschaftsweiten Kostenbuchungen. Ist er höher als die Höhe, zeigt das Plugin einen Hinweis. Es stellt keine Rechtsfolge fest.
- Nach dem Verfall ist das Budget abgelaufen. Spätere Buchungen werden als abweichend angezeigt.
- Eine Zustimmung des Beirats ist eine Entscheidung ([[ENT-09 - Entscheidungskarte]]) und wird im Verlauf belegt, nicht am Budget abgehakt.

## Datenschutz

Nicht personenbezogen. Nur gemeinschaftsweite Beträge.

## Abweichungen vom WCS

- Technische `id` und `schema` kommen hinzu; das WCS führt das Budget ohne Kennung.
- Beträge in ganzen Cent wie bei [[ENT-20 - Zahlungseintrag]].
- „Beauftragt durch“ ist eine Rolle, kein Name.

## Offene Punkte

- O-ENT26-1 (erledigt): Entschieden am 22.11.2026 vom Produktverantwortlichen: Ein gemeinsames Finanz-Feature nach dem MVP baut Kostenbuchung, Kontobewegung und Budget mit derselben Buchungslogik. Kostenbuchung löst [[ENT-19 - Rechnung]] ab, Kontobewegung löst [[ENT-20 - Zahlungseintrag]] ab.
- O-ENT26-2: Kann ein Beschluss mehrere Budgets freigeben (je Jahr, je Zweck)? Vorschlag: ja, je Jahr ein Budget.
- O-ENT26-3: Wie wird die Zustimmung des Beirats je Beauftragung nachgewiesen? Vorschlag: Entscheidungskarte mit Verweis auf das Budget.

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7, Roadmap-Vision v0.2): Objekt Budget, Status später; Glossar Budget (V3), Wirtschaftsplan (§ 28 Abs. 1 WEG). Keine PRD-Kennung und kein PBI im Backlog; verwandt mit [[F-17 - Rechnungen und Zahlungen führen]]. Regel: [[DF-12 - Gemeinschaftstrennung]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
