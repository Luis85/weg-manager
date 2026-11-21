---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 87000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-05-Obsidian]]"
release: ""
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
entities: []
business-rules: []
decisions: []
hypotheses: []
pages: []
user-flows: []
dependsOn:
  - "[[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]]"
triage: ready-for-agent
---

# PBI-59 · Entwicklerdokumentation an die neue Architektur anpassen

**Planungsstand:** Technischer Folgepunkt aus dem Plan `docs/plans/pre-feature-improvement-plan.md` (Schritt 4.1)

## User Story

Als Beirat möchte ich, dass die Entwicklerdokumentation zum tatsächlichen Plugin passt, damit neue Funktionen nach denselben Regeln entstehen und nicht nach veralteten Anleitungen.

## Ausgangslage

Blueprint und Handoff unter `docs/plans/` beschreiben in Teilen einen Stand, den es nicht mehr gibt. `docs/engineering/architecture.md` und `docs/engineering/adding-a-feature.md` beschreiben noch die Shell ohne Module, ohne Notizspeicher und ohne Routen.

## Akzeptanzkriterien

1. Blueprint und Handoff sind in eine Archivnote verschoben, die ihren Stand und das Datum nennt; `docs/plans/` behält nur den, der noch gilt.
2. `docs/engineering/architecture.md` folgt ADR 0006 bis 0008 (`docs/adr/0006-module-structure.md`, `docs/adr/0007-vault-data-access.md`, `docs/adr/0008-navigation-and-view-state.md`): Module, Notizspeicher, Index, Navigation.
3. `docs/engineering/adding-a-feature.md` beschreibt den Weg eines neuen Moduls entlang des Durchstichs aus [[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]], einschließlich der Checkliste für Ansichten.
4. Alle Verweise in `AGENTS.md` und `docs/` auf verschobene oder umbenannte Dokumente sind angepasst.

## Herkunft und Bezüge

Plan `docs/plans/pre-feature-improvement-plan.md`, Schritt 4.1 (nach Schritt 3.6, wegen der Funktionsanleitung). Regeln zur Ablage: `docs/README_DOCS.md`.

## Kommentare

- 21.11.2026: Angelegt als offener Schritt des Plans `docs/plans/pre-feature-improvement-plan.md`. Bereit zur Umsetzung; die Reihenfolge steht in `dependsOn`.
