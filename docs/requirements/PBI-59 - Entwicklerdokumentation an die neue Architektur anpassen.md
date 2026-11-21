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
finished: 2026-11-21
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
triage: ""
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
- 21.11.2026: Abgeschlossen. Stand der Umsetzung:
  - **Archiv:** Blueprint und Handoff liegen unter `docs/plans/archive/`. Jede Note nennt oben, dass sie ein historischer Stand vom 21.11.2026 ist, und verweist auf die geltende Dokumentation; ihr Inhalt blieb bis auf zwei Pfade der Handoff-Links unverändert. `docs/plans/` hält nur den Verbesserungsplan. `docs/README_DOCS.md` führt den neuen Ordner (Kriterium 1).
  - **Architektur:** `docs/engineering/architecture.md` ist neu geordnet und folgt ADR 0006 bis 0008 (Module, Notizspeicher, Codec, Index, Navigation). Die Mermaid-Diagramme zeigen Schichten, Module, den Lebenszyklus mit `VaultReady`, den Index und `getState`/`setState`. Jeder Pfad, Bezeichner und jedes Skript in den Leitfäden wurde gegen das Repository geprüft; was zum Demo oder zu früheren Ständen gehörte, ist entfernt, Doppelungen sind zusammengeführt (Kriterium 2).
  - **Funktion hinzufügen:** `docs/engineering/adding-a-feature.md` führt entlang des Durchstichs von [[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]] mit den echten Dateien je Schritt, der Liste der Kompositionszeilen und der Checkliste für Ansichten (Kriterium 3).
  - **Verweise:** ADR 0001, 0002 und 0004 bis 0008 haben kurze, datierte Nachträge, wo spätere Schritte Aussagen überholt haben (Pfade, Durchsetzung durch ESLint, Auswahl und Wechsel im Modul `communities`). Verweise in `docs/`, `README.md` und `AGENTS.md` auf verschobene Dokumente und Pfade sind angepasst (Kriterium 4).
  - **Plan und README:** Der Verbesserungsplan nennt je Schritt die Pull Requests und in Abschnitt 5 je Kriterium den Stand mit Beleg. Die `README.md` beschreibt Befehle, Struktur und den heutigen Funktionsumfang (nur Gemeinschaften).
  - **Offen, nicht Teil dieses PBIs:** die manuelle Prüfung im eigenen Vault (Tastatur, Screenreader, Themes, andere Plugins), `CI / e2e` als Pflichtprüfung (Einstellung des Eigentümers, siehe PBI-58 Kriterium 5) und die Vorabversion 0.2.0.
