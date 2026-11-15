---
type: PBI
parent: "[[F-08 - Kommunikation vorbereiten und Versand erfassen]]"
order: 30000
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
  - "[[docs/design/entities/ENT-01 - Gemeinschaft]]"
  - "[[docs/design/entities/ENT-02 - Ansprechpartner]]"
  - "[[docs/design/entities/ENT-04 - Punkt]]"
  - "[[docs/design/entities/ENT-06 - Ereignis]]"
  - "[[docs/design/entities/ENT-10 - Nachrichtenentwurf]]"
  - "[[docs/design/entities/ENT-11 - Versanddokumentation]]"
business-rules:
  - "[[docs/business-rules/DF-05 - Nachfassfristen und Stufen]]"
  - "[[docs/business-rules/DF-07 - Wahl, Entwurf und Versand]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-06 - Nachfassen an Versand und Fristen ausrichten]]"
  - "[[docs/decisions/K-10 - Manuelle Quellenübernahme und Registerimport vorsehen]]"
hypotheses:
  - "[[docs/hypothesis/H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]"
  - "[[docs/hypothesis/H-05 - Manuelle Eingangsübernahme bleibt alltagstauglich]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-04 - Postausgang]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-05 - Senden, dokumentieren und nachhalten]]"
---

# PBI-20 · Tatsächlichen Versand dokumentieren

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich nur wirklich versandte Nachrichten mit ihrer Fassung erfassen, damit Entwürfe nicht als gestellte Anfragen zählen.

## Akzeptanzkriterien

1. Eine ausdrückliche Nutzeraktion dokumentiert tatsächlichen Versand mit Datum, Empfänger, Fassung und Bezug.
2. Bei drei Entwürfen und einem Versand bleibt genau eine Nachricht als versandt erfasst.
3. Aus Versand folgt weder Zustellung noch Antwort oder Erfüllung; ein lokaler Korrekturvermerk behauptet keinen Rückruf der Nachricht.
4. Das Plugin versendet keine Nachricht automatisch.

## Herkunft und Regeln

P G4; P NFR-1; US-09; DF-07. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-18 - Nachrichten je Gemeinschaft bündeln]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-05 - Nachfassfristen und Stufen]], [[DF-07 - Wahl, Entwurf und Versand]].
