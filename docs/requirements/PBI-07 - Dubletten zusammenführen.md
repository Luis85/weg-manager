---
type: PBI
parent: "[[F-03 - Einzelne Punkte bearbeiten]]"
order: 11000
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
  - "[[docs/design/entities/ENT-06 - Ereignis]]"
  - "[[docs/design/entities/ENT-07 - Quelle]]"
business-rules:
  - "[[docs/business-rules/DF-02 - Bearbeitung, Terminprüfung und Bewertung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
decisions:
  - "[[docs/decisions/K-02 - Zwei Gemeinschaften für einen Bearbeiter]]"
  - "[[docs/decisions/K-03 - Einzeln erledigbarer Punkt als Kerneinheit]]"
hypotheses:
  - "[[docs/hypothesis/H-02 - Einzelne Punkte machen den Arbeitsstand verständlich]]"
  - "[[docs/hypothesis/H-05 - Manuelle Eingangsübernahme bleibt alltagstauglich]]"
pages:
  - "[[docs/design/sitemap/VIEW-03 - Punkte und Punktakte]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-02 - Wochenarbeit geführt]]"
  - "[[docs/design/user-flows/FLOW-04 - Schnell erfassen und Eingang sichten]]"
---

# PBI-07 · Dubletten zusammenführen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich doppelte Punkte innerhalb einer Gemeinschaft zusammenführen, damit ich einen Sachverhalt nur einmal nachhalte.

## Akzeptanzkriterien

1. Ein prüfbarer Zielpunkt erhält Verweise auf die Ursprünge; widersprüchliche Angaben werden zur Auswahl gezeigt.
2. Alte Referenzen bleiben auflösbar und als zusammengeführt erkennbar.
3. Gleichnamige Punkte verschiedener Gemeinschaften werden nicht zusammengeführt.

## Herkunft und Regeln

P FR-V3; US-03; DF-12/13. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-05 - Einen Punkt erfassen und wiederfinden]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-02 - Bearbeitung, Terminprüfung und Bewertung]], [[DF-12 - Gemeinschaftstrennung]], [[DF-13 - Historie und kontrollierte Entfernung]].
