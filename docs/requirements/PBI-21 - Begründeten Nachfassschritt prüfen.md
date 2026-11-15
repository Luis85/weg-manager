---
type: PBI
parent: "[[F-09 - Verwaltungszusagen nachfassen]]"
order: 33000
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
  - "[[docs/design/entities/ENT-04 - Punkt]]"
  - "[[docs/design/entities/ENT-05 - Termin]]"
  - "[[docs/design/entities/ENT-06 - Ereignis]]"
  - "[[docs/design/entities/ENT-07 - Quelle]]"
  - "[[docs/design/entities/ENT-11 - Versanddokumentation]]"
  - "[[docs/design/entities/ENT-13 - Nachfassstand]]"
business-rules:
  - "[[docs/business-rules/DF-03 - Terminbedeutung]]"
  - "[[docs/business-rules/DF-04 - Fehlender Termin]]"
  - "[[docs/business-rules/DF-05 - Nachfassfristen und Stufen]]"
  - "[[docs/business-rules/DF-06 - Reaktion und Pause]]"
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-06 - Nachfassen an Versand und Fristen ausrichten]]"
hypotheses:
  - "[[docs/hypothesis/H-01 - Beiratsfokus deckt den ersten Pilotbedarf]]"
  - "[[docs/hypothesis/H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-02 - Wochenarbeit]]"
  - "[[docs/design/sitemap/VIEW-04 - Postausgang]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-02 - Wochenarbeit geführt]]"
  - "[[docs/design/user-flows/FLOW-05 - Senden, dokumentieren und nachhalten]]"
---

# PBI-21 · Begründeten Nachfassschritt prüfen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich für offene Verwaltungszusagen einen begründeten Nachfassvorschlag sehen, damit ausbleibende Reaktionen nicht unsichtbar werden.

## Akzeptanzkriterien

1. Vorschlag benennt auslösende Zusage, bekannten Versand, geltenden Termin, Quellenstand und Stufe.
2. Am 16.11. dokumentierter Versand mit Antworttermin 30.11. führt am 23.11. nicht wegen Wochenwechsel zur nächsten Stufe.
3. Entwurf ohne Versand startet keine Reaktionsfrist; wiederholtes Prüfen vollzieht keinen Schritt.
4. Termin erfragen, Antworttermin vorschlagen, förmlich nachfassen und Bericht/ETV vormerken bleiben Arbeitsvorschläge mit menschlicher Prüfung.

## Herkunft und Regeln

P FR-L1/L2/L3; US-10; DF-03/04/05/08. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-09 - Termin und Wiedervorlage trennen]], [[PBI-12 - Ereignisse nachvollziehen]], [[PBI-20 - Tatsächlichen Versand dokumentieren]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-03 - Terminbedeutung]], [[DF-04 - Fehlender Termin]], [[DF-05 - Nachfassfristen und Stufen]], [[DF-08 - Quellenabdeckung]].
