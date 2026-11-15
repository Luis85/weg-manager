---
type: PBI
parent: "[[F-15 - Auswertungen und Feedback vertiefen]]"
order: 57000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-02-Verwaltung]]"
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
  - "[[docs/design/entities/ENT-04 - Punkt]]"
  - "[[docs/design/entities/ENT-05 - Termin]]"
  - "[[docs/design/entities/ENT-06 - Ereignis]]"
  - "[[docs/design/entities/ENT-07 - Quelle]]"
business-rules:
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
  - "[[docs/business-rules/DF-14 - Kennzahlen]]"
decisions:
  - "[[docs/decisions/K-06 - Nachfassen an Versand und Fristen ausrichten]]"
  - "[[docs/decisions/K-07 - Sachstand gezielt teilen und Bewertungen intern halten]]"
hypotheses:
  - "[[docs/hypothesis/H-01 - Beiratsfokus deckt den ersten Pilotbedarf]]"
  - "[[docs/hypothesis/H-11 - Der Nutzen führt zu erneuter Verwendung]]"
pages: []
user-flows: []
---

# PBI-36 · Abgegrenzte Zeiträume auswerten

**Planungsstand:** Konzeptentwurf · **Umfang:** Später

## User Story

Als Beirat möchte ich Antwort- und Erfüllungsdauer getrennt auswerten, damit ich Verzögerungen sachlich bespreche.

## Akzeptanzkriterien

1. Anfrage 01.11., Bestätigung 02.11. und sachliche Antwort 05.11. ergeben getrennt einen und vier Kalendertage.
2. Offene Fälle werden als offen und mit bekanntem Alter gezeigt, nicht als null Tage gemittelt.
3. Zeitraum Angebot bis Beschluss wird Durchlaufzeit genannt; Einheit, Ereignispaare, Zeitraum und Quelle sind sichtbar.

## Herkunft und Regeln

P FR-V6; P G3; US-18; DF-14. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-12 - Ereignisse nachvollziehen]]

## Refinementgrenze

Noch grob; vor Aufnahme in ein Release fachliche Detailfälle und offene Scopefragen klären. Keine Entwicklungsfreigabe.

## Business Rules

[[DF-14 - Kennzahlen]].
