---
type: PBI
parent: "[[F-08 - Kommunikation vorbereiten und Versand erfassen]]"
order: 28000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-02-Verwaltung]]"
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
  - "[[docs/design/entities/ENT-08 - Dokument]]"
  - "[[docs/design/entities/ENT-10 - Nachrichtenentwurf]]"
business-rules:
  - "[[docs/business-rules/DF-07 - Wahl, Entwurf und Versand]]"
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-11 - Sachstand und Bewertung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-02 - Zwei Gemeinschaften für einen Bearbeiter]]"
  - "[[docs/decisions/K-07 - Sachstand gezielt teilen und Bewertungen intern halten]]"
  - "[[docs/decisions/K-10 - Manuelle Quellenübernahme und Registerimport vorsehen]]"
hypotheses:
  - "[[docs/hypothesis/H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]"
  - "[[docs/hypothesis/H-05 - Manuelle Eingangsübernahme bleibt alltagstauglich]]"
  - "[[docs/hypothesis/H-06 - Vorbereitete Wochenarbeit ist ohne verpflichtende KI nützlich]]"
pages:
  - "[[docs/design/sitemap/VIEW-04 - Postausgang]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-05 - Senden, dokumentieren und nachhalten]]"
---

# PBI-18 · Nachrichten je Gemeinschaft bündeln

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich zusammengehörige Rückfragen mit ausgewählten Anlagen vorbereiten, damit die Verwaltung klar zugeordnete Anliegen erhält.

## Akzeptanzkriterien

1. Standard ist ein Sammelentwurf je Gemeinschaft und Anlass; unterschiedliche Empfänger, Themenstränge oder Dringlichkeit erlauben getrennte Entwürfe.
2. Text, Empfänger und jede Anlage sind vor Weitergabe prüfbar; WEG und Tiefgarage werden nicht vermischt.
3. Kopierbarer Text und Anlagenliste genügen als Kanalübergabe; Erzeugung oder Kopieren setzt keinen Versandstatus.
4. Eigene Angaben (Name, Rolle, Grußformel DE/EN) werden in neue Entwürfe übernommen; bestehende Entwürfe und gesendete Nachrichten bleiben unverändert.

## Herkunft und Regeln

Kriterium 4: Ergänzt aus dem Designreview und Pilot-Prototyp vom 15.11.2026 (direkte Nutzeranforderung, siehe [[Prototyp - Stand Pilot]]).

P FR-W6; US-09; DF-07/12. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-17 - Folgearbeit aus Entscheidungen vorbereiten]], [[PBI-28 - Empfängerbezogene Ausgabe prüfen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-07 - Wahl, Entwurf und Versand]], [[DF-12 - Gemeinschaftstrennung]].
