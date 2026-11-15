---
type: PBI
parent: "[[F-03 - Einzelne Punkte bearbeiten]]"
order: 10000
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
  - "[[docs/design/entities/ENT-02 - Ansprechpartner]]"
  - "[[docs/design/entities/ENT-03 - Thema]]"
  - "[[docs/design/entities/ENT-04 - Punkt]]"
  - "[[docs/design/entities/ENT-05 - Termin]]"
  - "[[docs/design/entities/ENT-06 - Ereignis]]"
business-rules:
  - "[[docs/business-rules/DF-02 - Bearbeitung, Terminprüfung und Bewertung]]"
  - "[[docs/business-rules/DF-04 - Fehlender Termin]]"
  - "[[docs/business-rules/DF-06 - Reaktion und Pause]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
decisions:
  - "[[docs/decisions/K-03 - Einzeln erledigbarer Punkt als Kerneinheit]]"
hypotheses:
  - "[[docs/hypothesis/H-02 - Einzelne Punkte machen den Arbeitsstand verständlich]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-03 - Punkte und Punktakte]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
---

# PBI-06 · Sammelpunkte aufteilen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich einen Sammelpunkt in einzeln erledigbare Punkte aufteilen, damit Teilergebnisse den übrigen Bedarf nicht verdecken.

## Akzeptanzkriterien

1. Aufteilung hält Ursprung und Zielreferenzen fest; der alte Punkt ist als aufgeteilt erkennbar.
2. Jeder Teil erhält eigenes Ergebnis, Termin beziehungsweise Klärungsstand und Verantwortlichen.
3. Abschluss eines Teils erledigt keinen anderen Teil; Kennungen werden nicht neu vergeben.

## Herkunft und Regeln

P FR-V3; US-03; DF-02/13. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-05 - Einen Punkt erfassen und wiederfinden]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-02 - Bearbeitung, Terminprüfung und Bewertung]], [[DF-13 - Historie und kontrollierte Entfernung]].
