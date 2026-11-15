---
type: PBI
parent: "[[F-07 - Arbeitsentscheidungen treffen]]"
order: 24000
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
  - "[[docs/design/entities/ENT-04 - Punkt]]"
  - "[[docs/design/entities/ENT-07 - Quelle]]"
  - "[[docs/design/entities/ENT-08 - Dokument]]"
  - "[[docs/design/entities/ENT-09 - Arbeitsentscheidung]]"
  - "[[docs/design/entities/ENT-10 - Nachrichtenentwurf]]"
business-rules:
  - "[[docs/business-rules/DF-01 - Beiratsarbeit und Befugnis]]"
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-15 - Arbeitsentscheidung und Beschluss]]"
decisions:
  - "[[docs/decisions/K-01 - Beirat als erster Produkteinstieg]]"
  - "[[docs/decisions/K-04 - Wochenpaket beim Einstieg aktualisieren]]"
  - "[[docs/decisions/K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]"
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

# PBI-15 · Eine Entscheidungsvorlage prüfen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich Kontext, echte Optionen, Folgen und einen Empfehlungsentwurf prüfen, damit ich informiert über mein Vorgehen entscheide.

## Akzeptanzkriterien

1. Kontext und Empfehlung verweisen auf Quellen; Unsicherheit und fehlende Nachweise sind sichtbar.
2. Sinnvolle Optionen enthalten Folgen; keine künstlichen Alternativen zum Erreichen einer festen Anzahl.
3. Vor der Wahl liegt ein bearbeitbarer Entwurf zur Empfehlung vor; ohne KI bleibt die Vorlage nutzbar.
4. Persönliche Vorgehensentscheidung, Beschlussentwurf und vorhandener Beschlussnachweis sind unterschiedlich bezeichnet.

## Herkunft und Regeln

P FR-W3; US-07; DF-01/08/15. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-12 - Ereignisse nachvollziehen]], [[PBI-14 - Entscheidungsauswahl und Überlauf prüfen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-01 - Beiratsarbeit und Befugnis]], [[DF-08 - Quellenabdeckung]], [[DF-15 - Arbeitsentscheidung und Beschluss]].
