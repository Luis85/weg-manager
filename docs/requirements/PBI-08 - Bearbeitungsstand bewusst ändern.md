---
type: PBI
parent: "[[F-03 - Einzelne Vorgänge bearbeiten]]"
order: 12000
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
  - "[[docs/entities/ENT-04 - Vorgang]]"
  - "[[docs/entities/ENT-05 - Termin]]"
  - "[[docs/entities/ENT-06 - Verlaufseintrag]]"
  - "[[docs/entities/ENT-07 - Quelle]]"
  - "[[docs/entities/ENT-09 - Entscheidungskarte]]"
  - "[[docs/entities/ENT-16 - Beiratsbewertung]]"
business-rules:
  - "[[docs/business-rules/DF-01 - Beiratsarbeit und Befugnis]]"
  - "[[docs/business-rules/DF-02 - Bearbeitung, Terminprüfung und Bewertung]]"
  - "[[docs/business-rules/DF-06 - Reaktion und Pause]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
  - "[[docs/business-rules/DF-15 - Entscheidungskarte und Beschluss]]"
decisions:
  - "[[docs/decisions/K-01 - Beirat als erster Produkteinstieg]]"
  - "[[docs/decisions/K-03 - Einzeln erledigbarer Vorgang als Kerneinheit]]"
  - "[[docs/decisions/K-06 - Eskalation an Versand und Fristen ausrichten]]"
  - "[[docs/decisions/K-07 - Sachstand gezielt teilen und Bewertungen intern halten]]"
hypotheses:
  - "[[docs/hypothesis/H-02 - Einzelne Vorgänge machen den Arbeitsstand verständlich]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-03 - Vorgänge und Vorgangsakte]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
---

# PBI-08 · Bearbeitungsstand bewusst ändern

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich Erledigung, Klärungsbedarf und meine Bewertung getrennt erfassen, damit ein Prüfhinweis nicht als belegte Erfüllung gilt.

## Akzeptanzkriterien

1. Offen, ungeklärt, erledigt und hinfällig sind unterscheidbar; Erledigung oder Hinfälligkeit erhält Anlass und vorhandene Quelle.
2. Nicht eingehalten wird nur bewusst mit Begründung und Bezug zur Zusageversion gesetzt; es erledigt den Vorgang nicht.
3. Ein neuer Termin und eine Teillieferung erledigen den Vorgang nicht automatisch; begründete Wiederöffnung ist möglich.
4. Eine Entscheidung auf einer Entscheidungskarte erzeugt keinen Gemeinschaftsbeschluss, Auftrag oder Zahlungseintrag.

## Herkunft und Regeln

P FR-V7; US-03; DF-02/06/15. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-05 - Einen Vorgang erfassen und wiederfinden]], [[PBI-12 - Verlauf nachvollziehen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-01 - Beiratsarbeit und Befugnis]], [[DF-02 - Bearbeitung, Terminprüfung und Bewertung]], [[DF-06 - Reaktion und Pause]], [[DF-15 - Entscheidungskarte und Beschluss]].
