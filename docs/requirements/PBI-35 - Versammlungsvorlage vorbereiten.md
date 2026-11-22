---
type: PBI
parent: "[[F-14 - Berichte und Versammlungsvorbereitung]]"
order: 55000
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
  - "[[docs/entities/ENT-07 - Quelle]]"
  - "[[docs/entities/ENT-08 - Dokument]]"
  - "[[docs/entities/ENT-15 - Ausgabestand]]"
business-rules:
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-11 - Sachstand und Bewertung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-15 - Entscheidungskarte und Beschluss]]"
decisions:
  - "[[docs/decisions/K-01 - Beirat als erster Produkteinstieg]]"
  - "[[docs/decisions/K-07 - Sachstand gezielt teilen und Bewertungen intern halten]]"
hypotheses:
  - "[[docs/hypothesis/H-01 - Beiratsfokus deckt den ersten Pilotbedarf]]"
  - "[[docs/hypothesis/H-09 - Eine ausgewählte Übergabe ist ohne Hintergrundwissen verständlich]]"
pages: []
user-flows: []
---

# PBI-35 · Versammlungsvorlage vorbereiten

**Planungsstand:** Konzeptentwurf · **Umfang:** Später

## User Story

Als Beirat möchte ich Tagesordnungspunkte mit Optionen und Empfehlung vorbereiten, damit offene Themen geordnet besprochen werden.

## Akzeptanzkriterien

1. Vorlage unterscheidet Anlass, Optionen, Empfehlung und Quellen von einem gefassten Beschluss.
2. Der gewünschte höchstens zweiseitige Einstieg wird gegen den konkreten Berichtsbedarf geprüft.
3. Einladung, Rechtswirksamkeit und vollständige Beschluss-Sammlung sind nicht durch diese Story zugesichert.

## Herkunft und Regeln

P FR-B2; US-17; DF-15. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-29 - Sachstand lesbar übergeben]]

## Refinementgrenze

Noch grob; vor Aufnahme in ein Release fachliche Detailfälle und offene Scopefragen klären. Keine Entwicklungsfreigabe.

## Business Rules

[[DF-15 - Entscheidungskarte und Beschluss]].
