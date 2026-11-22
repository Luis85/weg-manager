---
type: Page
id: VIEW-07
status: entwurf
scope: mvp
version: "2.0"
date: 2026-11-15
navigation: Nebenbereich
requirements:
  - "[[PBI-01 - Gemeinschaftskontext wählen]]"
  - "[[PBI-02 - Personen und Rollen zuordnen]]"
  - "[[PBI-03 - Registerimport prüfen]]"
  - "[[PBI-04 - Geprüften Bestand übernehmen]]"
  - "[[PBI-05 - Einen Vorgang erfassen und wiederfinden]]"
  - "[[PBI-30 - Bestand sichern und wiederherstellen]]"
  - "[[PBI-31 - Konflikte ohne Datenverlust klären]]"
  - "[[PBI-32 - Ohne KI selbstständig beginnen]]"
  - "[[PBI-33 - Wochenarbeit auf dem Handy abschließen]]"
  - "[[PBI-41 - Vorgänge ohne Plugin und Obsidian nutzen]]"
  - "[[PBI-42 - AI-Agent direkt mit den Notizen arbeiten lassen]]"
  - "[[PBI-72 - Beim ersten Benutzen eines Bereichs einen Hinweis erhalten]]"
entities:
  - "[[docs/entities/ENT-01 - Gemeinschaft]]"
  - "[[docs/entities/ENT-02 - Person und Rolle]]"
  - "[[docs/entities/ENT-04 - Vorgang]]"
business-rules:
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
  - "[[DF-22 - Notizen als maßgeblicher Datenbestand]]"
  - "[[DF-23 - Externe Bearbeitung ohne stilles Überschreiben]]"
decisions:
  - "[[docs/decisions/K-10 - Manuelle Quellenübernahme und Registerimport vorsehen]]"
  - "[[docs/decisions/K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]"
mockups:
  - "[[docs/design/sitemap/assets/v2-D13-Erststart.png]]"
  - "[[docs/design/sitemap/assets/v2-D14-Sicherung.png]]"
  - "[[docs/design/sitemap/assets/v2-D12-Konflikt.png]]"
  - "[[docs/design/sitemap/assets/v2-P-D-17-Einstellungen.png]]"
  - "[[docs/design/sitemap/assets/v2-D8-Import.png]]"
  - "[[docs/design/sitemap/assets/v2-D16-Tour-Start.png]]"
  - "[[docs/design/sitemap/assets/v2-D17-Tour-Schritt.png]]"
  - "[[docs/design/sitemap/assets/v2-M12-Tour-Start.png]]"
  - "[[docs/design/sitemap/assets/v2-M13-Tour-Schritt.png]]"
---

# VIEW-07 · Einstellungen und Einrichtung

Die Mockups zeigen noch die Begriffe vor dem 22.11.2026 (Punkt statt Vorgang usw., [[K-20 - WCS-Datenmodell als fachliche Grundlage]]).

Nebenbereich mit eigener Unternavigation; Desktop über „Einstellungen“ unten in der Sidebar, mobil über das Zahnrad im Kopf. Änderungen gelten sofort (Obsidian-Konvention), mehrteilige Stammdaten wie eine Gemeinschaft werden im Sheet mit „Speichern“ bearbeitet. Überschriften in Satzanfang-Großschreibung ohne das Wort „Einstellungen“ (Obsidian-Richtlinie). Jeder Bereich beginnt mit einem kurzen Einleitungsabsatz; jede Option zeigt Name, Beschreibung und Steuerelement nebeneinander (mobil untereinander).

## Bereiche

| Bereich | Inhalt |
| --- | --- |
| Gemeinschaften (Stammdaten) | Karte je Gemeinschaft: Name, Art, Einheiten bzw. Stellplätze, Anzahl Vorgänge, Anschrift, Verwaltung und Eigentümer-Verteiler (Links öffnen das Kontakt-Modal, [[VIEW-08 - Kontakte]]), Sprache der Eigentümer-Infos. „Bearbeiten“ öffnet ein Sheet: Name, Kürzel (nur bei Neuanlage, danach fest), Kurzname, Art (Auswahl aus den Arten, Link „Arten bearbeiten“), Anschrift, Anzahl in der Einheitenbezeichnung der Art, Farbe aus der Palette (vergebene Farben gesperrt), Verwaltung, Sprachen. „+ Gemeinschaft“ legt eine weitere an. Kontakte dürfen in mehreren Gemeinschaften vorkommen, Vorgänge nie. |
| Arten von Gemeinschaften | Editierbare Stammdaten: Bezeichnung und Bezeichnung der Einheiten (z. B. Wohnungseigentümergemeinschaft · Einheiten, Stellplatzgemeinschaft · Stellplätze, Sonstige Gemeinschaft · Einheiten). „+ Art“ ergänzt; entfernen nur, solange keine Gemeinschaft die Art nutzt. Keine Ableitung von Rechtsform oder Befugnissen aus der Art (ENT-01, O-05). |
| Eigene Angaben | Einleitung: Angaben erscheinen in vorbereiteten Nachrichten, werden nicht veröffentlicht. Name (im Verlauf „Du“, in der Grußformel), Rolle (unter dem Namen, keine Befugnis), Grußformel DE und EN (Schluss jeder Fassung, gilt für neue Entwürfe). |
| Wochenrhythmus | Einleitung: was die Wochenarbeit bündelt, dass nichts im Hintergrund läuft und die Fälligkeit beim Öffnen geprüft wird. Je Einstellung Titel, Beschreibung und Steuerelement (Obsidian-Muster): Wochentag (Lage zeigt „Woche starten“, Prüfungen zum Nachfassen und Wiedervorlagen fallen auf diesen Tag), Zeitziel in Minuten (Richtwert, aktive Zeit wird gezählt, keine Unterbrechung), Entscheidungen pro Woche (Standard 7, Dringendes zusätzlich), Frist bei akuten Problemen in Tagen (Standard 3, O-D4, im Entwurf änderbar). |
| Ablage | Einleitung: alle Daten als Markdown-Notizen und Dateien im Vault, auch ohne Plugin lesbar; Ordnerwechsel verschiebt vorhandene Notizen und passt Links an. Je Ordner Beschreibung: Vorgänge (eine Notiz je Vorgang), Quellen (Originale, beim Erfassen verschoben oder kopiert, Unterordner je Gemeinschaft), Kontakte (eine Notiz je Kontakt/Verteiler), Textbausteine (Vorlagen, als Notizen bearbeitbar). |
| Register-Import | Assistent: Datei → 15 Felder zuordnen → Prüfen → Übernehmen. |
| Sicherung | Einleitung: Kopie aller Plugin-Notizen und -Dateien; vor Import und Wiederherstellung automatisch; Wiederherstellen zeigt vorher die Änderungen. Letzte Sicherung, Umfang, Sichern/Wiederherstellen mit Vorschau. Akten bleiben lesbare Markdown-Notizen. |
| Datenprobleme | Konflikte (externe Änderung, doppelte ID, fehlende Datei) mit Badge; Hinweis zusätzlich oben in Lage und an der betroffenen Akte (DF-23). |
| Hilfe und Erststart | Einrichtung in 3 Schritten: Gemeinschaften → Kontakte → Register (optional). Ohne Konto und KI. „Tour starten“ startet die Einführungstour neu. |

![[v2-P-D-17-Einstellungen.png]]

## Register-Import (Prüfen)

Kacheln Bereit · Klären · Dublette? · Gemeinschaften (anklickbar als Filter). Tabelle mit Zeile, Gemeinschaft, Altnummer, Anliegen, Status laut Quelle → wird zu, Termin, Prüfung (in einem scrollbaren Rahmen). Klärfall-Panel: unbekannter Wert → „ungeklärt“ (Originalwert bleibt am Vorgang) · „offen“ · auslassen; „Für alle N Zeilen mit diesem Wert“. Fehlende Daten werden nicht erfunden. Übernehmen sichert vorher automatisch; Unterbrechen jederzeit; Wiederholung aktualisiert statt zu verdoppeln. Gleiche Altnummer in AW und TG bleibt getrennt.

![[v2-D8-Import.png]]

## Konflikt klären

Beide Fassungen nebeneinander (Plugin / extern geändert) mit Zeitpunkt und Quelle der Änderung; nur abweichende Angaben als Zeilen, Wahl je Angabe (Plugin/Datei), gleiche Angaben zusammengefasst. Optional Übernahme einer neuen Angabe als Verlaufseintrag. Aktionen: Zusammenführen und speichern · Beide Fassungen als Kopie behalten · Später.

![[v2-D12-Konflikt.png]]

## Erststart

> [!note] Abgelöst
> Die Einrichtung beim ersten Start ist seit 22.11.2026 in [[VIEW-09 - Einrichtung]] beschrieben: nur Gemeinschaften, danach die Lage mit „Erste Schritte“ ([[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]]). Der folgende Stand v2 bleibt als Referenz.

Drei Schritte: Gemeinschaften (Name, Kürzel, Art, Farbe aus geprüfter Palette; vergebene Farben gesperrt) → Kontakte (gleiches Formular wie in [[VIEW-08 - Kontakte]]) → Register übernehmen (optional). Ablageordner änderbar.

![[v2-D13-Erststart.png]]

## Einführungstour

> [!note] Abgelöst
> Seit 22.11.2026 gibt es keine Tour mehr. Stattdessen erscheint beim ersten Benutzen eines Bereichs ein einzelner, nichtmodaler Hinweis am Element; der Befehl „Hinweise erneut zeigen“ setzt sie zurück ([[PBI-72 - Beim ersten Benutzen eines Bereichs einen Hinweis erhalten]], [[VIEW-09 - Einrichtung]], [[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]]). Der folgende Stand v2 bleibt als Referenz.

Startet einmalig nach dem Erststart auf der Lage; danach über Einstellungen › Hilfe oder den Befehl „Einführungstour starten“. Willkommensdialog mit „Tour starten“ und „Überspringen“, dann 7 Schritte als Spotlight mit Hinweiskarte (Punkte, „n / 7“, Zurück, Weiter bzw. Fertig, × zum Beenden):

| Schritt | Ziel (Desktop / mobil) | Titel |
| --- | --- | --- |
| 1 | Kennzahlen | Lage auf einen Blick |
| 2 | Wochenarbeit-Karte | Einmal pro Woche |
| 3 | Erfassen (Sidebar / schwebender Button) | Sofort festhalten |
| 4 | Hauptnavigation (Sidebar / Segment) | Vier Ziele |
| 5 | Gemeinschaftsfilter | Gemeinschaften getrennt |
| 6 | Kontakte (Sidebar / Personen-Symbol) | Kontakte |
| 7 | Einstellungen (Sidebar / Zahnrad) | Einstellungen |

Regeln: Die Tour blockiert die Oberfläche, bis sie beendet wird; Esc beendet, Pfeiltasten blättern, der Fokus springt auf den Titel der Karte. Je Schritt ein Satz Funktionsbeschreibung, keine Beruhigungs- oder Erklärtexte darüber hinaus. Abschluss oder Überspringen wird gespeichert (Plugin-Daten, nicht im Vault). Eine laufende Wochenarbeit wird beim Start pausiert. Bei reduzierter Bewegung ohne Animation.

![[v2-D16-Tour-Start.png]]
![[v2-D17-Tour-Schritt.png]]
![[v2-M13-Tour-Schritt.png]]

## Sicherung

Status der letzten Sicherung mit „Jetzt sichern“; Automatik (vor Import/Wiederherstellung immer, nach Wochenarbeit wählbar, Aufbewahrung); Wiederherstellen mit Auswahl, Vollständigkeitsstatus und Vorschau der Unterschiede zum aktuellen Stand.

![[v2-D14-Sicherung.png]]

## Weitere Bildschirme (Prototyp)

Stand Pilot 15.11.2026, Übersicht in [[Prototyp - Stand Pilot]].

![[v2-P-M-17-Einstellungen.png|180]]
![[v2-P-D-18-Einstellungen-Wochenrhythmus.png]]
![[v2-P-M-18-Einstellungen-Wochenrhythmus.png|180]]
