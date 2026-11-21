---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 79000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-05-Obsidian]]"
release: ""
status: ""
started: ""
finished: 2026-11-21
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

# PBI-51 · Plugin-Code in Module gliedern

**Planungsstand:** Technischer Folgepunkt aus dem Plan `docs/plans/pre-feature-improvement-plan.md` (Schritte 2.1 und 3.1) · **Bezug:** B-NFR-11, B-NFR-14

## User Story

Als Beirat möchte ich, dass das Plugin in klar getrennte Module gegliedert ist, damit neue Fachfunktionen ohne Eingriff in fremden Code entstehen und das Plugin dabei verlässlich bleibt.

## Ausgangslage

Jede Schicht liegt in wenigen Sammeldateien: `ports.ts`, `errors.ts`, `events.ts`, `use-cases.ts`, `user-messages.ts`, `i18n/catalog.ts` mit `de.ts` und `en.ts`, `app-services.ts`, `obsidian/layers.ts`. Jedes Fachfeature würde dieselben Dateien ändern. Das Plugin soll 17 MVP-Entitäten und 36 Stories tragen, mit Dateigrenze von 400 Zeilen und parallelen Agenten-Worktrees.

## Akzeptanzkriterien

1. Jede Schicht (`src/domain`, `src/application`, `src/infrastructure/obsidian`, `src/presentation`) ist nach Modulen gegliedert: `src/<Schicht>/<modul>/`. Ein Modul besitzt seine Ports, Fehler, Use Cases, Ereignisse und seinen Katalogteil.
2. Das vorhandene Plugin-Gerüst ist das Modul `shell`.
3. Ein Modul importiert ein anderes nur über dessen `index.ts`. Lint und fallow erzwingen die Regel; ein absichtlich eingefügter Import an `index.ts` vorbei lässt Lint fehlschlagen. Der Nachweis steht in der PR-Beschreibung.
4. Zentrale Dateien komponieren nur: `AppError` ist die Vereinigung der Modulfehler, `Catalog` setzt sich aus den Modulkatalogen zusammen, `describeError` delegiert je Modul. Sie enthalten keinen Fachcode.
5. Neue Code-Bezeichner sind englisch (z. B. `Community`); deutsche Fachbegriffe bleiben in Oberfläche und `docs/`. `GLOSSARY.md` ordnet sie einander zu.
6. Es ändert sich kein Verhalten: `npm run verify` endet mit Exit 0, die vorhandenen Tests ändern sich nur in Importpfaden, die Zeilengrenzen (400 je Quell-, 450 je Testdatei) halten.

## Herkunft und Bezüge

Plan `docs/plans/pre-feature-improvement-plan.md`, Abschnitt 3 (Lücke B2) und Schritte 2.1 und 3.1. Die Entscheidung steht in `docs/adr/0006-module-structure.md`; Entscheidung des Produktverantwortlichen vom 21.11.2026: Code-Bezeichner sind englisch. Voraussetzung für [[PBI-52 - Notizspeicher für Vault-Notizen bereitstellen]] und [[PBI-55 - Navigation und App-Rahmen der Plugin-Ansicht bereitstellen]].

## Kommentare

- 21.11.2026: Angelegt als offener Schritt des Plans `docs/plans/pre-feature-improvement-plan.md`. Bereit zur Umsetzung; die Reihenfolge steht in `dependsOn`.
- 21.11.2026: Abgeschlossen. Der vorhandene Code ist das Modul `shell`; die Sammeldateien in `src/application/` komponieren nur noch. Die Modulgrenzen prüfen ESLint (`eslint.config.mjs`, Block `moduleBoundaries`) und fallow (`configs/fallow.json`); die Schichtregeln bleiben in oxlint. Ein neues Modul ist ein Eintrag in den Modullisten von `eslint.config.mjs` und, sobald andere es importieren, in den `allow`-Listen von `configs/fallow.json`. Offen für [[PBI-55 - Navigation und App-Rahmen der Plugin-Ansicht bereitstellen]]: `src/presentation/shell/index.ts` ist heute Vue-frei, weil `bootstrap` es beim Laden importiert; Fachkomponenten brauchen einen zweiten, Vue-seitigen Einstieg.
