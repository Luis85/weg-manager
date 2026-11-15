---
type: BusinessRule
id: DF-20
status: entwurf
scope: spaeter
---

# DF-20 · Abschläge ohne doppelte Anrechnung

## Regel

Bereits in der Schlussrechnung berücksichtigte Abschläge werden nicht erneut als zusätzliche Zahlungen abgezogen. Abschlags- und Schlussbelege werden nicht zu einer gemeinsamen Bruttorechnungssumme addiert. Ein Verweis auf den Abschlag erzeugt keinen neuen Zahlungseintrag und ändert die ursprüngliche Zahlungszuordnung nicht.

## Synthetischer Abnahmeanker

Abschlag 100 EUR bezahlt; Schlussrechnung 500 EUR Gesamtleistung minus bereits angerechnete 100 EUR = 400 EUR Zahlbetrag. Weitere 150 EUR auf die Schlussrechnung ergeben 250 EUR Rest. Es wird weder erneut 100 EUR abgezogen noch eine Bruttosumme von 600 EUR gebildet.

## Geltung und Herkunft

Späterer Ausbau, kein aktuelles MVP-Releasekriterium. Ausgangsregel vor Umsetzung mit dem konkreten Ausbauumfang erneut prüfen. Der Abnahmeanker ist ein vorgeschlagener Fall, kein ausgeführter Test.

Quelle: PBI-39 und historisches PRD 1.0, Abschlagsbeispiel im Zahlungsmodell.

[[PBI-39 - Dokumentierten Rechnungsrest nachvollziehen]].

**Entitäten:** [[ENT-19 - Rechnung]], [[ENT-20 - Zahlungseintrag]].

Historisches PRD 1.0 (historische Quelle im Git-Commit `b3a1cc2`, Pfad `docs/history/02-MVP-PRD-v1.0.md`) · [[Product Backlog.base#Business Rules]].
