# The Obsidian WEG Manager Plugin

Ein Obsidian-Plugin für Verwaltungsbeiräte, die eine oder mehrere Wohnungseigentümergemeinschaften (WEG) begleiten. Offene Anliegen bleiben mit Quelle, Zuständigkeit und nächstem Schritt sichtbar, die Wochenarbeit ist geführt und begrenzt, Nachrichten bleiben unter menschlicher Kontrolle. Alle Daten liegen lokal als Markdown-Notizen mit Frontmatter im eigenen Vault, nutzbar ohne Konto, Netz und KI.

> **Stand:** Konzeptphase. Anforderungen, Design und ein klickbarer Prototyp liegen vor. Das Plugin hat ein lauffähiges technisches Grundgerüst (Begrüßung, Dateizähler, Einstellungen), aber noch keine Fachfunktionen.

## Kernreise

1. Gemeinschaften getrennt einrichten und vorhandene Registerpunkte übernehmen.
2. Nachrichten, Unterlagen und einzelne erledigbare Punkte mit Quelle erfassen.
3. In der **Lage** sehen, was seit der letzten Übergabe passiert ist, was drängt und welche Fristen anstehen.
4. Die **Wochenarbeit** in fünf Schritten erledigen: Eingänge zuordnen, Zusagen prüfen, Entscheidungen treffen, Nachrichten prüfen und senden, Schwerpunkte für nächste Woche festlegen.
5. Nachrichten bewusst außerhalb des Plugins senden und den tatsächlichen Versand dokumentieren.
6. Ausgewählte Sachstände und Quellen verständlich weitergeben.

## Prototyp

Der klickbare Prototyp zeigt den abgestimmten Designstand mit synthetischen Daten (WEG Ahornweg 12 und Tiefgarage). Er läuft ohne Installation im Browser: [`docs/design/prototype/WEG-Manager-Prototyp.html`](docs/design/prototype/WEG-Manager-Prototyp.html). Stand, Inhalte und alle Bildschirme: [Prototyp – Stand Pilot](docs/design/prototype/Prototyp%20-%20Stand%20Pilot.md).

### Lage

Was ist neu, was drängt, was steht in den nächsten 14 Tagen an, welche Schwerpunkte hat die letzte Übergabe gesetzt.

![Lage](docs/design/sitemap/assets/v2-P-D-01-Lage.png)

### Wochenarbeit

Geführter Ablauf in fünf Schritten. Eingänge werden Punkten zugeordnet, erkannte Termine bewusst übernommen.

![Wochenarbeit – Eingang](docs/design/sitemap/assets/v2-P-D-02-Woche-Eingang.png)

Höchstens sieben reguläre Entscheidungen pro Woche, Dringendes zusätzlich. Bestätigen erzeugt Entwürfe und Aufgaben; gesendet wird nichts automatisch.

![Wochenarbeit – Entscheiden](docs/design/sitemap/assets/v2-P-D-04-Woche-Entscheiden.png)

### Punktakte

Ein Punkt mit Fakten, Fremdtermin und Wiedervorlage, Verlauf und Quellen an einem Ort.

![Punktakte](docs/design/sitemap/assets/v2-P-D-09-Punktakte.png)

### Postausgang

Entwürfe je Gemeinschaft und Empfänger, Eigentümer-Infos auf Deutsch und Englisch, Versand wird dokumentiert.

![Postausgang](docs/design/sitemap/assets/v2-P-D-07-Postausgang.png)

### Kontakte

Personen, Firmen und Eigentümer-Verteiler, gruppiert nach Rolle und zuständig für eine oder mehrere Gemeinschaften.

![Kontakte](docs/design/sitemap/assets/v2-P-D-14-Kontakte.png)

### Mobil

Die vollständige Wochenarbeit funktioniert auch auf dem Handy.

| Lage | Entscheiden | Punktakte | Zusage erfassen |
| --- | --- | --- | --- |
| ![Lage mobil](docs/design/sitemap/assets/v2-P-M-01-Lage.png) | ![Entscheiden mobil](docs/design/sitemap/assets/v2-P-M-04-Woche-Entscheiden.png) | ![Punktakte mobil](docs/design/sitemap/assets/v2-P-M-09-Punktakte.png) | ![Erfassen mobil](docs/design/sitemap/assets/v2-P-M-13-Erfassen-Zusage.png) |

## Dokumentation

| Einstieg | Inhalt |
| --- | --- |
| [Produktvision](docs/01-Produktvision.md) | Zielgruppe, Problem, Nutzenversprechen |
| [MVP-PRD](docs/02-MVP-PRD.md) | Umfang, funktionale und nichtfunktionale Anforderungen, Abnahmefälle |
| [Dokumentationsstruktur](docs/README_DOCS.md) | Ordner, Notiztypen und Konventionen |
| [Sitemap](docs/design/sitemap/00%20-%20Sitemap.md) | Ansichten und Navigation (VIEW-01 bis VIEW-08) |
| [Handoff](docs/design/handoff/00%20-%20Handoff%20%C3%9Cbersicht.md) | Umsetzungspaket: Tokens, Komponenten, Zustände, Texte, Abnahme, offene Punkte |

Die Dokumentation ist als Obsidian-Vault mit verknüpften Notizen angelegt. Anforderungen (Epics, Features, PBIs) liegen unter `docs/requirements`, Fachregeln unter `docs/business-rules`, Entscheidungen unter `docs/decisions`; die Übersichten liefert `Product Backlog.base`.

## Entwicklung

Voraussetzung: Node 24 (`.nvmrc`) und npm 11.

```sh
npm ci            # installiert und setzt den pre-push-Hook (npm run verify)
npm run dev:ui    # Browser-Harness, ?scenario=default|empty|error|slow|readonly
npm run dev       # Watch-Build; mit OBSIDIAN_PLUGIN_DIR in .env.local direkt in einen Test-Vault
npm run verify    # Qualitätstor: Format, Lint, Typen, Tests mit Coverage, Analyse, Build, dist-Prüfung
```

| Skript | Zweck |
| --- | --- |
| `test`, `test:coverage` | Vitest (Projekte `unit` und `dom`) |
| `test:mutation`, `test:mutation:full` | Stryker auf Domain und Application |
| `test:e2e` | End-to-End-Tests im echten Obsidian (WebdriverIO, lädt Obsidian beim ersten Lauf herunter; unter Linux ohne Display: `xvfb-run -a npm run test:e2e`) |
| `build`, `check:dist` | `dist/main.js`, `styles.css`, `manifest.json` und ihre Invarianten |
| `version`, `release:package` | Versionssprung und Release-Paket, siehe Releasing |

Für die eigene Vault-Konfiguration: `node_modules/`, `dist/`, `coverage/`, `reports/` und `.stryker-tmp/` unter *Einstellungen → Dateien und Links → Ausgeschlossene Dateien* eintragen, da der Vault die Repo-Wurzel ist.

Entwicklerdokumentation (englisch): [Architektur](docs/engineering/architecture.md) · [Feature hinzufügen](docs/engineering/adding-a-feature.md) · [Tests](docs/engineering/testing.md) · [Fehlerbehandlung](docs/engineering/error-handling.md) · [Releasing](docs/engineering/releasing.md) · [GitHub-Einrichtung](docs/engineering/github-setup.md) · [ADRs](docs/adr/)

## Repository

| Ort | Inhalt |
| --- | --- |
| `src/` | Plugin-Quellcode: `domain`, `application`, `infrastructure`, `presentation` |
| `harness/` | Browser-Harness für UI-Arbeit ohne Obsidian |
| `docs/` | Produktkonzept, Anforderungen, Design, Prototyp, Entwicklerdokumentation |
| `skills/` | Claude Skill `weg-gmail-to-vault` (0.1.0): übernimmt ausgewählte Gmail-Nachrichten lesend als Notizen in den Vault |
| `scripts/` | Build-, Prüf- und Release-Skripte des Plugins; `package_claude_skills.py` baut das Skillpaket (`--output-dir`) |
| `tests/` | Plugin-Tests (`unit`, `dom`, Obsidian-Testdouble) sowie Tests für Skillpaket und Gmail-Import |

## Lizenz

[MIT](LICENSE)
