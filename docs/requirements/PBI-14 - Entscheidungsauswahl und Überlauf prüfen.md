---
type: PBI
parent: "[[F-06 - Wochenpaket vorbereiten]]"
order: 22000
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
  - "[[docs/design/entities/ENT-04 - Punkt]]"
  - "[[docs/design/entities/ENT-05 - Termin]]"
  - "[[docs/design/entities/ENT-09 - Arbeitsentscheidung]]"
  - "[[docs/design/entities/ENT-14 - Wochenübergabe]]"
business-rules:
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
  - "[[docs/business-rules/DF-09 - Begrenzte Auswahl und Dringlichkeit]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-04 - Wochenpaket beim Einstieg aktualisieren]]"
  - "[[docs/decisions/K-05 - Sieben reguläre Entscheidungen mit sichtbarem Überlauf]]"
hypotheses:
  - "[[docs/hypothesis/H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]"
  - "[[docs/hypothesis/H-04 - Sieben Entscheidungen sind ein brauchbares Arbeitsbudget]]"
pages:
  - "[[docs/design/sitemap/VIEW-02 - Wochenarbeit]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-02 - Wochenarbeit geführt]]"
---

# PBI-14 · Entscheidungsauswahl und Überlauf prüfen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich eine begrenzte priorisierte Auswahl und alle dringenden Ausnahmen sehen, damit ich Aufmerksamkeit steuere ohne Risiken zu übersehen.

## Akzeptanzkriterien

1. Bis sieben reguläre Entscheidungen insgesamt über beide Gemeinschaften; jede zeigt ihren Kontext.
2. Auswahlgrund berücksichtigt dringliche Fristen, letzte Schwerpunkte und Alter; unbekanntes Alter bleibt unbekannt.
3. Neun vor der nächsten Sitzung dringliche Fälle bleiben alle sichtbar, auch bei sieben regulären Karten.
4. Nicht gewählte reguläre Arbeit bleibt als Rückstand sichtbar; kein eigener Aufräummodus ist vorausgesetzt.

## Herkunft und Regeln

P FR-W2/W9; US-06; DF-09. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-13 - Aktuelle Wochenlage öffnen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-09 - Begrenzte Auswahl und Dringlichkeit]].
