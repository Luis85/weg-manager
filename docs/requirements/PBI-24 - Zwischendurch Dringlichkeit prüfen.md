---
type: PBI
parent: "[[F-10 - Lagecheck und Wiedereinstieg]]"
order: 37000
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
  - "[[docs/entities/ENT-14 - Übergabe]]"
business-rules:
  - "[[docs/business-rules/DF-03 - Terminbedeutung]]"
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
  - "[[docs/business-rules/DF-09 - Begrenzte Auswahl und Dringlichkeit]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-04 - Wochenpaket beim Einstieg aktualisieren]]"
  - "[[docs/decisions/K-05 - Sieben reguläre Entscheidungen mit sichtbarem Überlauf]]"
  - "[[docs/decisions/K-06 - Eskalation an Versand und Fristen ausrichten]]"
  - "[[docs/decisions/K-09 - Vollständige mobile Wochenarbeit unterstützen]]"
  - "[[docs/decisions/K-10 - Manuelle Quellenübernahme und Registerimport vorsehen]]"
hypotheses:
  - "[[docs/hypothesis/H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]"
  - "[[docs/hypothesis/H-04 - Sieben Entscheidungen sind ein brauchbares Arbeitsbudget]]"
  - "[[docs/hypothesis/H-07 - Obsidian trägt die tatsächliche mobile Arbeit]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-01 - Lage]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-03 - Lagecheck unterwegs]]"
---

# PBI-24 · Zwischendurch Dringlichkeit prüfen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich seit der letzten Übergabe neue Verlaufseinträge und zeitkritische Vorgänge sehen, damit ich gezielt vor der nächsten Wochenarbeit eingreife.

## Akzeptanzkriterien

1. Letzte Übergabe, neue Verlaufseinträge und nächster geplanter Wochenzeitpunkt sind erkennbar.
2. Fristen vor diesem Zeitpunkt, nötige Unterschriften, akute Gebäudeprobleme und drohende Kosten können hervorgehoben und menschlich korrigiert werden.
3. Ungeprüfte Portalnachricht erscheint als Lücke; daraus folgt weder keine Antwort noch alles kann warten.
4. Nicht dringliche Vorgänge bleiben in der Wochenarbeit erhalten.

## Herkunft und Regeln

P FR-A1/A2/E5; US-11; DF-08/09. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-12 - Verlauf nachvollziehen]], [[PBI-09 - Termin und Wiedervorlage trennen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-08 - Quellenabdeckung]], [[DF-09 - Begrenzte Auswahl und Dringlichkeit]].
