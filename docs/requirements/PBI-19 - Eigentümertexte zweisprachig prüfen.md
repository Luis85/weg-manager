---
type: PBI
parent: "[[F-08 - Kommunikation vorbereiten und Versand erfassen]]"
order: 29000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-03-Eigentuemer]]"
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
  - "[[docs/entities/ENT-05 - Termin]]"
  - "[[docs/entities/ENT-10 - Nachrichtenentwurf]]"
  - "[[docs/entities/ENT-15 - Ausgabestand]]"
business-rules:
  - "[[docs/business-rules/DF-07 - Wahl, Entwurf und Versand]]"
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-11 - Sachstand und Bewertung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-07 - Sachstand gezielt teilen und Bewertungen intern halten]]"
  - "[[docs/decisions/K-10 - Manuelle Quellenübernahme und Registerimport vorsehen]]"
hypotheses:
  - "[[docs/hypothesis/H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]"
  - "[[docs/hypothesis/H-06 - Vorbereitete Wochenarbeit ist ohne verpflichtende KI nützlich]]"
pages:
  - "[[docs/design/sitemap/VIEW-04 - Postausgang]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-05 - Senden, dokumentieren und nachhalten]]"
---

# PBI-19 · Eigentümertexte zweisprachig prüfen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich Eigentümerinformationen auf Deutsch und Englisch prüfen, damit beide Sprachfassungen denselben Sachstand vermitteln.

## Akzeptanzkriterien

1. Beide bearbeitbaren Fassungen enthalten dieselben freigegebenen Fakten, Fristen und beabsichtigten Handlungen.
2. Eine Änderung relevanter Inhalte macht die andere Fassung erneut prüfbedürftig.
3. Die Ausgabe verlangt menschliche Inhaltsprüfung; kein KI- oder Übersetzungsanbieter ist Voraussetzung.

## Herkunft und Regeln

P FR-W7; US-09; DF-07/11. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-18 - Nachrichten je Gemeinschaft bündeln]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-07 - Wahl, Entwurf und Versand]], [[DF-11 - Sachstand und Bewertung]].
