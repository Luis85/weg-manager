---
type: Handoff
id: HO-09
status: entwurf
scope: mvp
version: "1.1"
date: 2026-11-22
---

# Handoff · Offene Punkte vor Implementierung

**Auf den Stand vom 22.11.2026 gebracht** nach den Entscheidungen vom 22.11.2026 (`docs/plans/pre-feature-improvement-plan.md`, Abschnitt 8; [ADR 0007](../../adr/0007-vault-data-access.md), Nachtrag zur Rolle eines Kontakts) und dem Stand der Umsetzung (Durchstich mit Gemeinschaften, [[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]]).

## Aus dem PRD (O-01–08)

| ID | Thema | Auswirkung auf UI |
| --- | --- | --- |
| O-01 | Scopefreigabe Beiratsfokus | gesamte IA |
| O-02 | Obsidian-Version, Desktop-Messziele; Referenz-Handy und mobile Messziele erst für den Ausbau nach dem MVP | Breakpoints; später Sheets, Dateiauswahl, Tastatur-Overlay |
| O-03 | anonymisierter Export für Tests | Testdaten für AT-B01–12 |
| O-04 | Vorbereitungsaufwand ohne KI | Vorschlag in [[Konzept - Vorbereitung ohne KI]], im Pilottest prüfen |
| O-05 | Gemeinschaftsangaben (Organisationsform TG) | Einstellungen, Kürzel. Die Gemeinschaftsnotiz führt die Art als freien Text ohne Rechtsform ([[DV-01 - Gemeinschaft v1]]) |
| O-06 | Umfang Vertretung | Ausgabe für Vertretung |
| O-07 | spätere Berichtsfreigabe | Ausgabe |
| O-08 | Releaseangaben | Erststart, Hilfe |

## Designentscheidungen (O-D)

| ID | Frage | Vorschlag |
| --- | --- | --- |
| O-D1 | Wohin führt ein Klick auf eine Kennzahl in der Lage? | In den passenden Wochenschritt, außerhalb der Woche in die gefilterte Punkteliste |
| O-D2 | Merkmal „Eigentümer betroffen“ als Feld oder Punktart? | Feld am Punkt (Mehrfachmerkmale möglich) |
| O-D3 | Wochensitzung auf zwei Geräten | Sitzung sperrt nicht; letzter Stand pro Element gewinnt, Konflikt bei gleichem Element als Alert |
| O-D4 | Default-Frist für akute Probleme (E6) | 3 Tage, in Einstellungen änderbar |
| O-D5 | Ablage der Textbausteine | Ordner `WEG Manager/Vorlagen` im Vault, Teil des Datenvertrags |
| O-D7 | Eigentümer einzeln führen? | Nein im MVP: Verteiler je Gemeinschaft mit Anzahl und Sprachaufteilung; Einzelführung erst mit Datenschutzkonzept |
| O-D8 | Kontakte importieren (vCard/CSV)? | Nicht im MVP; manuelle Anlage und Erststart reichen für den Pilot |
| O-D9 | Hinweise je Schritt beim ersten Durchlauf der Wochenarbeit | Entschieden: ja, siehe [[VIEW-02 - Wochenarbeit]] |
| O-D10 | Kann derselbe Kontakt je Gemeinschaft eine andere Rolle haben (z. B. Verwaltung in AW, Eigentümer in TG)? | **Entschieden am 22.11.2026:** nein. Ein Kontakt hat eine Rolle und eine Zuständigkeit für eine oder mehrere Gemeinschaften, wie im Prototyp. Eine abweichende Rolle steht in der Notiz des Kontakts; eine Rolle je Gemeinschaft kann mit einer neuen Schemaversion folgen ([[PBI-61 - Beziehungen zwischen Datensätzen und abgeleitete Werte vorbereiten]]). AT-B01 in [[08 - Abnahme und Testszenarien]] ist angepasst; PBI-02 ist beim Ausarbeiten der Funktion anzupassen |
| O-D11 | Benennung des nativen Chats (PBI-47) vs. Schreibregel „kein KI in Labels“ ([[06 - Texte und Begriffe]]) | Vorschlag: Regel gilt für die regelbasierte Kernreise; der Chat heißt nach seiner Funktion („Chat mit Claude“) und zeigt den Abrechnungsmodus |
| O-D6 | Punkte-Liste als Bases-View oder eigene Liste | Spike: Bases-View für Lesen, eigene Liste für Bearbeitung |
| O-D12 | Schrift: Geist lokal bündeln (Entwurf vom 15.11.2026, [[K-13 - Nuxt UI als Frontend-Komponentenbasis]]) oder die Schrift des Hosts behalten? | Offen. Gebaut ist die Schrift des Hosts (`--font-interface`, `--font-monospace`); Geist ist nicht eingebaut und keine Entscheidung ersetzt sie |

## Noch nicht gestaltet

MVP-Stories ohne Gestaltung:

- [[PBI-46 - Gmail-Nachrichten mit Claude als Vault-Notizen übernehmen]]: Anzeige importierter E-Mail-Quellnotizen im Eingang (Kanal, „unvollständig“, Prüfbedarf bei abweichend erneut geliefertem Inhalt), Bereitstellung des Skillpakets in Einstellungen (Version, ZIP, ohne Verbindungsbehauptung).
- [[PBI-47 - AI-Chat über die eigene Claude-Subscription nutzen]]: Chatansicht (Desktop) mit Kontextwahl, Abrechnungsmodus, Toolbestätigung, Abbruch, Zuständen (keine Laufzeit, nicht angemeldet, Limit) und Gesprächsnotiz.
- [[PBI-32 - Ohne KI selbstständig beginnen]]: Inhalte der lokalen Hilfe (Kernreise, externer Versand, Datenlücken, Sicherung) und Diagnosebericht.
- [[PBI-41 - Vorgänge ohne Plugin und Obsidian nutzen]] / [[PBI-42 - AI-Agent direkt mit den Notizen arbeiten lassen]]: nur textuell in VIEW-03/07 und FLOW-08; Vergleichsansicht für externe Änderungen ist Mockup, nicht Prototyp.

Weitere Lücken: Erststart Schritt 2 (Kontakte) und 3 (Register, entspricht dem Import-Assistenten), Sachstand ausgeben, Dark Mode für die übrigen Ansichten (Tokens vorhanden), Verantwortlichen bzw. Kontakt aus der Punktakte zuweisen (P-071 zeigt „unklar“). Einstellungen mobil ist im Prototyp umgesetzt. Alle übrigen Seiten, Dialoge und Zustände sind gestaltet.

## Technische Spikes

1. Erledigt: Nuxt UI (Vue) in einer Obsidian-`ItemView` inkl. CSS-Kapselung und Theme-Wechsel (ADR 0002, ADR 0008); Mobile erst nach dem MVP.
2. Icons ohne Netz sind gelöst (Liste in `SHELL_ICONS`, kein Abruf zur Laufzeit); lokale Schriften offen, siehe O-D12.
3. Nach dem MVP: `visualViewport`-Verhalten der Aktionsleisten mit Obsidian-Mobile-Tastatur.
4. Leistung: Lage mit 500 Punkten < 5 s Start, < 300 ms Filtern (B-NFR-04). Gemessen ist bisher der Notizindex mit 2.000 Datensätzen (`docs/engineering/architecture.md`, Abschnitt „The index“), nicht die Lage.
