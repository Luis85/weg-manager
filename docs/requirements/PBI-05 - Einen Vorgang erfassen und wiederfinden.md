---
type: PBI
parent: "[[F-03 - Einzelne Vorgänge bearbeiten]]"
order: 9000
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
  - "[[docs/entities/ENT-01 - Gemeinschaft]]"
  - "[[docs/entities/ENT-02 - Person und Rolle]]"
  - "[[docs/entities/ENT-03 - Thema]]"
  - "[[docs/entities/ENT-04 - Vorgang]]"
  - "[[docs/entities/ENT-07 - Quelle]]"
  - "[[docs/entities/ENT-12 - To-do]]"
business-rules:
  - "[[docs/business-rules/DF-02 - Bearbeitung, Terminprüfung und Bewertung]]"
  - "[[docs/business-rules/DF-04 - Fehlender Termin]]"
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-01 - Beirat als erster Produkteinstieg]]"
  - "[[docs/decisions/K-02 - Zwei Gemeinschaften für einen Bearbeiter]]"
  - "[[docs/decisions/K-03 - Einzeln erledigbarer Vorgang als Kerneinheit]]"
hypotheses:
  - "[[docs/hypothesis/H-01 - Beiratsfokus deckt den ersten Pilotbedarf]]"
  - "[[docs/hypothesis/H-02 - Einzelne Vorgänge machen den Arbeitsstand verständlich]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-03 - Vorgänge und Vorgangsakte]]"
  - "[[docs/design/sitemap/VIEW-05 - Erfassen]]"
  - "[[docs/design/sitemap/VIEW-07 - Einstellungen und Einrichtung]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-04 - Schnell erfassen und Eingang sichten]]"
---

# PBI-05 · Einen Vorgang erfassen und wiederfinden

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich eine Zusage, eine Frage oder ein To-do als einzeln erledigbaren Vorgang erfassen, damit der nächste Schritt zu einem konkreten Ergebnis führt.

## Akzeptanzkriterien

1. Referenz, Gemeinschaft, Art, Thema, erwartetes Ergebnis, Verantwortlicher, Quelle oder Quellenlücke und nächster Schritt sind erfassbar.
2. Ein Thema kann mehrere unabhängige Vorgänge bündeln, ohne deren Status zu verbinden.
3. Suche und Filter nach Thema, Bearbeitungsstand, Gemeinschaft und Verantwortlichem öffnen den richtigen Vorgang.
4. Ein vorhandener Altfall benötigt keine erfundenen vorherigen Prozessschritte.
5. Eine eigene Notiz ohne Quelle kann einem Vorgang hinzugefügt werden; sie erscheint im Verlauf als Notiz und gilt nicht als Quelle.

## Herkunft und Regeln

Kriterium 5: Ergänzt aus dem Designreview und Pilot-Prototyp vom 15.11.2026 (direkte Nutzeranforderung, siehe [[Prototyp - Stand Pilot]]).

P FR-V1; US-03. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-01 - Gemeinschaftskontext wählen]], [[PBI-02 - Personen und Rollen zuordnen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Kommentare

- 26.11.2026: Entscheidungen des Produktverantwortlichen und Umsetzungsfreigabe für einen ersten Schnitt.
  - **Freigabe (Kern-Schnitt):** ein neues Modul `matters`. Ein Vorgang wird als Notiz angelegt und bearbeitet, mit den Pflichtfeldern aus [[ENT-04 - Vorgang]] und der Wiedervorlage. Dazu kommt eine Liste unter der Route „Vorgänge“ mit Suche und Filtern nach Thema, Bearbeitungsstand, Gemeinschaft und Verantwortlichem (Kriterium 3) und dem berechneten Prüfvermerk („überfällig“, „Termin erfragen“). Verlauf, eigene Notiz (Kriterium 5), Statuswechsel mit Anlass ([[PBI-08 - Bearbeitungsstand bewusst ändern]]) und die Vorgangsakte als eigene Seite folgen danach.
  - **Wer:** `responsible_id` verweist auf einen Kontakt ([[PBI-02 - Personen und Rollen zuordnen]]), kein freier Text.
  - **Verlauf (O-ENT04-4):** als datierte Liste unter der Überschrift „Verlauf“ im Text der Vorgangsnotiz. Das Plugin schreibt nur in diesen Abschnitt; der Abschnittsvertrag kommt mit dem Verlauf.
  - **Vorgangsnummer:** die höchste Nummer im Vault plus eins. Eine doppelte Nummer, etwa nach einem Sync, erscheint als Problem, und der Mensch vergibt eine neue.
- 26.11.2026 (Umsetzung des ersten Schnitts): Modul `matters` in allen Schichten, Dateivertrag [[DV-03 - Vorgang v1]], eigene Route „Vorgänge“ in der Navigation. Erfüllt sind Kriterium 1 (Nummer, Gemeinschaft, Art, Thema, erwartetes Ergebnis, Verantwortlicher als Kontakt, Quelle oder Quellenlücke `unknown`, nächster Schritt, dazu Termine, Wiedervorlage, Nachrichtenreferenz und Link), 2 (ein Thema bündelt Vorgänge, ohne ihren Stand zu verbinden) und 3 (Suche über Thema, Ergebnis, nächsten Schritt und Nummer; Filter nach Thema, Bearbeitungsstand, Gemeinschaft und Verantwortlichem). Kriterium 4 gilt, weil ein Vorgang ohne vorherige Schritte angelegt wird; der Import von Altfällen ist [[PBI-04 - Geprüften Bestand übernehmen]]. Offen: Kriterium 5 (eigene Notiz im Verlauf) mit dem Verlauf. Der Prüfvermerk („überfällig“, „Termin erfragen“) wird berechnet und nie gespeichert. In der Navigation steht „Kontakte“ noch vor „Vorgänge“, weil die Einträge der Reihenfolge der Module folgen; die Reihenfolge der Sitemap (Vorgänge vor Kontakte) braucht eine eigene Ordnung der Einträge. Tests: `tests/unit/domain/matters/`, `tests/unit/application/matters/`, `tests/dom/presentation/matters/screen.test.ts`, `tests/e2e/specs/matters.e2e.ts`. `npm run verify` mit Exit 0, e2e 28 von 28 Specs grün.

