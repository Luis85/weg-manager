---
type: PBI
parent: "[[F-21 - Nichtfunktionale Anforderungen]]"
order: 75000
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
  - "[[docs/business-rules/DF-23 - Externe Bearbeitung ohne stilles Überschreiben]]"
decisions:
  - "[[docs/decisions/K-09 - Vollständige mobile Wochenarbeit unterstützen]]"
hypotheses: []
pages: []
user-flows: []
triage: ready-for-agent
---

# PBI-48 · Externe Änderungen an den Einstellungen übernehmen

**Planungsstand:** Technischer Folgepunkt aus dem Code-Review der Plugin-Shell · **Bezug:** B-NFR-02, B-NFR-12, B-NFR-14

## User Story

Als Beirat, der denselben Vault auf Handy und Desktop nutzt, möchte ich, dass das Plugin per Obsidian Sync eingetroffene Einstellungen sofort übernimmt, damit ein Gerät meine auf dem anderen Gerät gespeicherten Werte nicht still mit einem alten Stand überschreibt.

## Ausgangslage

`src/application/settings-service.ts` liest `data.json` genau einmal beim Aufbau. `Plugin.onExternalSettingsChange` (seit Obsidian 1.5.7) ist nicht umgesetzt. Schreibt Obsidian Sync eine neuere `data.json`, behält das Plugin die alten Werte, und das nächste Speichern überschreibt die synchronisierten. Auch der Status (beschreibbar/schreibgeschützt) ist je Ladevorgang fest (`status: Effect.succeed(status)`).

## Akzeptanzkriterien

1. `SettingsService` bietet ein `reload`, das `data.json` erneut über den `SettingsStore` liest, dekodiert und die neuen Werte über `changes` veröffentlicht. Unveränderte Werte lösen keine zusätzliche Veröffentlichung aus.
2. Der Einstellungsstatus ist beobachtbar (z. B. als Stream neben `changes`) und folgt jedem `reload`; Ansicht und Einstellungs-Tab zeigen den aktuellen Stand.
3. Das Plugin implementiert `onExternalSettingsChange` und ruft darin `reload` auf; Fehler laufen als getaggter `AppError` mit `describeError`-Text, nicht als stiller Abbruch.
4. Kommt per Sync eine schreibgeschützte, unlesbare oder neuere (unbekanntes Schema) `data.json` an, wechselt das Plugin auf schreibgeschützt und schreibt die Datei nicht; die bisherige Meldung für schreibgeschützte Einstellungen erscheint.
5. Unit-Tests am Obsidian-Double decken `reload`, Statuswechsel und den schreibgeschützten Fall ab.
6. Ein e2e-Test (`npm run test:e2e`) schreibt `data.json` von außen, löst die externe Änderung aus und sieht die Ansicht den neuen Wert anzeigen.

## Herkunft und Bezüge

Code-Review der Plugin-Shell vom 21.11.2026. Relevant für [[K-09 - Vollständige mobile Wochenarbeit unterstützen]], weil der mobile und der Desktop-Einsatz dieselben Einstellungen über Sync teilen, sowie für [[DF-23 - Externe Bearbeitung ohne stilles Überschreiben]].

## Kommentare

- 21.11.2026: Kriterien 1 bis 6 sind umgesetzt.
  - **Neu laden (1):** `SettingsService.reload` (`src/application/settings-service.ts`) liest `data.json` erneut über den `SettingsStore`, dekodiert sie und veröffentlicht neue Werte über `changes`. Gleiche Werte lösen keine Veröffentlichung aus. Reload und Speichern laufen nacheinander, nie verschränkt.
  - **Beobachtbarer Status (2):** `statusChanges` folgt jedem `reload`. `useSettingsStatus` ist reaktiv, der Hinweis „schreibgeschützt“ und die gesperrte Speichern-Schaltfläche in der Ansicht folgen ihm. Der Einstellungs-Tab ruft nach jedem Reload `update()` auf und zeigt Werte und Status neu an.
  - **`onExternalSettingsChange` (3):** `src/main.ts` wartet auf einen noch laufenden Ladevorgang und ruft dann `reload` auf; nach dem Entladen oder einem fehlgeschlagenen Laden tut es nichts. Ein unlesbares `data.json` wird zum getaggten `ReadOnlySettingsError` mit `describeError`-Text, ein Defekt läuft über `reportDefect`. Obsidian 1.15.1 ruft die Methode selbst auf: Sein Datei-Watcher meldet die geänderte `data.json`, Obsidian vergleicht die Änderungszeit mit dem letzten eigenen Speichern und aktualisiert danach auch den Tab.
  - **Schreibschutz (4):** Eine neuere oder unlesbare `data.json` schaltet auf schreibgeschützt; die bisherige Meldung erscheint einmal, die Datei wird nicht geschrieben. Kommt danach wieder eine gültige Datei, ist das Plugin wieder beschreibbar.
  - **Tests (5, 6):** Unit-Tests in `tests/unit/application/settings-reload.test.ts`, DOM-Tests am Obsidian-Double in `tests/dom/external-settings.test.ts` und `tests/dom/settings-tab.test.ts`, e2e in `tests/e2e/specs/external-settings.e2e.ts`: Es schreibt `data.json` über `app.vault.adapter.write`, und die offene Ansicht zeigt die neue Begrüßung, ohne dass der Test `onExternalSettingsChange` selbst aufruft.
  - **Offen:** Das Eingabefeld des Begrüßungsformulars behält einen bereits angezeigten Wert; nur Überschrift, Hinweis und Sperre folgen dem Reload.
