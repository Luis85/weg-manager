---
type: PBI
parent: "[[F-14 - Berichte und Versammlungsvorbereitung]]"
order: 54000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-03-Eigentuemer]]"
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
  - "[[docs/entities/ENT-01 - Gemeinschaft]]"
  - "[[docs/entities/ENT-04 - Vorgang]]"
  - "[[docs/entities/ENT-06 - Verlaufseintrag]]"
  - "[[docs/entities/ENT-07 - Quelle]]"
  - "[[docs/entities/ENT-13 - Eskalation]]"
  - "[[docs/entities/ENT-15 - Ausgabestand]]"
  - "[[docs/entities/ENT-16 - Beiratsbewertung]]"
business-rules:
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-11 - Sachstand und Bewertung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-14 - Kennzahlen]]"
decisions:
  - "[[docs/decisions/K-07 - Sachstand gezielt teilen und Bewertungen intern halten]]"
hypotheses:
  - "[[docs/hypothesis/H-01 - Beiratsfokus deckt den ersten Pilotbedarf]]"
  - "[[docs/hypothesis/H-09 - Eine ausgewählte Übergabe ist ohne Hintergrundwissen verständlich]]"
pages: []
user-flows: []
---

# PBI-34 · Quartalsüberblick zusammenstellen

**Planungsstand:** Konzeptentwurf · **Umfang:** Später

## User Story

Als Beirat möchte ich einen gemeinschaftsbezogenen Quartalsüberblick vorbereiten, damit Eigentümer einen verständlichen Verlauf erhalten.

## Akzeptanzkriterien

1. Zeitraum, Gemeinschaft und bewusst gewählte Sachinformationen sind erkennbar; DE/EN geben denselben Stand wieder.
2. Interne Antwortzeitbewertungen, Eskalationsstufen und Notizen werden erst nach gesondert definierter Empfängerfreigabe aufgenommen.
3. Vor Refinement muss O-07 entschieden werden; keine vollständige Berichtsfunktion im ersten MVP.

## Herkunft und Regeln

P FR-B1; US-17; DF-11/14. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-29 - Sachstand lesbar übergeben]]

## Refinementgrenze

Noch grob; vor Aufnahme in ein Release fachliche Detailfälle und offene Scopefragen klären. Keine Entwicklungsfreigabe.

## Business Rules

[[DF-11 - Sachstand und Bewertung]].
