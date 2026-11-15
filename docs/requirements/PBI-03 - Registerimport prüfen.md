---
type: PBI
parent: "[[F-02 - Registerbestand übernehmen]]"
order: 6000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-07-Register-Quellsystem]]"
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
  - "[[docs/design/entities/ENT-01 - Gemeinschaft]]"
  - "[[docs/design/entities/ENT-02 - Ansprechpartner]]"
  - "[[docs/design/entities/ENT-03 - Thema]]"
  - "[[docs/design/entities/ENT-04 - Punkt]]"
  - "[[docs/design/entities/ENT-05 - Termin]]"
  - "[[docs/design/entities/ENT-06 - Ereignis]]"
  - "[[docs/design/entities/ENT-07 - Quelle]]"
  - "[[docs/design/entities/ENT-12 - Eigene Aufgabe]]"
  - "[[docs/design/entities/ENT-16 - Beiratsbewertung]]"
business-rules:
  - "[[docs/business-rules/DF-02 - Bearbeitung, Terminprüfung und Bewertung]]"
  - "[[docs/business-rules/DF-03 - Terminbedeutung]]"
  - "[[docs/business-rules/DF-04 - Fehlender Termin]]"
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
decisions:
  - "[[docs/decisions/K-02 - Zwei Gemeinschaften für einen Bearbeiter]]"
  - "[[docs/decisions/K-03 - Einzeln erledigbarer Punkt als Kerneinheit]]"
  - "[[docs/decisions/K-10 - Manuelle Quellenübernahme und Registerimport vorsehen]]"
hypotheses:
  - "[[docs/hypothesis/H-05 - Manuelle Eingangsübernahme bleibt alltagstauglich]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-07 - Einstellungen und Einrichtung]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-06 - Einrichten, Import und Datenerhalt]]"
---

# PBI-03 · Registerimport prüfen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich die Zuordnung meines Registerexports vor Übernahme prüfen, damit unklare Daten nicht unbemerkt zu Fakten werden.

## Akzeptanzkriterien

1. Die 15 Quellangaben Nr, Art, Thema, Zusage, Wer, Zugesagt am, Bis wann, Status, Erledigt am, Quelle, Nächster Schritt, Prüfung, Mail-Referenz, Link und Gemeinschaft sind zuordenbar.
2. Vorschau unterscheidet gültige, unklare und abgewiesene Zeilen; unbekannte Statuswerte werden nicht still umgedeutet.
3. Fehlende Ereignisdaten bleiben unbekannt; Importdatum ersetzt weder Zusage noch Erledigungsdatum.
4. 97 Punkte sind ein Prüfbeispiel und keine feste Importgrenze.

## Herkunft und Regeln

P FR-V8; US-02; DF-02/13. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-01 - Gemeinschaftskontext wählen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-04 - Fehlender Termin]].
