---
type: Handoff
id: HO-01
status: entwurf
scope: mvp
version: "1.0"
date: 2026-11-15
---

# Handoff · Design Tokens

Maschinenlesbar: `design-tokens.css` (CSS Custom Properties, Präfix `--wm-`) und `design-tokens.json` (dieselben Werte, hell/dunkel). Werte entsprechen den Mockups v2 und dem Prototyp.

## Regeln

- Komponenten verwenden **nur** Tokens, nie Literalfarben. Kein `el.style` für Farben (Obsidian-Richtlinie); Klassen im Plugin-Stylesheet.
- Alle Tokens sind auf `.wm-root` (Container der Plugin-Ansicht) gekapselt. Host-Themes und Snippets verändern die Plugin-Optik nicht ungewollt; umgekehrt greift das Plugin nicht in Obsidian-UI ein.
- Dunkelmodus folgt dem Obsidian-Theme (`body.theme-dark`), keine eigene Umschaltung.
- Status wird nie nur über Farbe vermittelt: Form (● ▲ ◆ ○ ◌) und Wort gehören dazu.
- Kontrast: Text ≥ 4.5:1 auf seiner Fläche in beiden Modi (geprüft für `fg`, `fg-2`, `fg-3` auf `bg`/`surface` und alle `*-fg` auf `*-bg`).

## Farbrollen

| Token | Rolle |
| --- | --- |
| `bg`, `surface`, `surface-2`, `sunk` | Grund, Karten/Panels, Hover, eingelassene Flächen (Segmente, Chips neutral) |
| `line`, `line-strong` | Trenner, Rahmen von Eingaben |
| `fg`, `fg-2`, `fg-3` | Haupttext, Sekundärtext, Metadaten/IDs |
| `primary`, `on-primary` | Primäraktion und invertierte Flächen (im Dunkelmodus hell) |
| `focus` | Fokusring, Links |
| `c1`, `c2` (+`-bg`, `-fg`) | Gemeinschaftsfarben. Default c1 = erste, c2 = zweite Gemeinschaft; Auswahl in Einstellungen aus einer geprüften Palette, nie frei |
| `bad` | überfällig, akut, Konflikt, Fehler |
| `warn` | Datenlücke, Termin fehlt, Prüfung offen, Platzhalter |
| `ok` | erledigt, geprüft, gesendet |
| `info` | wartet, neu, Termin genannt |
| `judge` | ◆ Beiratsbewertung (immer intern) |
| `mark` | hervorgehobene Textstelle in Originalen |

## Typografie

Geist (UI) und Geist Mono (IDs, Daten, Zahlen, `tabular-nums`). Schriften werden **lokal gebündelt** (Offline, B-NFR-01); Fallback auf Obsidian-Schriften `--font-interface` / `--font-monospace`.

| Stufe | Größe | Verwendung |
| --- | --- | --- |
| `kpi` | 40 (mobil 32) | Kennzahlen |
| `title-lg` | 30 | Seitentitel Desktop |
| `title-md` | 24 | Schritt-Frage in der Wochenarbeit |
| `title-sm` | 21 | Titel mobil |
| `text-lg` | 17 | Abschnittstitel |
| `text-md` | 15 | Fließtext, Eingaben (mobil ≥ 15, sonst Zoom bei Fokus auf iOS) |
| `text-sm` | 13 | Metadaten, Buttons klein |
| `text-xs` | 12 | Labels in Versalien (+0.06em), IDs |

## Abstände und Formen

4er-Raster (`space-1` … `space-8`). Radien: Chips `pill`, Eingaben/Buttons `md`, Karten `lg`, Sheets `xl`. Touchziele ≥ `touch` (44 px). Sidebar `sidebar` (236 px).

## Abbildung auf Obsidian

| Plugin | Obsidian-Variable (Fallback/Anpassung) |
| --- | --- |
| `--wm-font` | `--font-interface` als Fallback |
| `--wm-font-mono` | `--font-monospace` als Fallback |
| `--wm-focus` | eigener Wert; `--interactive-accent` wird bewusst nicht übernommen (Lesbarkeit der Statussemantik) |
| Scrollbars, native Controls | `color-scheme` folgt `theme-dark`/`theme-light` |

Entscheidung „eigene App-Optik“ siehe [[K-13 - Nuxt UI als Frontend-Komponentenbasis]]. Eine Option „Obsidian-Akzent übernehmen“ ist nicht Teil des MVP.
