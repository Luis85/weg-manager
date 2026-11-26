---
type: PBI
parent: "[[F-03 - Einzelne Vorgänge bearbeiten]]"
order: 11000
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
  - "[[docs/entities/ENT-06 - Verlaufseintrag]]"
  - "[[docs/entities/ENT-07 - Quelle]]"
business-rules:
  - "[[docs/business-rules/DF-02 - Bearbeitung, Terminprüfung und Bewertung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
decisions:
  - "[[docs/decisions/K-02 - Zwei Gemeinschaften für einen Bearbeiter]]"
  - "[[docs/decisions/K-03 - Einzeln erledigbarer Vorgang als Kerneinheit]]"
hypotheses:
  - "[[docs/hypothesis/H-02 - Einzelne Vorgänge machen den Arbeitsstand verständlich]]"
  - "[[docs/hypothesis/H-05 - Manuelle Eingangsübernahme bleibt alltagstauglich]]"
pages:
  - "[[docs/design/sitemap/VIEW-03 - Vorgänge und Vorgangsakte]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-02 - Wochenarbeit geführt]]"
  - "[[docs/design/user-flows/FLOW-04 - Schnell erfassen und Eingang sichten]]"
---

# PBI-07 · Dubletten zusammenführen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich doppelte Vorgänge innerhalb einer Gemeinschaft zusammenführen, damit ich einen Sachverhalt nur einmal nachhalte.

## Akzeptanzkriterien

1. Ein prüfbarer Zielvorgang erhält Verweise auf die Ursprünge; widersprüchliche Angaben werden zur Auswahl gezeigt.
2. Alte Referenzen bleiben auflösbar und als zusammengeführt erkennbar.
3. Gleichnamige Vorgänge verschiedener Gemeinschaften werden nicht zusammengeführt.

## Herkunft und Regeln

P FR-V3; US-03; DF-12/13. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-05 - Einen Vorgang erfassen und wiederfinden]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-02 - Bearbeitung, Terminprüfung und Bewertung]], [[DF-12 - Gemeinschaftstrennung]], [[DF-13 - Historie und kontrollierte Entfernung]].

## Kommentare

- 26.11.2026: Entscheidungen des Produktverantwortlichen und Umsetzungsfreigabe für einen gemeinsamen ersten Schnitt von [[PBI-06 - Sammelvorgänge aufteilen]] und [[PBI-07 - Dubletten zusammenführen]].
  - **Ursprung:** Nach dem Aufteilen oder Zusammenführen ist der Ursprung „hinfällig“ und trägt `split_into_ids` beziehungsweise `merged_into_id`. Die Karte zeigt „aufgeteilt in AW 042, AW 043“ beziehungsweise „zusammengeführt in AW 041“. So zählt er nie als erfüllt und nie als offen.
  - **Widersprüche beim Zusammenführen:** Der Dialog zeigt jedes Feld, in dem sich Ziel und Dublette unterscheiden, und der Mensch wählt je Feld; Vorgabe ist der Wert des Ziels.
  - **Teile beim Aufteilen:** Jeder Teil erbt Gemeinschaft, Art, Thema und Quelle und bekommt im Dialog eigenes Ergebnis, Termin oder Klärungsstand, Verantwortlichen und nächsten Schritt. Jeder Teil bekommt eine neue Nummer und trägt `split_from_id`.
  - **Verlauf beim Zusammenführen:** Der Verlauf der Dublette bleibt in ihrer Notiz. Das Ziel bekommt einen Eintrag mit Verweis auf die Dublette, die Dublette einen mit Verweis auf das Ziel; nichts wird kopiert.
- 26.11.2026 (Umsetzung des ersten Schnitts): Erfüllt sind Kriterium 1 (das Ziel trägt `merged_from_ids` und einen Verlaufseintrag `merge`; der Dialog „Zusammenführen“ zeigt jedes Feld, in dem die Dublette einen anderen Wert hat, mit dem Wert des Ziels als Vorgabe), 2 (die Dublette bleibt als Notiz mit ihrem Verlauf, steht auf „hinfällig“, trägt `merged_into_id` und zeigt „zusammengeführt in …“) und 3 (zur Wahl stehen nur Vorgänge derselben Gemeinschaft; der Use Case weist andere ab). Tests: `tests/unit/domain/matters/lineage.test.ts`, `tests/unit/application/matters/lineage.test.ts`, `tests/dom/presentation/matters/lineage.test.ts`, `tests/e2e/specs/matter-lineage.e2e.ts`.
