---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 80000
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
business-rules:
  - "[[docs/business-rules/DF-22 - Notizen als maßgeblicher Datenbestand]]"
  - "[[docs/business-rules/DF-23 - Externe Bearbeitung ohne stilles Überschreiben]]"
decisions:
  - "[[docs/decisions/K-14 - Markdown und Frontmatter als offene Datengrundlage]]"
hypotheses: []
pages: []
user-flows: []
dependsOn:
  - "[[PBI-51 - Plugin-Code in Module gliedern]]"
triage: ready-for-agent
---

# PBI-52 · Notizspeicher für Vault-Notizen bereitstellen

**Planungsstand:** Technischer Folgepunkt aus dem Plan `docs/plans/pre-feature-improvement-plan.md` (Schritt 3.2) · **Bezug:** B-NFR-02, B-NFR-10, B-NFR-14

## User Story

Als Beirat möchte ich, dass das Plugin meine Notizen über eine einzige, gut geprüfte Schnittstelle liest und schreibt, damit keine Änderung an meinen Dateien an Obsidians Schreibwegen vorbeiläuft und Notizen nicht beschädigt werden.

## Ausgangslage

Es gibt keinen Weg zu Vault-Notizen. `VaultReader` kennt nur `markdownFileCount`. Das Obsidian-Double kennt nur `getMarkdownFiles`, sein `MetadataCache` ist leer, es gibt keinen `fileManager`. `tests/support/layers.ts` und `harness/layers.ts` bauen je eigene Fakes.

## Akzeptanzkriterien

1. Ein Port `NoteStore` beschreibt den Notizzugriff in Fachbegriffen und ohne Obsidian-Typen (kein `TFile`): lesen, anlegen, Frontmatter ändern, Text ändern, umbenennen, in den Papierkorb legen.
2. Der Obsidian-Adapter in `src/infrastructure/obsidian/` liest über `metadataCache` und schreibt nur über `fileManager.processFrontMatter`, `vault.process`, `vault.create`, `fileManager.trashFile` und `fileManager.renameFile`. Andere Schreibaufrufe (z. B. `vault.modify`, `adapter.write`) kommen für Notizen nicht vor.
3. Ein In-Memory-Adapter dient Tests und Harness gemeinsam; die beiden bisherigen eigenen Fakes entfallen.
4. Das Obsidian-Double kann `getFileByPath`, `create`, `process`, `metadataCache.getFileCache`, `fileManager.processFrontMatter`, `fileManager.trashFile` und `fileManager.renameFile` und löst dieselben Ereignisse aus wie Obsidian.
5. Erwartbare Fehler (Notiz fehlt, Pfad belegt, Notiz nicht schreibbar) sind getaggte `AppError` mit `describeError`-Text in `de.ts` und `en.ts`.
6. Adaptertests laufen gegen das Double und gegen den In-Memory-Adapter mit denselben Fällen.
7. Ein e2e-Spec (`npm run test:e2e`) legt in echtem Obsidian eine Notiz an, ändert sie, benennt sie um und legt sie in den Papierkorb, und vergleicht die Ereignisse mit denen des Doubles.

## Herkunft und Bezüge

Plan `docs/plans/pre-feature-improvement-plan.md`, Abschnitt 3 (Lücke B1) und Schritt 3.2. Die Entscheidung steht in `docs/adr/0007-vault-data-access.md`. Grundlage sind [[K-14 - Markdown und Frontmatter als offene Datengrundlage]], [[DF-22 - Notizen als maßgeblicher Datenbestand]] und [[DF-23 - Externe Bearbeitung ohne stilles Überschreiben]].

## Kommentare

- 21.11.2026: Angelegt als offener Schritt des Plans `docs/plans/pre-feature-improvement-plan.md`. Bereit zur Umsetzung; die Reihenfolge steht in `dependsOn`.
