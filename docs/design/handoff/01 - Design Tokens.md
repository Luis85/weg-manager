---
type: Handoff
id: HO-01
status: entwurf
scope: mvp
version: "1.1"
date: 2026-11-22
---

# Handoff · Design Tokens

**Auf den Stand vom 22.11.2026 gebracht** nach [ADR 0002](../../adr/0002-architecture.md) (Nachtrag „CSS ownership in Obsidian“), [ADR 0008](../../adr/0008-navigation-and-view-state.md) und den Entscheidungen des Produktverantwortlichen vom 22.11.2026 (Primärfarbe, Gemeinschaftspalette; `docs/plans/pre-feature-improvement-plan.md`, Abschnitt 8). Maßgeblich für die gebauten Werte sind `src/styles/tokens.css`, `src/styles/bridge.css` und `src/styles/communities.css`. `design-tokens.css` und `design-tokens.json` halten die Gestaltungswerte vom 15.11.2026 fest; sie sind nicht der gebaute Stand und werden nicht ins Plugin kopiert.

## Regeln

- Komponenten verwenden **nur** Tokens und Tailwind-Klassen mit Präfix `wm:`, nie Literalfarben. Kein `el.style` für Farben (Obsidian-Richtlinie). Nichts schreibt in `document.head`.
- Alle Farben werden aus Variablen des Hosts abgeleitet (`--background-primary`, `--text-normal`, `--text-muted`, `--interactive-accent`, `--text-warning`, `--text-error`, `--text-success`, `--text-on-accent`). Daher folgen sie jedem Theme, auch Community-Themes, ohne eigene Umschaltung. Die Klassen `dark` und `light` am Plugin-Wurzelelement spiegeln `theme-dark` und `theme-light` des Hosts und steuern nur Nuxt UI und die Gemeinschaftsfarben.
- Das Plugin-Stylesheet ist auf `.weg-manager-root` (Wurzel jeder Plugin-Ansicht) begrenzt. Darin setzt `bridge.css` Obsidians Grundstile zurück (Listen, Überschriften, Absätze, Fieldset, Knöpfe), damit Obsidians Elementregeln nicht in die Ansicht greifen; umgekehrt greift das Plugin nicht in Obsidians Oberfläche ein.
- Status wird nie nur über Farbe vermittelt: Wort und Form gehören dazu (● ▲ ◆ ○ ◌). Die ausgewählte Gemeinschaft trägt ein Häkchen, die aktuelle Seite einen Balken am Anfang des Eintrags, das Kürzel steht immer als Text neben der Farbe.
- Kontrast nach WCAG 2.2 AA: Text mindestens 4,5:1 auf seiner Fläche und auf der 10–15-%-Tönung seiner Rolle, die Grenze eines Formularfelds und das Fokuszeichen mindestens 3:1, jeweils hell und dunkel. `tests/e2e/specs/appearance.e2e.ts` misst das in Obsidian.

## Farbrollen

Obsidians Status- und Akzentfarben sind Farbtöne, keine Textfarben (im hellen Standard-Theme: Warnung 2,95:1, Fehler 4,20:1, weißer Text auf dem Akzent 3,42:1). Das Plugin nimmt sie deshalb nie unverändert für Text oder Fläche, sondern leitet je Rolle zwei Werte ab:

| Token | Bildung | Verwendung |
| --- | --- | --- |
| `--wm-bg`, `--wm-bg-secondary` | `--background-primary`, `--background-secondary` | Grund; Karten, Hover, eingelassene Flächen |
| `--wm-border` | `--background-modifier-border` | Trenner, Rahmen von Karten |
| `--wm-line-strong` | `--text-muted` zu 70 % in den Hintergrund gemischt | Rahmen von Eingabefeldern und Umriss-Knöpfen (3:1; Obsidians Feldrahmen hat im hellen Theme 1,27:1) |
| `--wm-text`, `--wm-text-muted` | `--text-normal`, `--text-muted` | Haupttext; Sekundärtext, Metadaten |
| `--wm-primary-fg`, `--wm-warn-fg`, `--wm-bad-fg`, `--wm-ok-fg` | der Farbton zu 55 % in `--text-normal` gemischt | Text und Umriss der Rolle, auch Tönung hinter diesem Text (Hinweise, gewählte Option) |
| `--wm-primary-fill`, `--wm-warn-fill`, `--wm-bad-fill`, `--wm-ok-fill` | der Farbton mit 40 % Schwarz abgedunkelt | Fläche unter Text in `--wm-on-fill` (gefüllte Knöpfe, Hinweise); hält 4,5:1 auch in Nuxt UIs Hover-Stufe |
| `--wm-on-fill` | `--text-on-accent` | Text auf gefüllter Fläche |
| `--wm-accent` | `--interactive-accent` unverändert | nur Fokus-Umriss, nie Text oder Fläche |

Rollen in der Oberfläche:

- **Primärfarbe** ist Obsidians Akzentfarbe, für den Kontrast abgedunkelt (entschieden am 22.11.2026). Sie färbt Primärknöpfe, den aktiven Navigationseintrag. Die neutrale Primärfarbe des Entwurfs vom 15.11.2026 und die Option „Obsidian-Akzent übernehmen“ entfallen. Nuxt UIs `secondary` und `info` nehmen dieselbe Farbe.
- **Fokus:** Obsidians Akzent als 2-px-Umriss mit 1 px Abstand auf jedem Bedienelement (`:focus-visible` in `bridge.css`), im Modus erzwungener Farben `Highlight`. Es gibt keinen eigenen Fokuswert. Am Eingabefeld erscheint daneben noch Obsidians eigener grauer Ring; das ist offen ([[PBI-66 - Erscheinungsbild und Barrierefreiheit in Obsidian abschließen]]).
- **bad, warn, ok:** `bad` überfällig, akut, Konflikt, Fehler; `warn` Datenlücke, Termin fehlt, Prüfung offen, Platzhalter, „Auswahl nötig“; `ok` erledigt, geprüft, gesendet. Gebaut sind `warn` (Hinweis in der Gemeinschaftsauswahl) und `bad` (Fehler, Löschen); `ok` kommt mit der ersten Ansicht, die es braucht.
- **Noch nicht gebaut:** `info` (wartet, neu, Termin genannt) hat keinen eigenen Wert und folgt vorerst der Primärfarbe; `judge` (◆ Beiratsbewertung, immer intern) und `mark` (hervorgehobene Textstelle in Originalen) entstehen mit den Ansichten, die sie zeigen, und werden wie die übrigen aus Hostvariablen abgeleitet. Die Literalwerte in `design-tokens.css` sind dafür nur Richtwerte.

## Gemeinschaftsfarben

Eine Gemeinschaft hat genau eine Farbe aus einer festen Palette, nie frei gewählt und je Gemeinschaft verschieden. Die Notiz speichert den englischen Namen ([[DV-01 - Gemeinschaft v1]]); die Farbtöne je Theme legt das Plugin in `src/styles/communities.css` fest und kann sie ändern, ohne Notizen anzufassen. Die Palette heißt: `teal`, `violet`, `blue`, `rust`, `slate`, `amber`, `pink`, `olive` (deutsch Petrol, Violett, Blau, Rostrot, Schiefergrau, Bernstein, Pink, Oliv). `amber` ersetzt seit dem 22.11.2026 `cyan`, das von `teal` kaum zu unterscheiden war. Die Farbtöne stehen nur in `communities.css`, nicht hier.

- Der Farbton hinterlegt das Kürzel (`CommunityBadge`); der Text darauf ist in hellen Themes weiß, in dunklen dunkel (`--wm-community-on`), jeweils mit mindestens 4,5:1.
- Fehlt die Farbe oder kennt die Palette sie nicht, zeigt das Kürzel einen gestrichelten Umriss in der Textfarbe statt einer Fläche (`data-community-color="none"`).
- Die früheren Rollen `c1` und `c2` (mit `-bg`, `-fg`) entfallen; eine Gemeinschaftsfarbe hat keine Tönung und keine Textvariante.

## Typografie

Schrift ist die des Hosts: `--wm-font` folgt `--font-interface`, `--wm-font-mono` folgt `--font-monospace` (IDs, Daten, Zahlen mit `tabular-nums`). Die Schriftgrößen folgen Obsidians Oberflächengrößen und damit der Einstellung des Nutzers: Tailwinds `text-xs` bis `text-lg` sind `--font-ui-smaller`, `--font-ui-small`, `--font-ui-medium`, `--font-ui-large`; `text-xl` und `text-2xl` bleiben auf Tailwinds Skala, weil Obsidian keine größere Oberflächengröße hat. Die Stufen der Planung (Kennzahl, Seitentitel, Schritt-Frage, Abschnittstitel, Fließtext, Metadaten, Labels in Versalien) gelten als Rangfolge, nicht als Pixelwerte.

Die Schrift Geist, die der Entwurf vom 15.11.2026 mit lokaler Bündelung vorsah, entfällt: Entschieden am 22.11.2026 bleibt die Schrift des Hosts ([[09 - Offene Punkte vor Implementierung]], O-D12; Nachtrag in [[K-13 - Nuxt UI als Frontend-Komponentenbasis]]).

## Abstände und Formen

Tailwinds 4-px-Raster. Der Radius der Plugin-Elemente ist `--wm-radius` (`--radius-s` des Hosts), Nuxt UIs Radien leiten sich davon ab. Touchziele von 44 px und die feste Seitenleistenbreite aus dem Entwurf gehören zum mobilen Ausbau nach dem MVP. Gebaut ist: Der Rahmen der Ansicht richtet sich nach der Breite seines Containers; ab 860 px steht die Navigation als 14 rem breite Seitenleiste links, darunter als Reihe über dem Inhalt ([[07 - Responsive, Barrierefreiheit und Plattform]]).

## Abbildung auf Obsidian

| Plugin | Obsidian-Variable |
| --- | --- |
| `--wm-font`, `--wm-font-mono` | `--font-interface`, `--font-monospace` |
| `--wm-radius` | `--radius-s` |
| Nuxt-UI-Rollen (`--ui-*`) | aus den `--wm-*`-Tokens in `bridge.css`; Nuxts eigene Farbpalette und sein Laufzeit-Farbplugin sind abgeschaltet |
| Diagrammfarben (`--ui-chart-*`) | Obsidians Farbvariablen (`--color-blue`, `--color-purple` …) |
| Scrollbars, native Controls | folgen dem Theme des Hosts |

Die Entscheidung zur Komponentenbasis steht in [[K-13 - Nuxt UI als Frontend-Komponentenbasis]]. Ihre Aussage „eigene App-Optik“ gilt für die Anordnung und die Komponenten, nicht mehr für Farben und Schrift: Die Ansicht übernimmt das Theme des Hosts.
