---
type: Prototyp
id: PROTO-STAND
status: pilot
version: "29"
date: 2026-11-22
---

# Prototyp · Stand Pilot (22.11.2026)

Klickbarer Prototyp des Beirats-MVP, freigegeben für den Pilotnutzer. Er bildet den abgestimmten Designstand nach allen Review-Kommentaren vom 15.11.2026 ab.

Der Stand zeigt die Begriffe nach K-20 ([[K-20 - WCS-Datenmodell als fachliche Grundlage]]): Vorgang statt Punkt, Vorgangsnummer mit Kürzel („AW 041“), To-do statt Aufgabe, Prüfvermerke „überfällig“ und „Termin erfragen“.

## Zugang

- **Geteilte Fassung:** claude.ai-Artifact, Version 29. Privat bis zur Freigabe über „Teilen“. Feedback des Pilots über die Artifact-Kommentare. Version 29 zeigt noch die Begriffe vor K-20; die lokale Fassung ist neuer.
- **Lokale Fassung:** `WEG-Manager-Prototyp.html` in diesem Ordner. Im Browser öffnen, ohne Installation.
- Synthetische Daten, Zustand nur im Speicher. „Neu starten“ setzt zurück. Tour und Hinweise merken sich ihren Status im Browser.
- **Direkt aufrufen:** `#lage`, `#woche` (startet die Wochenarbeit), `#vorgaenge`, `#vorgang/AW-041`, `#post`, `#kontakte`, `#einst`.
- **Bildschirme neu aufnehmen:** `node docs/design/prototype/screenshots.mjs` im Repo-Wurzelverzeichnis (Playwright über `NODE_PATH`). Das Skript klickt den Durchlauf der Tabelle unten nach, Desktop 1440 × 900 und Mobil 390 × 844, jeweils mit Faktor 2, und schreibt nach `docs/design/sitemap/assets`. Ein Filter wie `D-09` oder `M-` nimmt nur passende Bilder auf. Es bricht bei Fehlern in der Konsole ab.

## Vorrang

Weicht ein älteres Mockup (`v2-D*`, `v2-M*`, Design-Canvas) vom Prototyp ab, gilt der Prototyp. Fachregeln (DF-xx), PBIs und das Handoff-Paket gehen weiterhin vor, siehe [[00 - Handoff Übersicht]].

## Inhalt

- **Navigation:** Lage, Woche, Vorgänge, Postausgang, Kontakte; Einstellungen unten in der Sidebar (mobil: Zahnrad im Kopf).
- **Wochenarbeit:** fünf Schritte („Neue Eingänge zuordnen“ … „Schwerpunkte für nächste Woche festlegen“), Erst-Hinweise je Schritt, „← Zurück zur Lage“ pausiert. Entscheidungen erzeugen Entwürfe oder To-dos, die Übergabe hält bis zu drei Schwerpunkte fest.
- **Vorgänge:** Liste mit Vorgangsnummer, Prüfvermerk („überfällig“, „Termin erfragen“) und Umschalter auf To-dos.
- **Vorgangsakte:** Verlaufseinträge und Quellen öffnen Modals (Quelltext, Vault-Pfad, „In Obsidian öffnen“). Status „offen“; „nicht eingehalten“ erscheint nur als Bewertung.
- **Erfassen:** Notiz, Nachricht, Unterlage, Zusage oder To-do; Notiz ohne Quelle, Dateiauswahl außerhalb des Vaults (verschieben/kopieren, mehrere Dateien), Gemeinschaftsauswahl adaptiv, Kontakt direkt anlegen.
- **Kontakte:** Liste nach Rolle, Kontakt als Modal, Formular mit Pflichtfeldern und Dublettenhinweis, Firmen mit Personen, Verteiler.
- **Einstellungen:** Gemeinschaften, Arten von Gemeinschaften, Eigene Angaben, Wochenrhythmus, Ablage, Sicherung, Hilfe; jede Option mit Beschreibung.
- **Einführungstour:** Willkommen + 7 Schritte, startet einmal automatisch, neu startbar unter Einstellungen › Hilfe.

Details je Ansicht: [[VIEW-01 - Lage]] bis [[VIEW-08 - Kontakte]]. Testaufgaben für den Pilot: [[08 - Abnahme und Testszenarien#Prototyp-Szenarien für den Pilottest]].

## Nicht im Prototyp

Import-Assistent, Erststart-Schritte 2–3, Sachstand ausgeben, Konflikte und Speicherfehler (nur als Mockup), Dark Mode (nur Mockups). Offene Punkte: [[09 - Offene Punkte vor Implementierung]].

## Bildschirme (Desktop 1440 px · Mobil 390 px)

Aufgenommen am 22.11.2026 mit `screenshots.mjs`: 01–06 im Durchlauf der Wochenarbeit, 07–18 im Zustand nach abgeschlossener Woche (4 Entwürfe im Postausgang).

| # | Ansicht | Desktop | Mobil |
| --- | --- | --- | --- |
| 01 | Lage | ![[v2-P-D-01-Lage.png\|360]] | ![[v2-P-M-01-Lage.png\|160]] |
| 02 | Woche Eingang | ![[v2-P-D-02-Woche-Eingang.png\|360]] | ![[v2-P-M-02-Woche-Eingang.png\|160]] |
| 03 | Woche Nachhalten | ![[v2-P-D-03-Woche-Nachhalten.png\|360]] | ![[v2-P-M-03-Woche-Nachhalten.png\|160]] |
| 04 | Woche Entscheiden | ![[v2-P-D-04-Woche-Entscheiden.png\|360]] | ![[v2-P-M-04-Woche-Entscheiden.png\|160]] |
| 05 | Woche Senden | ![[v2-P-D-05-Woche-Senden.png\|360]] | ![[v2-P-M-05-Woche-Senden.png\|160]] |
| 06 | Woche Übergabe | ![[v2-P-D-06-Woche-Uebergabe.png\|360]] | ![[v2-P-M-06-Woche-Uebergabe.png\|160]] |
| 07 | Postausgang | ![[v2-P-D-07-Postausgang.png\|360]] | ![[v2-P-M-07-Postausgang.png\|160]] |
| 08 | Vorgänge | ![[v2-P-D-08-Vorgaenge.png\|360]] | ![[v2-P-M-08-Vorgaenge.png\|160]] |
| 09 | Vorgangsakte | ![[v2-P-D-09-Vorgangsakte.png\|360]] | ![[v2-P-M-09-Vorgangsakte.png\|160]] |
| 10 | Verlauf Modal | ![[v2-P-D-10-Verlauf-Modal.png\|360]] | ![[v2-P-M-10-Verlauf-Modal.png\|160]] |
| 11 | Quelle Modal | ![[v2-P-D-11-Quelle-Modal.png\|360]] | ![[v2-P-M-11-Quelle-Modal.png\|160]] |
| 12 | Erfassen Notiz | ![[v2-P-D-12-Erfassen-Notiz.png\|360]] | ![[v2-P-M-12-Erfassen-Notiz.png\|160]] |
| 13 | Erfassen Zusage | ![[v2-P-D-13-Erfassen-Zusage.png\|360]] | ![[v2-P-M-13-Erfassen-Zusage.png\|160]] |
| 14 | Kontakte | ![[v2-P-D-14-Kontakte.png\|360]] | ![[v2-P-M-14-Kontakte.png\|160]] |
| 15 | Kontakt Modal | ![[v2-P-D-15-Kontakt-Modal.png\|360]] | ![[v2-P-M-15-Kontakt-Modal.png\|160]] |
| 16 | Kontakt neu | ![[v2-P-D-16-Kontakt-neu.png\|360]] | ![[v2-P-M-16-Kontakt-neu.png\|160]] |
| 17 | Einstellungen | ![[v2-P-D-17-Einstellungen.png\|360]] | ![[v2-P-M-17-Einstellungen.png\|160]] |
| 18 | Einstellungen Wochenrhythmus | ![[v2-P-D-18-Einstellungen-Wochenrhythmus.png\|360]] | ![[v2-P-M-18-Einstellungen-Wochenrhythmus.png\|160]] |
