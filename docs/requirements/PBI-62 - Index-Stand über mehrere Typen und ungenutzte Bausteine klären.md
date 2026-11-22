---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 90000
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
dependsOn: []
triage: ready-for-agent
---

# PBI-62 · Index-Stand über mehrere Typen und ungenutzte Bausteine klären

**Planungsstand:** Zweiter Befund entschieden am 22.11.2026 (Lesepfad behalten, Rest löschen); der erste wartet auf den zweiten Notiztyp · **Bezug:** `docs/plans/pre-feature-improvement-plan.md` (Abschnitt 8, Review-Runde vom 22.11.2026)

## User Story

Als Beirat möchte ich, dass eine Ansicht, die mehrere Arten von Notizen zusammen zeigt, nie einen halben Stand zeigt, damit zusammengehörige Angaben nicht kurz widersprüchlich erscheinen.

## Ausgangslage

**Befund 1 (C3): Stand je Typ.** Der Index veröffentlicht je Notiztyp einen eigenen Stand und setzt sie nacheinander (`src/application/notes/index-live.ts`, Funktion `publish`). Eine Ansicht, die Punkte mit Ansprechpartnern verbindet, kann kurz den einen Typ aktualisiert sehen und den anderen noch nicht. Außerdem wird eine abgeleitete Liste für jeden Abonnenten neu berechnet: `communityListChanges` ist ein `Stream.map`, den der Gemeinschaftswechsel und der Bildschirm je für sich durchlaufen. Der Reviewer konnte keinen sichtbaren Fehler nachweisen; es gibt heute nur einen Typ.

**Befund 2 (C4): ungenutzte Bausteine.** Am Stand vom 22.11.2026 nutzt nichts in `src` diese Teile:

- `useQuery` und `useAppEvents` (`src/presentation/shell/runtime/`), nur über den Index des Moduls exportiert,
- `EventBus.events` und `on`,
- `isMarkdown` (`src/application/shell/events.ts`),
- die Ereignisse `ActiveFileChanged` und `ColorSchemeChanged`: Der Adapter veröffentlicht sie, niemand verarbeitet sie. Das Theme folgt stattdessen einem MutationObserver (`src/presentation/shell/theme.ts`).

Sie sind getestet und billig, aber ohne Nutzer.

## Akzeptanzkriterien

1. Ein DOM-Test schreibt in einem Schub Notizen zweier Typen (eine Notiz und eine, die auf sie verweist) und zeigt, ob eine Ansicht einen Zwischenstand sieht. Der Test entsteht mit dem zweiten Notiztyp.
2. Zeigt der Test einen Zwischenstand: Der Index hält einen gemeinsamen Stand für alle Typen mit Auswahlfunktionen je Typ, und abgeleitete Listen liegen in einem Dienst statt je Abonnent neu berechnet zu werden. Zeigt er keinen, wird das Ergebnis hier festgehalten und nichts umgebaut.
3. Für die ungenutzten Bausteine ist entschieden: behalten oder löschen, bis es einen Nutzer gibt. Bei „löschen“ verschwinden Code, Tests und Erwähnungen in `docs/engineering/architecture.md` zusammen.
4. `npm run verify` endet mit Exit 0.

## Entscheidung (22.11.2026)

Ungenutzte Bausteine: **`useQuery` und `useAppEvents` bleiben**, weil `AGENTS.md` `useQuery` als Lesepfad der Komponenten nennt und die nächste Funktion ihn braucht. **Gelöscht werden** die Ereignisse `ActiveFileChanged` und `ColorSchemeChanged`, `isMarkdown` sowie `EventBus.events` und `on`, jeweils mit Tests und Erwähnungen in `docs/engineering/architecture.md`. Sie kommen zurück, wenn etwas sie braucht. Umsetzung vor dem Tag 0.2.0.

## Herkunft und Bezüge

Architektur-Review vom 22.11.2026, Optionen C3 und C4. [[PBI-54 - Index der Notizen aufbauen und aktuell halten]], [[PBI-50 - Grundlage für Vault-Ereignisse und Indexierung]].

## Kommentare

- 22.11.2026: Angelegt aus der Review-Runde nach dem Durchstich (vier unabhängige Reviews am Stand `0cb8292`). Die Befunde stammen aus den Review-Berichten und den Berichten der Umsetzer; nichts davon ist bisher umgesetzt, soweit die Note es nicht anders sagt.
- 22.11.2026 (Interview nach der Review-Runde): Entscheidung zu Kriterium 3 eingetragen; `triage` auf `ready-for-agent`. Die Kriterien 1 und 2 entstehen mit dem zweiten Notiztyp.
