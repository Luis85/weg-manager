---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 97000
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

# PBI-69 · Befunde der zweiten Review-Runde an Release, CI und Skripten beheben

**Planungsstand:** Umgesetzt auf dem Zweig `review2-release`; offen ist der Nachweis durch echte Läufe (siehe Kommentare) · **Bezug:** Review von Build, CI und Release am Stand `65eb006`

## User Story

Als Beirat möchte ich, dass Release, CI und die Prüfskripte nur dann „grün“ melden, wenn sie wirklich geprüft haben, und dass eine Veröffentlichung genau die vom Qualitätstor geprüften Dateien enthält, damit ich dem Ergebnis trauen kann.

## Ausgangslage

Der Review von Build, CI und Release am Stand `65eb006` fand nichts Ausnutzbares, aber mehrere Stellen, an denen eine Prüfung stillschweigend nichts tut oder etwas anderes prüft, als die Dokumentation sagt:

1. **Skript-Aufruf versagt offen.** `scripts/verify.mjs` und sieben weitere Skripte starten ihre Befehlszeile nur, wenn `resolve(process.argv[1])` dem echten Pfad entspricht. Über einen Symlink tut das Skript nichts und endet mit 0 (vom Reviewer im Versuch bestätigt).
2. **`release.yml`:** (a) Die Tag-Prüfung wertet jeden `gh api`-Fehler als „kein Tag“. (b) Die veröffentlichten Dateien stammen aus einem zweiten Build: Der e2e-Lauf baut `dist/` neu, erst danach wird gepackt. (c) Die billigen Prüfungen (Version gegen `manifest.json`, Eintrag in `versions.json`) laufen zuletzt, und `package.json` gegen `manifest.json` wird nirgends verglichen. (d) `gh release create` legt zuerst einen Entwurf an; ein Fehler danach lässt ihn stehen, und `releasing.md` behauptet das Gegenteil.
3. **`ci.yml`:** Mit `cancel-in-progress: false` hält GitHub je Gruppe nur einen wartenden Lauf; von drei schnellen Zusammenführungen nach `main` bekommt die mittlere keinen Lauf. Die Checkouts behalten das Token.
4. **`nightly-mutation.yml`:** Die Cache-Schlüssel erfassen `configs/vitest.config.ts`, die tsconfigs und `tests/support/**` nicht, obwohl die Ergebnisse davon abhängen; ein Überlebender wird in einem inkrementellen Lauf nicht gegen neue Tests geprüft.
5. **Lizenzhinweise:** Für ein Paket ohne Lizenzdatei schreibt das Skript einen Standardtext, der im Diff wie jeder andere Eintrag aussieht.
6. **Dokumente:** Die Prüfung der Herkunftsbescheinigung (`--repo` allein) beweist nicht, dass `release.yml` auf `main` oder dem Tag die Datei erzeugt hat; `github-setup.md` verortet die Tag-auf-`main`-Prüfung im falschen Job; `testing.md` sagt, `check:notices` lese das Lockfile.

Nicht Teil dieser Note: eine geschützte Umgebung `release` und Tag-Regeln (Einstellung des Produktverantwortlichen), die Netzwerkregel von `check-dist`, `npm ci --ignore-scripts`, der Blueprint unter `docs/plans/`.

## Akzeptanzkriterien

1. Jedes Skript, das eine Befehlszeile hat, startet sie auch über einen Symlink; ein Test startet ein Skript über einen Symlink in einem temporären Ordner, ein zweiter stellt sicher, dass kein Skript mehr `process.argv[1]` selbst vergleicht.
2. `release.yml`: (a) nur ein 404 gilt als „kein Tag“, jeder andere Fehler beendet den Job; (b) die Dateien werden direkt nach dem Qualitätstor bereitgestellt und gehasht, nach den e2e-Schritten bricht der Job ab, wenn sie davon abweichen; (c) Version, Übereinstimmung von Tag, `manifest.json`, `package.json` und `versions.json` werden vor `npm ci` geprüft, und das Qualitätstor prüft `package.json` gegen `manifest.json` mit (`check:versions`); (d) `releasing.md` sagt, was bei einem Fehler im letzten Schritt stehen bleibt und wie man es entfernt. Zwei Jobs, Pins, `persist-credentials: false` und Eingaben nur über `env:` bleiben.
3. `ci.yml`: Pushes nach `main` haben je Commit eine Gruppe, Pull Requests brechen überholte Läufe weiter ab, der Kommentar stimmt, die Checkouts setzen `persist-credentials: false`.
4. `nightly-mutation.yml`: Schlüssel und `restore-keys` beider Jobs enthalten, wovon die Tests des Jobs abhängen; ein wöchentlicher Lauf prüft alle Mutanten, der nächtliche bleibt inkrementell.
5. Ein von `third-party-notices.mjs` erzeugter Lizenztext ist in `THIRD-PARTY-NOTICES.txt` markiert und wird in der Ausgabe des Skripts genannt; ein Test belegt es.
6. `releasing.md` dokumentiert die Prüfung mit `--signer-workflow` und `--source-ref`, `github-setup.md` und `testing.md` stimmen mit den Dateien überein.
7. `npm run verify` endet mit 0.

## Herkunft und Bezüge

Review von Build, CI und Release (Bericht `ci-release-scripts.md`, Stand `65eb006`). `docs/engineering/releasing.md`, `docs/engineering/github-setup.md`, `docs/engineering/testing.md`. Verwandt: [[PBI-67 - Erste Veröffentlichung absichern]].

## Kommentare

- 22.11.2026: Angelegt und umgesetzt auf dem Zweig `review2-release` (ein Commit je Punkt). Die Kriterien 1, 5, 6 und 7 sind durch Tests beziehungsweise das Gate belegt.
  - **Zu 1:** `scripts/is-cli.mjs` vergleicht echte Pfade (`realpathSync`); alle acht Skripte und `install-hooks.mjs` nutzen es. `import.meta.main` wird nicht verwendet, weil es Node 24.2 braucht und `engines` `>=24` sagt.
  - **Zu 2:** `scripts/release-version.mjs` (Version auflösen) und `scripts/check-versions.mjs` (Versionsregeln) sind getestet und laufen im Job `build` vor `npm ci`. Bereitstellen und Hashes direkt nach `npm run verify`, Prüfung der Hashes nach den e2e-Schritten, dann erst der Upload. Zu (d) bewusst die Dokumentation statt eines löschenden Schritts: Ein Schritt, der eine Veröffentlichung löscht, könnte bei falscher Bedingung eine veröffentlichte Version entfernen; ob `gh` einen Entwurf über den Tag findet, ist nicht an einem echten Fehler gezeigt. Zusätzlich: `check:versions` ist der vierte Schritt der ersten Gate-Stufe (`AGENTS.md`, `testing.md` angepasst). Ein zweiter Build mit denselben Quellen lieferte lokal byteidentische Dateien; der Ablauf verlässt sich nicht darauf.
  - **Zu 3 und 4:** Die Gruppe ist `ci-<ref>` für Pull Requests und `ci-<sha>` für Pushes. Der nächtliche Lauf ist Montag bis Samstag inkrementell, Sonntag voll (ein einziger Lauf am Sonntag, nicht zwei). Abhängigkeiten geprüft: Die gesteuerten Tests importieren `tests/support/**`, beide Vitest-Konfigurationen `configs/vitest.config.ts`, der Typprüfer nutzt `tsconfig.app.json` und `tsconfig.base.json`; nur der Randschichten-Job hängt zusätzlich von `configs/vite.shared.ts` und den zwei Skripten ab, die es importiert.
  - **Zu 5:** Ein Eintrag mit erzeugtem Standardtext trägt `licence text generated` im Index und eine Zeile in seinem Abschnitt; `notices` und `check:notices` nennen die Namen. Kein gebündeltes Paket ist heute betroffen, die Datei blieb unverändert. Ein Override mit wörtlichem Text zählt als belegt und wird nicht markiert.
  - **Zu 6:** Die Flags stammen aus `gh attestation verify --help` (GitHub CLI 2.89.0); der Befehl lief nicht gegen eine echte Veröffentlichung.
- 22.11.2026, **offen, nur durch echte Läufe zu belegen** (deshalb ist `finished` leer und der Stand `ready-for-agent`): `release.yml` und `nightly-mutation.yml` laufen nicht aus einem Pull Request. Geprüft sind sie mit actionlint (und shellcheck für die Schritte) und durch Lesen. Zu beobachten bleibt: ein Lauf von `release.yml` mit den neuen Schritten (Reihenfolge, Hash-Prüfung, 404-Erkennung des Tags, `node` vor `npm ci` auf dem Runner), der Start über einen geschobenen Tag, der Sonntagslauf und ein zweiter Lauf des nächtlichen Mutationslaufs mit den neuen Schlüsseln, sowie die drei Läufe von `ci.yml` nach drei schnellen Zusammenführungen. Die `release`-Gruppe von `release.yml` hat dieselbe Eigenschaft (eine wartende Ausführung je Gruppe) wie die alte CI-Gruppe; bei einem Release nach dem anderen ohne Abwarten könnte ein wartender Lauf verdrängt werden. Das ist nicht geändert.
- 22.11.2026 (Release 0.2.1): Der erste echte Lauf von `release.yml` mit den neuen Schritten ist beobachtet: Lauf 2 (Run 45083519862), von Hand auf `main` gestartet, Commit `6352704`, beide Jobs im ersten Versuch grün. Belegt sind damit die Reihenfolge (Version auflösen, Commit auf `main`, `check:versions` vor `npm ci`), die Erkennung „Tag fehlt“ über die Abfrage (0.2.1 hatte noch keinen Tag), Bereitstellen und Hashen direkt nach dem Gate, die e2e-Schritte und danach die Hash-Prüfung („The staged files are unchanged“), der Upload und im Job `release` Bescheinigung und Veröffentlichung mit vier Dateien als Vorabversion. Weiter offen und nur durch echte Läufe zu belegen: der Start über einen geschobenen Tag, der Sonntagslauf und ein zweiter Lauf des nächtlichen Mutationslaufs mit den neuen Schlüsseln, die drei Läufe von `ci.yml` nach drei schnellen Zusammenführungen und `gh attestation verify` gegen eine echte Veröffentlichung. `finished` bleibt deshalb leer.
