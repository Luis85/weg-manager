---
type: PBI
parent: "[[F-11 - Vertraulichkeit und gezielte Übergabe]]"
order: 42000
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
  - "[[docs/design/entities/ENT-06 - Ereignis]]"
  - "[[docs/design/entities/ENT-07 - Quelle]]"
  - "[[docs/design/entities/ENT-08 - Dokument]]"
  - "[[docs/design/entities/ENT-15 - Ausgabestand]]"
business-rules:
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
decisions:
  - "[[docs/decisions/K-07 - Sachstand gezielt teilen und Bewertungen intern halten]]"
  - "[[docs/decisions/K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]"
hypotheses:
  - "[[docs/hypothesis/H-05 - Manuelle Eingangsübernahme bleibt alltagstauglich]]"
pages:
  - "[[docs/design/sitemap/VIEW-02 - Wochenarbeit]]"
  - "[[docs/design/sitemap/VIEW-03 - Punkte und Punktakte]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-07 - Sachstand gezielt ausgeben]]"
---

# PBI-27 · Unnötige private Inhalte entfernen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich fehlerhafte oder unnötige private Inhalte kontrolliert berichtigen oder entfernen, damit ich sie nicht dauerhaft weitertragen muss.

## Akzeptanzkriterien

1. Entfernung zeigt betroffene Referenzen und benötigt bewusste Auswahl; gewöhnliches Zusammenführen löscht keine Herkunft.
2. Verweise auf entfernte Anlagen bleiben verständlich; der Löschvermerk wiederholt den entfernten privaten Inhalt nicht.
3. Vorhandene Exporte und Sicherungen werden als gesondert zu prüfende Kopien benannt; keine weltweite Löschgarantie.
4. Aufbewahrungsentscheidung wird dokumentiert; es gibt kein pauschales Nie-löschen-Versprechen.

## Herkunft und Regeln

P FR-V3; P NFR-2/6; US-12; DF-13. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-26 - Unterlagen einstufen und korrigieren]], [[PBI-12 - Ereignisse nachvollziehen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-13 - Historie und kontrollierte Entfernung]].
