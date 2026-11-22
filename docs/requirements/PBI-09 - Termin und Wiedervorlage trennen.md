---
type: PBI
parent: "[[F-04 - Termine und eigene Schritte führen]]"
order: 14000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-02-Verwaltung]]"
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
  - "[[docs/entities/ENT-02 - Person und Rolle]]"
  - "[[docs/entities/ENT-04 - Vorgang]]"
  - "[[docs/entities/ENT-05 - Termin]]"
  - "[[docs/entities/ENT-06 - Verlaufseintrag]]"
  - "[[docs/entities/ENT-07 - Quelle]]"
  - "[[docs/entities/ENT-12 - To-do]]"
business-rules:
  - "[[docs/business-rules/DF-02 - Bearbeitung, Terminprüfung und Bewertung]]"
  - "[[docs/business-rules/DF-03 - Terminbedeutung]]"
  - "[[docs/business-rules/DF-04 - Fehlender Termin]]"
  - "[[docs/business-rules/DF-05 - Eskalationsleiter und Fristen]]"
  - "[[docs/business-rules/DF-06 - Reaktion und Pause]]"
decisions:
  - "[[docs/decisions/K-03 - Einzeln erledigbarer Vorgang als Kerneinheit]]"
  - "[[docs/decisions/K-06 - Eskalation an Versand und Fristen ausrichten]]"
hypotheses:
  - "[[docs/hypothesis/H-01 - Beiratsfokus deckt den ersten Pilotbedarf]]"
  - "[[docs/hypothesis/H-02 - Einzelne Vorgänge machen den Arbeitsstand verständlich]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-03 - Vorgänge und Vorgangsakte]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-02 - Wochenarbeit geführt]]"
---

# PBI-09 · Termin und Wiedervorlage trennen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich fachliche Termine mit Herkunft und eine eigene Wiedervorlage führen, damit Nachfassen keine zugesagte Frist verändert.

## Akzeptanzkriterien

1. Zugesagter, vertraglicher, als formell angegebener und gewünschter Termin sowie Wiedervorlage sind unterscheidbar.
2. Bei fehlendem Fremdtermin sind Klärungsstand, Verantwortlicher und eigene nächste Handlung mit Wiedervorlage sichtbar.
3. Überfälligkeit eines Datums ohne Uhrzeit erscheint ab dem Folgetag in Europe/Berlin; geschlossene Vorgänge werden nicht als aktuell offen behandelt.
4. Eine unbekannte Zusagezeit wird nicht als Alter null berechnet; Import setzt das Alter nicht zurück.

## Herkunft und Regeln

P FR-V2/V5; US-04; DF-03/04/05. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-05 - Einen Vorgang erfassen und wiederfinden]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-02 - Bearbeitung, Terminprüfung und Bewertung]], [[DF-03 - Terminbedeutung]], [[DF-04 - Fehlender Termin]].
