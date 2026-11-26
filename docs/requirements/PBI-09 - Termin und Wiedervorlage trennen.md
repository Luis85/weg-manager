---
type: PBI
parent: "[[F-04 - Termine und eigene Schritte führen]]"
order: 14000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-02-Verwaltung]]"
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
  - "[[docs/entities/ENT-12 - To-do]]"
business-rules:
  - "[[docs/business-rules/DF-02 - Bearbeitung, Terminprüfung und Bewertung]]"
  - "[[docs/business-rules/DF-03 - Terminbedeutung]]"
  - "[[docs/business-rules/DF-04 - Fehlender Termin]]"
  - "[[docs/business-rules/DF-05 - Eskalationsleiter und Fristen]]"
  - "[[docs/business-rules/DF-06 - Reaktion und Pause]]"
decisions:
  - "[[docs/decisions/K-03 - Einzeln erledigbarer Vorgang als Kerneinheit]]"
  - "[[docs/decisions/K-06 - Eskalation an Versand und Fristen ausrichten]]"
hypotheses:
  - "[[docs/hypothesis/H-01 - Beiratsfokus deckt den ersten Pilotbedarf]]"
  - "[[docs/hypothesis/H-02 - Einzelne Vorgänge machen den Arbeitsstand verständlich]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-03 - Vorgänge und Vorgangsakte]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-02 - Wochenarbeit geführt]]"
---

# PBI-09 · Termin und Wiedervorlage trennen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich fachliche Termine mit Herkunft und eine eigene Wiedervorlage führen, damit Nachfassen keine zugesagte Frist verändert.

## Akzeptanzkriterien

1. Zugesagter, vertraglicher, als formell angegebener und gewünschter Termin sowie Wiedervorlage sind unterscheidbar.
2. Bei fehlendem Fremdtermin sind Klärungsstand, Verantwortlicher und eigene nächste Handlung mit Wiedervorlage sichtbar.
3. Überfälligkeit eines Datums ohne Uhrzeit erscheint ab dem Folgetag in Europe/Berlin; geschlossene Vorgänge werden nicht als aktuell offen behandelt.
4. Eine unbekannte Zusagezeit wird nicht als Alter null berechnet; Import setzt das Alter nicht zurück.

## Herkunft und Regeln

P FR-V2/V5; US-04; DF-03/04/05. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-05 - Einen Vorgang erfassen und wiederfinden]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-02 - Bearbeitung, Terminprüfung und Bewertung]], [[DF-03 - Terminbedeutung]], [[DF-04 - Fehlender Termin]].

## Kommentare

- 26.11.2026: Entscheidungen des Produktverantwortlichen und Umsetzungsfreigabe für einen ersten Schnitt.
  - **Schnitt:** Am Vorgang kommen Bedeutung des Termins (`due_kind`: Zusage, vertraglich, formelle Frist, gewünschte Antwort), Herkunft (`due_source`) und Prüfstand (`due_checked`: bestätigt, vorgeschlagen, unbekannt) dazu. „Termin ändern“ ist ein eigener Dialog und schreibt die bisherige Fassung als Verlaufseintrag „neuer Termin“. Die Wiedervorlage bleibt ein eigenes Datum. Die Karte zeigt Bedeutung, Prüfstand und das Alter der Zusage; ohne Termin zeigt sie Klärungsstand, Wer, nächsten Schritt und Wiedervorlage (Kriterium 2).
  - **Zeitzone (Kriterium 3):** „Heute“ rechnet das Plugin immer in Europe/Berlin, unabhängig von der Zeitzone des Geräts.
  - **Sperren:** Beim Bearbeiten sind Bearbeitungsstand und Termin im Vorgangsformular nur Anzeige; sie ändern sich über „Stand ändern“ und „Termin ändern“, jeweils mit Verlaufseintrag. Beim Anlegen sind beide setzbar.
  - **Navigation:** Die Einträge folgen der Sitemap (Lage · Woche · Vorgänge · Postausgang · Kontakte · Einstellungen), über eine Ordnungszahl je Eintrag.
- 26.11.2026 (Umsetzung des ersten Schnitts): Erfüllt sind Kriterium 1 (Bedeutung `due_kind` unterscheidet Zusage, vertraglichen Termin, formelle Frist und gewünschte Antwort; die Wiedervorlage ist ein eigenes Datum; Herkunft und Prüfstand dazu), 2 (ohne Termin zeigt die Karte „Termin erfragen“, Stand, Wer, nächsten Schritt und Wiedervorlage), 3 („heute“ in Europe/Berlin, überfällig ab dem Folgetag; erledigte und hinfällige Vorgänge bekommen keinen Prüfvermerk) und 4 (das Alter der Zusage zählt ab `promised_on`; ohne ihn steht kein Alter da). „Termin ändern“ im Verlauf schreibt den neuen Termin und die bisherige Fassung (`previous`) in einem Schritt. Beim Bearbeiten sind Stand und Termin im Formular nur Anzeige. Die Navigation folgt der Sitemap (Vorgänge vor Kontakte). Tests: `tests/unit/domain/matters/`, `tests/unit/application/matters/history.test.ts`, `tests/dom/presentation/matters/`, `tests/dom/infrastructure/shell/today.test.ts`, `tests/e2e/specs/matter-history.e2e.ts`. `npm run verify` mit Exit 0, e2e 29 von 29 Specs grün.

