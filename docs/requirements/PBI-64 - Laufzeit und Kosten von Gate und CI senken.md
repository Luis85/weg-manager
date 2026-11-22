---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 92000
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

# PBI-64 · Laufzeit und Kosten von Gate und CI senken

**Planungsstand:** Befunde des Test-Reviews, bereit zur Umsetzung · **Bezug:** `docs/plans/pre-feature-improvement-plan.md` (Abschnitt 8, Review-Runde vom 22.11.2026)

## User Story

Als Beirat möchte ich, dass Änderungen am Plugin schnell geprüft sind, damit Korrekturen zügig bei mir ankommen und nicht an langen Wartezeiten hängen.

## Ausgangslage

Messungen des Test-Reviews (Abschnitt C) am Stand `0cb8292`:

- **Gate.** `npm run verify` dauerte in drei Läufen 81 bis 87 s. Die ersten drei Schritte sind unabhängig voneinander und laufen nacheinander: Formatprüfung 4 bis 5 s, Lint 25 s, Typprüfung 13 bis 15 s. Parallel gestartet fiele das Gate auf vier Kernen auf etwa 55 bis 60 s. Zu beachten: `AGENTS.md` sagt, dass das Gate am ersten fehlgeschlagenen Schritt hält; diese Aussage muss weiter stimmen oder angepasst werden.
- **Lint.** Die 25 s stammen fast ganz aus den typbewussten ESLint-Regeln über drei TypeScript-Projekte. Lokal hilft `--cache`.
- **Pre-push.** Der Hook fährt das ganze Gate bei jedem Push, auch wenn nur Dokumente oder ein Tag geschoben werden.
- **CI.** Der e2e-Job installiert bei jedem Lauf per `apt-get` einen Fenstermanager (rund 21 s, dazu ein Netzzugriff, der ausfallen kann). `verify`, `scanner-lint` und `e2e` führen je ein eigenes `npm ci` aus (je 10 bis 14 s); `scanner-lint` könnte ein Schritt in `verify` sein.
- **Cache.** Der Obsidian-Download ist rund 1,3 GB je Obsidian-Version, wird nur nach einem erfolgreichen Lauf gespeichert und kann mit seinen Einträgen die npm-Caches aus dem 10-GB-Limit des Repositorys drängen.

Schon erledigt mit PR #32: `cancel-in-progress` nur noch für Pull Requests, Dependabot mit sieben Tagen Wartezeit und einer Gruppe für `@wdio/*`.

## Akzeptanzkriterien

1. `scripts/verify.mjs` startet Formatprüfung, Lint und Typprüfung gleichzeitig; die Zusammenfassung nennt weiter jeden Schritt mit Ergebnis und Dauer, und ein fehlgeschlagener Schritt führt zu Exit ungleich 0. Der Test des Skripts deckt das ab; `AGENTS.md` beschreibt das Verhalten zutreffend.
2. Ein Push, der nur Dateien unter `docs/**` oder `*.md` ändert, durchläuft im Hook nur die Formatprüfung. Die Bedingung ist getestet, und ein Push mit einer einzigen anderen Datei durchläuft das ganze Gate.
3. Der e2e-Job braucht für Anzeige und Fenstermanager keinen `apt-get`-Zugriff mehr je Lauf, oder der Zugriff ist zwischengespeichert.
4. CI führt `npm ci` höchstens zweimal je Lauf aus.
5. Für den Obsidian-Cache ist festgehalten, wie viele Versionen gehalten werden; ein fehlgeschlagener erster Lauf lädt nicht bei jedem Wiederholen neu.
6. Die gemessene Dauer von Gate und CI vor und nach der Änderung steht im Pull Request.

## Offene Entscheidung

Keine fachliche. Der Pfad für reine Dokument-Pushes (Kriterium 2) lockert den Hook; wer das nicht möchte, streicht das Kriterium.

## Herkunft und Bezüge

Test-Review vom 22.11.2026, Abschnitt C. `docs/engineering/testing.md`, `docs/engineering/github-setup.md`. [[PBI-58 - CI und Abhängigkeiten gepflegt halten]].

## Kommentare

- 22.11.2026: Angelegt aus der Review-Runde nach dem Durchstich (vier unabhängige Reviews am Stand `0cb8292`). Die Befunde stammen aus den Review-Berichten und den Berichten der Umsetzer; nichts davon ist bisher umgesetzt, soweit die Note es nicht anders sagt.
