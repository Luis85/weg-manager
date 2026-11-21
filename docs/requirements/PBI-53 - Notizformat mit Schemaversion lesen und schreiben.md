---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 81000
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
  - "[[PBI-52 - Notizspeicher für Vault-Notizen bereitstellen]]"
triage: ready-for-agent
---

# PBI-53 · Notizformat mit Schemaversion lesen und schreiben

**Planungsstand:** Technischer Folgepunkt aus dem Plan `docs/plans/pre-feature-improvement-plan.md` (Schritt 3.3) · **Bezug:** B-NFR-10, B-NFR-13, B-NFR-14

## User Story

Als Beirat möchte ich, dass das Plugin meine Notizen versioniert, verlustfrei und ohne Überraschungen liest und schreibt, damit eine externe Bearbeitung, eine kaputte Datei oder eine neuere Plugin-Version nie zu Datenverlust führt.

## Ausgangslage

Der Notizspeicher aus [[PBI-52 - Notizspeicher für Vault-Notizen bereitstellen]] liefert rohes Frontmatter. Es fehlt die Übersetzung in Fachobjekte und zurück sowie die Schemaversionierung.

## Akzeptanzkriterien

1. Eine Notiz gehört dem Plugin über das Frontmatter `schema: weg-manager.<typ>/v<n>`, egal wo sie im Vault liegt.
2. Die Identität ist das Frontmatter `id` (Typpräfix plus UUID); sie ändert sich nie, der Dateiname darf umbenannt werden. Lesbare Nummern wie `P-041` sind ein eigenes Anzeigefeld.
3. Frontmatter-Schlüssel und Wertcodes sind englisch in `snake_case`.
4. Ein generischer Codec (Effect Schema) liest Frontmatter zu einem Fachobjekt oder zu Problemcodes. Die Domäne liefert Codes, nie Sätze.
5. Beim Schreiben bleiben unbekannte Schlüssel und die Schlüsselreihenfolge erhalten. Ein Rundlauf-Test und ein Property-Test belegen das.
6. Ungültiges YAML, eine doppelte `id` und eine neuere Schemaversion ergeben je einen Problemcode und führen nie zu einem Schreibvorgang. Die betroffene Notiz bleibt lesbar, aber schreibgeschützt.
7. Neue Problemcodes haben `describeError`- bzw. Meldungstexte in `de.ts` und `en.ts`.
8. Der Mutationswert (`npm run verify:full`) bleibt auf dem bisherigen Stand.

## Herkunft und Bezüge

Plan `docs/plans/pre-feature-improvement-plan.md`, Schritt 3.3; Entscheidungen des Produktverantwortlichen vom 21.11.2026 (Notiz gehört über `schema` zum Plugin, unveränderliche `id`, englische Schlüssel). Die Entscheidung steht in `docs/adr/0007-vault-data-access.md`. Bezug: [[K-14 - Markdown und Frontmatter als offene Datengrundlage]], [[DF-22 - Notizen als maßgeblicher Datenbestand]], [[DF-23 - Externe Bearbeitung ohne stilles Überschreiben]].

## Kommentare

- 21.11.2026: Angelegt als offener Schritt des Plans `docs/plans/pre-feature-improvement-plan.md`. Bereit zur Umsetzung; die Reihenfolge steht in `dependsOn`.
