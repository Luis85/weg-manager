---
type: Handoff
id: HO-09
status: entwurf
scope: mvp
version: "1.0"
date: 2026-11-15
---

# Handoff · Offene Punkte vor Implementierung

## Aus dem PRD (O-01–08)

| ID | Thema | Auswirkung auf UI |
| --- | --- | --- |
| O-01 | Scopefreigabe Beiratsfokus | gesamte IA |
| O-02 | Obsidian-Version, Desktop-Messziele; Referenz-Handy und mobile Messziele erst für den Ausbau nach dem MVP | Breakpoints; später Sheets, Dateiauswahl, Tastatur-Overlay |
| O-03 | anonymisierter Export für Tests | Testdaten für AT-B01–12 |
| O-04 | Vorbereitungsaufwand ohne KI | Vorschlag in [[Konzept - Vorbereitung ohne KI]], im Pilottest prüfen |
| O-05 | Gemeinschaftsangaben (Organisationsform TG) | Einstellungen, Kürzel |
| O-06 | Umfang Vertretung | Ausgabe für Vertretung |
| O-07 | spätere Berichtsfreigabe | Ausgabe |
| O-08 | Releaseangaben | Erststart, Hilfe |

## Designentscheidungen (O-D)

| ID | Frage | Vorschlag |
| --- | --- | --- |
| O-D1 | Wohin führt ein Klick auf eine Kennzahl in der Lage? | In den passenden Wochenschritt, außerhalb der Woche in die gefilterte Vorgangsliste |
| O-D2 | Merkmal „Eigentümer betroffen“ als Feld oder Vorgangsart? | Feld am Vorgang (Mehrfachmerkmale möglich) |
| O-D3 | Wochensitzung auf zwei Geräten | Sitzung sperrt nicht; letzter Stand pro Element gewinnt, Konflikt bei gleichem Element als Alert |
| O-D4 | Default-Frist für akute Probleme (E6) | 3 Tage, in Einstellungen änderbar |
| O-D5 | Ablage der Textbausteine | Ordner `WEG Manager/Vorlagen` im Vault, Teil des Datenvertrags |
| O-D7 | Eigentümer einzeln führen? | Nein im MVP: Verteiler je Gemeinschaft mit Anzahl und Sprachaufteilung; Einzelführung erst mit Datenschutzkonzept |
| O-D8 | Kontakte importieren (vCard/CSV)? | Nicht im MVP; manuelle Anlage und Erststart reichen für den Pilot |
| O-D9 | Hinweise je Schritt beim ersten Durchlauf der Wochenarbeit | Entschieden: ja, siehe [[VIEW-02 - Wochenarbeit]] |
| O-D10 | Kann derselbe Kontakt je Gemeinschaft eine andere Rolle haben (z. B. Verwaltung in AW, Eigentümer in TG)? | Prototyp: eine Rolle je Kontakt, Zuständigkeit je Gemeinschaft. PBI-02 und AT-B01 sprechen von Rollen je Gemeinschaft; vor Umsetzung entscheiden |
| O-D12 | Onboarding: erledigt am 22.11.2026. Release, Speicherort und Ablageordner sind entschieden; das Verhalten von `onUserEnable` ist per Spike geklärt (K-19, O-19d). | [[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]]; Ansicht [[VIEW-09 - Einrichtung]] |
| O-D11 | Benennung des nativen Chats (PBI-47) vs. Schreibregel „kein KI in Labels“ ([[06 - Texte und Begriffe]]) | Vorschlag: Regel gilt für die regelbasierte Kernreise; der Chat heißt nach seiner Funktion („Chat mit Claude“) und zeigt den Abrechnungsmodus |
| O-D6 | Vorgangsliste als Bases-View oder eigene Liste | Spike: Bases-View für Lesen, eigene Liste für Bearbeitung |
| O-D13 | Routen, Befehls-IDs und Mockups nach den WCS-Begriffen nachziehen (K-20) | Vor Implementierung der Vorgangsansichten: Routen wie `punkte` und `punkt/<id>`, Befehls-IDs wie `open-point`, Mockups und Prototyp auf Vorgang, Vorgangsakte usw. umstellen ([[K-20 - WCS-Datenmodell als fachliche Grundlage]]) |

## Noch nicht gestaltet

MVP-Stories ohne Gestaltung:

- [[PBI-47 - AI-Chat über die eigene Claude-Subscription nutzen]]: Chatansicht (Desktop) mit Kontextwahl, Abrechnungsmodus, Toolbestätigung, Abbruch, Zuständen (keine Laufzeit, nicht angemeldet, Limit) und Gesprächsnotiz.
- [[PBI-32 - Ohne KI selbstständig beginnen]]: Inhalte der lokalen Hilfe (Kernreise, externer Versand, Datenlücken, Sicherung) und Diagnosebericht.
- [[PBI-41 - Vorgänge ohne Plugin und Obsidian nutzen]] / [[PBI-42 - AI-Agent direkt mit den Notizen arbeiten lassen]]: nur textuell in VIEW-03/07 und FLOW-08; Vergleichsansicht für externe Änderungen ist Mockup, nicht Prototyp.

Weitere Lücken: Erststart Schritt 2 (Kontakte) und 3 (Register, entspricht dem Import-Assistenten), Sachstand ausgeben, Dark Mode für die übrigen Ansichten (Tokens vorhanden), Verantwortlichen bzw. Kontakt aus der Vorgangsakte zuweisen (P-071 zeigt „unklar“). Einstellungen mobil ist im Prototyp umgesetzt. Alle übrigen Seiten, Dialoge und Zustände sind gestaltet.

## Technische Spikes

1. Nuxt UI (Vue) in einer Obsidian-`ItemView` inkl. CSS-Kapselung, Theme-Wechsel; Mobile erst nach dem MVP.
2. Lokale Schriften und Icons ohne Netz.
3. Nach dem MVP: `visualViewport`-Verhalten der Aktionsleisten mit Obsidian-Mobile-Tastatur.
4. Leistung: Lage mit 500 Vorgängen < 5 s Start, < 300 ms Filtern (B-NFR-04).
