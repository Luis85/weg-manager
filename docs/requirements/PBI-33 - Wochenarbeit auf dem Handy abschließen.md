---
type: PBI
parent: "[[F-13 - Mobile Wochenarbeit]]"
order: 51000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-05-Obsidian]]"
  - "[[ACT-06-Kommunikationswerkzeug]]"
release: ""
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
  - "[[docs/entities/ENT-09 - Entscheidungskarte]]"
  - "[[docs/entities/ENT-10 - Nachrichtenentwurf]]"
  - "[[docs/entities/ENT-12 - To-do]]"
  - "[[docs/entities/ENT-13 - Eskalation]]"
  - "[[docs/entities/ENT-14 - Übergabe]]"
  - "[[docs/entities/ENT-15 - Ausgabestand]]"
  - "[[docs/entities/ENT-16 - Beiratsbewertung]]"
business-rules:
  - "[[docs/business-rules/DF-01 - Beiratsarbeit und Befugnis]]"
  - "[[docs/business-rules/DF-02 - Bearbeitung, Terminprüfung und Bewertung]]"
  - "[[docs/business-rules/DF-03 - Terminbedeutung]]"
  - "[[docs/business-rules/DF-04 - Fehlender Termin]]"
  - "[[docs/business-rules/DF-05 - Eskalationsleiter und Fristen]]"
  - "[[docs/business-rules/DF-06 - Reaktion und Pause]]"
  - "[[docs/business-rules/DF-07 - Wahl, Entwurf und Versand]]"
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
  - "[[docs/business-rules/DF-09 - Begrenzte Auswahl und Dringlichkeit]]"
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-11 - Sachstand und Bewertung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
  - "[[docs/business-rules/DF-14 - Kennzahlen]]"
  - "[[docs/business-rules/DF-15 - Entscheidungskarte und Beschluss]]"
decisions:
  - "[[docs/decisions/K-04 - Wochenpaket beim Einstieg aktualisieren]]"
  - "[[docs/decisions/K-07 - Sachstand gezielt teilen und Bewertungen intern halten]]"
  - "[[docs/decisions/K-09 - Vollständige mobile Wochenarbeit unterstützen]]"
  - "[[docs/decisions/K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]"
hypotheses:
  - "[[docs/hypothesis/H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]"
  - "[[docs/hypothesis/H-07 - Obsidian trägt die tatsächliche mobile Arbeit]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-01 - Lage]]"
  - "[[docs/design/sitemap/VIEW-02 - Wochenarbeit]]"
  - "[[docs/design/sitemap/VIEW-03 - Vorgänge und Vorgangsakte]]"
  - "[[docs/design/sitemap/VIEW-05 - Erfassen]]"
  - "[[docs/design/sitemap/VIEW-06 - Sachstand ausgeben]]"
  - "[[docs/design/sitemap/VIEW-07 - Einstellungen und Einrichtung]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-02 - Wochenarbeit geführt]]"
  - "[[docs/design/user-flows/FLOW-03 - Lagecheck unterwegs]]"
---

# PBI-33 · Wochenarbeit auf dem Handy abschließen

**Planungsstand:** Konzeptentwurf · **Umfang:** Später (nach dem MVP); keine Releasezuordnung

## User Story

Als Beirat möchte ich Lage, Entscheidungen, Notizen und Übergabe auf meinem Handy bearbeiten, damit ich nicht für Kernaktionen zum Desktop wechseln muss.

## Akzeptanzkriterien

1. Auf dem vor Entwicklungsfreigabe festgelegten Pilotgerät sind Lage lesen, Quellen prüfen, wählen, Notiz eingeben, Entwurf prüfen und Übergabe abschließen durchführbar.
2. Unterbrechung und Wiederaufnahme verlieren keine bestätigten Eingaben; kleine Bildschirmfläche verhindert keine Kernaktion.
3. Prüfung umfasst Lagecheck, Vertraulichkeitsvorschau und vollständige manuelle Kernarbeit ohne KI.
4. Bestehende Mailbenachrichtigung bleibt externer Auslöser; eigener Pushdienst und simultaner Geräteabgleich werden nicht zugesagt.

## Herkunft und Regeln

P NFR-5; P FR-A3; US-15. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-13 - Aktuelle Wochenlage öffnen]], [[PBI-17 - Folgearbeit aus Entscheidungen vorbereiten]], [[PBI-19 - Eigentümertexte zweisprachig prüfen]], [[PBI-25 - Nächste Wochenarbeit vorbereiten]], [[PBI-29 - Sachstand lesbar übergeben]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Kommentare

- 21.11.2026: Entscheidung des Produktverantwortlichen: Mobile folgt nach dem MVP. Die Story gehört nicht mehr zum MVP-Umfang, die Releasezuordnung ist entfernt. Für den MVP ist kein Referenz-Handy nötig. Die Kriterien bleiben als Vorlage für den späteren Ausbau stehen. Siehe [[K-09 - Vollständige mobile Wochenarbeit unterstützen]].
