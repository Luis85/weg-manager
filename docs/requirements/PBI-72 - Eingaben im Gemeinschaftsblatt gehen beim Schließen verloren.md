---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 100000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-05-Obsidian]]"
release: ""
status: ""
started: ""
finished: 2026-11-22
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
triage: ""
---

# PBI-72 · Eingaben im Gemeinschaftsblatt gehen beim Schließen verloren

**Planungsstand:** Befund bestätigt im Code, im echten Obsidian nicht ausgeführt; Entscheidung des Eigentümers am 22.11.2026 getroffen (Rückfrage vor dem Verwerfen, in jedem Formular des Datensatz-Bausteins) · **Bezug:** `docs/plans/pre-feature-improvement-plan.md` (Abschnitt 8, Review-Runde 2 vom 22.11.2026)

## User Story

Als Beirat möchte ich, dass ein Text, den ich im Blatt einer Gemeinschaft getippt habe, nicht ohne Rückfrage verschwindet, wenn ich Escape drücke oder neben das Blatt klicke, damit ich nicht noch einmal eintippen muss.

## Ausgangslage

**Befund 3: Das Blatt schließt bei Escape und bei jedem Klick daneben.** `CommunitySettings.vue` zeigt das Formular in einem `USlideover` (`src/presentation/communities/components/CommunitySettings.vue`, Zeilen 129 bis 134) und setzt dafür nur `v-model:open="sheetOpen"`. Der Slideover hat Nuxt UIs Voreinstellung `dismissible: true` (geprüft in `node_modules/@nuxt/ui/.../Slideover.vue`, Zeile 28). Das Schließen setzt `editing = undefined` und hängt damit das Formular aus; alle Eingaben sind weg.

**Szenario.** Die Person tippt eine neue Gemeinschaft und klickt dann in eine andere Obsidian-Ansicht, um einen Namen zu kopieren, oder drückt Escape. Das Blatt schließt, die Eingabe ist verloren. Dass Reka ein modales Blatt bei einem Klick außerhalb schließt, ist sein Standardverhalten; der Reviewer hat es nicht in Obsidian ausgeführt.

**Bekannter Rahmen.** `docs/design/handoff/03 - Ansichten, Navigation und Befehle.md` (Zeile 75) nennt den Verlust von Formulareingaben beim Schließen der View und stellt einen Entwurfsspeicher je Formular zurück. Dieser Weg ist deutlich häufiger als das Schließen der View, und das Formular für Ansprechpartner wird länger.

## Entscheidung des Eigentümers (22.11.2026, viertes Interview)

**Vor dem Verwerfen fragen.** Ein Formular schließt nicht ohne Rückfrage, solange es nicht gespeicherte Eingaben enthält. Ohne solche Eingaben schließt es wie bisher. Für die Umsetzung gilt die erste der beiden Möglichkeiten, die diese Note vorgeschlagen hatte: das Blatt schließt nicht von selbst, solange das Formular geändert ist (`:dismissible="!dirty"` mit `isDirty` des Formulars), und `close:prevent` fragt vor dem Verwerfen. Die zweite Möglichkeit (so lassen, bis es einen Entwurfsspeicher gibt) ist nicht gewählt.

**Umfang.** Jedes Formular, das der Datensatz-Baustein in `notes` baut, nicht nur das Blatt der Gemeinschaften. Die Rückfrage wird einmal im Baustein gebaut, nicht je Feature.

## Akzeptanzkriterien

1. Der Eigentümer hat entschieden; die Entscheidung steht in dieser Note (erledigt am 22.11.2026).
2. Jedes Formular, das der Datensatz-Baustein in `notes` baut, fragt vor dem Verwerfen, wenn es nicht gespeicherte Eingaben enthält. Das gilt für beide Wege, die diese Note nennt (Escape und ein Klick neben das Blatt) und für die eigenen Knöpfe des Formulars zum Abbrechen und Schließen. Ein unverändertes Formular schließt wie bisher ohne Frage. Die Rückfrage ist einmal im Baustein gebaut, nicht nur im Blatt der Gemeinschaften. Ein DOM-Test deckt alle vier Wege ab, ein E2e-Spec in echtem Obsidian den Klick daneben. Der Text der Rückfrage steht in beiden Katalogen (Du-Form, Ursache vor Handlung).
3. Entfällt: die Möglichkeit „so lassen, bis es einen Entwurfsspeicher gibt“ ist nicht gewählt.
4. `npm run verify` endet mit Exit 0; bei einer Änderung am Code auch `npm run test:e2e` (unter `xvfb-run -a`).

## Herkunft und Bezüge

Review-Runde vom 22.11.2026 am Stand `65eb006`, Bericht zum Produktcode, Befund 3 und Verbesserung 3 (ein Schutz beim Schließen, bevor das längere Formular für Ansprechpartner kommt). [[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]] (das Blatt der Gemeinschaften).

## Kommentare

- 22.11.2026: Angelegt aus der Review-Runde nach dem Stand `65eb006` (vier unabhängige Reviews: Produktcode, Tests, CI und Release, Blueprint und Dokumente). Der Befund ist gegen den Code gelesen, nicht in Obsidian ausgeführt, und nicht umgesetzt. `triage` ist `needs-triage`, weil die Entscheidung zwischen Rückfrage und Warten auf den Entwurfsspeicher beim Eigentümer liegt.
- 22.11.2026 (viertes Interview): Der Eigentümer hat entschieden, vor dem Verwerfen zu fragen, in jedem Formular des Datensatz-Bausteins und nur bei nicht gespeicherten Eingaben (Abschnitt „Entscheidung des Eigentümers“, Kriterien 2 und 3). `triage` ist `ready-for-agent`. Die Version 0.2.1 wird veröffentlicht, wenn [[PBI-71 - Formulare des Datensatz-Bausteins für alle Feldarten tragfähig machen]] und diese Note zusammengeführt und grün sind; der Agent startet die Veröffentlichung dann. Vorher gibt es keine.
- 22.11.2026 (Umsetzung): Umgesetzt im Zweig `forms-kit`, einmal im Datensatz-Baustein. Ein Formular meldet `isDirty` von TanStack an den Bildschirm um es herum (`useRecordForm` über `sheet-guard.ts`). Das neue `RecordSheet` in `notes` setzt dann `dismissible: false`; Escape, ein Klick neben das Blatt, sein Schließen-Knopf und „Abbrechen“ im Formular öffnen `DiscardInputDialog` („Eingaben verwerfen?“, „Verwerfen“, „Weiter bearbeiten“; Texte in beiden Katalogen). „Weiter bearbeiten“ hat zuerst den Fokus und ist auch, was Escape im Dialog wählt; danach kehrt der Fokus dorthin zurück, wo er war. Ohne Eingaben und nach dem Speichern schließt das Blatt wie bisher. Die Gemeinschaften nutzen `RecordSheet`; jedes künftige Formular des Bausteins bekommt die Rückfrage mit. Tests: `tests/dom/presentation/notes/discard-input.test.ts` (alle vier Wege, mit und ohne Eingaben, Name, Fokus, Weiter bearbeiten, Verwerfen), `tests/e2e/specs/communities-discard.e2e.ts` (Escape und Klick daneben in Obsidian). `npm run verify` mit Exit 0, `npm run test:e2e` unter `xvfb-run -a` dreimal hintereinander grün (26 von 26 Specs, je 93 bis 96 s); ein früherer dritter Lauf scheiterte in `note-vanished.e2e.ts` an einer unbehandelten ENOENT-Ablehnung. Die Ursache liegt nicht in dieser Änderung: Eine andere Session hat sie unter CPU-Last nachgestellt und auf ein Promise im Inneren von Electron zurückgeführt (weder Obsidian noch das Plugin lesen die gelöschte Datei ein zweites Mal); ihre Korrektur des Specs kommt mit dem Pull Request #5. Der Spec bleibt hier unverändert. Weiter offen, wie entschieden: Eingaben nach dem Schließen der View oder von Obsidian wiederherstellen (Entwurfsspeicher, Handoff 03) und eine Rückfrage beim Wechsel der Route. Die Darstellung bei 320 px und in beiden Farbschemata ist nicht eigens gemessen; der Dialog nutzt dasselbe `UModal` und dieselben Klassen wie der Löschdialog, den `appearance.e2e.ts` misst.
