---
type: DesignSpec
id: UI-DESIGN-01
status: entwurf
scope: mvp
version: "2.0"
date: 2026-11-15
canvas: https://claude.ai/artifact/8KsVenY2P3dVbSRL1Phf5S
---

# UI-Design · Leitlinien und Reviewumfang (v2)

Neuentwurf des MVP-UI auf Basis von [[02-MVP-PRD]], PBI-01–33, DF-01–15 und [[F-21 - Nichtfunktionale Anforderungen]]. Anlass war das Review des ersten Entwurfs: zu viele gleichrangige Seiten (17), unklarer Einstieg in die Wochenarbeit, zu textlastige Darstellung. Der erste Entwurf wurde verworfen und ist nicht mehr Teil der Dokumentation. Keine Implementierung, keine Entwicklungsfreigabe.

**Einstieg:** [[UI-Research - v2 Muster und Plattform]] → [[00 - Sitemap]] → [[FLOW-01 - Gesamtfluss des Beirats-MVP]] → [[VIEW-02 - Wochenarbeit]]. Vorbereitung ohne KI: [[Konzept - Vorbereitung ohne KI]]. Klickbarer Prototyp: `docs/design/prototype/WEG-Manager-Prototyp.html`, Stand: [[Prototyp - Stand Pilot]]. Umsetzungspaket: [[00 - Handoff Übersicht]]. Alle Mockups liegen als PNG unter `docs/design/sitemap/assets/v2-*.png` und editierbar im Design-Canvas (Link im Frontmatter, privat bis zur Freigabe).

## Kernentscheidungen v2

| Thema | Entscheidung | Begründung |
| --- | --- | --- |
| Struktur | 4 Ziele (Lage, Woche, Punkte, Postausgang) + Nebenbereiche Kontakte und Einstellungen; 8 Ansichten statt 17 Pages | weniger Suchaufwand, max. 2 Ebenen (NN/g) |
| Wochenarbeit | geführter Ablauf in 5 Schritten mit Pause, Zeit, Stepper | Weekly-Review-Muster; klarer Anfang und Ende |
| Nachhalten | vier Ein-Klick-Antworten je Zusage | „Warten auf“-Muster, DF-05/06 |
| Status | Form + Farbe + Wort, große Zahlen; Fließtext nur in Akte und Entwürfen | Kritik „zu textlastig“; WCAG 1.4.1 |
| Gemeinschaften | feste Kürzel + Farbe (AW Petrol, TG Violett), unterschiedliche Helligkeit | DF-12, Farbsehschwächen |
| Mobil | Segment oben statt Tabbar unten; Erfassen schwebt über der Obsidian-Navigation | schwebende Host-Navigation (Obsidian 2026) |
| Mikrotexte | keine Erklär- oder Beruhigungstexte im UI („Nichts wird gesendet“, „bleibt sichtbar“ …). Regeln zeigen sich im Verhalten, in Status-Chips und Button-Beschriftungen; Erklärungen gehören in diese Notes und in die Hilfe | Review-Kommentare 15.11.2026: ohne Mehrwert für den Nutzer |
| Optik | eigene App-Optik im Obsidian-Tab (Geist / Geist Mono, neutrale Flächen, schwarze Primäraktion) | Produktentscheidung 15.11.2026 |

## Tokens (Hell / Dunkel)

| Token | Hell | Dunkel | Verwendung |
| --- | --- | --- | --- |
| Grund | `#F6F6F3` | `#111113` | App-Hintergrund |
| Fläche | `#FFFFFF` | `#1A1A1D` | Karten, Panels |
| Linie | `#E4E4DF` | `#2C2C30` | Rahmen, Trenner |
| Text | `#18181B` | `#EDEDEF` | Haupttext, Primärbutton (invertiert) |
| Text 2 | `#52525B` | `#A1A1AA` | Sekundärtext |
| Fokus/Link | `#2563EB` | `#60A5FA` | Links, Fokusring |
| AW | `#0F766E` | `#2BB3A3` | Kürzel WEG |
| TG | `#6D28D9` | `#A78BFA` | Kürzel Tiefgarage |
| Warnung | `#B45309` / Fläche `#FEF3E2` | `#F59E0B` / `#3A2A12` | Datenlücke, Termin fehlt |
| Fehler/dringend | `#B42318` / `#FDECEA` | `#F87171` / `#3B1A1A` | überfällig, Konflikt |
| Erfolg | `#15803D` / `#ECFDF3` | `#22C55E` / `#11291C` | erledigt, geprüft |
| Bewertung | `#6D28D9` / `#F5F3FF` | `#C4B5FD` / `#2A1F45` | ◆ Deine Bewertung |

Typografie: Geist 400–700 (Fließtext 14–15 px, Titel 26–30 px), Geist Mono für Daten, IDs und Zahlen. Radius 9–16 px. Touchziele ≥ 44 px. Fonts später lokal bündeln (offline, K-11). Im Dunkelmodus bleibt die Wochenarbeit-Karte eine erhöhte dunkle Fläche; Primäraktionen werden hell.

## Komponentensprache (Nuxt UI)

DashboardSidebar (Desktop-Navigation) · DashboardPanel (Arbeitsfläche + Kontextpanel) · Stepper (Wochenarbeit, Import) · Tabs (Sprachfassung, Akte mobil) · RadioGroup als Karten (Entscheiden) · Segmented Control (Nachhalten, Erfassen-Art) · Slideover / Drawer (Erfassen, Als gesendet markieren) · Table in Scrollrahmen (Import) · Badge (Kürzel, Status) · Alert persistent (Datenproblem, Datenlücke) · Timeline als eigene Komposition (Verlauf). Konkrete Hostintegration bleibt technische Konzeptfrage ([[UI-Research - NuxtUI und Komponentenwahl]]).

## Abdeckung der MVP-Stories

| User Story | Ort in v2 |
| --- | --- |
| [[PBI-01 - Gemeinschaftskontext wählen]] | [[VIEW-01 - Lage]] Filter, [[VIEW-05 - Erfassen]], [[VIEW-07 - Einstellungen und Einrichtung]] |
| [[PBI-02 - Personen und Rollen zuordnen]] | [[VIEW-08 - Kontakte]], [[VIEW-07 - Einstellungen und Einrichtung]] |
| [[PBI-03 - Registerimport prüfen]] | [[VIEW-07 - Einstellungen und Einrichtung]] Import |
| [[PBI-04 - Geprüften Bestand übernehmen]] | [[VIEW-07 - Einstellungen und Einrichtung]] Import |
| [[PBI-05 - Einen Vorgang erfassen und wiederfinden]] | [[VIEW-05 - Erfassen]], [[VIEW-03 - Vorgänge und Vorgangsakte]] |
| [[PBI-06 - Sammelvorgänge aufteilen]] | [[VIEW-03 - Vorgänge und Vorgangsakte]] Dialog |
| [[PBI-07 - Dubletten zusammenführen]] | [[VIEW-03 - Vorgänge und Vorgangsakte]], [[VIEW-02 - Wochenarbeit]] Eingang |
| [[PBI-08 - Bearbeitungsstand bewusst ändern]] | [[VIEW-03 - Vorgänge und Vorgangsakte]] |
| [[PBI-09 - Termin und Wiedervorlage trennen]] | [[VIEW-03 - Vorgänge und Vorgangsakte]] Fakten, [[VIEW-02 - Wochenarbeit]] Nachhalten |
| [[PBI-10 - Eigenes To-do nachhalten]] | [[VIEW-03 - Vorgänge und Vorgangsakte]] Segment Aufgaben |
| [[PBI-11 - Nachricht und Original zuordnen]] | [[VIEW-02 - Wochenarbeit]] Eingang, [[VIEW-05 - Erfassen]] |
| [[PBI-12 - Verlauf nachvollziehen]] | [[VIEW-03 - Vorgänge und Vorgangsakte]] Verlauf |
| [[PBI-13 - Aktuelle Wochenlage öffnen]] | [[VIEW-01 - Lage]], [[VIEW-02 - Wochenarbeit]] |
| [[PBI-14 - Entscheidungsauswahl und Überlauf prüfen]] | [[VIEW-02 - Wochenarbeit]] Entscheiden |
| [[PBI-15 - Eine Entscheidungsvorlage prüfen]] | [[VIEW-02 - Wochenarbeit]] Entscheiden |
| [[PBI-16 - Wahl mit Kontextnotiz bestätigen]] | [[VIEW-02 - Wochenarbeit]] Entscheiden |
| [[PBI-17 - Folgearbeit aus Entscheidungen vorbereiten]] | [[VIEW-02 - Wochenarbeit]] „Danach entsteht“, [[VIEW-04 - Postausgang]] |
| [[PBI-18 - Nachrichten je Gemeinschaft bündeln]] | [[VIEW-04 - Postausgang]] |
| [[PBI-19 - Eigentümertexte zweisprachig prüfen]] | [[VIEW-04 - Postausgang]] |
| [[PBI-20 - Tatsächlichen Versand dokumentieren]] | [[VIEW-04 - Postausgang]] Sheet |
| [[PBI-21 - Begründeten Eskalationsschritt prüfen]] | [[VIEW-02 - Wochenarbeit]] Nachhalten |
| [[PBI-22 - Eskalationen begrenzen oder aussetzen]] | [[VIEW-02 - Wochenarbeit]] Nachhalten |
| [[PBI-23 - Reaktion richtig einordnen]] | [[VIEW-03 - Vorgänge und Vorgangsakte]] Reaktion, [[VIEW-02 - Wochenarbeit]] |
| [[PBI-24 - Zwischendurch Dringlichkeit prüfen]] | [[VIEW-01 - Lage]] |
| [[PBI-25 - Nächste Wochenarbeit vorbereiten]] | [[VIEW-02 - Wochenarbeit]] Übergabe |
| [[PBI-26 - Unterlagen einstufen und korrigieren]] | [[VIEW-03 - Vorgänge und Vorgangsakte]] Quellen |
| [[PBI-27 - Unnötige private Inhalte entfernen]] | [[VIEW-03 - Vorgänge und Vorgangsakte]] Dialog |
| [[PBI-28 - Empfängerbezogene Ausgabe prüfen]] | [[VIEW-06 - Sachstand ausgeben]] |
| [[PBI-29 - Sachstand lesbar übergeben]] | [[VIEW-06 - Sachstand ausgeben]] |
| [[PBI-30 - Bestand sichern und wiederherstellen]] | [[VIEW-07 - Einstellungen und Einrichtung]] |
| [[PBI-31 - Konflikte ohne Datenverlust klären]] | [[VIEW-07 - Einstellungen und Einrichtung]], Hinweis in [[VIEW-01 - Lage]] |
| [[PBI-32 - Ohne KI selbstständig beginnen]] | [[VIEW-07 - Einstellungen und Einrichtung]] Erststart, Einführungstour; Hinweise in [[VIEW-02 - Wochenarbeit]]; Hilfe-Inhalte und Diagnosebericht offen |
| [[PBI-33 - Wochenarbeit auf dem Handy abschließen]] | alle Ansichten; mobile Prototyp-Bildschirme `v2-P-M-*` |
| [[PBI-41 - Vorgänge ohne Plugin und Obsidian nutzen]] | textuell in [[VIEW-03 - Vorgänge und Vorgangsakte]], [[VIEW-07 - Einstellungen und Einrichtung]], [[FLOW-08 - Zwischen Plugin und direkter Dateibearbeitung wechseln]] |
| [[PBI-42 - AI-Agent direkt mit den Notizen arbeiten lassen]] | textuell in [[VIEW-02 - Wochenarbeit]], [[VIEW-03 - Vorgänge und Vorgangsakte]], [[VIEW-07 - Einstellungen und Einrichtung]], [[FLOW-08 - Zwischen Plugin und direkter Dateibearbeitung wechseln]] |
| [[PBI-47 - AI-Chat über die eigene Claude-Subscription nutzen]] | **offen**, siehe [[09 - Offene Punkte vor Implementierung]] |

## Mockup-Bestand

| Datei | Inhalt |
| --- | --- |
| `v2-00-Research-Prinzipien.png` | Research → Designprinzipien |
| `v2-Sitemap.png`, `v2-Flows.png` | IA und Flows, aus den Mermaid-Diagrammen in [[00 - Sitemap]] und [[FLOW-01 - Gesamtfluss des Beirats-MVP]] erzeugt |
| `v2-D7-Ausgabe.png`, `v2-D8-Import.png` | Desktop: Sachstand ausgeben, Register-Import (nicht im Prototyp) |
| `v2-D11-Aufgaben.png` … `v2-D14-Sicherung.png` | Desktop: Aufgaben, Konflikt klären, Erststart, Sicherung |
| `v2-Dlg-*.png` | Dialoge: Aufteilen, Zusammenführen, Bewerten, Reaktion erfassen, Als gesendet markieren |
| `v2-M8-Nachricht.png` | Mobil: Nachricht prüfen |
| `v2-D16-Tour-Start.png`, `v2-D17-Tour-Schritt.png`, `v2-M12-Tour-Start.png`, `v2-M13-Tour-Schritt.png` | Einführungstour: Willkommen und Schritt, Desktop und Mobil |
| `v2-P-D-01-Lage.png` … `v2-P-D-18-…`, `v2-P-M-01-…` … `v2-P-M-18-…` | Prototyp-Stand Pilot 15.11., Desktop und Mobil, 18 Bildschirme; gilt bei Abweichung vor den älteren Mockups, siehe [[Prototyp - Stand Pilot]] |
| `v2-Z-Zustaende.png` | Leer, keine Treffer, Laden, Speicherfehler, Konflikt, Datenlücke, Woche pausiert, Toast |
| `v2-*-dark.png` | Dunkel: Desktop Lage, Punktakte, Postausgang; Mobil Lage, Punktakte. Referenz für Farben und Kontraste; Inhalt vor dem Prototyp-Stand |

Alle Inhalte sind synthetisch (WEG Ahornweg 12, Tiefgarage). Betrachtungszeitpunkt So 15.11.2026, Wochenarbeit Mo 16.11.2026.

## Review v2 (15.11.2026)

Alle 21 Artboards wurden gerendert, bei 1440 px und bei 390 px Breite auf horizontales Überlaufen geprüft und visuell gegengelesen.

**Behoben:**

- Stepper in Wochenarbeit und Import liefen bei schmaler Breite über → umbrechend.
- „Sachstand ausgeben“ lief bei 390 px über → Spalten-Mindestbreiten reduziert.
- Sidebar-Bezeichnung „WEG Ahornweg 12“ brach um → „Ahornweg 12“ (Kürzel trägt den Typ).
- Punktakte und Postausgang hatten keine Suche in der Sidebar → ergänzt, Navigation jetzt einheitlich.
- Mobile Lage: Feed lief unter Erfassen-Button und Host-Navigation → Kennzahlen als 4er-Reihe, Feed gekürzt.
- Mobile Entscheiden: Notiz lag unter der Aktionsleiste → Lückenhinweis in Kachel integriert.
- Dunkelmodus: invertierte helle Wochenkarte war zu grell und Chip-Kontrast zu gering → erhöhte dunkle Fläche, heller Primärbutton.
- Emoji in Ausgabe-Chips entfernt (Konsistenz mit Symbolsprache).
- Nach Review-Kommentaren: rund 25 Erklärtexte in D2–D9, M3–M5 entfernt (Untertitel, Infoboxen, Fußnoten, Zusätze wie „· bleibt Lücke“); verbleibende Texte zeigen nur Daten, Status oder Aktionen.
- Eigene Aufgaben hatten in der Sitemap keinen Ort → Segment „Punkte | Aufgaben“.

**Offen für den fachlichen Review:**

1. Noch nicht gezeichnet: Erststart Schritt 2 und 3, Sachstand ausgeben mobil, Einstellungen mobil.
2. Dunkelmodus für fünf Kernansichten bebildert; Tokens decken alle ab.
3. Desktop-Nachhalten zeigt die Bewertung als Checkbox, die Akte zeigt sie bereits gesetzt (zeitlich nacheinander zu lesen).
4. Ob Kennzahl-Kacheln als Filter (Lage → gefilterte Punkte) oder als Sprung in den Wochenschritt dienen, ist festzulegen.
5. Technisch: Geist lokal bündeln, Bases-View für die Punkte-Liste prüfen, Fokusführung im Stepper, Verhalten bei 200 % Zoom.

Statische Mockups belegen keine Tastaturbedienung, Screenreader-Ansagen, Speicherung, Offlinefähigkeit oder Performance.
