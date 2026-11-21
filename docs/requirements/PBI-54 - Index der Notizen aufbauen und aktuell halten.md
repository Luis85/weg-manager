---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 82000
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
  - "[[PBI-53 - Notizformat mit Schemaversion lesen und schreiben]]"
triage: ""
---

# PBI-54 · Index der Notizen aufbauen und aktuell halten

**Planungsstand:** Technischer Folgepunkt aus dem Plan `docs/plans/pre-feature-improvement-plan.md` (Schritt 3.4); offener Teil von [[PBI-50 - Grundlage für Vault-Ereignisse und Indexierung]] · **Bezug:** B-NFR-04, B-NFR-11, B-NFR-14

## User Story

Als Beirat möchte ich, dass Punkte, Fristen und Wochenarbeit stets den aktuellen Dateistand zeigen und trotzdem schnell erscheinen, damit ich weder auf ein Neuladen warten noch veraltete Listen prüfen muss.

## Ausgangslage

Das Plugin kennt Dateiereignisse (`EventBus`, `AppEvent`, siehe [[PBI-50 - Grundlage für Vault-Ereignisse und Indexierung]]), baut aber keinen Index. `LayoutReady` bedeutet nicht, dass Obsidians Metadaten-Cache fertig ist: Auf einem kalten oder extern geänderten Vault meldet Obsidian das später mit `resolved`. Es gibt keinen Referenz-Vault und keine Zeitmessung.

## Akzeptanzkriterien

1. Ein eigenes `AppEvent` meldet, dass der Vault lesbar ist. Es wird nach `LayoutReady` und nach Obsidians `metadataCache`-Ereignis `resolved` veröffentlicht. Ein e2e-Spec belegt das auf einem kalten Vault.
2. Ein Index-Dienst baut den Gesamtindex nach diesem Bereitschaftsereignis; die Startereignisse (`FileCreated` je vorhandener Datei) erzeugen keinen Doppelbestand.
3. Der Index folgt Datei- und Metadatenereignissen (`FileCreated`, `FileModified`, `FileDeleted`, `FileRenamed`, `MetadataChanged`) schrittweise und entprellt.
4. Der Index lässt sich jederzeit auf Anforderung vollständig neu aufbauen und hat keinen eigenen Datenbestand: Er entsteht ausschließlich aus den Notizen. Notizen mit Problemcodes aus [[PBI-53 - Notizformat mit Schemaversion lesen und schreiben]] erscheinen als Probleme, nicht als Fehler des Index.
5. Der Index bietet Abfragen und einen Änderungsstrom, den `useQuery` und `useStream` später nutzen.
6. Ein Generator erzeugt einen Referenz-Vault (2.000 Notizen, davon 200 Punkte). Ein Zeitmess-Test prüft die Ziele aus B-NFR-04 und schlägt fehl, wenn das Budget überschritten wird.
7. Unit-Tests am Obsidian-Double decken Aufbau, Ereignisfolge, Neuaufbau und Dispose ab; nach dem Deaktivieren des Plugins läuft keine Indexarbeit mehr.

## Herkunft und Bezüge

Plan `docs/plans/pre-feature-improvement-plan.md`, Abschnitt 3 (Lücken B5 und B6) und Schritt 3.4. Setzt den offenen Teil von [[PBI-50 - Grundlage für Vault-Ereignisse und Indexierung]] um (dessen Kriterium 1 ist auf `EventBus` und `AppEvent` umgeschrieben). Die Entscheidung steht in `docs/adr/0007-vault-data-access.md`. Qualitätsziele: B-NFR-04 in [[F-21 - Nichtfunktionale Anforderungen]]. Technische Grundlage für [[PBI-41 - Vorgänge ohne Plugin und Obsidian nutzen]].

## Kommentare

- 21.11.2026: Angelegt als offener Schritt des Plans `docs/plans/pre-feature-improvement-plan.md`. Bereit zur Umsetzung; die Reihenfolge steht in `dependsOn`.
- 21.11.2026: Erster Teil ausgeliefert: das Ereignis `VaultReady` und der Referenz-Vault.
  - **Kriterium 1 präzisiert:** Obsidians Ereignis `resolved` taugt allein nicht als Signal. Gemessen in Obsidian 1.15.1 am Referenz-Vault: Beim Kaltstart ist das Layout bereit, wenn erst 1 von 2.200 Notizen im Cache steht, und `resolved` feuert je indexierter Notiz, zum ersten Mal vor dem Layout. Beim Warmstart und in der laufenden App ist der Cache sofort vollständig, `resolved` kommt einmal oder gar nicht. `VaultReady` wird deshalb veröffentlicht, sobald das Layout bereit ist und jede Markdown-Datei einen Eintrag im Metadaten-Cache hat; ein e2e-Spec belegt das für Kaltstart und Wiedereinschalten des Plugins.
  - **Referenz-Vault:** `npm run vault:reference` erzeugt ihn deterministisch nach `tests/e2e/vaults/reference/` (nicht eingecheckt): zwei Gemeinschaften, 200 Punkte, 2.000 Notizen mit Frontmatter, 200 ohne.
  - **Messwerte in diesem Container** (nicht die Referenzmaschine, noch keine Schwelle): `VaultReady` beim Kaltstart nach 2,4 bis 3,3 s, beim Warmstart nach rund 0,25 s; `NoteStore.list` danach 9 bis 20 ms für 2.000 Datensätze.
  - **Offen:** der Index selbst mit Zeitprüfung gegen B-NFR-04.
- 21.11.2026: Abgeschlossen. Stand der Umsetzung des Index:
  - **Dienst `NoteIndex`** (`src/application/notes/`): hält je registriertem Notiztyp die gelesenen Notizen mit ihren Problemen, sortiert nach Pfad, und meldet doppelte `id` über alle Typen. Eine Momentaufnahme sagt, ob der Index bereit ist und ob das letzte Lesen fehlschlug.
  - **Notiztypen** stehen in `src/application/note-types.ts`; ein Fachmodul ergänzt dort eine Zeile.
  - **Ohne Typ, aber sichtbar:** fehlerhafter `schema`-Wert, gültiger `schema`-Wert unbekannten Typs und, nur unterhalb des Wurzelordners, ein Frontmatter-Block, der sich nicht lesen lässt. Für Letzteres hat der Port `NoteStore` den Aufruf `unreadable(folder)` bekommen; gemessen in Obsidian 1.15.1 unterscheidet nur der Abschnitt `yaml` in `sections` kaputtes YAML von einer Notiz ohne Block.
  - **Aufbau und Folgen:** einmal Lesen bei `VaultReady`, danach erneutes Lesen je Pfad bei `MetadataChanged`, `FileDeleted` und `FileRenamed`, gebündelt nach 100 ms Ruhe (höchstens 1 s). Eigene Schreibvorgänge nehmen denselben Weg wie fremde.
  - **Fehlerzustand:** Schlägt das Lesen fehl, bleiben die letzten Notizen stehen und die Ansicht zeigt „Notizen nicht aktuell“ mit „Erneut versuchen“.
  - **Zeitprüfung** (dieser Container, nicht die Referenzmaschine): Aufbau aus 2.000 Datensätzen 30 bis 160 ms; von `VaultReady` bis zum bereiten Index in echtem Obsidian 29 bis 49 ms; eine fremde Änderung erscheint nach 106 bis 124 ms. Geprüft wird jeweils gegen 1 s.
