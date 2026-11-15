---
type: PBI
parent: "[[F-05 - Quellen und Verlauf zuordnen]]"
order: 18000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-02-Verwaltung]]"
  - "[[ACT-06-Kommunikationswerkzeug]]"
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
  - "[[docs/design/entities/ENT-02 - Ansprechpartner]]"
  - "[[docs/design/entities/ENT-04 - Punkt]]"
  - "[[docs/design/entities/ENT-05 - Termin]]"
  - "[[docs/design/entities/ENT-06 - Ereignis]]"
  - "[[docs/design/entities/ENT-07 - Quelle]]"
business-rules:
  - "[[docs/business-rules/DF-02 - Bearbeitung, Terminprüfung und Bewertung]]"
  - "[[docs/business-rules/DF-06 - Reaktion und Pause]]"
  - "[[docs/business-rules/DF-07 - Wahl, Entwurf und Versand]]"
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
  - "[[docs/business-rules/DF-14 - Kennzahlen]]"
decisions:
  - "[[docs/decisions/K-03 - Einzeln erledigbarer Punkt als Kerneinheit]]"
  - "[[docs/decisions/K-06 - Nachfassen an Versand und Fristen ausrichten]]"
  - "[[docs/decisions/K-10 - Manuelle Quellenübernahme und Registerimport vorsehen]]"
hypotheses:
  - "[[docs/hypothesis/H-02 - Einzelne Punkte machen den Arbeitsstand verständlich]]"
  - "[[docs/hypothesis/H-05 - Manuelle Eingangsübernahme bleibt alltagstauglich]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-03 - Punkte und Punktakte]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-03 - Lagecheck unterwegs]]"
---

# PBI-12 · Ereignisse nachvollziehen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich Anfrage, Antwort, Zusage und Erfüllung getrennt im Verlauf sehen, damit ich den tatsächlichen Stand erklären kann.

## Akzeptanzkriterien

1. Ereignisdatum, Erfassungsdatum, dokumentierter Akteur, Erfasser und Quelle bleiben unterscheidbar.
2. Empfangsbestätigung, inhaltliche Antwort, neuer Termin, Teillieferung und Erfüllung sind verschiedene Ereignisse.
3. Korrekturen sind erkennbar; fehlende Zeitangaben bleiben unbekannt statt zu erfundenen Dauern zu führen.
4. Die lokale Historie behauptet keine Manipulationssicherheit.

## Herkunft und Regeln

P FR-V4/V6; P NFR-6; US-05; DF-06/14. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-11 - Nachricht und Original zuordnen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-06 - Reaktion und Pause]], [[DF-14 - Kennzahlen]].
