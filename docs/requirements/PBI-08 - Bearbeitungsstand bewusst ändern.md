---
type: PBI
parent: "[[F-03 - Einzelne Vorgänge bearbeiten]]"
order: 12000
actors:
  - "[[ACT-01-Beirat]]"
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
  - "[[docs/entities/ENT-04 - Vorgang]]"
  - "[[docs/entities/ENT-05 - Termin]]"
  - "[[docs/entities/ENT-06 - Verlaufseintrag]]"
  - "[[docs/entities/ENT-07 - Quelle]]"
  - "[[docs/entities/ENT-09 - Entscheidungskarte]]"
  - "[[docs/entities/ENT-16 - Beiratsbewertung]]"
business-rules:
  - "[[docs/business-rules/DF-01 - Beiratsarbeit und Befugnis]]"
  - "[[docs/business-rules/DF-02 - Bearbeitung, Terminprüfung und Bewertung]]"
  - "[[docs/business-rules/DF-06 - Reaktion und Pause]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
  - "[[docs/business-rules/DF-15 - Entscheidungskarte und Beschluss]]"
decisions:
  - "[[docs/decisions/K-01 - Beirat als erster Produkteinstieg]]"
  - "[[docs/decisions/K-03 - Einzeln erledigbarer Vorgang als Kerneinheit]]"
  - "[[docs/decisions/K-06 - Eskalation an Versand und Fristen ausrichten]]"
  - "[[docs/decisions/K-07 - Sachstand gezielt teilen und Bewertungen intern halten]]"
hypotheses:
  - "[[docs/hypothesis/H-02 - Einzelne Vorgänge machen den Arbeitsstand verständlich]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-03 - Vorgänge und Vorgangsakte]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
---

# PBI-08 · Bearbeitungsstand bewusst ändern

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich Erledigung, Klärungsbedarf und meine Bewertung getrennt erfassen, damit ein Prüfhinweis nicht als belegte Erfüllung gilt.

## Akzeptanzkriterien

1. Offen, ungeklärt, erledigt und hinfällig sind unterscheidbar; Erledigung oder Hinfälligkeit erhält Anlass und vorhandene Quelle.
2. Nicht eingehalten wird nur bewusst mit Begründung und Bezug zur Zusageversion gesetzt; es erledigt den Vorgang nicht.
3. Ein neuer Termin und eine Teillieferung erledigen den Vorgang nicht automatisch; begründete Wiederöffnung ist möglich.
4. Eine Entscheidung auf einer Entscheidungskarte erzeugt keinen Gemeinschaftsbeschluss, Auftrag oder Zahlungseintrag.

## Herkunft und Regeln

P FR-V7; US-03; DF-02/06/15. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-05 - Einen Vorgang erfassen und wiederfinden]], [[PBI-12 - Verlauf nachvollziehen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-01 - Beiratsarbeit und Befugnis]], [[DF-02 - Bearbeitung, Terminprüfung und Bewertung]], [[DF-06 - Reaktion und Pause]], [[DF-15 - Entscheidungskarte und Beschluss]].

## Kommentare

- 26.11.2026: Entscheidungen des Produktverantwortlichen und Umsetzungsfreigabe für einen gemeinsamen ersten Schnitt von [[PBI-08 - Bearbeitungsstand bewusst ändern]] und [[PBI-12 - Verlauf nachvollziehen]].
  - **Schnitt:** Der Abschnitt „Verlauf“ im Text der Vorgangsnotiz wird am Vorgang angezeigt. Ein Statuswechsel läuft über einen eigenen Dialog mit Anlass; erledigt und hinfällig verlangen zusätzlich eine Quelle. Er schreibt Status und Verlaufseintrag in einem Schritt. Einträge von Hand (Anfrage, Antwort, Notiz und die übrigen Arten) und Wiedereröffnen mit Begründung gehören dazu. „Nicht eingehalten“ (Bewertungsschicht, [[ENT-16 - Beiratsbewertung]]) folgt später.
  - **Format:** je Eintrag ein Listenpunkt unter „## Verlauf“ mit Inline-Feldern, etwa `- 2026-11-20 Anfrage per Mail an die Verwaltung [kind:: request] [actor:: board] [source:: Mail] [recorded:: 2026-11-21] [id:: …]`.
  - **Akteur:** ein Kontakt (`contact-…`) oder der Beirat selbst (`board`) als Vorgabe.
  - **Korrektur:** nur anhängen. Einträge werden nie geändert oder gelöscht; eine Korrektur ist ein neuer Eintrag mit `[corrects:: …]`, der alte erscheint als „korrigiert“.
- 26.11.2026 (Umsetzung des ersten Schnitts): Verlauf als Abschnitt „## Verlauf“ der Vorgangsnotiz ([[DV-03 - Vorgang v1]], ADR 0007 Nachtrag vom 26.11.2026), aufklappbar an jeder Vorgangskarte, mit Eintrag von Hand und Statuswechsel mit Anlass. Der `NoteStore` schreibt dafür Frontmatter und Abschnitt in einem atomaren Schritt. Erfüllt sind Kriterium 1 (vier unterscheidbare Stände; jeder Wechsel mit Anlass, erledigt und hinfällig zusätzlich mit Quelle, erledigt mit Tag) und 3 (ein Wechsel geschieht nur bewusst; Wiedereröffnen mit Begründung). Offen: Kriterium 2 („nicht eingehalten“ in der Bewertungsschicht) und 4 (Entscheidungskarten). Tests: `tests/unit/domain/matters/history.test.ts`, `tests/unit/application/matters/history.test.ts`, `tests/dom/presentation/matters/history.test.ts`, `tests/e2e/specs/matter-history.e2e.ts`, der Vertrag des `NoteStore` (fünf neue Fälle, auch in Obsidian). `npm run verify` mit Exit 0, e2e 29 von 29 Specs grün.

