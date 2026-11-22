---
type: PBI
parent: "[[F-09 - Verwaltungszusagen nachfassen]]"
order: 35000
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
  - "[[docs/entities/ENT-04 - Vorgang]]"
  - "[[docs/entities/ENT-05 - Termin]]"
  - "[[docs/entities/ENT-06 - Verlaufseintrag]]"
  - "[[docs/entities/ENT-07 - Quelle]]"
  - "[[docs/entities/ENT-13 - Eskalation]]"
business-rules:
  - "[[docs/business-rules/DF-02 - Bearbeitung, Terminprüfung und Bewertung]]"
  - "[[docs/business-rules/DF-03 - Terminbedeutung]]"
  - "[[docs/business-rules/DF-05 - Eskalationsleiter und Fristen]]"
  - "[[docs/business-rules/DF-06 - Reaktion und Pause]]"
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
decisions:
  - "[[docs/decisions/K-03 - Einzeln erledigbarer Vorgang als Kerneinheit]]"
  - "[[docs/decisions/K-06 - Eskalation an Versand und Fristen ausrichten]]"
hypotheses:
  - "[[docs/hypothesis/H-02 - Einzelne Vorgänge machen den Arbeitsstand verständlich]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-02 - Wochenarbeit]]"
  - "[[docs/design/sitemap/VIEW-03 - Vorgänge und Vorgangsakte]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-02 - Wochenarbeit geführt]]"
  - "[[docs/design/user-flows/FLOW-03 - Lagecheck unterwegs]]"
  - "[[docs/design/user-flows/FLOW-05 - Senden, dokumentieren und nachhalten]]"
---

# PBI-23 · Reaktion richtig einordnen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich eine Antwort oder einen akzeptierten neuen Termin einordnen, damit Nachfassen zum tatsächlichen Bedarf passt.

## Akzeptanzkriterien

1. Wir kümmern uns ohne Datum erzeugt weder verbindlichen Termin noch Erledigung.
2. Ein menschlich akzeptierter neuer Termin beendet aktuelles Terminnachfragen, erhält aber den offenen Punkt und den bisherigen Verlauf.
3. Bei erneuter Überschreitung wird ein begründeter neuer Vorschlag sichtbar; Teillieferung erledigt nur belegte Teile.
4. Erfüllung wird anhand des erwarteten Ergebnisses bewusst bestätigt.

## Herkunft und Regeln

P FR-L4; US-10; DF-02/06. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-21 - Begründeten Eskalationsschritt prüfen]], [[PBI-12 - Verlauf nachvollziehen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-06 - Reaktion und Pause]].
