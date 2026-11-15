---
type: PBI
parent: "[[F-17 - Rechnungen und Zahlungen führen]]"
order: 62000
actors:
  - "[[ACT-01-Beirat]]"
status: ""
started: ""
finished: ""
horizon: ""
start: ""
due: ""
risk: ""
priority: ""
assignee: ""
iteration: ""
entities:
  - "[[docs/design/entities/ENT-02 - Ansprechpartner]]"
  - "[[docs/design/entities/ENT-05 - Termin]]"
  - "[[docs/design/entities/ENT-07 - Quelle]]"
  - "[[docs/design/entities/ENT-08 - Dokument]]"
  - "[[docs/design/entities/ENT-19 - Rechnung]]"
  - "[[docs/design/entities/ENT-20 - Zahlungseintrag]]"
business-rules:
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
  - "[[docs/business-rules/DF-18 - Rechnungsbasis und dokumentierter Rest]]"
  - "[[docs/business-rules/DF-19 - Zahlungsstatus und Korrektur]]"
  - "[[docs/business-rules/DF-20 - Abschläge ohne doppelte Anrechnung]]"
  - "[[docs/business-rules/DF-21 - Unklare Zuordnung und Sammelzahlungen]]"
decisions:
  - "[[docs/decisions/K-01 - Beirat als erster Produkteinstieg]]"
hypotheses:
  - "[[docs/hypothesis/H-01 - Beiratsfokus deckt den ersten Pilotbedarf]]"
pages: []
user-flows: []
---

# PBI-39 · Dokumentierten Rechnungsrest nachvollziehen

**Planungsstand:** Konzeptentwurf · **Umfang:** Später

## User Story

Als Beirat möchte ich Rechnungsbasis und zusätzliche Zahlungen getrennt sehen, damit ich keine Abschläge doppelt anrechne.

## Akzeptanzkriterien

1. Historischer Abnahmeanker: Schlussrechnung 500 EUR minus bereits angerechnete 100 EUR startet mit 400 EUR Rest; weitere 150 EUR ergeben 250 EUR.
2. Zahlungsstatus, Belegstatus und Prüfstand bleiben getrennt; unklare Zuordnung liefert keinen scheinbar verlässlichen Rest.
3. Vollständiges Zahlungsmodell samt Storno, Überzahlung und Sammelzahlungsgrenze aus PRD 1.0 vor Umsetzung neu prüfen; im MVP keine Berechnung.

## Herkunft und Regeln

Alt FR-12/13/14. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-11 - Nachricht und Original zuordnen]]

## Refinementgrenze

Noch grob; vor Aufnahme in ein Release fachliche Detailfälle und offene Scopefragen klären. Keine Entwicklungsfreigabe.

## Business Rules

[[DF-18 - Rechnungsbasis und dokumentierter Rest]], [[DF-19 - Zahlungsstatus und Korrektur]], [[DF-20 - Abschläge ohne doppelte Anrechnung]], [[DF-21 - Unklare Zuordnung und Sammelzahlungen]].
