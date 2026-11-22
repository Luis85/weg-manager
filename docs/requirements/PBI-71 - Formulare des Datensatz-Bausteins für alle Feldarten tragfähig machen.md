---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 99000
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

# PBI-71 · Formulare des Datensatz-Bausteins für alle Feldarten tragfähig machen

**Planungsstand:** Befund bestätigt, nichts umgesetzt; vor dem zweiten Notiztyp zu erledigen · **Bezug:** `docs/plans/pre-feature-improvement-plan.md` (Abschnitt 8, Review-Runde 2 vom 22.11.2026)

## User Story

Als Beirat möchte ich, dass beim Speichern eines Datensatzes nur die Felder geändert werden, die ich bearbeitet habe, damit Listen, Verweise, Zahlen und Häkchen in anderen Feldern weder verschwinden noch ihre Form ändern.

## Ausgangslage

**Befund 1: Die Formulare des Bausteins kennen nur Text.** Der Datensatz-Baustein in `notes` (`useRecordForm`, `editedValues`, `mergeEdit`, `ConflictChoice`) behandelt jedes Feld als Text. Heute hat kein Notiztyp ein anderes Feld als Text oder Datum, deshalb ist kein Nutzer betroffen. Ein zweiter Typ ist es: Der geplante Ansprechpartner trägt `community_ids: references("community")`.

Die Stellen:

- `src/presentation/notes/use-record-form.ts`: `rawText` (Zeilen 23 bis 26) macht aus einem Array `""`; `loaded` wird damit gebaut (Zeilen 97 bis 99); die Wahl „theirs“ in `resolve` setzt `rawText(conflict.current)` (Zeile 193).
- `src/domain/notes/form.ts`: `FormInput` besteht nur aus Zeichenketten (Zeile 5); `editedValues` behält den geladenen Wert nur bei `===` mit dem Eingabetext (Zeilen 31 bis 44).
- `src/domain/notes/write.ts`: `mergeEdit` vergleicht den bearbeiteten mit dem geladenen Wert (Zeilen 142 und 143).
- `src/presentation/notes/components/ConflictChoice.vue`: zeigt eine Liste als „leer“ (Zeilen 34 bis 37).
- Der Cast, der es verdeckt: `values as CommunityValues` in `src/application/communities/use-cases.ts` (Zeile 66).

**Szenario A (Liste oder Verweis wird gelöscht).** Ein Ansprechpartner mit `community_ids` wird im Formular geöffnet. Das Feld zeigt `""`, weil `rawText` ein Array nicht kennt. Die Person ändert nur den Namen und speichert. Der Entwurf für `community_ids` ist `undefined`; in `mergeEdit` ist `same(undefined, [ids])` falsch und die Notiz hat sich nicht geändert, also kommt der Schlüssel in `remove`. Der Ansprechpartner verliert seine Gemeinschaften.

**Szenario B (Zahl oder Häkchen wird als Text geschrieben).** Ein Zahlenfeld mit `5` erscheint als `"5"`. `editedValues` liefert den Entwurf `"5"`, der Merge sieht eine Änderung, der Serialisierer schreibt `"5"` in Anführungszeichen, und das nächste Lesen meldet `field.number`. Ebenso `true` und `"true"` bei einem Häkchen.

Der Reviewer hat den ganzen Weg vom Laden des Formulars über `editedValues`, `mergeEdit` und `toPatch` bis `editNoteText` gelesen; kein Test deckt ihn ab, weil es nur Textfelder gibt.

**Verbesserung 2: Feature-Dienste können nicht von früheren Features abhängen.** `servicesLayerOf` (`src/application/module.ts`, Zeile 184) mischt die Layer der Features nebeneinander (`Layer.mergeAll`), `appServicesLayer` setzt das Ergebnis über `notes` (`src/application/app-services-layer.ts`, Zeile 105). Ein Feature für Ansprechpartner, das auf die gewählte Gemeinschaft begrenzt ist, braucht den `CommunitySelectionService` und sieht ihn nicht.

**Verbesserung 5: Der angezeigte Name eines referenzierten Datensatzes fehlt im Baustein.** Eine Zeile mit `community_ids` hält nackte Ids. Jeder Typ braucht „angezeigter Name zur Id“ über `byId` des Zieltyps, für Karten, Konflikte und den Text zu `reference.missing`. Das gehört einmal in `notes`, nicht in jedes Feature.

## Akzeptanzkriterien

1. Jede Feldart (Text, Datum, Zahl, Häkchen, Liste, Verweis, Verweisliste) hat im Domain-Code eine Abbildung zwischen gespeichertem Wert und Formularwert (`toInput` und `fromInput`: Zeichenkette für Text und Datum, Liste von Zeichenketten für Liste und Verweise, Wahrheitswert, Zahl oder leer). `FormInput<F>` folgt der Feldart statt überall `string` zu sein.
2. `editedValues` vergleicht je Feldart (`Equal.equals`) den Formularwert mit dem geladenen Rohwert. Ein unberührtes Feld behält den Wert der Notiz, solange der gültig ist.
3. Die Use Cases kommen ohne Casts aus: `values as CommunityValues` und die Casts `as Input` und `as never` in `use-record-form.ts` entfallen.
4. Zu jeder Feldart gibt es einen Test: Beim Speichern eines anderen Feldes behält ein unberührtes Feld seine Bytes in der Datei. Der Konfliktdialog zeigt Listen und Verweise mit ihren Werten, nicht als „leer“, und die Wahl „theirs“ setzt den Formularwert über dieselbe Abbildung.
5. Feature-Dienste dürfen von Diensten eines früheren Features abhängen: Die Layer werden in der Reihenfolge von `APP_MODULES` gefaltet (je `provideMerge` auf das vorige), und `Layer<AppServices>` prüft das Ergebnis weiter. Ein Test mit zwei Modulen, von denen das spätere einen Dienst des früheren braucht, zeigt es.
6. Ein Helfer in `notes` liefert den angezeigten Namen eines referenzierten Datensatzes über `byId` des Zieltyps; Karten, Konflikte und der Text zu `reference.missing` benutzen ihn, kein Feature baut ihn selbst.
7. `npm run verify` endet mit Exit 0 und `npm run test:e2e` (unter `xvfb-run -a`) ebenfalls, weil Formular- und Notizverhalten sich ändern.
8. Ein Datensatz, dessen Verweis auf ein fehlendes Ziel zeigt (etwa eine gelöschte Notiz), lässt sich speichern. Das Formular markiert das Feld; das Speichern wird aus diesem Grund nie verweigert. Ein Test deckt es für Verweis und Verweisliste ab. (Entscheidung vom 22.11.2026, viertes Interview.)

## Herkunft und Bezüge

Review-Runde vom 22.11.2026 am Stand `65eb006`, Bericht zum Produktcode: Befund 1 sowie die Verbesserungen 2 und 5 vor dem zweiten Notiztyp. [[PBI-61 - Beziehungen zwischen Datensätzen und abgeleitete Werte vorbereiten]] (Verweisfelder und Suche nach Id sind gebaut, kein Feature nutzt sie), [[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]] (der erste Typ, auf dessen Textfelder der Baustein zugeschnitten ist).

## Kommentare

- 22.11.2026: Angelegt aus der Review-Runde nach dem Stand `65eb006` (vier unabhängige Reviews: Produktcode, Tests, CI und Release, Blueprint und Dokumente). Befund 1 und die Verbesserungen 2 und 5 stammen aus dem Bericht zum Produktcode und sind gegen den Code gelesen, aber nicht ausgeführt; nichts davon ist umgesetzt. `triage` ist `ready-for-agent`, weil Kriterien und Lösungsrichtung feststehen; kein heutiger Typ ist betroffen.
- 22.11.2026 (viertes Interview): Entscheidungen des Eigentümers, soweit sie diese Note betreffen. (2) Die Formulare für alle Feldarten werden jetzt gebaut, vor dem ersten Fachfeature. (5) Ein Datensatz, dessen Verweis auf ein fehlendes Ziel zeigt, wird trotzdem gespeichert; das Formular markiert das Feld, und die Notiz erscheint unter den Datenproblemen. Das Speichern wird aus diesem Grund nie verweigert (Kriterium 8). (6) Ein Verweis zwischen Datensätzen wird nur als `id` des Ziels geschrieben. Es gibt keine Wikilink-Eigenschaft; Obsidians Graph und Rückverweise zeigen die Beziehung nicht. Die Felder `reference` und `references` schreiben und lesen deshalb nur die `id`. Die Version 0.2.1 folgt, wenn diese Note und [[PBI-72 - Eingaben im Gemeinschaftsblatt gehen beim Schließen verloren]] zusammengeführt und grün sind; der Agent startet die Veröffentlichung dann.
- 22.11.2026 (Umsetzung): Umgesetzt im Zweig `forms-kit`. (1) Jede Feldart hat in `src/domain/notes/form.ts` eine Abbildung (`toInput`, `fromInput`; `formInput` und `draftValues` für alle Felder): Text für Text, Datum und Verweis, Zahl oder leer, Wahrheitswert, Liste von Zeichenketten für Liste und Verweisliste. `FormInput<F>` und `FormDraft<F>` folgen der Feldart. (2) `editedValues` vergleicht je Feldart mit `Equal.equals` den Formularwert mit dem ebenso abgebildeten geladenen Wert; ein unberührtes, gültiges Feld behält den Wert der Notiz. (3) `values as CommunityValues` entfällt: der Codec hat `parse`, das nach den Regeln die typisierten Werte liefert (ein Wert, den die Regeln durchlassen und der Typ ablehnt, ist ein Defekt). In `use-record-form.ts` entfallen `as Input` und beide `as never`: Feldfehler laufen über die eigenen Feldnamen des Formulars, „theirs“ über den Store des Formulars. Ein neuer Cast steht im Codec (`parseValues`, nach einer Prüfung ohne Befund), wo `readFields` schon castet. (4) Tests je Feldart: `tests/unit/application/notes/form-kinds-bytes.test.ts` (die Bytes jedes unberührten Feldes bleiben durch Merge und Zeilenbearbeitung, an einer Notiz mit Flow-Liste, `5.0`, `True` und Kommentaren), `tests/unit/domain/notes/form-kinds.test.ts`, `tests/dom/presentation/notes/record-form-kinds.test.ts` (Formular, Konfliktdialog mit Listen und Verweisen, „theirs“ über dieselbe Abbildung) auf dem Testtyp `testRecord`. Die Gemeinschaften sind unverändert; ihre Specs laufen ohne Änderung. (5) `servicesLayerOf` faltet die Layer in der Reihenfolge von `APP_MODULES` (`Layer.provideMerge` auf das vorige); `tests/unit/application/module.test.ts` zeigt ein späteres Modul, das den Dienst eines früheren nutzt, und dass die umgekehrte Reihenfolge nicht kompiliert. (6) Der Datensatz-Baustein gibt `names` und `nameChanges` (angezeigter Name je Id über `byId`) und `shownReference`, das auf die Id zurückfällt, wie der Text zu `reference.missing`; der Konfliktdialog nutzt ihn über die Option `references` von `useRecordForm`. Karten mit Verweisen gibt es noch nicht; die Anleitung (`adding-a-feature.md`) schreibt den Helfer für sie vor. (8) Ein Verweis und eine Verweisliste auf ein fehlendes Ziel: das Formular markiert das Feld, das Speichern gelingt und behält den Verweis (DOM-Test). Nicht gebaut, wie entschieden: Eingabekomponenten für Zahl, Häkchen, Liste und Verweis; das erste Feature, das eines braucht, baut es. (7) `npm run verify` mit Exit 0; `npm run test:e2e` unter `xvfb-run -a` dreimal hintereinander grün (25 von 25 Specs, je 94 bis 115 s).
