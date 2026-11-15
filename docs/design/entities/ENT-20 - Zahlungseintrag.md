---
type: Entity
id: ENT-20
status: entwurf
scope: spaeter
---

# ENT-20 · Zahlungseintrag

## Zweck

Manuell dokumentierte Zahlung mit eindeutigem Rechnungs- und Basisbezug; keine direkt ausgelöste Banktransaktion.

## Wesentliche fachliche Angaben

Referenz; genau eine Rechnung; positiver Betrag in ganzen Centwerten in EUR; Status; Datum; Zahlungsreferenz; Zuordnung zusätzlich/bereits in der Basis enthalten/ungeklärt zur konkreten Dokumentbasis; unabhängiger Belegstatus; Bezug auf vorherigen Eintrag bei Korrektur oder Storno.

## Beziehungen

Gehört genau einer [[ENT-19 - Rechnung]]. Ein Beleg kann über [[ENT-07 - Quelle]] und [[ENT-08 - Dokument]] verbunden sein. Gemeinschaft wird über die Rechnung eindeutig zugeordnet. Storno und Korrektur halten den Bezug zur bisherigen Erfassung.

## Regeln und Lebenszyklus

Stände: vorbereitet, als veranlasst gemeldet, als erfolgt gemeldet und Erfassung storniert. Als erfolgt gemeldet benötigt ein Datum. Nur nicht stornierte, eindeutig zusätzliche und als erfolgt gemeldete Zahlungen reduzieren den Rest. Belegänderung ändert keinen Zahlungsstatus. Storno korrigiert die lokale Erfassung, ruft aber keine Überweisung zurück.

## Modellierungsgrenze und offene Punkte

Keine Bankzugangsdaten oder automatische Zahlungsbestätigung. Erstattungen, Rückbuchungen und Sammelzahlungen bleiben Klärungsfälle des bislang abgegrenzten Modells. Keine ungeprüfte Aufteilung einer Sammelüberweisung auf mehrere Rechnungen.

Die Note konkretisiert den späteren Ausbau und erweitert nicht den aktuellen MVP. Technische Speicherung und endgültiger Umfang bleiben offen.

## Herkunft und Anforderungen

PBI-39 und historisches PRD 1.0, FR-14 sowie Zahlungsmodell.

[[PBI-39 - Dokumentierten Rechnungsrest nachvollziehen]].

**Business Rules:** [[DF-18 - Rechnungsbasis und dokumentierter Rest]], [[DF-19 - Zahlungsstatus und Korrektur]], [[DF-20 - Abschläge ohne doppelte Anrechnung]], [[DF-21 - Unklare Zuordnung und Sammelzahlungen]].

[MVP-PRD](../../02-MVP-PRD.md) · PRD 1.0 als historische Quelle (historische Quelle im Git-Commit `b3a1cc2`, Pfad `docs/history/02-MVP-PRD-v1.0.md`) · [[Product Backlog.base#Design Foundations|Entitätsnotes]].
