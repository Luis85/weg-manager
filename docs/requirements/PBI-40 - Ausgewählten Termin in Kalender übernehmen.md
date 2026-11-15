---
type: PBI
parent: "[[F-18 - Integrationen]]"
order: 64000
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
  - "[[docs/design/entities/ENT-04 - Punkt]]"
  - "[[docs/design/entities/ENT-05 - Termin]]"
  - "[[docs/design/entities/ENT-12 - Eigene Aufgabe]]"
  - "[[docs/design/entities/ENT-15 - Ausgabestand]]"
business-rules:
  - "[[docs/business-rules/DF-03 - Terminbedeutung]]"
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-11 - Sachstand und Bewertung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]"
hypotheses:
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
  - "[[docs/hypothesis/H-11 - Der Nutzen führt zu erneuter Verwendung]]"
pages: []
user-flows: []
---

# PBI-40 · Ausgewählten Termin in Kalender übernehmen

**Planungsstand:** Konzeptentwurf · **Umfang:** Später

## User Story

Als Beirat möchte ich einen ausgewählten Termin bewusst in meinen Kalender übernehmen, damit ich ihn außerhalb der App wiederfinde.

## Akzeptanzkriterien

1. Fälligkeit und Wiedervorlage sind auswählbar; Ausgabe ist eine Momentaufnahme und keine zugesagte Synchronisation.
2. Interne Notizen und private Anlagen werden nicht automatisch mitgegeben.
3. Format und mobile Nutzung erst im späteren Refinement bestimmen; ICS aus PRD 1.0 bleibt Option.

## Herkunft und Regeln

Alt FR-15. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-09 - Termin und Wiedervorlage trennen]]

## Refinementgrenze

Noch grob; vor Aufnahme in ein Release fachliche Detailfälle und offene Scopefragen klären. Keine Entwicklungsfreigabe.
