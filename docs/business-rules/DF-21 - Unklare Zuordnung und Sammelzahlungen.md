---
type: BusinessRule
id: DF-21
status: entwurf
scope: spaeter
---

# DF-21 · Unklare Zuordnung und Sammelzahlungen

## Regel

Ändert sich die Dokumentbasis, werden bisherige Zahlungszuordnungen erneut geprüft; bis zur Klärung gibt es keinen verlässlich berechneten Rest oder berechnete Zahlungsvorlage. Frühere Prüfvermerke bleiben auf den alten Stand bezogen. Gutschriften, Erstattungen, Rückbuchungen, Sammelzahlungen und komplexe Verrechnungen bleiben im übernommenen Ausgangsmodell Klärungsfälle. Eine Sammelüberweisung darf nicht mit ihrem Gesamtbetrag mehreren Rechnungen zugerechnet werden; auch ihre manuelle Aufteilung ist in diesem Modell noch nicht spezifiziert. Ein abgelöster Beleg bleibt nachvollziehbar; abgelöst bedeutet nicht bezahlt.

## Synthetischer Abnahmeanker

Ein Beleg über eine Sammelüberweisung von 300 EUR betrifft Rechnungen A und B. Er wird als Klärungsbeleg referenziert, vermindert aber nicht automatisch beide Rechnungsreste. Eine Änderung der Rechnungsbasis macht alte Zuordnungen prüfbedürftig.

## Geltung und Herkunft

Späterer Ausbau, kein aktuelles MVP-Releasekriterium. Ausgangsregel vor Umsetzung mit dem konkreten Ausbauumfang erneut prüfen. Der Abnahmeanker ist ein vorgeschlagener Fall, kein ausgeführter Test.

Quelle: Historisches PRD 1.0, Klärungsfälle und AT-13; PBI-39 verlangt erneute Prüfung dieses Ausgangsmodells vor Umsetzung.

[[PBI-39 - Dokumentierten Rechnungsrest nachvollziehen]].

**Entitäten:** [[ENT-19 - Rechnung]], [[ENT-20 - Zahlungseintrag]].

Historisches PRD 1.0 (historische Quelle im Git-Commit `b3a1cc2`, Pfad `docs/history/02-MVP-PRD-v1.0.md`) · [[Product Backlog.base#Business Rules]].
