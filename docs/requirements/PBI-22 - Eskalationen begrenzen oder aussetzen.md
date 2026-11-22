---
type: PBI
parent: "[[F-09 - Verwaltungszusagen nachfassen]]"
order: 34000
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
  - "[[docs/entities/ENT-01 - Gemeinschaft]]"
  - "[[docs/entities/ENT-04 - Vorgang]]"
  - "[[docs/entities/ENT-05 - Termin]]"
  - "[[docs/entities/ENT-09 - Entscheidungskarte]]"
  - "[[docs/entities/ENT-13 - Eskalation]]"
business-rules:
  - "[[docs/business-rules/DF-01 - Beiratsarbeit und Befugnis]]"
  - "[[docs/business-rules/DF-03 - Terminbedeutung]]"
  - "[[docs/business-rules/DF-05 - Eskalationsleiter und Fristen]]"
  - "[[docs/business-rules/DF-06 - Reaktion und Pause]]"
  - "[[docs/business-rules/DF-07 - Wahl, Entwurf und Versand]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-02 - Zwei Gemeinschaften für einen Bearbeiter]]"
  - "[[docs/decisions/K-05 - Sieben reguläre Entscheidungen mit sichtbarem Überlauf]]"
  - "[[docs/decisions/K-06 - Eskalation an Versand und Fristen ausrichten]]"
hypotheses:
  - "[[docs/hypothesis/H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]"
  - "[[docs/hypothesis/H-04 - Sieben Entscheidungen sind ein brauchbares Arbeitsbudget]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-02 - Wochenarbeit]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-02 - Wochenarbeit geführt]]"
  - "[[docs/design/user-flows/FLOW-05 - Senden, dokumentieren und nachhalten]]"
---

# PBI-22 · Eskalationen begrenzen oder aussetzen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich die Eskalationen der Woche je Gemeinschaft mit Einzelausnahmen prüfen, damit ich angemessen reagieren kann.

## Akzeptanzkriterien

1. Die Entscheidung über die Eskalationen der Woche bleibt je betroffenem Vorgang nachvollziehbar; ein akuter Einzelfall kann abweichen.
2. Pause enthält Grund und Wiederaufnahmedatum; kritische Fristen bleiben sichtbar.
3. Nach Ablauf wird neu geprüft, ohne mehrere Stufen automatisch zu überspringen.
4. Die Freigabe der Eskalationen der Woche ist weder Versand noch vollzogene rechtliche Maßnahme.

## Herkunft und Regeln

P FR-L3/L5; US-10; DF-05/06/12. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-21 - Begründeten Eskalationsschritt prüfen]], [[PBI-16 - Wahl mit Kontextnotiz bestätigen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-05 - Eskalationsleiter und Fristen]], [[DF-06 - Reaktion und Pause]].
