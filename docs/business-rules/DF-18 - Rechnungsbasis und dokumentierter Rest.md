---
type: BusinessRule
id: DF-18
status: entwurf
scope: spaeter
---

# DF-18 · Rechnungsbasis und dokumentierter Rest

## Regel

Dokumentgesamtbetrag und laut Rechnung noch zu zahlender Betrag zum Dokumentstand sind getrennt. Die versionierte Dokumentbasis benennt bereits berücksichtigte Anrechnungen. Dokumentierter Rest = Zahlbetrag zum Dokumentstand minus eindeutig zusätzliche, nicht stornierte, als erfolgt gemeldete Zahlungen. Beträge werden in ganzen Centwerten in EUR behandelt; ein negativer Rest wird als Überzahlung gezeigt, nicht auf null gekürzt. Anzeige: laut manueller Erfassung. Prüfstand, Freigabevermerk und Zahlungsstand bleiben getrennt.

## Synthetischer Abnahmeanker

Rechnung mit 300 EUR Zahlbetrag und zusätzlicher als erfolgt gemeldeter Zahlung von 120 EUR zeigt 180 EUR Rest. Nach weiteren 200 EUR zeigt sie 20 EUR Überzahlung. Ein bloß hochgeladener Beleg vermindert den Rest nicht.

## Geltung und Herkunft

Späterer Ausbau, kein aktuelles MVP-Releasekriterium. Ausgangsregel vor Umsetzung mit dem konkreten Ausbauumfang erneut prüfen. Der Abnahmeanker ist ein vorgeschlagener Fall, kein ausgeführter Test.

Quelle: PBI-39 und historisches PRD 1.0, FR-12/14 sowie Zahlungsmodell.

[[PBI-39 - Dokumentierten Rechnungsrest nachvollziehen]].

**Entitäten:** [[ENT-19 - Rechnung]], [[ENT-20 - Zahlungseintrag]].

Historisches PRD 1.0 (historische Quelle im Git-Commit `b3a1cc2`, Pfad `docs/history/02-MVP-PRD-v1.0.md`) · [[Product Backlog.base#Business Rules]].
