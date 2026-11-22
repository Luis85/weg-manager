---
type: PBI
parent: "[[F-12 - Daten erhalten und selbstständig starten]]"
order: 48000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-05-Obsidian]]"
  - "[[docs/design/actors/ACT-09 - AI-Agent mit direktem Dateizugriff]]"
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
  - "[[docs/entities/ENT-03 - Thema]]"
  - "[[docs/entities/ENT-04 - Vorgang]]"
  - "[[docs/entities/ENT-05 - Termin]]"
  - "[[docs/entities/ENT-06 - Verlaufseintrag]]"
  - "[[docs/entities/ENT-07 - Quelle]]"
  - "[[docs/entities/ENT-08 - Dokument]]"
  - "[[docs/entities/ENT-09 - Entscheidungskarte]]"
  - "[[docs/entities/ENT-10 - Nachrichtenentwurf]]"
  - "[[docs/entities/ENT-11 - Versanddokumentation]]"
  - "[[docs/entities/ENT-12 - To-do]]"
  - "[[docs/entities/ENT-13 - Eskalation]]"
  - "[[docs/entities/ENT-14 - Übergabe]]"
  - "[[docs/entities/ENT-15 - Ausgabestand]]"
  - "[[docs/entities/ENT-16 - Beiratsbewertung]]"
business-rules:
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
  - "[[docs/business-rules/DF-23 - Externe Bearbeitung ohne stilles Überschreiben]]"
decisions:
  - "[[docs/decisions/K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]"
  - "[[docs/decisions/K-14 - Markdown und Frontmatter als offene Datengrundlage]]"
hypotheses:
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-07 - Einstellungen und Einrichtung]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-06 - Einrichten, Import und Datenerhalt]]"
  - "[[docs/design/user-flows/FLOW-08 - Zwischen Plugin und direkter Dateibearbeitung wechseln]]"
---

# PBI-31 · Konflikte ohne Datenverlust klären

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich externe Änderungen und unterbrochene Bearbeitung verständlich klären, damit meine Eingaben und Quellen erhalten bleiben.

## Akzeptanzkriterien

1. Externe Änderung während offener Bearbeitung wird sichtbar; kein blindes Überschreiben beider Stände.
2. Doppelte IDs, beschädigte Beziehungen und unbekannte neuere Schemata werden gemeldet und nicht still repariert oder überschrieben.
3. Wiederholung einer unterbrochenen Aktion erzeugt keine doppelten Fachobjekte.
4. Fremde Notizinhalte und unbekannte Properties bleiben erhalten.

## Herkunft und Regeln

Alt FR-17/18; P NFR-6. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-05 - Einen Vorgang erfassen und wiederfinden]], [[PBI-11 - Nachricht und Original zuordnen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Konkretisierung für direkten Agentenzugriff

Externe Änderungen schließen ausdrücklich das Schreiben eines freigegebenen AI-Agents bei laufendem Plugin ein. Die Bearbeitung verwendet denselben Notizbestand ohne Export/Import-Rundreise oder MCP. Gültige Änderungen werden berücksichtigt; unvollständiges Frontmatter, erneute externe Änderung und eigener ungespeicherter Entwurf dürfen nicht durch stilles Überschreiben verloren gehen. Grundlage: [[DF-23 - Externe Bearbeitung ohne stilles Überschreiben]] und [[PBI-42 - AI-Agent direkt mit den Notizen arbeiten lassen]].
