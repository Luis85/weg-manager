---
type: Handoff
id: HO-03
status: entwurf
scope: mvp
version: "1.0"
date: 2026-11-15
---

# Handoff · Ansichten, Navigation und Befehle

## Einbettung in Obsidian

- **Eine** registrierte View (`registerView`, Typ `weg-manager`) mit interner Navigation; keine 7 Obsidian-Views. Der Tab-Titel folgt dem Ziel („WEG Manager · Woche“).
- Öffnen über Ribbon-Symbol (Desktop), Befehl und mobil über das Obsidian-Menü (kein Ribbon auf Mobil).
- Geöffnete Leaves werden beim Plugin-Update nicht geschlossen; die View stellt ihren Zustand aus `getState()/setState()` wieder her (Ziel, Vorgangsnummer, Wochenschritt).
- Akten bleiben normale Markdown-Notizen (K-14); „In Notiz öffnen“ führt aus der Vorgangsakte zur Datei.

## Routen und Zustand

| Route | Ansicht | Parameter | Rückweg |
| --- | --- | --- | --- |
| `lage` | [[VIEW-01 - Lage]] | Filter | — |
| `woche/<schritt>` | [[VIEW-02 - Wochenarbeit]] | Schritt 1–5, Position | „← Zurück zur Lage“ pausiert → `lage` |
| `vorgaenge` | [[VIEW-03 - Vorgänge und Vorgangsakte]] Liste | Segment, Filter, Suche | — |
| `vorgang/<id>` | Vorgangsakte | Vorgangsnummer | Herkunft (Liste, Lage, Woche) inkl. Scrollposition |
| `post` | [[VIEW-04 - Postausgang]] | gewählte Nachricht, Sprache | — |
| `ausgabe/<gemeinschaft>` | [[VIEW-06 - Sachstand ausgeben]] | Empfängerart | Vorgänge |
| `kontakte` | [[VIEW-08 - Kontakte]] | Segment, Suche | — |
| Modal `kontakt/<id>` | Kontakt (über jeder Ansicht) | Kontakt-ID | schließt zurück zur Ansicht |
| `einstellungen/<bereich>` | [[VIEW-07 - Einstellungen und Einrichtung]] | Bereich | vorheriges Ziel |
| `einrichtung/<schritt>` | [[VIEW-09 - Einrichtung]] | Schritt 1–2 (`gemeinschaften`, `pruefen`) | keiner; nur ohne Gemeinschaft erreichbar, danach `lage` |
| Sheet `erfassen` | [[VIEW-05 - Erfassen]] | optional Vorgangsnummer | schließt zurück zur Ansicht |

Desktop: Vorgangsakte aus Lage/Woche öffnet im rechten Panel; aus der Liste als Hauptinhalt. Mobil immer Vollbild.

Routen und Befehls-IDs folgen seit dem 22.11.2026 den WCS-Begriffen ([[K-20 - WCS-Datenmodell als fachliche Grundlage]]). Routen sind deutsche Wörter ohne Umlaute (`vorgaenge`, `vorgang/<id>`); Befehls-IDs sind englisch und nutzen den Code-Begriff des Objekts, für den Vorgang `matter`.

## Befehle (Command Palette)

Ohne Standard-Hotkeys (Obsidian-Richtlinie); Namen in Satzanfang-Großschreibung.

| ID | Name |
| --- | --- |
| `open-lage` | Lage öffnen |
| `start-week` | Wochenarbeit starten oder fortsetzen |
| `capture` | Erfassen |
| `capture-from-note` | Aktuelle Notiz als Quelle erfassen |
| `open-post` | Postausgang öffnen |
| `open-contacts` | Kontakte öffnen |
| `new-contact` | Neuer Kontakt |
| `open-matter` | Vorgang öffnen … (Suche) |
| `backup-now` | Jetzt sichern |
| `open-settings` | Einstellungen öffnen |
| `reset-hints` | Hinweise erneut zeigen (ohne Tastenkürzel, [[PBI-72 - Beim ersten Benutzen eines Bereichs einen Hinweis erhalten]]) |
| `show-first-steps` | Erste Schritte wieder einblenden (ohne Tastenkürzel, [[PBI-71 - Nach der Einrichtung auf der Lage mit Ersten Schritten ankommen]]) |

## Navigationsregeln

- Gemeinschaftsfilter wirkt auf alle Ziele gleich und bleibt beim Wechsel erhalten. Der aktive Filter steht als FilterTag im Kopf jeder Ansicht.
- Ungespeicherte Eingaben bleiben bei jedem Wechsel erhalten (Entwurfsspeicher je Formular).
- Wochenarbeit: Wechsel zu einem anderen Ziel pausiert die Sitzung automatisch.
- Maximal zwei Ebenen; Sheets nie gestapelt.
