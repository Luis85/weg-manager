---
type: Handoff
id: HO-03
status: entwurf
scope: mvp
version: "1.1"
date: 2026-11-22
---

# Handoff · Ansichten, Navigation und Befehle

**Auf den Stand vom 22.11.2026 gebracht** nach [ADR 0008](../../adr/0008-navigation-and-view-state.md) mit seinen Nachträgen (feste Registerkarte und eigener Verlauf, Zusammensetzung und Gemeinschaftsauswahl, nur Gemeinschaften ohne Problem wählbar, Einstellungen als Route der Shell) und den Entscheidungen vom 22.11.2026 (Eintrag „Einstellungen“, Auswahl ohne „Alle“; `docs/plans/pre-feature-improvement-plan.md`, Abschnitt 8). „Gebaut“ nennt, was im Plugin steht; die übrigen Routen und Befehle sind Entwurf und gelten wie geplant.

## Einbettung in Obsidian

- **Eine** registrierte View (`registerView`, Typ `weg-manager-view`) mit interner Navigation; keine 7 Obsidian-Views. Jede geöffnete View hat eigene Vue-App und eigene aktuelle Route; zwei Views können zwei Ansichten zeigen. Der Tab-Titel ist heute fest „WEG Manager“; ein Titel, der dem Ziel folgt („WEG Manager · Woche“), ist Entwurf.
- **Feste Registerkarte:** Die View hat `navigation = false`. Ein Klick auf eine Datei im Dateiexplorer öffnet die Notiz in einer anderen Registerkarte und schließt die Plugin-View nicht.
- Öffnen über das Ribbon-Symbol und den Befehl „Ansicht öffnen“. Das Plugin ist `isDesktopOnly`; der mobile Zugang über das Obsidian-Menü gehört zum Ausbau nach dem MVP ([[K-09 - Vollständige mobile Wochenarbeit unterstützen]]).
- Geöffnete Leaves werden beim Plugin-Update nicht geschlossen; die View stellt ihre Route aus `getState()/setState()` wieder her. Ein unbekannter oder beschädigter Zustand führt zur Startroute und wirft nie. Eine Route auf einen Datensatz, den es nicht mehr gibt, zeigt „Nicht gefunden“ mit Weg zurück zur Startseite; das ist noch ungeprüft, weil noch keine Route einen Datensatz als Parameter hat. Vorgangsnummer und Wochenschritt kommen als Routenparameter mit ihren Ansichten.
- Akten bleiben normale Markdown-Notizen (K-14); „In Notiz öffnen“ führt aus der Vorgangsakte zur Datei. Notizen, die das Plugin nicht schreiben darf, bieten „In Obsidian öffnen“.

## Routen und Zustand

Eine Route ist ein typisiertes Datum (`Route` in `src/application/routes.ts`), keine URL; Routen sind keine teilbaren Links. Es gibt nur Routen, deren Ansicht existiert, keine Platzhalter. Neue Ansichten tragen ihre Zeile hier ein.

| Route | Ansicht | Parameter | Rückweg | Stand |
| --- | --- | --- | --- | --- |
| `einstellungen/gemeinschaften` | [[VIEW-07 - Einstellungen und Einrichtung]], Bereich Gemeinschaften | — | vorheriges Ziel | gebaut, derzeit die Startroute |
| `einstellungen/datenprobleme` | [[VIEW-07 - Einstellungen und Einrichtung]], Bereich Datenprobleme | — | vorheriges Ziel | gebaut |
| `lage` | [[VIEW-01 - Lage]] | — | — | Entwurf; wird die Startroute, sobald die Ansicht existiert |
| `woche/<schritt>` | [[VIEW-02 - Wochenarbeit]] | Schritt 1–5, Position | „← Zurück zur Lage“ pausiert → `lage` | Entwurf |
| `vorgaenge` | [[VIEW-03 - Vorgänge und Vorgangsakte]] Liste | Segment, Suche | — | Entwurf |
| `vorgang/<id>` | Vorgangsakte | Vorgangsnummer | Herkunft (Liste, Lage, Woche) inkl. Scrollposition | Entwurf |
| `post` | [[VIEW-04 - Postausgang]] | gewählte Nachricht, Sprache | — | Entwurf |
| `ausgabe/<gemeinschaft>` | [[VIEW-06 - Sachstand ausgeben]] | Empfängerart | Vorgänge | Entwurf |
| `kontakte` | [[VIEW-08 - Kontakte]] | Segment, Suche | — | Entwurf |
| Modal `kontakt/<id>` | Kontakt (über jeder Ansicht) | Kontakt-ID | schließt zurück zur Ansicht | Entwurf |
| `einrichtung/<schritt>` | [[VIEW-09 - Einrichtung]] | Schritt 1–2 (`gemeinschaften`, `pruefen`) | keiner; nur ohne Gemeinschaft erreichbar, danach `lage` | Entwurf ([[PBI-74 - Beim ersten Aktivieren in die Einrichtung geführt werden]]) |
| Sheet `erfassen` | [[VIEW-05 - Erfassen]] | optional Vorgangsnummer | schließt zurück zur Ansicht | Entwurf |

Die Gemeinschaft steht in keiner Route; die Auswahl ist ein Dienst (siehe Navigationsregeln).

**Einstellungen** gehören der Shell. Die Route heißt `{ name: "settings", section }` und hat je Modul einen Bereich: heute „Gemeinschaften“ und „Datenprobleme“ (Notizen von WEG Manager, die das Plugin nicht lesen oder keinem Typ zuordnen kann, mit Zähler). Ein Modul fügt einen Bereich hinzu, ohne die Shell zu ändern. Die Ansicht zeigt über dem aktuellen Bereich eine beschriftete Navigation der Bereiche (bei nur einem Bereich keine). Ein gespeicherter Bereich wird wiederhergestellt; ein unbekannter führt zur Startroute. Der Eintrag in der Hauptnavigation heißt „Einstellungen“ und ist auf jedem Bereich als aktuelle Seite markiert. Die Einstellungen des Plugins in Obsidians eigenem Einstellungsdialog sind davon getrennt: Dort stehen nur technische Werte wie die Protokollstufe, Fachdaten wie Gemeinschaften nur in der Ansicht (PBI-49).

Auf dem Desktop öffnet die Vorgangsakte aus Lage/Woche im rechten Panel, aus der Liste als Hauptinhalt. Mobil immer Vollbild (nach dem MVP).

Routen und Befehls-IDs folgen seit dem 22.11.2026 den WCS-Begriffen ([[K-20 - WCS-Datenmodell als fachliche Grundlage]]). Routen sind deutsche Wörter ohne Umlaute (`vorgaenge`, `vorgang/<id>`); Befehls-IDs sind englisch und nutzen den Code-Begriff des Objekts, für den Vorgang `matter`.


## Befehle (Command Palette)

Ohne Standard-Hotkeys (Obsidian-Richtlinie); Namen in Satzanfang-Großschreibung; die ID trägt nicht die Plugin-ID, die Obsidian selbst voranstellt. Der Name folgt der Sprache der Oberfläche.

| ID | Name | Stand |
| --- | --- | --- |
| `open-view` | Ansicht öffnen | gebaut (öffnet die Startroute) |
| `copy-diagnostics` | Diagnose kopieren | gebaut |
| `open-lage` | Lage öffnen | Entwurf; ersetzt `open-view`, sobald die Lage existiert |
| `start-week` | Wochenarbeit starten oder fortsetzen | Entwurf |
| `capture` | Erfassen | Entwurf |
| `capture-from-note` | Aktuelle Notiz als Quelle erfassen | Entwurf |
| `open-post` | Postausgang öffnen | Entwurf |
| `open-contacts` | Kontakte öffnen | Entwurf |
| `new-contact` | Neuer Kontakt | Entwurf |
| `open-matter` | Vorgang öffnen … (Suche) | Entwurf |
| `backup-now` | Jetzt sichern | Entwurf |
| `open-settings` | Einstellungen öffnen | Entwurf |
| `reset-hints` | Hinweise erneut zeigen (ohne Tastenkürzel, [[PBI-77 - Beim ersten Benutzen eines Bereichs einen Hinweis erhalten]]) | Entwurf |
| `show-first-steps` | Erste Schritte wieder einblenden (ohne Tastenkürzel, [[PBI-76 - Nach der Einrichtung auf der Lage mit Ersten Schritten ankommen]]) | Entwurf |

Ein Befehl öffnet eine Route über eine Funktion, die eine vorhandene View zeigt oder eine neue anlegt.

## Navigationsregeln

- **Gemeinschaftsauswahl, kein Filter.** Es gibt keine Auswahl „Alle“. Die ausgewählte Gemeinschaft ist der Bearbeitungskontext (Glossar: Gemeinschaftskontext) und gilt für alle offenen Ansichten gleich. Sie steht als Auswahl mit Radio-Knöpfen im Kontextbereich des Rahmens und ist damit auf jeder Ansicht sichtbar, bevor etwas bearbeitet oder ausgegeben wird. Die Auswahl wird je Gerät im lokalen Speicher des Vaults gehalten, nicht in `data.json`, damit Sync nicht die Gemeinschaft auf einem anderen Gerät umschaltet.
  - Wählbar sind nur Gemeinschaften ohne Problem. Eine schreibgeschützte oder fehlerhafte steht in den Einstellungen mit ihrem Hinweis. Eine gespeicherte Auswahl, deren Gemeinschaft gerade ein Problem hat oder fehlt, bleibt gespeichert und zählt wieder, sobald die Notiz in Ordnung ist.
  - Ohne gespeicherte Auswahl wird bei genau einer wählbaren Gemeinschaft diese gewählt. Bei zwei oder mehr ist keine gewählt, und der Rahmen fordert zur Wahl auf, bevor bearbeitet werden kann. Diese Sperre ist noch nicht durchgesetzt; die erste Ansicht, die einen Datensatz einer Gemeinschaft bearbeitet, muss sie einführen.
  - Ob eine Ansicht (etwa die Lage) mehrere Gemeinschaften zusammen zeigt, ist nicht entschieden und nicht gebaut. Ein solcher Filter wäre nie Bearbeitungskontext. Der frühere `FilterTag` im Kopf jeder Ansicht entfällt.
- **Verlauf:** Jede View führt einen eigenen Verlauf im Speicher (höchstens 50 Schritte zurück). Der Rahmen zeigt Zurück und Vorwärts, sobald es einen Schritt gibt; ein Wechsel zur aktuellen Route legt nichts ab. Obsidians eigene Zurück- und Vorwärts-Knöpfe im Kopf der View wirken auf die Navigation im Plugin nicht. Der Verlauf wird nicht gespeichert; eine wiederhergestellte View beginnt mit leerem Verlauf.
- Ungespeicherte Eingaben sollen bei jedem Wechsel erhalten bleiben (Entwurfsspeicher je Formular). Das ist noch nicht gebaut: Formulareingaben gehen verloren, wenn die View schließt; ein Entwurfsspeicher wird mit dem ersten langen Formular entschieden. Schließt man dagegen das Blatt eines Datensatzes mit nicht gespeicherten Eingaben (Escape, Klick daneben, Schließen, Abbrechen), fragt das Plugin vorher, ob die Eingaben verworfen werden sollen (PBI-72).
- Wochenarbeit: Wechsel zu einem anderen Ziel pausiert die Sitzung automatisch (Entwurf).
- Maximal zwei Ebenen; Sheets nie gestapelt.
