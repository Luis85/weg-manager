---
type: PBI
parent: "[[F-07 - Arbeitsentscheidungen treffen]]"
order: 25000
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
  - "[[docs/design/entities/ENT-06 - Ereignis]]"
  - "[[docs/design/entities/ENT-09 - Arbeitsentscheidung]]"
business-rules:
  - "[[docs/business-rules/DF-01 - Beiratsarbeit und Befugnis]]"
  - "[[docs/business-rules/DF-07 - Wahl, Entwurf und Versand]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-15 - Arbeitsentscheidung und Beschluss]]"
decisions:
  - "[[docs/decisions/K-01 - Beirat als erster Produkteinstieg]]"
  - "[[docs/decisions/K-04 - Wochenpaket beim Einstieg aktualisieren]]"
hypotheses:
  - "[[docs/hypothesis/H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]"
  - "[[docs/hypothesis/H-06 - Vorbereitete Wochenarbeit ist ohne verpflichtende KI nützlich]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-02 - Wochenarbeit]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-02 - Wochenarbeit geführt]]"
---

# PBI-16 · Wahl mit Kontextnotiz bestätigen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich meine Wahl mit einer ergänzenden Notiz bestätigen, damit die Folgearbeit meine Absicht berücksichtigt.

## Akzeptanzkriterien

1. Wahl, Notiz, Zeitpunkt, Gemeinschaft und betroffene Punkte werden gemeinsam festgehalten.
2. Mehrere Entscheidungen können intern übernommen werden; die Aktion versendet nichts.
3. Vertagen bewahrt offenen Bedarf und nächsten Prüfzeitpunkt; kein Punkt wird dadurch erledigt.

## Herkunft und Regeln

P FR-W4; US-08; DF-01/07/15. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-15 - Eine Entscheidungsvorlage prüfen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-01 - Beiratsarbeit und Befugnis]], [[DF-07 - Wahl, Entwurf und Versand]], [[DF-15 - Arbeitsentscheidung und Beschluss]].
