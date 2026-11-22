---
type: Entity
id: ENT-20
status: abgeloest
scope: spaeter
category: bewegungsdaten
wcs: keine
date: 2026-11-22
---

# ENT-20 · Zahlungseintrag

> [!note] Abgelöst
> Seit dem 22.11.2026 geht dieses Objekt in [[ENT-37 - Kontobewegung]] auf ([[00 - Fachliches Domänenmodell]], O-DM-5). Die Note bleibt als Referenz für Regeln und Felder.

## Zweck

Eine manuell dokumentierte Zahlung mit eindeutigem Rechnungs- und Basisbezug; keine direkt ausgelöste Banktransaktion. Das WCS führt keinen Zahlungseintrag. Es kennt die [[ENT-37 - Kontobewegung]] aus einem Kontoauszug-Import.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `payment-entry-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. |
| Schema | `schema` | Text | P | `weg-manager.payment-entry/v1` (vorgeschlagen). |
| Rechnung | `invoice_id` | Text | P | Genau eine [[ENT-19 - Rechnung]]. |
| Betrag | `amount_cents` | Zahl | P | Positiver Betrag in ganzen Cent, EUR. WCS `Kontobewegung.betrag` ist vorzeichenbehaftet. |
| Status | `status` | Text | P | Siehe Wertelisten. |
| Datum | `paid_on` | Datum | O | Pflicht bei „als erfolgt gemeldet“. WCS `Kontobewegung.datum` (Valuta). |
| Zahlungsreferenz | `payment_ref` | Text | O | WCS `Kontobewegung.verwendungszweck`, ohne Eigentümernamen. |
| Zuordnung zur Basis | `basis_assignment` | Text | P | Zusätzlich, bereits in der Basis enthalten oder ungeklärt. |
| Belegstatus | `receipt_state` | Text | O | Unabhängig vom Zahlungsstatus. |
| Korrektur oder Storno von | `corrects_id` | Text | O | Bezug auf den vorherigen Eintrag. |
| Kontobewegung | `bank_movement_id` | Text | O | Später: zugeordnete Kontobewegung (WCS `Kontobewegung.zuordnung`). |

**Abbildung auf das WCS:** Zahlungseintrag ↔ Kontobewegung: Der Zahlungseintrag ist die manuelle Meldung, die Kontobewegung der importierte Kontoumsatz. Eine Kontobewegung kann später einen Zahlungseintrag bestätigen, aber nicht still erzeugen.

## Wertelisten

**Status (geschlossen):** vorbereitet (`prepared`), als veranlasst gemeldet (`reported_initiated`), als erfolgt gemeldet (`reported_paid`), Erfassung storniert (`cancelled`).

**Zuordnung zur Basis (geschlossen):** zusätzlich (`additional`), bereits enthalten (`included`), ungeklärt (`unclear`).

## Beziehungen

Gehört genau einer [[ENT-19 - Rechnung]]. Ein Beleg kann über [[ENT-07 - Quelle]] und [[ENT-08 - Dokument]] verbunden sein. Die Gemeinschaft folgt eindeutig aus der Rechnung. Storno und Korrektur halten den Bezug zur bisherigen Erfassung. Später kann eine [[ENT-37 - Kontobewegung]] zugeordnet werden.

[[ENT-36 - Kostenbuchung]], [[ENT-37 - Kontobewegung]].

## Regeln und Lebenszyklus

- „Als erfolgt gemeldet“ braucht ein Datum ([[DF-19 - Zahlungsstatus und Korrektur]]).
- Nur nicht stornierte, eindeutig zusätzliche und als erfolgt gemeldete Zahlungen reduzieren den Rest ([[DF-18 - Rechnungsbasis und dokumentierter Rest]], [[DF-20 - Abschläge ohne doppelte Anrechnung]]).
- Eine Belegänderung ändert keinen Zahlungsstatus.
- Storno korrigiert die lokale Erfassung, ruft aber keine Überweisung zurück.
- Keine ungeprüfte Aufteilung einer Sammelüberweisung auf mehrere Rechnungen ([[DF-21 - Unklare Zuordnung und Sammelzahlungen]]).

## Datenschutz

Keine Bankzugangsdaten. Verwendungszwecke enthalten in geteilten Sichten keine Eigentümernamen (WCS-Regel zur Kontobewegung).

## Abweichungen vom WCS

Das WCS kennt keinen Zahlungseintrag, nur die importierte Kontobewegung. Die Note bleibt als unsere Ergänzung eigenständig, weil sie die manuelle Meldung ohne Bankanbindung trägt. Sie konkretisiert den späteren Ausbau und erweitert nicht den aktuellen MVP.

## Offene Punkte

- **O-ENT20-1 (erledigt):** Entschieden am 22.11.2026 vom Produktverantwortlichen: Abgelöst durch [[ENT-37 - Kontobewegung]] im gemeinsamen Finanz-Feature nach dem MVP.
- **O-ENT20-2:** Erstattungen, Rückbuchungen und Sammelzahlungen bleiben Klärungsfälle des bislang abgegrenzten Modells.
- **O-ENT20-3:** Keine automatische Zahlungsbestätigung. Technische Speicherung und endgültiger Umfang bleiben offen.

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (Roadmap-Vision v0.2): Kontobewegung (CSV/CAMT-Import), Roadmap-Frage 2. PBI-39 und historisches PRD 1.0, FR-14 sowie Zahlungsmodell (Git-Commit `b3a1cc2`, Pfad `docs/history/02-MVP-PRD-v1.0.md`). Unser [MVP-PRD](../02-MVP-PRD.md): Systemgrenze (Zahlungsvorbereitung später). Regeln: [[DF-18 - Rechnungsbasis und dokumentierter Rest]], [[DF-19 - Zahlungsstatus und Korrektur]], [[DF-20 - Abschläge ohne doppelte Anrechnung]], [[DF-21 - Unklare Zuordnung und Sammelzahlungen]].

[[PBI-39 - Dokumentierten Rechnungsrest nachvollziehen]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
