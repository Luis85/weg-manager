---
type: PBI
parent: "[[F-06 - Wochenpaket vorbereiten]]"
order: 21000
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
  - "[[docs/entities/ENT-06 - Verlaufseintrag]]"
  - "[[docs/entities/ENT-07 - Quelle]]"
  - "[[docs/entities/ENT-08 - Dokument]]"
  - "[[docs/entities/ENT-12 - To-do]]"
business-rules:
  - "[[docs/business-rules/DF-03 - Terminbedeutung]]"
  - "[[docs/business-rules/DF-04 - Fehlender Termin]]"
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
  - "[[docs/business-rules/DF-09 - Begrenzte Auswahl und Dringlichkeit]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-01 - Beirat als erster Produkteinstieg]]"
  - "[[docs/decisions/K-04 - Wochenpaket beim Einstieg aktualisieren]]"
  - "[[docs/decisions/K-05 - Sieben reguläre Entscheidungen mit sichtbarem Überlauf]]"
  - "[[docs/decisions/K-09 - Vollständige mobile Wochenarbeit unterstützen]]"
  - "[[docs/decisions/K-10 - Manuelle Quellenübernahme und Registerimport vorsehen]]"
  - "[[docs/decisions/K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]"
hypotheses:
  - "[[docs/hypothesis/H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]"
  - "[[docs/hypothesis/H-05 - Manuelle Eingangsübernahme bleibt alltagstauglich]]"
  - "[[docs/hypothesis/H-06 - Vorbereitete Wochenarbeit ist ohne verpflichtende KI nützlich]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-01 - Lage]]"
  - "[[docs/design/sitemap/VIEW-02 - Wochenarbeit]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-02 - Wochenarbeit geführt]]"
---

# PBI-13 · Aktuelle Wochenlage öffnen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich eine vorbereitete kurze Lage mit Fristen und Aufgaben öffnen, damit ich ohne verstreute Listen beginnen kann.

## Akzeptanzkriterien

1. Lage bis sieben Sätze, Fristen der nächsten 14 Tage und eigene Aufgaben sind quellenbezogen verfügbar.
2. Zeitpunkt, berücksichtigte Quellen, ungeprüfte Unterlagen und bekannte Lücken sind sichtbar.
3. Einstieg aktualisiert fällige Arbeit; ein geschlossener Client wird nicht als gelaufener Hintergrunddienst ausgegeben.
4. Die Vorbereitung verwendet vorhandene Daten und bearbeitbare Texte; notwendige manuelle Ergänzung zählt zur späteren Wochenzeit.
5. Wochentag, Zeitziel, Anzahl regulärer Entscheidungen und Frist bei akuten Problemen sind einstellbar. Fälligkeit wird beim Öffnen geprüft, nicht im Hintergrund.

## Herkunft und Regeln

Kriterium 5: Ergänzt aus dem Designreview und Pilot-Prototyp vom 15.11.2026 (direkte Nutzeranforderung, siehe [[Prototyp - Stand Pilot]]).

P FR-W1/E5; US-06; DF-08. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-09 - Termin und Wiedervorlage trennen]], [[PBI-10 - Eigenes To-do nachhalten]], [[PBI-12 - Verlauf nachvollziehen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-08 - Quellenabdeckung]].
