---
type: BusinessRule
id: DF-17
status: entwurf
scope: spaeter
---

# DF-17 · Angebotsfassungen und Vergleich

## Regel

Ein Vergleich benennt Anbieter, Quelle und Leistungs-/Angebotsfassung. Fehlende Beträge, Termine oder Leistungsangaben bleiben unbekannt. Unterschiedliche Leistungsstände und Ausschlüsse sind sichtbar. Eine neue Fassung überschreibt keine alten Originale. Null, ein oder mehrere Angebote bleiben bearbeitbar; keine automatische Anbieterwahl und keine pauschale Mindestzahl. Die Auswahl erhält eine Begründung; alternative Angebote werden nicht addiert.

## Synthetischer Abnahmeanker

Zwei Angebote beziehen sich auf unterschiedliche Leistungsfassungen. Der Unterschied wird gezeigt; ein fehlender Betrag wird nicht als null bewertet. Eine spätere Fassung bleibt vom Original unterscheidbar.

## Geltung und Herkunft

Späterer Ausbau, kein aktuelles MVP-Releasekriterium. Ausgangsregel vor Umsetzung mit dem konkreten Ausbauumfang erneut prüfen. Der Abnahmeanker ist ein vorgeschlagener Fall, kein ausgeführter Test.

Quelle: PBI-38 und historisches PRD 1.0, FR-07.

[[PBI-38 - Angebote fachlich vergleichen]].

**Entitäten:** [[ENT-18 - Angebot]].

Historisches PRD 1.0 (historische Quelle im Git-Commit `b3a1cc2`, Pfad `docs/history/02-MVP-PRD-v1.0.md`) · [[Product Backlog.base#Business Rules]].
