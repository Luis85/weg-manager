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

1. Die Vorabversion 0.2.0 ist über den Release-Ablauf entstanden; der Lauf wurde beobachtet. Die Veröffentlichung trägt `main.js`, `manifest.json`, `styles.css` und die Datei mit den Lizenzhinweisen Dritter, ist als Vorabversion markiert und hat eine gültige Bescheinigung. Ein Fehlschlag wird nach `docs/engineering/releasing.md` behoben und hier festgehalten.
2. Der nächtliche Mutationslauf ist mindestens einmal gelaufen (von Hand oder nach Zeitplan); der zweite Lauf nutzt die Zwischenergebnisse des ersten.
3. Der erste Dependabot-Lauf nach PR #32 hat die Wartezeit und die Gruppe angewendet, oder die Schlüssel sind korrigiert.
4. Es ist entschieden, ob die Veröffentlichung Lizenzhinweise Dritter mitführt (etwa als vierte Datei oder im Repository), und die Lizenz von `vaul-vue` ist an seiner Quelle geklärt.
5. `CI / e2e` ist Pflichtprüfung für `main` (Einstellung des Produktverantwortlichen). Am 22.11.2026 im vierten Interview erneut gefragt und erneut zurückgestellt; das Kriterium bleibt offen.

## Entscheidungen (22.11.2026)

- **Lizenzhinweise Dritter (Kriterium 4):** Eine erzeugte Datei mit den Hinweisen liegt im Repository, das Gate hält sie aktuell, und jede GitHub-Veröffentlichung trägt sie als vierte Datei. Obsidian und BRAT installieren weiter nur `main.js`, `manifest.json` und `styles.css`. Die Datei ist schon in 0.2.0 dabei.
- **Tag 0.2.0:** Der Agent setzt den Tag, sobald die am 22.11.2026 beschlossenen Arbeiten auf `main` liegen und die CI dort grün ist: Datensatz-Baukasten in `notes`, Lizenzhinweise, Modulmanifest (PBI-60), Löschen der ungenutzten Ereignisse (PBI-62), die vier Punkte aus PBI-65 und die Farbe `amber` (PBI-66). Er beobachtet den ersten Lauf des Release-Ablaufs.
- **`CI / e2e` als Pflichtprüfung (Kriterium 5):** vorerst nicht. Der Agent wartet weiter nach eigener Regel auf den Job, bevor er zusammenführt.
- **Viertes Interview (22.11.2026), Kriterium 5:** Erneut gefragt, ob `CI / e2e` Pflichtprüfung für `main` wird: noch nicht, erneut zurückgestellt. Der Agent wartet weiter nach eigener Regel auf den Job, bevor er zusammenführt.
- **Viertes Interview (22.11.2026), Veröffentlichung (berührt Kriterium 1):** Kein Freigabeklick je Veröffentlichung, also keine geschützte Umgebung `release`. Eine Veröffentlichung startet nur, wenn der Eigentümer sie verlangt, und sie wird veröffentlicht, wenn ihre Prüfungen bestehen.

## Herkunft und Bezüge

Test-Review vom 22.11.2026 (A1, A2, B8, D6), Bericht zu PR #32. `docs/engineering/releasing.md`, `docs/engineering/github-setup.md`.

## Kommentare

- 22.11.2026: Angelegt aus der Review-Runde nach dem Durchstich (vier unabhängige Reviews am Stand `0cb8292`). Die Befunde stammen aus den Review-Berichten und den Berichten der Umsetzer; nichts davon ist bisher umgesetzt, soweit die Note es nicht anders sagt.
- 22.11.2026 (Interview nach der Review-Runde): Entscheidungen eingetragen. Kriterium 5 ist zurückgestellt; die Note bleibt `ready-for-human`, weil der Tag eine öffentliche Vorabversion erzeugt und die Einstellung der Pflichtprüfung dem Produktverantwortlichen gehört.
- 22.11.2026 (zweites Interview am selben Tag): Die Lizenzhinweise sind umgesetzt (PR #40: 26 gebündelte Pakete, 25 MIT, 1 ISC; `vaul-vue` ist nicht im Bündel, seine Lizenz ist an der Quelle als MIT belegt). Kriterium 4 ist damit erfüllt. Der Produktverantwortliche installiert 0.2.0 über BRAT in einem Vault unter Windows. Der Agent darf den nächtlichen Mutationslauf nach dem Tag einmal von Hand starten (Kriterium 2) und bei Dependabot-Aktualisierungen die neu erzeugten Lizenzhinweise als Commit ergänzen (`docs/engineering/github-setup.md`).
- 22.11.2026 (nach der Veröffentlichung): Kriterium 1 ist erfüllt. 0.2.0 ist über den Release-Ablauf entstanden, von Hand auf `main` gestartet (PR #49: der Ablauf legt den Tag selbst an, weil die Agentensitzung keine Tags schieben darf). Beide Jobs liefen im ersten Versuch durch; die Veröffentlichung ist als Vorabversion markiert, trägt `main.js`, `manifest.json`, `styles.css` und `THIRD-PARTY-NOTICES.txt`, und der Schritt der Herkunftsbescheinigung war erfolgreich. Ungeprüft bleibt der Start über einen geschobenen Tag. Kriterium 2 ist teilweise erfüllt: Der nächtliche Lauf lief einmal nach Zeitplan durch (32 Minuten). Der von Hand gestartete Lauf nach dem Versionssprung prüfte alle Mutanten neu, weil das Lockfile zum Cache-Schlüssel gehört: Der Job der Randschichten bestand in 39 Minuten, der Hauptjob wurde nach 45 Minuten ohne Bericht abgebrochen, und es entstand kein Issue. Behoben: Zeitgrenze 120 Minuten, und der Meldejob wertet auch abgebrochene Jobs. Offen: ein zweiter Lauf, der die Zwischenergebnisse des ersten nutzt, und der Nachweis des Issues.
- 22.11.2026 (viertes Interview): Zwei Entscheidungen eingetragen (Abschnitt „Entscheidungen“): `CI / e2e` bleibt keine Pflichtprüfung (Kriterium 5, erneut zurückgestellt), und es gibt keinen Freigabeklick je Veröffentlichung (keine geschützte Umgebung `release`). Offen bleiben: Kriterium 2 zweiter Teil (ein zweiter nächtlicher Lauf, der die Zwischenergebnisse des ersten nutzt, und der Nachweis des Issues bei einem Fehlschlag), Kriterium 3 (der erste Dependabot-Lauf) und Kriterium 5. Die Note bleibt `ready-for-human`, ohne `finished`. Zur Version 0.2.1 (nach PBI-71 und PBI-72, der Agent startet sie dann) siehe die Kommentare von [[PBI-71 - Formulare des Datensatz-Bausteins für alle Feldarten tragfähig machen]].
