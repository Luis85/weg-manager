---
type: PBI
parent: "[[F-21 - Nichtfunktionale Anforderungen]]"
order: 76000
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
triage: ready-for-agent
---

# PBI-49 · Eine Einstellung hat genau einen Bearbeitungsort

**Planungsstand:** Technischer Folgepunkt aus dem Code-Review der Plugin-Shell · **Bezug:** B-NFR-02, B-NFR-05

## User Story

Als Beirat möchte ich jede Einstellung an genau einer Stelle bearbeiten und dort immer den aktuellen Wert sehen, damit ein veraltetes Formular meinen zuletzt gespeicherten Wert nicht überschreibt und Tippen nicht bei jedem Zeichen eine Datei schreibt.

## Ausgangslage

Die Begrüßung ist sowohl im nativen Einstellungs-Tab als auch im Formular der Ansicht bearbeitbar. `src/presentation/components/GreetingForm.vue` liest `defaultValues` nur einmal; nach einer Änderung im Tab zeigt das Formular den alten Wert, und „Speichern“ überschreibt den neueren. Das Textfeld im Tab (`src/infrastructure/obsidian/settings-tab.ts`, `setControlValue`) schreibt `data.json` bei jedem Tastendruck.

## Akzeptanzkriterien

1. Für jede bestehende Einstellung ist genau ein Bearbeitungsort festgelegt (Einstellungs-Tab oder Ansicht); der andere Ort zeigt den Wert höchstens lesend an. Die Regel wird später in `docs/engineering/adding-a-feature.md` dokumentiert.
2. Ein vom Nutzer nicht berührtes Formularfeld übernimmt Änderungen aus `changes` des `SettingsService`; ein bereits bearbeitetes Feld wird nicht überschrieben.
3. Textänderungen im Einstellungs-Tab werden entprellt (z. B. 400 ms) oder beim Verlassen des Felds gespeichert; ein schnelles Tippen erzeugt höchstens einen Schreibvorgang je Pause.
4. Beim Schließen des Tabs geht ein noch nicht gespeicherter entprellter Wert nicht verloren.
5. Tests je Kriterium: Komponententest für das Nachführen des unberührten Felds und den Schutz des bearbeiteten Felds, Unit-Test für das Entprellen bzw. Speichern beim Verlassen in `settings-tab.ts`. Weil der Einstellungs-Tab betroffen ist, läuft zusätzlich ein e2e-Test erfolgreich.

## Herkunft und Bezüge

Code-Review der Plugin-Shell vom 21.11.2026. Ergänzt [[PBI-48 - Externe Änderungen an den Einstellungen übernehmen]], das dieselben `changes` für Sync-Änderungen nutzt.

## Kommentare

- 21.11.2026: Kriterium 2 ist umgesetzt, Kriterien 1, 3, 4 und 5 (bis auf den Komponententest zu 2) sind offen.
  - **Unberührtes Feld folgt (2):** `GreetingForm.vue` beobachtet die angezeigte Begrüßung (gespeicherter Wert oder Standard der UI-Sprache). Zeigt das Feld noch den vorherigen Wert, setzt es sich auf den neuen (`form.reset`), etwa nach einer Änderung im Einstellungs-Tab oder per Sync (`SettingsService.reload`). Was der Nutzer gerade tippt, bleibt stehen; nach dem Speichern folgt das Feld wieder. „Speichern“ überschreibt damit keine neuere Begrüßung mehr mit einem veralteten Wert.
  - **Tests:** `tests/dom/presentation/greeting-form.test.ts` (Nachführen, Zurücksetzen auf den Standard, Schutz der Eingabe, Speichern nach Sync).
  - Entstanden mit der UI-Sprache nach Obsidian ([ADR 0005](../adr/0005-ui-language.md)): Auch der Standardgruß der Sprache wird so nachgeführt.
- 21.11.2026: Kriterium 1 ist entschieden (Entscheidung des Product Owners), Kriterien 3 und 4 sind gegenstandslos.
  - **Ein Bearbeitungsort (1):** Die Begrüßung wird nur noch im Formular der Ansicht (`GreetingForm.vue`) bearbeitet. Der Einstellungs-Tab (`src/infrastructure/obsidian/settings-tab.ts`) enthält nur Plugin-Einstellungen (Protokollstufe, bei schreibgeschützten Einstellungen der Hinweis dazu). Die Regel steht in `AGENTS.md` und `docs/engineering/adding-a-feature.md`: technische Plugin-Einstellungen im Einstellungs-Tab von Obsidian, fachliche Daten in den Ansichten des Plugins.
  - **Entprellen (3) und ungespeicherter Wert beim Schließen (4):** gegenstandslos, weil der Tab kein Textfeld mehr hat; das Schreiben von `data.json` bei jedem Tastendruck entfällt damit.
  - **Nachführen des unberührten Felds (2):** bereits früher umgesetzt (siehe Kommentar oben).
  - **Tests:** `tests/dom/settings-tab.test.ts` (nur Protokollstufe, kein Textfeld), `tests/e2e/specs/settings-and-theme.e2e.ts` (Tab ohne Textfeld, Begrüßung über das Formular der Ansicht gespeichert, leere Begrüßung nie geschrieben).
