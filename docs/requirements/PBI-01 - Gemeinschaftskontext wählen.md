---
type: PBI
parent: "[[F-01 - Gemeinschaften und Ansprechpartner]]"
order: 3000
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
  - "[[docs/design/entities/ENT-01 - Gemeinschaft]]"
  - "[[docs/design/entities/ENT-04 - Punkt]]"
  - "[[docs/design/entities/ENT-09 - Arbeitsentscheidung]]"
  - "[[docs/design/entities/ENT-10 - Nachrichtenentwurf]]"
business-rules:
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-02 - Zwei Gemeinschaften für einen Bearbeiter]]"
hypotheses:
  - "[[docs/hypothesis/H-01 - Beiratsfokus deckt den ersten Pilotbedarf]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-01 - Lage]]"
  - "[[docs/design/sitemap/VIEW-05 - Erfassen]]"
  - "[[docs/design/sitemap/VIEW-07 - Einstellungen und Einrichtung]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-04 - Schnell erfassen und Eingang sichten]]"
  - "[[docs/design/user-flows/FLOW-06 - Einrichten, Import und Datenerhalt]]"
---

# PBI-01 · Gemeinschaftskontext wählen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich zwischen WEG und Tiefgarage wechseln und Punkte eindeutig zuordnen, damit ich keine Sachverhalte vermische.

## Akzeptanzkriterien

1. Mindestens zwei Gemeinschaften sind nutzbar; vor Bearbeitung und Ausgabe ist der Kontext sichtbar.
2. Gleich benannte Punkte beider Gemeinschaften bleiben verschieden; Querverweise führen keine Daten zusammen.
3. Jeder Punkt, jede Karte und jeder Entwurf gehört genau einer Gemeinschaft.
4. Jede Gemeinschaft hat Name, festes Kürzel und unterscheidbare Farbe; die Art stammt aus einer editierbaren Liste mit eigener Einheitenbezeichnung (z. B. Einheiten, Stellplätze). Aus der Art werden weder Rechtsform noch Befugnisse abgeleitet.

## Herkunft und Regeln

Kriterium 4: Ergänzt aus dem Designreview und Pilot-Prototyp vom 15.11.2026 (direkte Nutzeranforderung, siehe [[Prototyp - Stand Pilot]]).

P FR-ROL3; US-01; DF-12. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

Keine vorausgehende Story; Gemeinschaftskontext ist der Einstieg.

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-12 - Gemeinschaftstrennung]].
