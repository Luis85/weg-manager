---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 85000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-05-Obsidian]]"
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
entities: []
business-rules: []
decisions: []
hypotheses: []
pages: []
user-flows: []
dependsOn: []
triage: ready-for-agent
---

# PBI-57 · Einstellungen schemagesteuert lesen und migrieren

**Planungsstand:** Technischer Folgepunkt aus dem Plan `docs/plans/pre-feature-improvement-plan.md` (Schritt 4.3) · **Bezug:** B-NFR-02, B-NFR-14

## User Story

Als Beirat möchte ich, dass das Plugin seine Einstellungen auch nach Updates sicher liest, damit ein Feld mit ungültigem oder altem Wert nicht alle übrigen Einstellungen zurücksetzt.

## Ausgangslage

`src/domain/settings.ts` dekodiert jedes Feld von Hand (`decodeFields`, `greetingField`, `logLevelField`). `SETTINGS_VERSION` erkennt nur eine neuere Version, es gibt keinen Migrationsschritt. Die Einstellungen wachsen bald (Wurzelordner der Notizen, später weitere).

## Akzeptanzkriterien

1. Die Dekodierung ist schemagesteuert (Effect Schema). Ein ungültiges Feld fällt auf seinen Standardwert zurück, die übrigen Felder bleiben erhalten.
2. Eine Migrationstabelle hebt ältere Versionen schrittweise auf die aktuelle. Eine neuere, unbekannte Version bleibt schreibgeschützt wie bisher.
3. Der Wurzelordner der Plugin-Notizen ist eine Einstellung ohne Oberfläche mit dem Standard `WEG Manager`; [[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]] liest den Ordner dort aus. Ein Verschieben der Notizen bei Änderung des Ordners ist ein späteres Feature und hier nicht enthalten.
4. Unit- und Property-Tests decken Fallback je Feld, jede Migrationsstufe und die Rückwärtsrichtung ab (neuere Version, kein Schreiben).
5. `npm run verify` endet mit Exit 0; berührt die Änderung den Einstellungs-Tab, läuft zusätzlich `npm run test:e2e` erfolgreich.

## Herkunft und Bezüge

Plan `docs/plans/pre-feature-improvement-plan.md`, Abschnitt 3 (Lücke B8) und Schritt 4.3; Entscheidung des Produktverantwortlichen vom 21.11.2026 (Wurzelordner als Einstellung ohne Oberfläche). Die Regel zum Bearbeitungsort steht in [[PBI-49 - Eine Einstellung hat genau einen Bearbeitungsort]].

## Kommentare

- 21.11.2026: Angelegt als offener Schritt des Plans `docs/plans/pre-feature-improvement-plan.md`. Bereit zur Umsetzung; die Reihenfolge steht in `dependsOn`.
