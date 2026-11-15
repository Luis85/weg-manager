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
  - "[[docs/design/entities/ENT-01 - Gemeinschaft]]"
  - "[[docs/design/entities/ENT-02 - Ansprechpartner]]"
  - "[[docs/design/entities/ENT-04 - Punkt]]"
  - "[[docs/design/entities/ENT-05 - Termin]]"
  - "[[docs/design/entities/ENT-12 - Eigene Aufgabe]]"
business-rules:
  - "[[docs/business-rules/DF-03 - Terminbedeutung]]"
  - "[[docs/business-rules/DF-04 - Fehlender Termin]]"
  - "[[docs/business-rules/DF-06 - Reaktion und Pause]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-01 - Beirat als erster Produkteinstieg]]"
  - "[[docs/decisions/K-03 - Einzeln erledigbarer Punkt als Kerneinheit]]"
  - "[[docs/decisions/K-06 - Nachfassen an Versand und Fristen ausrichten]]"
hypotheses:
  - "[[docs/hypothesis/H-01 - Beiratsfokus deckt den ersten Pilotbedarf]]"
  - "[[docs/hypothesis/H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-02 - Wochenarbeit]]"
  - "[[docs/design/sitemap/VIEW-03 - Punkte und Punktakte]]"
  - "[[docs/design/sitemap/VIEW-05 - Erfassen]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-02 - Wochenarbeit geführt]]"
  - "[[docs/design/user-flows/FLOW-04 - Schnell erfassen und Eingang sichten]]"
---

# PBI-10 · Eigene Folgeaufgabe nachhalten

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich meinen nächsten Arbeitsschritt getrennt von der fremden Zusage erledigen, damit ich meinen Anteil zuverlässig fortführe.

## Akzeptanzkriterien

1. Aufgabe kennt Gemeinschaft, optionalen Punktbezug, Verantwortlichen, Zustand und Fälligkeit beziehungsweise Wiedervorlage.
2. Offen, in Arbeit, wartend, erledigt und entfallen sind unterscheidbar; Warten braucht Grund und Wiedervorlage, Entfallen einen Grund.
3. Erledigen der eigenen Versand- oder Prüfaufgabe bestätigt keine Erfüllung der Verwaltungszusage.
4. Offene Punkte ohne nächsten Schritt erscheinen in einer Klärungsliste.

## Herkunft und Regeln

Alt FR-04; P FR-W5; US-04/08; DF-04/06. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-05 - Einen Punkt erfassen und wiederfinden]], [[PBI-09 - Termin und Wiedervorlage trennen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-04 - Fehlender Termin]].
