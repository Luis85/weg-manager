---
type: PBI
parent: "[[F-11 - Vertraulichkeit und gezielte Übergabe]]"
order: 43000
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
  - "[[docs/entities/ENT-15 - Ausgabestand]]"
  - "[[docs/entities/ENT-16 - Beiratsbewertung]]"
business-rules:
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-11 - Sachstand und Bewertung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-02 - Zwei Gemeinschaften für einen Bearbeiter]]"
  - "[[docs/decisions/K-07 - Sachstand gezielt teilen und Bewertungen intern halten]]"
  - "[[docs/decisions/K-08 - Vertretung zunächst durch lesbare Übergabe unterstützen]]"
hypotheses:
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
  - "[[docs/hypothesis/H-09 - Eine ausgewählte Übergabe ist ohne Hintergrundwissen verständlich]]"
  - "[[docs/hypothesis/H-10 - Lesbare Übergabe genügt dem ersten Vertretungsbedarf]]"
pages:
  - "[[docs/design/sitemap/VIEW-06 - Sachstand ausgeben]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-07 - Sachstand gezielt ausgeben]]"
---

# PBI-28 · Empfängerbezogene Ausgabe prüfen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich ausgewählte Sachstände vor Weitergabe in einer Vorschau prüfen, damit nur geeignete Informationen beim Empfänger landen.

## Akzeptanzkriterien

1. Empfängerkontext, Gemeinschaft, ausgewählte Textabschnitte und jede Anlage sind sichtbar.
2. Interne Notizen, Bewertungen und ungeprüfte Originale werden nicht automatisch übernommen; Auswahl erfordert passende Prüfung.
3. Nur verlinkte, nicht gewählte Anlagen werden nicht mitgenommen; Vorschau und Ausgabe stimmen überein.
4. Erzeugte Ausgabe führt keinen fremden Code aus und lädt nichts extern nach.

## Herkunft und Regeln

P FR-ROL1/ROL2/E4; US-12/13; DF-10/11/12. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-26 - Unterlagen einstufen und korrigieren]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-10 - Vertraulichkeitsprüfung]], [[DF-11 - Sachstand und Bewertung]], [[DF-12 - Gemeinschaftstrennung]].
