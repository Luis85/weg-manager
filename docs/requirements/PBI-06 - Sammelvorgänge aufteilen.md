---
type: PBI
parent: "[[F-03 - Einzelne Vorgänge bearbeiten]]"
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
  - "[[docs/entities/ENT-02 - Person und Rolle]]"
  - "[[docs/entities/ENT-03 - Thema]]"
  - "[[docs/entities/ENT-04 - Vorgang]]"
  - "[[docs/entities/ENT-05 - Termin]]"
  - "[[docs/entities/ENT-06 - Verlaufseintrag]]"
business-rules:
  - "[[docs/business-rules/DF-02 - Bearbeitung, Terminprüfung und Bewertung]]"
  - "[[docs/business-rules/DF-04 - Fehlender Termin]]"
  - "[[docs/business-rules/DF-06 - Reaktion und Pause]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
decisions:
  - "[[docs/decisions/K-03 - Einzeln erledigbarer Vorgang als Kerneinheit]]"
hypotheses:
  - "[[docs/hypothesis/H-02 - Einzelne Vorgänge machen den Arbeitsstand verständlich]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-03 - Vorgänge und Vorgangsakte]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
---

# PBI-06 · Sammelvorgänge aufteilen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich einen Sammelvorgang in einzeln erledigbare Vorgänge aufteilen, damit Teilergebnisse den übrigen Bedarf nicht verdecken.

## Akzeptanzkriterien

1. Aufteilung hält Ursprung und Zielreferenzen fest; der alte Vorgang ist als aufgeteilt erkennbar.
2. Jeder Teil erhält eigenes Ergebnis, Termin beziehungsweise Klärungsstand und Verantwortlichen.
3. Abschluss eines Teils erledigt keinen anderen Teil; Kennungen werden nicht neu vergeben.

## Herkunft und Regeln

P FR-V3; US-03; DF-02/13. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-05 - Einen Vorgang erfassen und wiederfinden]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-02 - Bearbeitung, Terminprüfung und Bewertung]], [[DF-13 - Historie und kontrollierte Entfernung]].
