---
type: PBI
parent: "[[F-05 - Quellen und Verlauf zuordnen]]"
order: 17000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-02-Verwaltung]]"
  - "[[ACT-03-Eigentuemer]]"
  - "[[ACT-06-Kommunikationswerkzeug]]"
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
  - "[[docs/entities/ENT-06 - Verlaufseintrag]]"
  - "[[docs/entities/ENT-07 - Quelle]]"
  - "[[docs/entities/ENT-08 - Dokument]]"
business-rules:
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
decisions:
  - "[[docs/decisions/K-07 - Sachstand gezielt teilen und Bewertungen intern halten]]"
  - "[[docs/decisions/K-10 - Manuelle Quellenübernahme und Registerimport vorsehen]]"
hypotheses:
  - "[[docs/hypothesis/H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]"
  - "[[docs/hypothesis/H-05 - Manuelle Eingangsübernahme bleibt alltagstauglich]]"
pages:
  - "[[docs/design/sitemap/VIEW-02 - Wochenarbeit]]"
  - "[[docs/design/sitemap/VIEW-03 - Vorgänge und Vorgangsakte]]"
  - "[[docs/design/sitemap/VIEW-05 - Erfassen]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-02 - Wochenarbeit geführt]]"
  - "[[docs/design/user-flows/FLOW-04 - Schnell erfassen und Eingang sichten]]"
---

# PBI-11 · Nachricht und Original zuordnen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich relevante Nachrichten und Unterlagen einem Punkt zuordnen, damit ich Aussagen später belegen kann.

## Akzeptanzkriterien

1. Nachrichtentext, Gesprächsnotiz und Originaldatei sind mit Herkunft erfassbar; ein Quellenlink ist als Link erkennbar.
2. Neue Dokumentfassungen überschreiben keine bisherigen Originale; fehlende Dateien werden angezeigt.
3. Umbenennen erhält Beziehungen oder meldet Reparaturbedarf; Dateiinhalte werden nicht still verändert.
4. Der Erfassungsweg verlangt keinen Mail-Connector und behauptet keinen vollständigen Postfacheingang.
5. Dateien außerhalb des Vaults können gewählt werden; sie werden nach Wahl in den Quellenordner verschoben oder kopiert, der Zielpfad ist vor dem Speichern sichtbar. Mehrere Dateien je Erfassung sind möglich.
6. Quellen sind aus der Punktakte mit Vorschau, Vault-Pfad und Öffnen in Obsidian einsehbar.

## Herkunft und Regeln

Kriterien 5–6: Ergänzt aus dem Designreview und Pilot-Prototyp vom 15.11.2026 (direkte Nutzeranforderung, siehe [[Prototyp - Stand Pilot]]).

P FR-E1/E2; US-05; Alt FR-17. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-05 - Einen Vorgang erfassen und wiederfinden]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-08 - Quellenabdeckung]].
