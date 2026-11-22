---
type: PBI
parent: "[[F-11 - Vertraulichkeit und gezielte Übergabe]]"
order: 41000
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
  - "[[docs/entities/ENT-06 - Verlaufseintrag]]"
  - "[[docs/entities/ENT-07 - Quelle]]"
  - "[[docs/entities/ENT-08 - Dokument]]"
  - "[[docs/entities/ENT-16 - Beiratsbewertung]]"
business-rules:
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-11 - Sachstand und Bewertung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
decisions:
  - "[[docs/decisions/K-07 - Sachstand gezielt teilen und Bewertungen intern halten]]"
hypotheses:
  - "[[docs/hypothesis/H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]"
  - "[[docs/hypothesis/H-05 - Manuelle Eingangsübernahme bleibt alltagstauglich]]"
pages:
  - "[[docs/design/sitemap/VIEW-02 - Wochenarbeit]]"
  - "[[docs/design/sitemap/VIEW-03 - Vorgänge und Vorgangsakte]]"
  - "[[docs/design/sitemap/VIEW-06 - Sachstand ausgeben]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-02 - Wochenarbeit geführt]]"
  - "[[docs/design/user-flows/FLOW-04 - Schnell erfassen und Eingang sichten]]"
  - "[[docs/design/user-flows/FLOW-07 - Sachstand gezielt ausgeben]]"
---

# PBI-26 · Unterlagen einstufen und korrigieren

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich den Prüf- und Vertraulichkeitsstand von Inhalten festhalten, damit ungeprüfte Angaben nicht unbemerkt nach außen gelangen.

## Akzeptanzkriterien

1. Sachinformation, interne Bewertung und vertrauliche Unterlage sind unterscheidbar.
2. Ungeprüfte und als privat eingestufte Inhalte sind von externer Übernahme standardmäßig ausgeschlossen.
3. Eine menschliche Korrektur der Einstufung bleibt nachvollziehbar; automatische Hinweise behaupten keine vollständige Erkennung.
4. Ein verschobenes Original wird nicht als anonymisiert bezeichnet.

## Herkunft und Regeln

P FR-E3/E4/ROL1; P NFR-2; US-12; DF-10/11. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-11 - Nachricht und Original zuordnen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-10 - Vertraulichkeitsprüfung]].
