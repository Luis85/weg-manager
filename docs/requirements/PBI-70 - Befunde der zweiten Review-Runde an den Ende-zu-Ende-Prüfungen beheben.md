---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 98000
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

# PBI-70 · Befunde der zweiten Review-Runde an den Ende-zu-Ende-Prüfungen beheben

**Planungsstand:** umgesetzt bis auf einen Lauf als Nutzer ohne Root-Rechte · **Bezug:** `docs/plans/pre-feature-improvement-plan.md` (Abschnitt 8, zweite Review-Runde), `docs/engineering/testing.md`

## User Story

Als Beirat möchte ich, dass die Prüfungen im echten Obsidian nur dann bestehen, wenn die geprüfte Wirkung wirklich eingetreten ist, damit ein grünes Ergebnis etwas bedeutet.

## Ausgangslage

Befunde 5 bis 8 des Test-Reviews der zweiten Runde (am Stand `65eb006`; die Befunde 1 bis 4 stehen in [[PBI-68 - Befunde der zweiten Review-Runde am Notizspeicher und am Testdouble beheben]]):

- **Negativprüfungen, die leer bestehen können.** `vault-ready-fallback.e2e.ts` wartete zweimal 500 ms vor „`VaultReady` genau einmal“, ohne danach ein positives Zeichen abzuwarten. `communities-invalid.e2e.ts` prüfte, dass die Liste der nicht indizierten Notizen fehlt, bevor das nachgeladene Zeichen („Datenprobleme 1“) erschienen war. `settings-sections.e2e.ts` und `navigation.e2e.ts` prüften den Rückfall auf die Startroute, während die Ansicht schon auf der Startroute stand; ein Zustand, der einfach ignoriert wird, hätte bestanden.
- **`note-index.e2e.ts`, „von außen bearbeitet“,** schrieb über `app.vault.process`; Obsidians Dateiwächter lief nie. Die Grenze von 1 s enthielt außerdem Obsidians eigene Indexierung, die `INDEX_BATCH_MAX` nicht begrenzt.
- **Das Probe-Plugin** meldete einen Defekt, dessen Wert ein `_tag` trägt, wie einen getypten Fehler; eine Prüfung auf `NoteNotFoundError` hätte auch einen Absturz akzeptiert.
- **Der Vertrag des Notizspeichers im echten Obsidian** prüfte die Zahl der bestandenen Fälle als „Gesamtzahl minus Übersprungene“, nicht die Gesamtzahl; ein schrumpfender Vertrag fiel nicht auf.
- **Schreibfehler im echten Obsidian.** Die Vertragsfälle mit fehlschlagenden Schreibvorgängen wurden übersprungen („ein echtes Vault lässt sich nicht dazu bringen“). Ohne Root-Rechte geht das über `chmod`.

Der Review sprach von fünf solchen Fällen; es sind vier (`create`, `update`, `trash`, `rename`). Die übrigen übersprungenen Fälle brauchen angehaltene oder fehlschlagende Lesevorgänge.

## Akzeptanzkriterien

1. Keine Negativprüfung in `vault-ready-fallback.e2e.ts`, `communities-invalid.e2e.ts`, `settings-sections.e2e.ts` und `navigation.e2e.ts` besteht leer: „genau einmal“ folgt auf ein `resolved`, das eine Bearbeitung auslöst; die Abwesenheit der Liste wird nach dem nachgeladenen Zeichen geprüft; der Rückfall wird von einer anderen Route aus geprüft. `docs/engineering/testing.md` nennt die Regel (der erwartete Zustand muss sich vom Zustand vor der Handlung unterscheiden) und die neue Zahl der bleibenden Pausen (zwei).
2. Die Bearbeitung in `note-index.e2e.ts` läuft über Node-`fs`; die dokumentierte Grenze wird vom `changed` des Metadaten-Caches für die Datei bis zum Index gemessen, die Zeit ab dem Schreiben wird aufgezeichnet, nicht geprüft.
3. Das Probe-Plugin unterscheidet `fail` und `die`, und die Prüfung, die ein Tag erwartet, prüft auch die Art.
4. `note-store-contract.e2e.ts` hält die Gesamtzahl der Vertragsfälle fest.
5. Die vier Vertragsfälle mit fehlschlagenden Schreibvorgängen laufen im echten Obsidian, wenn der Läufer nicht Root ist, und werden als Root mit Namen und Grund übersprungen. Was Obsidian dabei tut, ist gemessen; eine Abweichung vom Double ist behoben, ein falsch benannter Fehler im Adapter ist gemeldet.
6. `npm run verify` endet mit Exit 0, und die e2e-Suite besteht fünfmal hintereinander.

## Herkunft und Bezüge

Test-Review der zweiten Runde (22.11.2026), Befunde 5 bis 8. [[PBI-63 - Obsidian-Testdouble und Ende-zu-Ende-Tests belastbarer machen]]. `docs/engineering/testing.md`.

## Kommentare

- 22.11.2026: Angelegt und umgesetzt (Zweig `review2-e2e`, ein Commit je Aufgabe).
  - Kriterium 1 erfüllt. `vault-ready-fallback.e2e.ts`: beide Pausen von 500 ms ersetzt durch eine Bearbeitung einer schlichten Notiz und das Warten auf das folgende `resolved`; die Pause von der halben Frist bleibt, weil vor der Frist nichts Beobachtbares geschieht. `communities-invalid.e2e.ts`: erst das Zeichen, dann die Abwesenheit. `navigation.e2e.ts` und `settings-sections.e2e.ts`: erst eine andere Route, dann der kaputte Zustand. Gezeigt, dass die Prüfungen scheitern können: mit einem eingepflanzten Fehler in `ShellView.setState` (ein kaputter Zustand wird ignoriert) bestand die alte `navigation`-Spec sechsmal, die neue scheiterte („the route: expected communities, last seen data-issues“ in `settings-sections`); mit einem eingepflanzten zweiten `VaultReady` je Ereignis nach der Bereitschaft scheitert die neue Fallback-Spec (erwartet 1, erhalten 2). Die alte Fallback-Spec scheiterte darunter auch, weil schon das `resolved` der Frist-Veröffentlichung das Zeichen auslöste; dass sie leer bestehen konnte, ist also nur durch Lesen gezeigt. Für die Abwesenheit in `communities-invalid.e2e.ts` gibt es keinen eingepflanzten Fehler, der die Reihenfolge beweist (das Zeichen erscheint stets vor der Prüfung der Liste auf diesem Rechner); sie ist durch Lesen begründet.
  - Kriterium 2 erfüllt. Gemessen: 104 bis 110 ms ab dem `changed`, 107 bis 116 ms ab dem Schreiben. Mit `INDEX_BATCH_QUIET` auf 1500 ms scheitert die Prüfung (1006,9 ms, durch `INDEX_BATCH_MAX` begrenzt).
  - Kriterium 3 erfüllt. `Outcome` trägt `kind: "fail" | "die"`; ein Defekt heißt immer `defect`. Mit einem eingepflanzten `Effect.die` statt `Effect.fail` für `NoteNotFoundError` im Adapter scheitert die Double-Prüfung der gemeinsamen Szenarien an der Art (vorher bestand sie).
  - Kriterium 4 erfüllt. 53 Fälle (42 bestanden, 11 übersprungen); mit 52 scheitert die Spec.
  - Kriterium 5 offen. `setFailWrites` in `contract-fixture.ts` nimmt allen Ordnern des Vaults (Wurzel eingeschlossen) und allen Notizen das Schreibrecht (außer `.`-Ordnern und der Zaun-Notiz), stellt die Rechte nach jedem Fall wieder her (auch in `dispose`) und stellt den Papierkorb währenddessen auf `local`. Als Root überspringt der Fall mit dem Grund „chmod hält Root nicht auf“, in der Spec beim Namen. Im Agenten-Container (Root) nicht gelaufen: ein zweiter Nutzer ließ sich dort nicht anlegen. Offen bleibt daher, was Obsidian bei den vier Fällen tut (ablehnen, `false`, anderes) und ob das Double abweicht. Die CI läuft als `runner`, nicht als Root; der erste dortige Lauf misst es. Bei einem roten Fall dort: die Abweichung ist ein Befund, das Double ist anzupassen, und liegt es am Adapter, ist es zu melden und nicht an `src/` zu ändern.
