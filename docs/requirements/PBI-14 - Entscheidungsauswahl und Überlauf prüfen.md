---
type: PBI
parent: "[[F-06 - Wochenpaket vorbereiten]]"
order: 22000
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
  - "[[docs/entities/ENT-09 - Entscheidungskarte]]"
  - "[[docs/entities/ENT-14 - Übergabe]]"
business-rules:
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
  - "[[docs/business-rules/DF-09 - Begrenzte Auswahl und Dringlichkeit]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-04 - Wochenpaket beim Einstieg aktualisieren]]"
  - "[[docs/decisions/K-05 - Sieben reguläre Entscheidungen mit sichtbarem Überlauf]]"
hypotheses:
  - "[[docs/hypothesis/H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]"
  - "[[docs/hypothesis/H-04 - Sieben Entscheidungen sind ein brauchbares Arbeitsbudget]]"
pages:
  - "[[docs/design/sitemap/VIEW-02 - Wochenarbeit]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-02 - Wochenarbeit geführt]]"
---

# PBI-14 · Entscheidungsauswahl und Überlauf prüfen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich eine begrenzte priorisierte Auswahl und alle dringenden Ausnahmen sehen, damit ich Aufmerksamkeit steuere ohne Risiken zu übersehen.

## Akzeptanzkriterien

1. Bis sieben reguläre Entscheidungen insgesamt über beide Gemeinschaften; jede zeigt ihren Kontext.
2. Auswahlgrund berücksichtigt dringliche Fristen, letzte Schwerpunkte und Alter; unbekanntes Alter bleibt unbekannt.
3. Neun vor der nächsten Sitzung dringliche Fälle bleiben alle sichtbar, auch bei sieben regulären Karten.
4. Nicht gewählte reguläre Arbeit bleibt als Rückstand sichtbar; kein eigener Aufräummodus ist vorausgesetzt.

## Herkunft und Regeln

P FR-W2/W9; US-06; DF-09. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-13 - Aktuelle Wochenlage öffnen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-09 - Begrenzte Auswahl und Dringlichkeit]].

## Kommentare

- 26.11.2026: Entscheidungen des Produktverantwortlichen und Umsetzungsfreigabe für einen ersten Schnitt.
  - **Kandidaten:** Jeder offene oder ungeklärte Vorgang ist ein Kandidat; die Auswahl wird beim Öffnen der Ansicht Woche berechnet und nicht gespeichert. Eine Entscheidungskarte mit Optionen (ENT-09) entsteht erst mit [[PBI-15 - Eine Entscheidungsvorlage prüfen]].
  - **Dringend (Kriterium 3):** überfällig, oder fällig bis zur Einstellung „Frist für akute Probleme“ oder bis zum Ende der Woche. Dringende Fälle zählen nicht ins Budget und bleiben alle sichtbar. Ein Sitzungsdatum braucht es nicht.
  - **Schwerpunkte (Kriterium 2):** Vorerst zählen Frist und Alter; dass die letzten Schwerpunkte erst mit der Übergabe ([[PBI-25 - Nächste Wochenarbeit vorbereiten]]) zählen, steht sichtbar daneben.
  - **Ort:** ein Abschnitt „Entscheidungen“ in der Ansicht Woche mit Budget (etwa 5/7), den regulären Karten mit Auswahlgrund, „Dringend · zusätzlich“ und eingeklapptem „Rückstand“.
- 26.11.2026 (Umsetzung des ersten Schnitts): Erfüllt sind Kriterium 1 (bis zur Einstellung „Reguläre Entscheidungen pro Woche“, Vorgabe 7, über alle Gemeinschaften zusammen; jede Karte zeigt Nummer mit Kürzel, Ergebnis, Auswahlgrund und nächsten Schritt), 2 (Auswahlgrund nach Frist, dann Alter der Zusage; ein unbekanntes Alter steht als „Alter der Zusage unbekannt“ da und zählt nie als 0; dass die Schwerpunkte erst mit der Übergabe zählen, steht daneben), 3 (überfällige und bis Wochenende oder zur Frist für akute Probleme fällige Vorgänge stehen unter „Dringend · zusätzlich“, alle sichtbar, außerhalb des Budgets; neun dringende neben sieben regulären sind getestet) und 4 (der Rest steht eingeklappt als „Rückstand“, ohne Aufräummodus). Tests: `tests/unit/domain/week/selection.test.ts`, `tests/dom/presentation/week/decisions.test.ts`, `tests/e2e/specs/week.e2e.ts`.
