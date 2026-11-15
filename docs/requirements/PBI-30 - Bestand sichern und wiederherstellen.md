---
type: PBI
parent: "[[F-12 - Daten erhalten und selbstständig starten]]"
order: 47000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-05-Obsidian]]"
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
  - "[[docs/design/entities/ENT-08 - Dokument]]"
  - "[[docs/design/entities/ENT-09 - Arbeitsentscheidung]]"
  - "[[docs/design/entities/ENT-10 - Nachrichtenentwurf]]"
  - "[[docs/design/entities/ENT-11 - Versanddokumentation]]"
  - "[[docs/design/entities/ENT-12 - Eigene Aufgabe]]"
  - "[[docs/design/entities/ENT-13 - Nachfassstand]]"
  - "[[docs/design/entities/ENT-14 - Wochenübergabe]]"
  - "[[docs/design/entities/ENT-15 - Ausgabestand]]"
  - "[[docs/design/entities/ENT-16 - Beiratsbewertung]]"
business-rules:
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-11 - Sachstand und Bewertung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
decisions:
  - "[[docs/decisions/K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]"
hypotheses:
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-07 - Einstellungen und Einrichtung]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-06 - Einrichten, Import und Datenerhalt]]"
---

# PBI-30 · Bestand sichern und wiederherstellen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich meine vollständigen Daten sichern und in einem leeren Arbeitsbereich wiederherstellen, damit ich nach einem Verlust weiterarbeiten kann.

## Akzeptanzkriterien

1. Sicherung umfasst Fachnotizen, Originale und erforderliche Schemaangaben; sie ist klar von Empfängerexport getrennt.
2. Wiederherstellung erhält Referenzen und Originale; fehlende Bestandteile werden sichtbar.
3. Deaktivierung oder Deinstallation entfernt keine Fachnotizen; Akten bleiben ohne Plugin und ohne Obsidian direkt aus den normalen Notizdateien lesbar.

## Herkunft und Regeln

Alt FR-18; P G5; P NFR-3/4. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-11 - Nachricht und Original zuordnen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.
