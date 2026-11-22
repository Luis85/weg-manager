---
type: Handoff
id: HO-08
status: entwurf
scope: mvp
version: "1.1"
date: 2026-11-22
---

# Handoff · Abnahme und Testszenarien

**Auf den Stand vom 22.11.2026 gebracht:** Ein Kontakt hat eine Rolle und eine Zuständigkeit für eine oder mehrere Gemeinschaften (O-D10, [[09 - Offene Punkte vor Implementierung]]); AT-B01 ist daran angepasst. Die Spalte „Prototyp“ bleibt der Stand vom 15.11.2026; was im Plugin gebaut ist, steht in den Dokumenten 02, 03 und 07.

Abbildung der geplanten internen Abnahmen AT-B01–18 (ohne das entfallene AT-B17) aus dem [[02-MVP-PRD]] auf Ansichten und Komponenten. AT-B13 (mobil) gehört zum Ausbau nach dem MVP. „Prototyp“ nennt, ob das Verhalten im klickbaren Prototyp nachvollziehbar ist (✓), angedeutet (~) oder fehlt (–).

| AT | Szenario (Kurz) | Ansichten | Prüfpunkte im UI | Prototyp |
| --- | --- | --- | --- | --- |
| AT-B01 | WEG und Tiefgarage mit gleichem Thema/Kontakt | Einstellungen, Erfassen, alle Listen | Kürzel + Farbe überall; Erfassen ohne Gemeinschaft nicht speicherbar; Kontakt mit einer Rolle und Zuständigkeit für beide Gemeinschaften, Vorgänge getrennt; „Nicht mehr verwenden“ erhält Verweise | ✓ |
| AT-B02 | Registerimport mit Dubletten, unbekanntem Status, fehlendem Datum | Import-Assistent | Kacheln Bereit/Klären/Dublette; „ungeklärt“ statt Raten; „Termin fehlt“; Wiederholung ohne Dubletten | – |
| AT-B03 | Sammelvorgang teilen, Dublette verbinden, Bewertung | Vorgangsakte (Dialoge) | Herkunft mit Zielverweisen; Bewertung ◆ ändert Bearbeitungsstand nicht | ~ (Bewertung) |
| AT-B04 | Fremdtermin 30.11., Wiedervorlage 23.11., terminlose Zusage > 14 T | Vorgangsakte, Nachhalten, Lage | Getrennte Kacheln Fremdtermin/Wiedervorlage; „Termin fehlt“ + Anlass A3 | ✓ |
| AT-B05 | Bestätigung, Antwort, neue Zusage, Teillieferung, korrigierte Quelle | Eingang, Vorgangsakte | getrennte Verlaufseinträge; alter Termin bleibt; Korrektur als Hinweis | ✓ (neue Zusage) |
| AT-B06 | Wochenpaket mit 9 dringenden Fällen + ungeprüfter Portalnachricht | Lage, Entscheiden | BudgetBar max. 7 regulär, alle 9 dringend sichtbar; Kachel „Ungeprüft“ | ~ (2 dringend) |
| AT-B07 | Wahl + Notiz bestätigen, wiederholen, ändern | Entscheiden, Postausgang | keine Dubletten; „Aktualisieren“ ersetzt Folgefassung; kein Versand | ✓ |
| AT-B08 | 3 Entwürfe, beide Gemeinschaften, DE/EN ändern, 1 Versand | Postausgang | Bündelung je Empfänger und Gemeinschaft; Textänderung setzt Prüfung zurück; genau ein Versandereignis | ✓ |
| AT-B09 | Versand 16.11., Frist 30.11., Prüfung 23.11., Pause, neue Antwort | Nachhalten | kein Wechsel der Eskalationsstufe am 23.11.; Pause mit Ende; neuer Termin erledigt den Vorgang nicht | ~ |
| AT-B10 | Übergabe, später akutes Problem | Übergabe, Lage | Schwerpunkte erscheinen in Lage; neue Dringlichkeit oben; Rückstand bleibt | ✓ |
| AT-B11 | Interne Bewertung, privates Original, ungeprüfte Anlage | Postausgang, Ausgabe | ausgeschlossene Bausteine sichtbar gesperrt; keine transitive Mitnahme | ~ |
| AT-B12 | Offline, externe Dateiänderung, doppelte ID, Abbruch, Sichern | alle, Einstellungen | Alerts statt Datenverlust; Eingaben bleiben; Plugin aus → Akten lesbar | – |
| AT-B13 | Nach dem MVP: Komplette Wochenreise mobil mit Unterbrechung | Woche mobil | alle Eingaben mobil; Pausieren/Fortsetzen; nichts unter Host-Navigation verdeckt | ✓ |
| AT-B14 | Öffentliche Installation in frischem Vault | Erststart ([[VIEW-09 - Einrichtung]]) | Einrichtung in 2 Schritten ohne Entwicklerwerkzeuge; danach Lage mit „Erste Schritte“, keine Tour ([[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]]) | ~ (Erste Schritte) |
| AT-B15 | Vorgang ohne Plugin und Obsidian lesen und ändern | alle (Dateivertrag), Datenprobleme | Akten als lesbare Markdown-Notizen; externe gültige Änderung beim nächsten Start übernommen; kein Export nötig | – |
| AT-B16 | Agent ändert Notizen bei geschlossenem und offenem Plugin | Datenprobleme, Lage, Vorgangsakte | Alert „Geändert außerhalb des Plugins“ mit Vergleichen; ungültiges YAML/neueres Schema sichtbar, nichts still überschrieben | – (Mockup Konflikt) |
| AT-B18 | Nativer AI-Chat über das Nutzerabo (Desktop) | Chatansicht | Abo-Modus sichtbar, Kontextwahl, Toolbestätigung, Abbruch/Limit, Vorschlag getrennt von ausgeführter Änderung | – (nicht gestaltet) |

## Prototyp-Szenarien für den Pilottest

Entsprechen den Testaufgaben im Prototyp (Button „Testaufgaben“ in der Prototyp-Leiste; Stand: [[Prototyp - Stand Pilot]]). Beobachten: Zeit je Aufgabe, Zögern, Fehlklicks, Fragen, Kommentare.

1. **Orientierung (Lage):** Was drängt? Erwartung: Kellerabdichtung, Rampenlicht, Unterschrift 18.11. werden genannt.
2. **Eingang:** Portalnachricht zu P-041 zuordnen, Termin übernehmen; Anruf Hausmeister der Tiefgarage zuordnen.
3. **Nachhalten:** P-041 nachfassen bzw. als eingegangen werten, je nach vorherigem Schritt.
4. **Entscheiden:** Sonnensegel mit Notiz entscheiden; eine Entscheidung zurückstellen.
5. **Senden:** Eigentümer-Info DE und EN prüfen, als gesendet markieren.
6. **Übergabe:** Schwerpunkte und Doppelpflege eintragen, Woche abschließen.
7. **Unterwegs (Handy), nach dem MVP:** Telefonische Zusage ohne Termin erfassen.
8. **Kontakte:** Herausfinden, wen man wegen der Rolltor-Wartung erreicht; einen neuen Kontakt anlegen.

## Auswertung

Je Szenario: geschafft ja/teilweise/nein, Zeit, wörtliche Zitate, Verbesserungsideen. Ergebnisse als Prüfergebnis in H-03, H-04, H-06, H-07, H-08 eintragen (Datum, Kontext, Evidenzgrenze: Prototyp, synthetische Daten).
