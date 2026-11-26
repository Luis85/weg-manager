---
type: PBI
parent: "[[F-04 - Termine und eigene Schritte führen]]"
order: 15000
actors:
  - "[[ACT-01-Beirat]]"
release: "[[MVP - Beirat Support]]"
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
  - "[[docs/entities/ENT-02 - Person und Rolle]]"
  - "[[docs/entities/ENT-04 - Vorgang]]"
  - "[[docs/entities/ENT-05 - Termin]]"
  - "[[docs/entities/ENT-12 - To-do]]"
business-rules:
  - "[[docs/business-rules/DF-03 - Terminbedeutung]]"
  - "[[docs/business-rules/DF-04 - Fehlender Termin]]"
  - "[[docs/business-rules/DF-06 - Reaktion und Pause]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-01 - Beirat als erster Produkteinstieg]]"
  - "[[docs/decisions/K-03 - Einzeln erledigbarer Vorgang als Kerneinheit]]"
  - "[[docs/decisions/K-06 - Eskalation an Versand und Fristen ausrichten]]"
hypotheses:
  - "[[docs/hypothesis/H-01 - Beiratsfokus deckt den ersten Pilotbedarf]]"
  - "[[docs/hypothesis/H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-02 - Wochenarbeit]]"
  - "[[docs/design/sitemap/VIEW-03 - Vorgänge und Vorgangsakte]]"
  - "[[docs/design/sitemap/VIEW-05 - Erfassen]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-02 - Wochenarbeit geführt]]"
  - "[[docs/design/user-flows/FLOW-04 - Schnell erfassen und Eingang sichten]]"
---

# PBI-10 · Eigenes To-do nachhalten

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich meinen nächsten Arbeitsschritt getrennt von der fremden Zusage erledigen, damit ich meinen Anteil zuverlässig fortführe.

## Akzeptanzkriterien

1. Das To-do kennt Gemeinschaft, optionalen Vorgangsbezug, Verantwortlichen, Zustand und Fälligkeit beziehungsweise Wiedervorlage.
2. Offen, in Arbeit, wartend, erledigt und entfallen sind unterscheidbar; Warten braucht Grund und Wiedervorlage, Entfallen einen Grund.
3. Erledigen eines To-dos zu Versand oder Prüfung bestätigt keine Erfüllung der Verwaltungszusage.
4. Offene Vorgänge ohne nächsten Schritt erscheinen in einer Klärungsliste.

## Herkunft und Regeln

Alt FR-04; P FR-W5; US-04/08; DF-04/06. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-05 - Einen Vorgang erfassen und wiederfinden]], [[PBI-09 - Termin und Wiedervorlage trennen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-04 - Fehlender Termin]].

## Kommentare

- 26.11.2026: Entscheidungen des Produktverantwortlichen und Umsetzungsfreigabe für einen ersten Schnitt.
  - **Zustände:** offen, wartend, erledigt und entfallen. Warten braucht einen Grund und eine Wiedervorlage, Entfallen einen Grund. „In Arbeit“ entfällt (wie O-ENT12-2).
  - **Ort:** Ein Segment „Vorgänge | To-dos“ in der Ansicht Vorgänge, wie VIEW-03, mit Schnelleingabe und Gruppen „Überfällig“, „Diese Woche“, „Später“. Der Verlauf eines Vorgangs zeigt seine To-dos.
  - **Klärungsliste (Kriterium 4):** Ein offener oder ungeklärter Vorgang ohne offenes oder wartendes To-do erscheint in der Klärungsliste. Der nächste Schritt am Vorgang bleibt Pflicht.
  - **Verantwortlich:** der Beirat als Vorgabe oder ein Kontakt der Gemeinschaft, wie der Akteur eines Verlaufseintrags.
- 26.11.2026 (Umsetzung des ersten Schnitts): Erfüllt sind Kriterium 1 (das To-do ist eine eigene Notiz `weg-manager.todo/v1`, [[DV-04 - To-do v1]], mit Gemeinschaft, optionalem Vorgang derselben Gemeinschaft, Verantwortlichem – Beirat oder Kontakt –, Zustand, Fälligkeit und Wiedervorlage), 2 (offen, wartend, erledigt und entfallen; Warten braucht Grund und Wiedervorlage, Entfallen einen Grund; „in Arbeit“ entfällt nach der Entscheidung), 3 („Erledigt“ schreibt nur das To-do, nie den Vorgang) und 4 (die Klärungsliste im Segment „To-dos“ zeigt offene und ungeklärte Vorgänge ohne offenes oder wartendes To-do und legt per Knopf eines an, vorbelegt mit dem nächsten Schritt). Die To-dos stehen im Segment „Vorgänge | To-dos“ der Ansicht Vorgänge, mit Schnelleingabe und den Gruppen „Überfällig“, „Diese Woche“ (bis Sonntag), „Später“, Erledigtes eingeklappt; der Verlauf eines Vorgangs zeigt seine To-dos. Nicht im Schnitt: Herkunft je To-do (Entscheidung, Übergabe) und der Entwurf am To-do (ENT-10). Tests: `tests/unit/domain/matters/todo.test.ts`, `tests/unit/application/matters/todos.test.ts`, `tests/dom/presentation/matters/todos.test.ts`, `tests/e2e/specs/todos.e2e.ts`.
