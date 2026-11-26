---
type: PBI
parent: "[[F-05 - Quellen und Verlauf zuordnen]]"
order: 17000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-02-Verwaltung]]"
  - "[[ACT-03-Eigentuemer]]"
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
  - "[[docs/entities/ENT-04 - Vorgang]]"
  - "[[docs/entities/ENT-06 - Verlaufseintrag]]"
  - "[[docs/entities/ENT-07 - Quelle]]"
  - "[[docs/entities/ENT-08 - Dokument]]"
business-rules:
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
decisions:
  - "[[docs/decisions/K-07 - Sachstand gezielt teilen und Bewertungen intern halten]]"
  - "[[docs/decisions/K-10 - Manuelle Quellenübernahme und Registerimport vorsehen]]"
hypotheses:
  - "[[docs/hypothesis/H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]"
  - "[[docs/hypothesis/H-05 - Manuelle Eingangsübernahme bleibt alltagstauglich]]"
pages:
  - "[[docs/design/sitemap/VIEW-02 - Wochenarbeit]]"
  - "[[docs/design/sitemap/VIEW-03 - Vorgänge und Vorgangsakte]]"
  - "[[docs/design/sitemap/VIEW-05 - Erfassen]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-02 - Wochenarbeit geführt]]"
  - "[[docs/design/user-flows/FLOW-04 - Schnell erfassen und Eingang sichten]]"
---

# PBI-11 · Nachricht und Original zuordnen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich relevante Nachrichten und Unterlagen einem Vorgang zuordnen, damit ich Aussagen später belegen kann.

## Akzeptanzkriterien

1. Nachrichtentext, Gesprächsnotiz und Originaldatei sind mit Herkunft erfassbar; ein Quellenlink ist als Link erkennbar.
2. Neue Dokumentfassungen überschreiben keine bisherigen Originale; fehlende Dateien werden angezeigt.
3. Umbenennen erhält Beziehungen oder meldet Reparaturbedarf; Dateiinhalte werden nicht still verändert.
4. Der Erfassungsweg verlangt keinen Mail-Connector und behauptet keinen vollständigen Postfacheingang.
5. Dateien außerhalb des Vaults können gewählt werden; sie werden nach Wahl in den Quellenordner verschoben oder kopiert, der Zielpfad ist vor dem Speichern sichtbar. Mehrere Dateien je Erfassung sind möglich.
6. Quellen sind aus der Vorgangsakte mit Vorschau, Vault-Pfad und Öffnen in Obsidian einsehbar.

## Herkunft und Regeln

Kriterien 5–6: Ergänzt aus dem Designreview und Pilot-Prototyp vom 15.11.2026 (direkte Nutzeranforderung, siehe [[Prototyp - Stand Pilot]]).

P FR-E1/E2; US-05; Alt FR-17. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-05 - Einen Vorgang erfassen und wiederfinden]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-08 - Quellenabdeckung]].

## Kommentare

- 26.11.2026: Entscheidungen des Produktverantwortlichen und Umsetzungsfreigabe für einen ersten Schnitt.
  - **Datenform (O-ENT07-1, O-ENT08-1):** Je Erfassung eine Quellnotiz `weg-manager.source/v1` mit Art (Mail, Gespräch, Dokument …), Herkunft, Datum, Gemeinschaft, Vorgang oder Vorgängen und Verweisen auf die Originaldateien. Der Nachrichtentext steht im Text der Notiz. Die Originale bleiben unverändert; eine eigene Begleitnote je Datei gibt es nicht.
  - **Dateien von außerhalb (Kriterium 5):** Vorgabe ist Kopieren; Verschieben ist im Dialog wählbar (nur am Desktop, die Datei außerhalb wird erst nach erfolgreicher Kopie entfernt). Der Zielpfad steht vor dem Speichern da. Nie wird überschrieben; eine neue Fassung bekommt ` (2)`.
  - **Ablage:** `<Wurzelordner>/Quellen/<Kürzel>/`, benannt nach der WCS-Ablageregel `JJJJ-MM-TT Art Thema` mit der Endung der Datei.
  - **Vorschau (Kriterium 6):** Nachrichtentext und Bilder stehen in der Vorgangsakte; PDF und andere Dateien zeigen Vault-Pfad und „In Obsidian öffnen“; eine fehlende Datei ist markiert.
- 26.11.2026 (Umsetzung des ersten Schnitts): Erfüllt sind Kriterium 1 (Nachrichtentext, Gesprächsnotiz und Originaldateien sind mit Art, Herkunft und Tag als Quellnotiz `weg-manager.source/v1` erfassbar, [[DV-05 - Quelle v1]]; ein Quellenlink mit `http(s)://` steht als Link da), 2 (eine neue Fassung bekommt ` (2)` und überschreibt nie; eine fehlende Datei ist „Datei fehlt“), 3 (Originale sind per Wikilink verbunden; mit „Interne Links automatisch aktualisieren“ hält Obsidian ihn beim Umbenennen aktuell, das Plugin löst ihn auf wie Obsidian; sonst zeigt es „Datei fehlt“ als Reparaturbedarf; Dateiinhalte ändert es nie), 4 (der Weg braucht keinen Mail-Connector und behauptet keinen vollständigen Eingang), 5 (Dateien von außerhalb sind wählbar, mehrere je Erfassung; Kopieren ist die Vorgabe, Verschieben am Desktop wählbar; der Zielpfad steht vor dem Speichern da) und 6 (die Vorgangsakte zeigt je Quelle Text, Bilder, Vault-Pfad und „In Obsidian öffnen“). Erfasst wird im Verlauf des Vorgangs über „Quelle erfassen“. Nicht im Schnitt: Prüfstand und Vertraulichkeit einer Quelle, eine Quelle ohne Vorgang, Bearbeiten einer Quelle im Plugin. Tests: `tests/unit/domain/matters/source.test.ts`, `tests/unit/application/matters/sources.test.ts`, `tests/unit/infrastructure/notes/vault-files.test.ts`, `tests/dom/presentation/matters/sources.test.ts`, `tests/e2e/specs/sources.e2e.ts`.
