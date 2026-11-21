---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 77000
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
business-rules:
  - "[[docs/business-rules/DF-22 - Notizen als maßgeblicher Datenbestand]]"
  - "[[docs/business-rules/DF-23 - Externe Bearbeitung ohne stilles Überschreiben]]"
decisions:
  - "[[docs/decisions/K-14 - Markdown und Frontmatter als offene Datengrundlage]]"
hypotheses: []
pages: []
user-flows: []
triage: ready-for-agent
---

# PBI-50 · Grundlage für Vault-Ereignisse und Indexierung

**Planungsstand:** Technischer Folgepunkt aus dem Code-Review der Plugin-Shell · **Bezug:** B-NFR-04, B-NFR-11, B-NFR-14

## User Story

Als Beirat möchte ich, dass das Plugin Änderungen an meinen Notizen laufend mitbekommt, ohne Obsidian beim Start zu bremsen oder nach dem Deaktivieren weiterzulaufen, damit Punkte, Fristen und Wochenarbeit stets den aktuellen Dateistand zeigen.

## Ausgangslage

Es gibt nur das einmalige `markdownFileCount` (`src/application/ports.ts`, `VaultReader`; `src/infrastructure/obsidian/layers.ts`). Die Ansicht zählt einmal beim Einhängen. Fachfunktionen wie Punkte, Fristen und Wochenarbeit brauchen Dateiereignisse.

## Akzeptanzkriterien

1. Ein Port `VaultEvents` in `src/application/ports.ts` liefert einen Effect-`Stream` der Ereignisse `create`, `modify`, `delete` und `rename` (bei `rename` mit altem Pfad).
2. Die Obsidian-Umsetzung in `src/infrastructure/obsidian/` registriert `vault.on(...)` in einem scoped Layer und meldet mit `vault.offref(...)` ab; `runtime.dispose()` gibt jeden Listener frei.
3. Indexierung und Ereignisweitergabe beginnen erst nach `workspace.onLayoutReady`, weil `vault.on("create")` vorher für jede vorhandene Datei feuert; diese Startereignisse erzeugen keinen Index-Doppelbestand.
4. Die Dateianzahl im Panel folgt den Ereignissen, statt nur beim Einhängen zu zählen.
5. Tests im Obsidian-Double decken Ereignisse, Start erst nach Layout-Ready und Freigabe beim Dispose ab.
6. Ein e2e-Test legt eine Notiz an und sieht die Anzahl steigen; nach dem Deaktivieren des Plugins ist kein Listener des Plugins mehr registriert.

## Herkunft und Bezüge

Code-Review der Plugin-Shell vom 21.11.2026. Technische Grundlage für [[PBI-41 - Vorgänge ohne Plugin und Obsidian nutzen]] (Neueinlesen nach externer Änderung) und die Laufzeitgrenze aus B-NFR-11.

## Kommentare

- 21.11.2026: Kriterien 2 bis 6 sind umgesetzt, Kriterium 1 in allgemeinerer Form, siehe ADR 0004 (`docs/adr/0004-event-system.md`).
  - **Event-Bus statt eigenem Port:** Statt eines eigenen Ports `VaultEvents` gibt es einen allgemeinen `EventBus` (`src/application/event-bus.ts`) mit dem typisierten Vokabular `AppEvent` (`src/application/events.ts`). Er überträgt Datei-, Metadaten- und Workspace-Ereignisse und später auch Fachereignisse.
  - **Ereignisweitergabe nach Layout-Ready:** Die Obsidian-Anbindung (`src/infrastructure/obsidian/events.ts`) hält Ereignisse bis `LayoutReady` zurück und meldet alle Listener beim Dispose ab.
  - **Dateianzahl folgt den Ereignissen:** Die Anzahl im Panel aktualisiert sich nach Anlegen, Löschen und Umbenennen (300 ms entprellt).
  - **Tests:** Im Double, in der Plugin-Lebensdauer und e2e (`tests/e2e/specs/events.e2e.ts`).
  - **Offen:** die eigentliche Indexierung. Sie gehört zum ersten Fachfeature.

