---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 83000
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
  - "[[docs/business-rules/DF-23 - Externe Bearbeitung ohne stilles Überschreiben]]"
decisions: []
hypotheses: []
pages: []
user-flows: []
dependsOn:
  - "[[PBI-51 - Plugin-Code in Module gliedern]]"
triage: ""
---

# PBI-55 · Navigation und App-Rahmen der Plugin-Ansicht bereitstellen

**Planungsstand:** Technischer Folgepunkt aus dem Plan `docs/plans/pre-feature-improvement-plan.md` (Schritt 3.5) · **Bezug:** B-NFR-02, B-NFR-06, B-NFR-11

## User Story

Als Beirat möchte ich nach einem Neustart von Obsidian dort weiterarbeiten, wo ich war, und überall im Plugin dieselbe Gemeinschaft gewählt sehen, damit ich keinen Kontext verliere und nichts vermische.

## Ausgangslage

`ShellView` hängt ein einzelnes `ShellPanel` ein; es gibt keine Route, kein `getState`/`setState` und keinen Gemeinschaftswechsel. `useFollowing` ist fest an `SettingsService` gebunden, Lesen und Schreiben aus der Oberfläche teilen sich ein Muster. Die Phase-1-Änderung trennt bereits `useQuery` (Lesen) und `useCommand` (Zustand ändern).

## Akzeptanzkriterien

1. `useQuery`, `useCommand` und `useStream` sind die Brücke der Oberfläche zu Use Cases und Strömen. `useStream` ersetzt das auf Einstellungen beschränkte `useFollowing`; nur `src/presentation/runtime/` importiert `effect`.
2. Das Plugin hat eine Obsidian-Ansicht mit einer eigenen, typisierten Routenliste (kein Router-Paket). `getState` und `setState` speichern und stellen die Route wieder her; Befehle navigieren über einen einzigen Use Case.
3. Der App-Rahmen zeigt Navigation und Gemeinschaftswechsel. Startroute ist `einstellungen/gemeinschaften`. Es gibt keine Platzhalterseiten.
4. Die Auswahl im Gemeinschaftswechsel wird je Gerät gespeichert und nicht synchronisiert (nicht in `data.json`); alle offenen Ansichten teilen eine Auswahl. Der Wechsel erhält die Auswahlliste als Eingabe; die Gemeinschaften selbst liefert [[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]].
5. Formulare führen beim Speichern je Feld zusammen: Ein extern geänderter Wert in einem unberührten Feld wird übernommen. Ein Feld, das auf beiden Seiten geändert wurde, bricht das Speichern mit einem Konflikt ab, den der Nutzer löst. Es wird nie still überschrieben.
6. Die ersten Nuxt-UI-Komponenten (Tabelle, Sheet) stehen in den `@source`-Listen von `src/styles/app.css`, neue Icons in `SHELL_ICONS` (`configs/vite.shared.ts`). Alle Texte stammen aus `de.ts` und `en.ts`.
7. Dom-Tests decken Routenwiederherstellung, Speicherung der Auswahl und die Feldzusammenführung ab. Ein e2e-Spec öffnet Obsidian neu und landet auf derselben Route; die Pop-out- und Theme-Prüfungen laufen weiter.

## Herkunft und Bezüge

Plan `docs/plans/pre-feature-improvement-plan.md`, Abschnitt 3 (Lücken B3 und B4) und Schritt 3.5; Entscheidungen des Produktverantwortlichen vom 21.11.2026 (Navigation, Speicherung der Auswahl, Zusammenführung je Feld). Die Entscheidung steht in `docs/adr/0008-navigation-and-view-state.md`. Die Zusammenführung folgt [[DF-23 - Externe Bearbeitung ohne stilles Überschreiben]]. Der mobile Einsatz folgt nach dem MVP.

## Kommentare

- 21.11.2026: Angelegt als offener Schritt des Plans `docs/plans/pre-feature-improvement-plan.md`. Bereit zur Umsetzung; die Reihenfolge steht in `dependsOn`.
- 21.11.2026: Vorgabe aus PBI-51: `src/presentation/shell/` bekommt zwei öffentliche Einstiege. `index.ts` ist die Schnittstelle für Fachkomponenten (`useQuery`, `useCommand`, `useStream`, Routen-Composables, gemeinsame Komponenten) und darf Vue laden. `host.ts` ist Vue-frei und enthält, was `bootstrap` und die Obsidian-Adapter beim Laden brauchen (`releaseAll`, `loadSurface`). Lint und fallow lassen genau diese beiden Dateien als Einstieg zu; `docs/adr/0006-module-structure.md` wird entsprechend ergänzt.
- 21.11.2026: Abgeschlossen. Stand der Umsetzung:
  - **Fester Tab, eigener Verlauf** (Entscheidung des Produktverantwortlichen): Die Plugin-Ansicht ist kein navigierbarer Obsidian-Tab. Eine Notiz, die bei aktivem Plugin-Tab geöffnet wird, landet in einem anderen Tab. Zurück und Vorwärts sind Schaltflächen im Rahmen; der Verlauf liegt je Ansicht im Arbeitsspeicher (höchstens 50 Schritte) und wird nicht gespeichert. Die aktuelle Route steht weiter im Ansichtszustand von Obsidian und ist nach einem Neustart wieder da. Obsidians eigene Pfeile im Tab-Kopf wirken nicht auf die Navigation im Plugin. Festgehalten als Ergänzung in `docs/adr/0008-navigation-and-view-state.md`.
  - **Zwei Einstiege** in `src/presentation/shell/`: `index.ts` für Fachkomponenten, `host.ts` (Vue-frei) für den Plugin-Start.
  - **Startroute** ist vorerst `welcome` mit dem Demo-Panel; `einstellungen/gemeinschaften` kommt mit [[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]]. Das betrifft die Kriterien, die die Startroute und den Gemeinschaftswechsel nennen: Der Rahmen hat dafür einen Platz (`context`), die Auswahl selbst entsteht in PBI-56 und nutzt den Port `DeviceStore`.
  - **Zusammenführen je Feld beim Speichern** gehört zum Notizformat und entsteht in [[PBI-53 - Notizformat mit Schemaversion lesen und schreiben]].
