---
type: Handoff
id: HO-07
status: entwurf
scope: mvp
version: "1.1"
date: 2026-11-22
---

# Handoff · Responsive, Barrierefreiheit und Plattform

**Auf den Stand vom 22.11.2026 gebracht** nach [ADR 0002](../../adr/0002-architecture.md) (Nachtrag „CSS ownership in Obsidian“), [ADR 0008](../../adr/0008-navigation-and-view-state.md) und dem UX-Review vom 22.11.2026 (`docs/plans/pre-feature-improvement-plan.md`, Abschnitt 8). „Gebaut“ nennt die Umsetzung im Durchstich (Rahmen, Gemeinschaften, Einstellungen); die Prüfungen, die ein Mensch machen muss, stehen in [[PBI-66 - Erscheinungsbild und Barrierefreiheit in Obsidian abschließen]].

## Breakpoints (Breite der Plugin-View, nicht des Fensters)

| Breite | Layout |
| --- | --- |
| ≥ 1200 | Sidebar + Inhalt + Kontextpanel (Woche, Akte) |
| 860–1199 | Sidebar + Inhalt; Kontextpanel umbrechend unter den Inhalt |
| < 860 | Gebaut: die Navigation steht als umbrechende Reihe über dem Inhalt, in ihr zuerst Zurück und Vorwärts, die Gemeinschaftsauswahl und dann die Einträge. Entwurf für den mobilen Ausbau: Titel, Gemeinschafts-Pill, Segmentnavigation oben, schwebendes „Erfassen“, Panels als Tabs oder darunter |

Gebaut: Die Breite des Containers der View (Container Query) entscheidet, nicht der Gerätetyp: Obsidian-Desktop mit schmaler Seitenleiste zeigt das mobile Layout.

## Obsidian Mobil

Stand 21.11.2026: Dieser Abschnitt beschreibt den mobilen Ausbau nach dem MVP, nicht den MVP-Umfang. Das Plugin bleibt bis dahin `isDesktopOnly: true` ([[K-09 - Vollständige mobile Wochenarbeit unterstützen]]). Die Breakpoints oben gelten weiter, weil auch Desktop-Panes schmal sein können.

- Keine eigene Tabbar unten: Die Obsidian-Navigation schwebt dort und blendet sich aus.
- Aktionsleisten und FAB mit Abstand `bottom ≥ 80px + env(safe-area-inset-bottom)`; Inhalte mit `padding-bottom` ≥ 140 px, damit nichts dauerhaft verdeckt ist.
- Sheets von unten (max. 92 % Höhe) mit Griff und Schließen-Button; Zurück-Geste schließt.
- Eingabefelder ≥ 15 px Schrift (kein Auto-Zoom), Tastatur darf Aktionsleiste verdecken → Leiste folgt `visualViewport`.
- Dateiauswahl mobil (Foto, PDF) über Obsidian-Vault-API; Verhalten auf Referenz-Handy prüfen (O-02).
- Dateien außerhalb des Vaults: Desktop über System-Dateidialog (`<input type=file>`), Inhalt per `Vault.createBinary` nach `WEG Manager/Quellen/<Gemeinschaft>/` schreiben. „Verschieben“ löscht das Original nur auf Desktop und nur nach erfolgreichem Schreiben; mobil ist nur „Kopie ablegen“ möglich, falls das Original nicht entfernt werden kann.

## Tastatur (Desktop)

| Kontext | Tasten |
| --- | --- |
| Global | Befehle über Command Palette; `Esc` schließt Sheet |
| Woche 1 Eingang | `1` Vorschlag zuordnen, `N` neuer Punkt, `D` Dublette, `S` später, `X` nicht relevant |
| Woche 2 Nachhalten | `E` eingegangen, `W` weiter warten, `F` nachfassen, `P` neu planen (aktive Karte) |
| Woche 3 Entscheiden | `↑/↓` Option, `Ctrl/Cmd+Enter` bestätigen, `Z` zurückstellen |
| Listen | `↑/↓` Zeile, `Enter` öffnen |

Tastenkürzel nur, wenn der Fokus nicht in einem Eingabefeld liegt; in der Hilfe dokumentiert, nicht im UI erklärt.

## Barrierefreiheit (B-NFR-06, WCAG 2.2 AA als Ziel)

- Sichtbarer Fokus auf allen Bedienelementen: Obsidians Akzentfarbe als 2-px-Umriss mit 1 px Abstand (`:focus-visible`), `Highlight` bei erzwungenen Farben; kein eigener Fokuswert ([[01 - Design Tokens]]). An Eingabefeldern zeigt Obsidian daneben einen eigenen grauen Ring; genau ein Fokuszeichen ist Ziel von PBI-66.
- Fokus nach einer Aktion: Ein Blatt oder Dialog setzt den Fokus beim Öffnen in sich (erstes Feld, beim Löschen „Abbrechen“) und gibt ihn beim Schließen an den Auslöser zurück. Nach Anlegen und Ändern steht er auf der Schaltfläche der Karte, nach dem Löschen auf „Gemeinschaft anlegen“. Der Rahmen ist hinter einem offenen Blatt `inert` und `aria-modal` gesetzt.
- Fortschritt: `ol` mit `aria-current="step"`; Optionen als `radiogroup`; Segmente als Button-Gruppe mit `aria-pressed`; Tabs mit `role="tablist"`.
- Grafiken (BudgetBar, AgeBar, 14-Tage-Leiste) mit `role="img"` und Text-Alternative oder `aria-hidden` plus sichtbarer Zahl.
- Meldungen nach einem Schreibvorgang sind Obsidian-Notices; Zustände in der Ansicht („Wird geladen …“, „Wähle die Gemeinschaft …“) tragen `role="status"`; Fehler sind persistente Alerts (`role="alert"`), nach einem misslungenen Speichern mit Fokus auf dem ersten ungültigen Feld.
- 320 px Breite ohne horizontales Scrollen (Tabelle im Import scrollt in eigenem Rahmen); gebaut und gemessen für den Rahmen, die Einstellungen und die Gemeinschaftsansicht. 200 % Zoom von Obsidian ist nur an Bildschirmfotos mit doppelter Pixeldichte gezeigt, nicht von einem Menschen geprüft.
- Lange Namen brechen um und sprengen nicht die Karte. Die Silbentrennung fehlt auf Linux (Obsidians Electron hat dort kein Trennwörterbuch), auf macOS und Windows ist sie ungeprüft.
- Noch nicht von einem Menschen geprüft: Bedienung mit einem echten Screenreader und die Darstellung in Community-Themes. Die Farben nutzen nur Variablen des Hosts; getestet sind Obsidians helles und dunkles Standard-Theme.
- Bewegung nur bei `prefers-reduced-motion: no-preference`.

## Obsidian-Plugin-Richtlinien

- Keine `innerHTML` mit Nutzerdaten im Plugin-Code; Vue-Templates escapen, Fremdtexte (Mails) nur als Text rendern (B-NFR-08).
- Keine Default-Hotkeys; Befehle mit klaren Namen.
- Einstellungen ohne Überschrift „Einstellungen“/„General“, Abschnitte über `setHeading()`.
- `registerEvent`, `registerView`; beim Entladen keine Leaves schließen, keine Akten entfernen (B-NFR-11).
- Dateien über `Vault.process`/`processFrontMatter` schreiben; fremde Properties erhalten (B-NFR-02).
