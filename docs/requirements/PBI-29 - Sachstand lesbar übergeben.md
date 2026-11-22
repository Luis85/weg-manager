---
type: PBI
parent: "[[F-11 - Vertraulichkeit und gezielte Übergabe]]"
order: 44000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-02-Verwaltung]]"
  - "[[ACT-03-Eigentuemer]]"
  - "[[ACT-04-Vertretung]]"
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
  - "[[docs/entities/ENT-01 - Gemeinschaft]]"
  - "[[docs/entities/ENT-02 - Person und Rolle]]"
  - "[[docs/entities/ENT-04 - Vorgang]]"
  - "[[docs/entities/ENT-07 - Quelle]]"
  - "[[docs/entities/ENT-08 - Dokument]]"
  - "[[docs/entities/ENT-12 - To-do]]"
  - "[[docs/entities/ENT-15 - Ausgabestand]]"
business-rules:
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-11 - Sachstand und Bewertung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-02 - Zwei Gemeinschaften für einen Bearbeiter]]"
  - "[[docs/decisions/K-07 - Sachstand gezielt teilen und Bewertungen intern halten]]"
  - "[[docs/decisions/K-08 - Vertretung zunächst durch lesbare Übergabe unterstützen]]"
  - "[[docs/decisions/K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]"
hypotheses:
  - "[[docs/hypothesis/H-09 - Eine ausgewählte Übergabe ist ohne Hintergrundwissen verständlich]]"
  - "[[docs/hypothesis/H-10 - Lesbare Übergabe genügt dem ersten Vertretungsbedarf]]"
pages:
  - "[[docs/design/sitemap/VIEW-06 - Sachstand ausgeben]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-07 - Sachstand gezielt ausgeben]]"
---

# PBI-29 · Sachstand lesbar übergeben

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich einen ausgewählten Stand mit Quellen lesbar übergeben, damit Empfänger und Vertretung offene Arbeit verstehen.

## Akzeptanzkriterien

1. Ausgabe nennt Gemeinschaft, Standdatum, offene Vorgänge, nächste Schritte und bewusst ausgewählte Quellen.
2. Fehlende Anlagen sind erkennbar; Lesen erfordert weder KI noch das Plugin.
3. Interne Vertretungsübergabe ist ausdrücklich von externer Sachstandsausgabe und vollständiger Sicherung unterschieden.
4. Es entsteht kein paralleler Bearbeitungszugang und kein behaupteter Zugriffsschutz für andere Vault-Nutzer.

## Herkunft und Regeln

P G5; P FR-ROL1/ROL2; US-13; DF-11/12. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-28 - Empfängerbezogene Ausgabe prüfen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-11 - Sachstand und Bewertung]].
