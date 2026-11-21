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
finished: 2026-11-21
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
triage: ""
---

# PBI-53 · Notizformat mit Schemaversion lesen und schreiben

**Planungsstand:** Technischer Folgepunkt aus dem Plan `docs/plans/pre-feature-improvement-plan.md` (Schritt 3.3) · **Bezug:** B-NFR-10, B-NFR-13, B-NFR-14

## User Story

Als Beirat möchte ich, dass das Plugin meine Notizen versioniert, verlustfrei und ohne Überraschungen liest und schreibt, damit eine externe Bearbeitung, eine kaputte Datei oder eine neuere Plugin-Version nie zu Datenverlust führt.

## Ausgangslage

Der Notizspeicher aus [[PBI-52 - Notizspeicher für Vault-Notizen bereitstellen]] liefert rohes Frontmatter. Es fehlt die Übersetzung in Fachobjekte und zurück sowie die Schemaversionierung. Das Gmail-Skill nutzt bereits englische Schlüssel in `snake_case` (z. B. `community_id`).

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
- 21.11.2026: Abgeschlossen. Stand der Umsetzung:
  - **Notiztyp als Deklaration:** `defineNoteType` (`src/domain/notes/`) leitet aus Typname, Version, Feldern und Migrationstabelle das Lesen, das Frontmatter einer neuen Notiz und das Zusammenführen ab. Feldarten: Text, Zahl, Kontrollkästchen, Datum (`YYYY-MM-DD`, echter Kalendertag), Textliste. Die Schlüssel im Code sind dieselben wie in der Datei (snake_case), ohne Umbenennung.
  - **Ergebnisse des Lesens:** kein Datensatz dieses Typs; schreibgeschützt (neuere Version, fehlgeschlagene Migration, fehlende, fehlerhafte oder fremde `id`, doppelte `id`); bearbeitbar, auch mit einzelnen ungültigen Feldern, die als Problem je Feld gemeldet werden und sich im Formular reparieren lassen.
  - **Zusammenführen je Feld:** ein vom Nutzer nicht geändertes Feld behält den aktuellen Wert der Notiz; ein geändertes wird geschrieben, solange die Notiz noch den geladenen Wert hat; ein auf beiden Seiten verschieden geändertes Feld ist ein Konflikt, dann wird nichts geschrieben. Unbekannte Schlüssel bleiben unberührt. Eine Notiz älterer Version wird beim Speichern in der aktuellen Version geschrieben.
  - **Offen für [[PBI-54 - Index der Notizen aufbauen und aktuell halten]]:** einen fehlerhaften `schema`-Wert und einen gültigen `schema`-Wert unbekannten Typs als Problem melden; ungültiges YAML in den Plugin-Ordnern melden.
  - **Offen für [[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]]:** eine Prüfung der Formularwerte gegen die Feldregeln vor dem Speichern.
