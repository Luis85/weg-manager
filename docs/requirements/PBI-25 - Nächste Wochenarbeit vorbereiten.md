---
type: PBI
parent: "[[F-10 - Lagecheck und Wiedereinstieg]]"
order: 38000
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
  - "[[docs/entities/ENT-01 - Gemeinschaft]]"
  - "[[docs/entities/ENT-04 - Vorgang]]"
  - "[[docs/entities/ENT-05 - Termin]]"
  - "[[docs/entities/ENT-14 - Übergabe]]"
business-rules:
  - "[[docs/business-rules/DF-03 - Terminbedeutung]]"
  - "[[docs/business-rules/DF-09 - Begrenzte Auswahl und Dringlichkeit]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-04 - Wochenpaket beim Einstieg aktualisieren]]"
  - "[[docs/decisions/K-05 - Sieben reguläre Entscheidungen mit sichtbarem Überlauf]]"
hypotheses:
  - "[[docs/hypothesis/H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]"
  - "[[docs/hypothesis/H-04 - Sieben Entscheidungen sind ein brauchbares Arbeitsbudget]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-01 - Lage]]"
  - "[[docs/design/sitemap/VIEW-02 - Wochenarbeit]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-02 - Wochenarbeit geführt]]"
---

# PBI-25 · Nächste Wochenarbeit vorbereiten

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich bis zu drei Schwerpunkte und eine Kontextnotiz hinterlassen, damit ich später ohne Rekonstruktion weiterarbeite.

## Akzeptanzkriterien

1. Bestätigte Übergabe nennt Datum, betroffene Gemeinschaften und bis drei Schwerpunkte mit Vorgangsbezug oder konkretem neuem Bedarf.
2. Die nächste Wochenansicht und der Lagecheck zeigen die letzte bestätigte Übergabe.
3. Übergabe verändert keine fachlichen Fristen oder Zustände; neue dringende Arbeit bleibt vorrangig sichtbar.

## Herkunft und Regeln

P FR-W8; US-14; DF-09/12. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-05 - Einen Vorgang erfassen und wiederfinden]], [[PBI-16 - Wahl mit Kontextnotiz bestätigen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-09 - Begrenzte Auswahl und Dringlichkeit]].
