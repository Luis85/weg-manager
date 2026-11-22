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
- 22.11.2026: Kriterien 1 und 2 sind umgesetzt und getestet (Branch `gate-cost`): `scripts/verify.mjs` startet Formatprüfung, Lint und Typprüfung gleichzeitig (Ausgabe je Schritt gepuffert und am Ende des Schritts ganz gedruckt; ein Fehler lässt die beiden anderen enden und hält dann das Gate; `AGENTS.md` angepasst), und der Hook startet `scripts/pre-push.mjs`, das bei einem Push nur aus `docs/**` und `*.md` allein die Formatprüfung fährt. Die Kriterien 3 bis 5 sind erfüllt, soweit es ohne CI-Lauf geht, und bis zum ersten CI-Lauf ungeprüft: der e2e-Job nutzt `xvfb-run` ohne `apt-get` und ohne Fenstermanager (das ist das Risiko, siehe `github-setup.md`), `scanner-lint` ist der letzte Schritt von `verify` (zwei `npm ci` je Lauf), der Obsidian-Cache wird getrennt wiederhergestellt und nach dem Lauf gespeichert, auch nach fehlgeschlagenen Tests, und gehalten werden die aktuelle und die vorige Version (`github-setup.md`). ESLint `--cache` ist bewusst nicht übernommen: Es meldet bei einer geänderten Abhängigkeit ein veraltetes Ergebnis für typbewusste Regeln (belegt in `testing.md`). Kriterium 6 ist offen, bis der Pull Request die Zahlen trägt: Gate gemessen (vorher 101 bis 115 s bei geringer Last, nachher auf ruhiger Maschine erwartet 81 bis 91 s; unter hoher Last im Wechsel 194 und 249 s gegen 319 bis 347 s), CI nur erwartet; deshalb bleiben `finished` und `triage` unverändert.
- 22.11.2026 (nach dem ersten CI-Lauf): Kriterium 3 bleibt offen. Der erste Lauf ohne Fenstermanager scheiterte an einer Kontrastmessung, die 400 ms nach dem Themenwechsel las, bevor der Wechsel gezeichnet war; ohne Fenstermanager zeichnet das Fenster auf dem Runner später. Der Fenstermanager bleibt deshalb vorerst, bis die e2e-Specs auf Bedingungen warten ([[PBI-63 - Obsidian-Testdouble und Ende-zu-Ende-Tests belastbarer machen]], Kriterien 6 bis 8); danach wird der Versuch wiederholt. Die übrigen Änderungen (Gate, Hook, ein `npm ci` weniger, Obsidian-Cache) sind davon unberührt.
