---
type: Handoff
id: HO-07
status: entwurf
scope: mvp
version: "1.0"
date: 2026-11-15
---

# Handoff · Responsive, Barrierefreiheit und Plattform

## Breakpoints (Breite der Plugin-View, nicht des Fensters)

| Breite | Layout |
| --- | --- |
| ≥ 1200 | Sidebar + Inhalt + Kontextpanel (Woche, Akte) |
| 860–1199 | Sidebar + Inhalt; Kontextpanel umbrechend unter den Inhalt |
| < 860 | mobil: Titel, Gemeinschafts-Pill, Segmentnavigation oben, schwebendes „Erfassen“, Panels als Tabs oder darunter |

Die View-Breite (Container Query / ResizeObserver) entscheidet, nicht der Gerätetyp: Obsidian-Desktop mit schmaler Seitenleiste zeigt das mobile Layout.

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

- Sichtbarer Fokus (`--wm-focus`, 2 px, Abstand 2 px) auf allen Bedienelementen.
- Fortschritt: `ol` mit `aria-current="step"`; Optionen als `radiogroup`; Segmente als Button-Gruppe mit `aria-pressed`; Tabs mit `role="tablist"`.
- Grafiken (BudgetBar, AgeBar, 14-Tage-Leiste) mit `role="img"` und Text-Alternative oder `aria-hidden` plus sichtbarer Zahl.
- Toasts in `aria-live="polite"`; Fehler als persistente Alerts mit Fokussprung.
- 200 % Zoom und 320 px Breite ohne horizontales Scrollen (Tabelle im Import scrollt in eigenem Rahmen).
- Bewegung nur bei `prefers-reduced-motion: no-preference`.

## Obsidian-Plugin-Richtlinien

- Keine `innerHTML` mit Nutzerdaten im Plugin-Code; Vue-Templates escapen, Fremdtexte (Mails) nur als Text rendern (B-NFR-08).
- Keine Default-Hotkeys; Befehle mit klaren Namen.
- Einstellungen ohne Überschrift „Einstellungen“/„General“, Abschnitte über `setHeading()`.
- `registerEvent`, `registerView`; beim Entladen keine Leaves schließen, keine Akten entfernen (B-NFR-11).
- Dateien über `Vault.process`/`processFrontMatter` schreiben; fremde Properties erhalten (B-NFR-02).
