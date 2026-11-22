---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 95000
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
triage: ready-for-human
---

# PBI-67 · Erste Veröffentlichung absichern

**Planungsstand:** Restpunkte aus dem Test-Review; der erste Lauf braucht den Tag des Produktverantwortlichen · **Bezug:** `docs/plans/pre-feature-improvement-plan.md` (Abschnitt 8, Review-Runde vom 22.11.2026)

## User Story

Als Beirat möchte ich, dass die erste veröffentlichte Version genau die geprüften Dateien enthält und ihre Herkunft belegt ist, damit ich ihr vertrauen kann.

## Ausgangslage

Mit PR #32 wurden der Release-Ablauf und der nächtliche Mutationslauf geändert. Beide sind bis heute nie gelaufen und lassen sich aus der Entwicklungsumgebung nicht ausführen; geprüft sind sie nur mit actionlint. Ungetestet sind damit:

- **Release (`.github/workflows/release.yml`):** die Prüfung, dass der getaggte Commit auf `main` liegt; die Übergabe der drei Dateien zwischen den beiden Jobs; die Bescheinigung der Herkunft (Attestation); `gh release create` mit `--prerelease` für Versionen unter 1.0 und `--verify-tag`; der e2e-Lauf auf dem Runner.
- **Nächtlicher Lauf (`.github/workflows/nightly-mutation.yml`):** Wiederherstellen und Speichern der Zwischenergebnisse, der Start von Hand mit `full`, und der Job, der bei einem Fehlschlag ein GitHub-Issue „Nightly mutation run failed“ anlegt oder kommentiert.
- **Dependabot:** Die neuen Schlüssel (`cooldown`, Gruppe `@wdio/*`) sind gegen die Dokumentation geprüft, nicht gegen einen Lauf.

Dazu zwei Punkte aus dem Review (D6):

- **Lizenzhinweise.** Die Hinweise der gebündelten Abhängigkeiten (MIT, BSD, Apache und andere; 248 Pakete im Laufzeitbaum, davon 232 MIT) fehlen im minimierten `main.js`. Die Veröffentlichung besteht bewusst aus genau drei Dateien.
- **`vaul-vue@0.4.1`** hat kein `license`-Feld in seiner `package.json`.

Und der offene Punkt aus [[PBI-58 - CI und Abhängigkeiten gepflegt halten]] (Kriterium 5): `CI / e2e` ist keine Pflichtprüfung. Der Job läuft bei jedem Pull Request, dauert etwa zwei Minuten und war in allen Läufen der Review-Runde grün.

## Akzeptanzkriterien

1. Die Vorabversion 0.2.0 ist über den Release-Ablauf entstanden; der Lauf wurde beobachtet. Die Veröffentlichung trägt genau `main.js`, `manifest.json` und `styles.css`, ist als Vorabversion markiert und hat eine gültige Bescheinigung. Ein Fehlschlag wird nach `docs/engineering/releasing.md` behoben und hier festgehalten.
2. Der nächtliche Mutationslauf ist mindestens einmal gelaufen (von Hand oder nach Zeitplan); der zweite Lauf nutzt die Zwischenergebnisse des ersten.
3. Der erste Dependabot-Lauf nach PR #32 hat die Wartezeit und die Gruppe angewendet, oder die Schlüssel sind korrigiert.
4. Es ist entschieden, ob die Veröffentlichung Lizenzhinweise Dritter mitführt (etwa als vierte Datei oder im Repository), und die Lizenz von `vaul-vue` ist an seiner Quelle geklärt.
5. `CI / e2e` ist Pflichtprüfung für `main` (Einstellung des Produktverantwortlichen).

## Offene Entscheidung

Lizenzhinweise Dritter: mitliefern, im Repository führen oder nichts tun (Kriterium 4). Der Zeitpunkt des Tags 0.2.0 gehört dem Produktverantwortlichen.

## Herkunft und Bezüge

Test-Review vom 22.11.2026 (A1, A2, B8, D6), Bericht zu PR #32. `docs/engineering/releasing.md`, `docs/engineering/github-setup.md`.

## Kommentare

- 22.11.2026: Angelegt aus der Review-Runde nach dem Durchstich (vier unabhängige Reviews am Stand `0cb8292`). Die Befunde stammen aus den Review-Berichten und den Berichten der Umsetzer; nichts davon ist bisher umgesetzt, soweit die Note es nicht anders sagt.
