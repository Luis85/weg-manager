---
type: PBI
parent: "[[F-05 - Quellen und Verlauf zuordnen]]"
order: 18000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-02-Verwaltung]]"
  - "[[ACT-06-Kommunikationswerkzeug]]"
release: "[[MVP - Beirat Support]]"
status: ""
started: 2026-11-26
finished: ""
horizon: ""
start: ""
due: ""
risk: ""
priority: ""
assignee: ""
iteration: ""
entities:
  - "[[docs/entities/ENT-02 - Person und Rolle]]"
  - "[[docs/entities/ENT-04 - Vorgang]]"
  - "[[docs/entities/ENT-05 - Termin]]"
  - "[[docs/entities/ENT-06 - Verlaufseintrag]]"
  - "[[docs/entities/ENT-07 - Quelle]]"
business-rules:
  - "[[docs/business-rules/DF-02 - Bearbeitung, Terminprüfung und Bewertung]]"
  - "[[docs/business-rules/DF-06 - Reaktion und Pause]]"
  - "[[docs/business-rules/DF-07 - Wahl, Entwurf und Versand]]"
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
  - "[[docs/business-rules/DF-14 - Kennzahlen]]"
decisions:
  - "[[docs/decisions/K-03 - Einzeln erledigbarer Vorgang als Kerneinheit]]"
  - "[[docs/decisions/K-06 - Eskalation an Versand und Fristen ausrichten]]"
  - "[[docs/decisions/K-10 - Manuelle Quellenübernahme und Registerimport vorsehen]]"
hypotheses:
  - "[[docs/hypothesis/H-02 - Einzelne Vorgänge machen den Arbeitsstand verständlich]]"
  - "[[docs/hypothesis/H-05 - Manuelle Eingangsübernahme bleibt alltagstauglich]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-03 - Vorgänge und Vorgangsakte]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-03 - Lagecheck unterwegs]]"
---

# PBI-12 · Verlauf nachvollziehen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich Anfrage, Antwort, Zusage und Erfüllung getrennt im Verlauf sehen, damit ich den tatsächlichen Stand erklären kann.

## Akzeptanzkriterien

1. Ereignisdatum, Erfassungsdatum, dokumentierter Akteur, Erfasser und Quelle bleiben unterscheidbar.
2. Empfangsbestätigung, inhaltliche Antwort, neuer Termin, Teillieferung und Erfüllung sind verschiedene Verlaufseinträge.
3. Korrekturen sind erkennbar; fehlende Zeitangaben bleiben unbekannt statt zu erfundenen Dauern zu führen.
4. Die lokale Historie behauptet keine Manipulationssicherheit.

## Herkunft und Regeln

P FR-V4/V6; P NFR-6; US-05; DF-06/14. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-11 - Nachricht und Original zuordnen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-06 - Reaktion und Pause]], [[DF-14 - Kennzahlen]].

## Kommentare

- 26.11.2026: Entscheidungen des Produktverantwortlichen und Umsetzungsfreigabe für einen gemeinsamen ersten Schnitt von [[PBI-08 - Bearbeitungsstand bewusst ändern]] und [[PBI-12 - Verlauf nachvollziehen]].
  - **Schnitt:** Der Abschnitt „Verlauf“ im Text der Vorgangsnotiz wird am Vorgang angezeigt. Ein Statuswechsel läuft über einen eigenen Dialog mit Anlass; erledigt und hinfällig verlangen zusätzlich eine Quelle. Er schreibt Status und Verlaufseintrag in einem Schritt. Einträge von Hand (Anfrage, Antwort, Notiz und die übrigen Arten) und Wiedereröffnen mit Begründung gehören dazu. „Nicht eingehalten“ (Bewertungsschicht, [[ENT-16 - Beiratsbewertung]]) folgt später.
  - **Format:** je Eintrag ein Listenpunkt unter „## Verlauf“ mit Inline-Feldern, etwa `- 2026-11-20 Anfrage per Mail an die Verwaltung [kind:: request] [actor:: board] [source:: Mail] [recorded:: 2026-11-21] [id:: …]`.
  - **Akteur:** ein Kontakt (`contact-…`) oder der Beirat selbst (`board`) als Vorgabe.
  - **Korrektur:** nur anhängen. Einträge werden nie geändert oder gelöscht; eine Korrektur ist ein neuer Eintrag mit `[corrects:: …]`, der alte erscheint als „korrigiert“.
- 26.11.2026 (Umsetzung des ersten Schnitts): Verlauf als Abschnitt „## Verlauf“ der Vorgangsnotiz ([[DV-03 - Vorgang v1]], ADR 0007 Nachtrag vom 26.11.2026), aufklappbar an jeder Vorgangskarte, mit Eintrag von Hand und Statuswechsel mit Anlass. Der `NoteStore` schreibt dafür Frontmatter und Abschnitt in einem atomaren Schritt. Erfüllt sind Kriterium 1 (Tag des Geschehens, Erfassungstag, Akteur und Quelle getrennt; der Erfasser ist heute immer der Beirat), 2 (Empfangsbestätigung, Antwort, neuer Termin, Teillieferung und Erfüllung sind eigene Arten), 3 (Korrektur als neuer Eintrag, der alte erscheint als korrigiert; ein unbekannter Tag bleibt `?`) und 4 (nichts behauptet Manipulationssicherheit: Der Verlauf ist Text der Notiz). Tests: `tests/unit/domain/matters/history.test.ts`, `tests/unit/application/matters/history.test.ts`, `tests/dom/presentation/matters/history.test.ts`, `tests/e2e/specs/matter-history.e2e.ts`, der Vertrag des `NoteStore` (fünf neue Fälle, auch in Obsidian). `npm run verify` mit Exit 0, e2e 29 von 29 Specs grün.

