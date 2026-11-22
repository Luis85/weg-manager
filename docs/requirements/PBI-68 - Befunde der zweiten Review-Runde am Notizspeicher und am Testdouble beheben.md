---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 96000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-05-Obsidian]]"
release: ""
status: ""
started: 2026-11-22
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

# PBI-68 · Befunde der zweiten Review-Runde am Notizspeicher und am Testdouble beheben

**Planungsstand:** Umgesetzt am 22.11.2026 bis auf den Rückgabewert eines eingereihten Umbenennens (Kriterium 3, Entscheidung offen) · **Bezug:** `docs/plans/pre-feature-improvement-plan.md` (zweite Review-Runde), ADR `docs/adr/0007-vault-data-access.md` (Nachtrag vom 22.11.2026, PBI-68)

## User Story

Als Beirat möchte ich, dass das Plugin mir nur dann „gelöscht“, „gespeichert“ oder „umbenannt“ meldet, wenn es in Obsidian wirklich so geschehen ist, und dass ein Fehler von Obsidian als solcher erscheint und nicht als Fehler des Plugins, damit ich den Meldungen trauen kann.

## Ausgangslage

Zwei unabhängige Reviews am Stand `65eb006` (Tests und Produktcode). Befunde 1 bis 3 hat der Koordinator in Obsidians eigenem Code (1.15.1) nachgelesen.

1. **Papierkorb, der scheitert, ohne abzulehnen.** `fileManager.trashFile` löst mit `false` auf (und zeigt eine eigene Meldung), wenn der Papierkorb des Systems scheitert. `trashCommand` übersah den Wert; das Plugin meldete die Notiz als gelöscht, obwohl sie blieb.
2. **`cachedRead` einer außen gelöschten Notiz.** Obsidian behält den Text jeder indexierten Notiz; `cachedRead` liefert dann den alten Text statt ENOENT. Das Double las bei `cachedRead` die Platte, sodass der Zweig „außen gelöscht, nicht unlesbar“ in `NoteStore.unreadable` nur im Double galt.
3. **`renameFile` reiht sich hinter Link-Aktualisierungen ein.** Kommt ein Umbenennen, während ein anderes seine Dateien verschiebt, löst sein Promise vor dem Verschieben auf, und ein Scheitern erreicht den ersten Aufrufer. Der Adapter meldete dann Erfolg.
4. **Umbenennen gibt alte Werte zurück.** Der Adapter gibt beim Umbenennen die Eigenschaften aus dem Metadaten-Cache zurück; das Record-Kit reichte sie nach Speichern und Umbenennen weiter. Der Port verspricht, dass jedes Schreiben die Notiz wie geschrieben zurückgibt.
5. **Zweiter Kontextbereich still verworfen.** `appSurface` nahm nur den ersten Modul-`context`; ein zweites Modul mit `context` wäre stillschweigend verschwunden.
6. **Öffnen einer Notiz als Defekt gemeldet.** `note-opener.ts` lief über `Effect.promise`; lehnt Obsidians `openFile` ab, sah der Nutzer die Defektmeldung mit dem GitHub-Link.
7. **Tastatur im Gemeinschaftswechsel.** Die Pfeiltasten verschoben den Fokus, während der Wechsel eine Wahl während einer laufenden Auswahl übersprang: der fokussierte Eintrag war nicht der gewählte.
8. **`Today`.** Eine Zeitzone, die `Intl` ablehnt, hätte den Aufbau der Laufzeit und damit das Laden des Plugins scheitern lassen, und ein Fehler beim Planen des nächsten Blicks hätte den Timer beendet. Die echte Uhr (`windowClock`) hatte keinen Test: ein UTC-Tag statt des lokalen bestand jeden Test.

## Akzeptanzkriterien

1. Ein `trashFile`, das `false` liefert, ist `NoteTrashError`; im echten Obsidian gemessen (`trashSystem` liefert `false`, Option „system“) und das Double verhält sich gleich. Festgehalten ist, was als Scheitern zählt und warum.
2. `vanishedScenario` misst `read` und `cachedRead` der außen gelöschten Notiz im echten Obsidian; das Double bildet den Textspeicher nach; `unreadable` ist entschieden und getestet, `architecture.md` („Unreadable frontmatter“) sagt, was gemessen ist.
3. Zwei überlappende `renameFile` sind im echten Obsidian gemessen (wann jedes Promise auflöst, was ein scheiterndes eingereihtes Umbenennen tut), das Double stimmt überein, und der Adapter gibt erst nach dem Verschieben zurück oder scheitert mit dem richtigen Fehler; gibt es dafür keinen sauberen Weg, sind die Möglichkeiten berichtet.
4. Vertragsfälle „Aktualisieren, dann Umbenennen“ und „Anlegen, dann Umbenennen“ bestehen für alle Adapter; das Record-Kit gibt die geschriebenen Werte zurück; der Port sagt, was `rename` verspricht.
5. Ein zweites Modul mit `context` scheitert laut, mit klarer Meldung.
6. Ein abgelehntes `openFile` ist ein typisierter Fehler mit Texten in beiden Katalogen, `NoteNotFoundError`, wenn die Datei weg ist.
7. Fokus und Wahl im Gemeinschaftswechsel können nicht auseinanderfallen (DOM-Test zuerst).
8. `Today` übersteht eine abgelehnte Zeitzone (Rückfall auf die Standardzone des Systems) und einen Fehler beim Planen (Timer läuft weiter); ein Test beweist den lokalen Tag mit der echten Uhr.

## Herkunft und Bezüge

Review-Berichte „tests“ und „product-code“ der zweiten Runde am Stand `65eb006`; ADR 0007, `docs/engineering/architecture.md`, `testing.md`.

## Kommentare

- 22.11.2026: Angelegt und umgesetzt; je Kriterium ein Commit auf `review2-store`, jede Änderung begann mit einem scheiternden Test.
  - Kriterium 1 erfüllt. Gemessen: `trashFile` löst mit `false` auf, nichts wird gelöscht, kein Ereignis, Obsidian zeigt „„Bleibt.md“ konnte nicht in den Papierkorb des Systems verschoben werden …“. Nur `false` zählt als Scheitern: Obsidian liefert bei Erfolg `true`, die d.ts verspricht `void`, und `undefined` eines Adapters, der sich an die d.ts hält, ist kein Scheitern. Szenario `trashFailureScenario`, Double mit `vault.adapter.trashSystem` und `trashOption`.
  - Kriterium 2 erfüllt. Gemessen: `cachedRead` gibt den alten Text, `read` und `process` lehnen mit ENOENT ab. `unreadable` liest jetzt mit `vault.read` (eine Plattenlesung je Kandidat, und Kandidaten sind nur Notizen mit unlesbarem Block); im echten Obsidian geprüft mit gehaltener Liste.
  - Kriterium 3 offen. Gemessen: ein Umbenennen aus dem `rename`-Ereignis eines anderen löst vor dem eigenen Verschieben auf; scheitert es, lehnt das Promise des ersten Aufrufers ab, das eigene hat schon aufgelöst. `renameFile` wartet außerdem, bis der Metadaten-Cache alle früheren Schreibvorgänge indexiert hat. Das Double bildet die Warteschlange nach. Für den Adapter gibt es kein öffentliches Signal, wann das eingereihte Verschieben geschehen oder gescheitert ist. Möglichkeiten zur Entscheidung: Obsidians interne Warteschlange abwarten (`fileManager.updateQueue`, genau, aber keine öffentliche API), auf das `rename`-Ereignis mit Frist warten (ein Timer, der ein spätes Verschieben als Scheitern meldet), oder so lassen (der Index folgt dem Verschieben, das Kit findet die Notiz über die `id`, ein gescheitertes Umbenennen wurde ohnehin nur protokolliert).
  - Kriterium 4 erfüllt. Die beiden Vertragsfälle bestanden sofort, auch im echten Obsidian: weil `renameFile` auf den Cache wartet, hält er die geschriebenen Werte. Alte Werte gibt es nur beim eingereihten Umbenennen; dafür gibt das Kit jetzt die geschriebenen Werte am Pfad des Umbenennens zurück (Test mit einem Speicher, dessen `rename` alte Werte liefert, scheiterte zuerst), und der Port sagt, dass `rename` die Werte liefert, wie der Speicher sie nach dem Verschieben liest.
  - Kriterium 5 erfüllt. `frameContextOf` wirft beim Laden und nennt die Module; ein Unit-Test über `MODULE_SCREENS`. Auf Typebene geht es nicht sauber, ohne dass jedes Modul die anderen kennt.
  - Kriterium 6 erfüllt. `NoteOpenError` („Notiz nicht geöffnet“ / „Note not opened“, erneut versuchen), `NoteNotFoundError` bei verschwundener Datei oder ENOENT.
  - Kriterium 7 erfüllt. Die Pfeiltasten bitten nur um die Wahl, der Fokus folgt der gewählten Option nach dem Rendern und nur in der Ansicht, die ihn hat.
  - Kriterium 8 erfüllt. Abgelehnte oder unlesbare Zone gilt als Standardzone des Systems; ein Fehler beim Planen wird gemeldet und der Timer auf eine Minute gesetzt. DOM-Tests ohne eingesetzte Uhr mit `TZ` Kiritimati und Los Angeles; mit `zone: () => "UTC"` als Einpflanzung scheitern sie.
