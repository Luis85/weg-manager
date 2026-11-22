---
type: Entity
id: ENT-37
status: entwurf
scope: spaeter
category: bewegungsdaten
wcs: spaeter
date: 2026-11-22
---

# ENT-37 · Kontobewegung

## Zweck

Eine Kontobewegung ist eine Zeile aus dem Konto der Gemeinschaft, importiert aus einer CSV- oder CAMT-Datei. Sie belegt Zahlungen und lässt sich Kostenbuchungen, Budgets oder Positionen des Wirtschaftsplans zuordnen.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `bank-transaction-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. Das WCS kennt keine eigene Kennung. |
| Schemaversion | `schema` | Text | P | `weg-manager.bank-transaction/v1`. |
| Gemeinschaft | `community_id` | Text (Verweis) | P | Kontoinhaberin ([[ENT-01 - Gemeinschaft]]). Ergänzung, nicht im WCS. |
| Konto | `account` | Text (Code) | P | `current_account` oder `reserve_account` (siehe Wertelisten). |
| Datum | `value_date` | Datum | P | Valuta. |
| Betrag | `amount_cents` | Zahl | P | Vorzeichenbehaftet in ganzen Cent (EUR): Eingang positiv, Ausgang negativ. |
| Verwendungszweck | `purpose` | Text | O | Ohne Eigentümernamen in geteilten Sichten. |
| Zuordnung: Kostenbuchung | `cost_posting_id` | Text (Verweis) | O | [[ENT-36 - Kostenbuchung]]. |
| Zuordnung: Budget | `budget_id` | Text (Verweis) | O | [[ENT-26 - Budget]]. |
| Zuordnung: Planposition | `business_plan_item` | Text | O | Position des Wirtschaftsplans, z. B. „Hausmeisterdienst“. |

## Wertelisten

Konto (geschlossen, aus dem WCS):

| Code | Anzeige |
| --- | --- |
| `current_account` | Girokonto |
| `reserve_account` | Rücklagenkonto |

## Beziehungen

Gehört genau einer [[ENT-01 - Gemeinschaft]]. Zuordnung zu höchstens einer [[ENT-36 - Kostenbuchung]], einem [[ENT-26 - Budget]] oder einer Planposition. Die Importdatei ist ein [[ENT-08 - Dokument]]. Kann die Abgleiche eines [[ENT-34 - Prüfvorgang]] speisen.

**Abgrenzung zu [[ENT-20 - Zahlungseintrag]]:** Der Zahlungseintrag ist eine manuell dokumentierte Zahlung zu genau einer [[ENT-19 - Rechnung]]. Die Kontobewegung ist eine importierte Bankzeile ohne Rechnungsbezug. Ob eine Kontobewegung einen Zahlungseintrag belegen darf, ist offen (O-ENT37-2).

## Regeln und Lebenszyklus

- Kontobewegungen entstehen nur durch Import oder Erfassung von Hand. Das Plugin hat keinen Bankzugang und löst keine Zahlung aus (vgl. [[ENT-20 - Zahlungseintrag]]).
- Ein erneuter Import derselben Datei legt keine Dubletten an.
- Eine importierte Bewegung wird nicht geändert. Nur die Zuordnung ändert sich.
- Ohne Zuordnung bleibt die Bewegung sichtbar offen; eine Sammelzahlung wird nicht ungeprüft aufgeteilt ([[DF-21 - Unklare Zuordnung und Sammelzahlungen]]).

## Datenschutz

Der Verwendungszweck kann Namen von Eigentümern enthalten, etwa bei Hausgeldzahlungen. Er erscheint in geteilten Sichten, Entwürfen, Karten und Berichten nie mit Eigentümernamen; dort wird er gekürzt oder ausgeblendet. Der volle Text liegt nur im privaten Bereich. Zahlungen einzelner Eigentümer sind personenbezogen ([[DF-10 - Vertraulichkeitsprüfung]]).

## Abweichungen vom WCS

- Technische `id` und `schema` kommen hinzu.
- `community_id` kommt hinzu, weil jeder Datensatz genau einer Gemeinschaft gehört ([[DF-12 - Gemeinschaftstrennung]]). Das WCS-Feld „konto“ sagt nur die Kontoart.
- Die WCS-„zuordnung“ mit wechselndem Ziel wird in drei Felder geteilt, weil ein Verweis nach ADR 0007 einen Typ hat.
- Beträge in ganzen Cent; das Vorzeichen bleibt.

## Offene Punkte

- O-ENT37-1 (erledigt): Entschieden am 22.11.2026 vom Produktverantwortlichen: Ein gemeinsames Finanz-Feature nach dem MVP baut Kostenbuchung, Kontobewegung und Budget mit derselben Buchungslogik. Kostenbuchung löst [[ENT-19 - Rechnung]] ab, Kontobewegung löst [[ENT-20 - Zahlungseintrag]] ab.
- O-ENT37-2 (erledigt): Entschieden am 22.11.2026 vom Produktverantwortlichen: Die Kontobewegung löst den Zahlungseintrag ab; manuell erfasste Zahlungen sind Kontobewegungen ohne Import.
- O-ENT37-3: Werden Hausgeldeingänge einzelner Eigentümer überhaupt importiert? Vorschlag: nur Summen oder gar nicht, weil nur gemeinschaftsweite Zahlen übernommen werden.
- O-ENT37-4: Eine Note je Bewegung oder eine Note je Import mit Tabelle? Bei vielen Zeilen ist eine Note je Bewegung schwer zu pflegen.
- O-ENT37-5: Woran erkennt der Import eine Dublette (Valuta, Betrag, Zweck, Bankreferenz)?

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7, Roadmap-Vision v0.2): Objekt Kontobewegung (später, CSV/CAMT-Import); Glossar Erhaltungsrücklage (§ 19 Abs. 2 Nr. 4 WEG), Vorschuss (§ 28 Abs. 1 WEG); Roadmap-Frage 2; Datenschutzregel NFR-2, FR-E4. Unser PRD: Systemgrenze „Zahlungsvorbereitung, Buchhaltung“ später. Feature: [[F-17 - Rechnungen und Zahlungen führen]]. Regeln: [[DF-10 - Vertraulichkeitsprüfung]], [[DF-12 - Gemeinschaftstrennung]], [[DF-19 - Zahlungsstatus und Korrektur]], [[DF-21 - Unklare Zuordnung und Sammelzahlungen]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
