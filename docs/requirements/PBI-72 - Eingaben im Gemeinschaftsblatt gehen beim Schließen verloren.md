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
triage: needs-triage
---

# PBI-72 · Eingaben im Gemeinschaftsblatt gehen beim Schließen verloren

**Planungsstand:** Befund bestätigt im Code, im echten Obsidian nicht ausgeführt; die Entscheidung des Eigentümers steht aus · **Bezug:** `docs/plans/pre-feature-improvement-plan.md` (Abschnitt 8, Review-Runde 2 vom 22.11.2026)

## User Story

Als Beirat möchte ich, dass ein Text, den ich im Blatt einer Gemeinschaft getippt habe, nicht ohne Rückfrage verschwindet, wenn ich Escape drücke oder neben das Blatt klicke, damit ich nicht noch einmal eintippen muss.

## Ausgangslage

**Befund 3: Das Blatt schließt bei Escape und bei jedem Klick daneben.** `CommunitySettings.vue` zeigt das Formular in einem `USlideover` (`src/presentation/communities/components/CommunitySettings.vue`, Zeilen 129 bis 134) und setzt dafür nur `v-model:open="sheetOpen"`. Der Slideover hat Nuxt UIs Voreinstellung `dismissible: true` (geprüft in `node_modules/@nuxt/ui/.../Slideover.vue`, Zeile 28). Das Schließen setzt `editing = undefined` und hängt damit das Formular aus; alle Eingaben sind weg.

**Szenario.** Die Person tippt eine neue Gemeinschaft und klickt dann in eine andere Obsidian-Ansicht, um einen Namen zu kopieren, oder drückt Escape. Das Blatt schließt, die Eingabe ist verloren. Dass Reka ein modales Blatt bei einem Klick außerhalb schließt, ist sein Standardverhalten; der Reviewer hat es nicht in Obsidian ausgeführt.

**Bekannter Rahmen.** `docs/design/handoff/03 - Ansichten, Navigation und Befehle.md` (Zeile 75) nennt den Verlust von Formulareingaben beim Schließen der View und stellt einen Entwurfsspeicher je Formular zurück. Dieser Weg ist deutlich häufiger als das Schließen der View, und das Formular für Ansprechpartner wird länger.

## Offene Entscheidung des Eigentümers

Die Note legt nichts fest. Zur Wahl stehen:

- **Vor dem Verwerfen fragen.** Das Blatt schließt nicht von selbst, solange das Formular geändert ist (`:dismissible="!dirty"` mit `isDirty` des Formulars), und `close:prevent` fragt vor dem Verwerfen.
- **So lassen, bis es einen Entwurfsspeicher gibt.** Das Verhalten bleibt, das Handoff nennt den Weg über Escape und Klick daneben ausdrücklich, und der Entwurfsspeicher löst beide Fälle zusammen.

## Akzeptanzkriterien

1. Der Eigentümer hat entschieden; die Entscheidung steht als Kommentar in dieser Note.
2. Bei „vor dem Verwerfen fragen“: Escape und ein Klick neben das Blatt verwerfen geänderte Eingaben nicht ohne Rückfrage; ein unverändertes Formular schließt wie bisher. Ein DOM-Test deckt beide Wege ab, ein E2e-Spec in echtem Obsidian den Klick daneben. Der Text der Rückfrage steht in beiden Katalogen (Du-Form, Ursache vor Handlung).
3. Bei „so lassen“: `docs/design/handoff/03 - Ansichten, Navigation und Befehle.md` und die Beschreibung des Blatts nennen Escape und den Klick daneben als bekannten Verlust, und die Note verweist auf den Entwurfsspeicher als Lösung.
4. `npm run verify` endet mit Exit 0; bei einer Änderung am Code auch `npm run test:e2e` (unter `xvfb-run -a`).

## Herkunft und Bezüge

Review-Runde vom 22.11.2026 am Stand `65eb006`, Bericht zum Produktcode, Befund 3 und Verbesserung 3 (ein Schutz beim Schließen, bevor das längere Formular für Ansprechpartner kommt). [[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]] (das Blatt der Gemeinschaften).

## Kommentare

- 22.11.2026: Angelegt aus der Review-Runde nach dem Stand `65eb006` (vier unabhängige Reviews: Produktcode, Tests, CI und Release, Blueprint und Dokumente). Der Befund ist gegen den Code gelesen, nicht in Obsidian ausgeführt, und nicht umgesetzt. `triage` ist `needs-triage`, weil die Entscheidung zwischen Rückfrage und Warten auf den Entwurfsspeicher beim Eigentümer liegt.
