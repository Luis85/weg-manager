---
type: BusinessRule
id: DF-19
status: entwurf
scope: spaeter
---

# DF-19 · Zahlungsstatus und Korrektur

## Regel

Ein Zahlungseintrag gehört genau einer Rechnung und einer konkreten Version ihrer Dokumentbasis. Er unterscheidet vorbereitet, als veranlasst gemeldet, als erfolgt gemeldet und Erfassung storniert. Ein positiver Centbetrag in EUR ist erforderlich; als erfolgt gemeldet verlangt ein Datum. Belegstatus ist unabhängig. Storno korrigiert die lokale Erfassung, nicht die Banküberweisung. Korrekturen erhalten ihren Bezug zum bisherigen Eintrag; mögliche Dubletten werden anhand Rechnung, Betrag, Datum und Referenz angezeigt.

## Synthetischer Abnahmeanker

Bei 300 EUR Rechnungsbasis bleiben nach nur vorbereiteten oder als veranlasst gemeldeten 120 EUR weiterhin 300 EUR Rest. Als erfolgt gemeldet entstehen 180 EUR Rest; nach Storno der Erfassung wieder 300 EUR. Der alte Eintrag bleibt nachvollziehbar, zählt aber nicht mit.

## Geltung und Herkunft

Späterer Ausbau, kein aktuelles MVP-Releasekriterium. Ausgangsregel vor Umsetzung mit dem konkreten Ausbauumfang erneut prüfen. Der Abnahmeanker ist ein vorgeschlagener Fall, kein ausgeführter Test.

Quelle: Historisches PRD 1.0, FR-14 und PBI-39.

[[PBI-39 - Dokumentierten Rechnungsrest nachvollziehen]].

**Entitäten:** [[ENT-19 - Rechnung]], [[ENT-20 - Zahlungseintrag]].

Historisches PRD 1.0 (historische Quelle im Git-Commit `b3a1cc2`, Pfad `docs/history/02-MVP-PRD-v1.0.md`) · [[Product Backlog.base#Business Rules]].
