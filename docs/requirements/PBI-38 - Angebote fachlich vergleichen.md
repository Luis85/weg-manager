---
type: PBI
parent: "[[F-16 - Operative Handwerkersteuerung]]"
order: 60000
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
  - "[[docs/entities/ENT-02 - Person und Rolle]]"
  - "[[docs/entities/ENT-05 - Termin]]"
  - "[[docs/entities/ENT-07 - Quelle]]"
  - "[[docs/entities/ENT-08 - Dokument]]"
  - "[[docs/entities/ENT-18 - Angebot]]"
business-rules:
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
  - "[[docs/business-rules/DF-17 - Angebotsfassungen und Vergleich]]"
decisions:
  - "[[docs/decisions/K-01 - Beirat als erster Produkteinstieg]]"
  - "[[docs/decisions/K-10 - Manuelle Quellenübernahme und Registerimport vorsehen]]"
hypotheses:
  - "[[docs/hypothesis/H-01 - Beiratsfokus deckt den ersten Pilotbedarf]]"
pages: []
user-flows: []
---

# PBI-38 · Angebote fachlich vergleichen

**Planungsstand:** Konzeptentwurf · **Umfang:** Später

## User Story

Als Beirat möchte ich Angebote zum gleichen Leistungsstand vergleichen, damit ich eine spätere Beschaffungsentscheidung nachvollziehbar vorbereite.

## Akzeptanzkriterien

1. Spätere Spezifikation muss Leistungsfassung, Anbieter, Ausschlüsse, Termine, unbekannte Werte und Auswahlbegründung unterscheiden.
2. Null, ein und mehrere Angebote bleiben bearbeitbar; keine automatische Anbieterwahl.
3. Story ist grober Ausbaukandidat; Anfrage, Auftrag, Nachträge und formelle Abnahme benötigen weiteres Refinement anhand PRD 1.0.

## Herkunft und Regeln

Alt FR-06/07; US-03 Kontext. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-11 - Nachricht und Original zuordnen]]

## Refinementgrenze

Noch grob; vor Aufnahme in ein Release fachliche Detailfälle und offene Scopefragen klären. Keine Entwicklungsfreigabe.

## Business Rules

[[DF-17 - Angebotsfassungen und Vergleich]].
