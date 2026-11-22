---
type: PBI
parent: "[[F-07 - Entscheidungskarten entscheiden]]"
order: 26000
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
  - "[[docs/entities/ENT-09 - Entscheidungskarte]]"
  - "[[docs/entities/ENT-10 - Nachrichtenentwurf]]"
  - "[[docs/entities/ENT-11 - Versanddokumentation]]"
  - "[[docs/entities/ENT-12 - To-do]]"
business-rules:
  - "[[docs/business-rules/DF-07 - Wahl, Entwurf und Versand]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-04 - Wochenpaket beim Einstieg aktualisieren]]"
  - "[[docs/decisions/K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]"
hypotheses:
  - "[[docs/hypothesis/H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]"
  - "[[docs/hypothesis/H-06 - Vorbereitete Wochenarbeit ist ohne verpflichtende KI nützlich]]"
pages:
  - "[[docs/design/sitemap/VIEW-02 - Wochenarbeit]]"
  - "[[docs/design/sitemap/VIEW-03 - Vorgänge und Vorgangsakte]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-02 - Wochenarbeit geführt]]"
---

# PBI-17 · Folgearbeit aus Entscheidungen vorbereiten

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich passende Texte und Aufgaben aus bestätigten Entscheidungen erhalten, damit ich nicht dieselbe Entscheidung mehrfach übertragen muss.

## Akzeptanzkriterien

1. Texte und konkrete Aufgaben berücksichtigen tatsächliche Wahl und Notiz; ihr Entscheidungsbezug ist sichtbar.
2. Wiederholung erzeugt keine doppelten Aufgaben oder Entwürfe.
3. Geänderte oder zurückgenommene Entscheidungen markieren frühere Folgefassungen als überholt und erneut prüfbedürftig.
4. Bereits dokumentierter tatsächlicher Versand wird durch eine neue Entscheidung nicht rückwirkend geändert.

## Herkunft und Regeln

P FR-W5; US-08; DF-07. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-16 - Wahl mit Kontextnotiz bestätigen]], [[PBI-10 - Eigenes To-do nachhalten]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-07 - Wahl, Entwurf und Versand]].
