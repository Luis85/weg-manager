---
type: Sitemap
id: SITEMAP-v2
status: entwurf
scope: mvp
version: "2.0"
date: 2026-11-15
views:
  - "[[VIEW-01 - Lage]]"
  - "[[VIEW-02 - Wochenarbeit]]"
  - "[[VIEW-03 - Punkte und Punktakte]]"
  - "[[VIEW-04 - Postausgang]]"
  - "[[VIEW-05 - Erfassen]]"
  - "[[VIEW-06 - Sachstand ausgeben]]"
  - "[[VIEW-07 - Einstellungen und Einrichtung]]"
  - "[[VIEW-08 - Kontakte]]"
mockups:
  - "[[docs/design/sitemap/assets/v2-Sitemap.png]]"
---

# Sitemap

Vier Ziele, eine Detailebene. Bearbeitung passiert im Kontext (Seitenpanel, Sheet, geführter Schritt), nicht auf eigenen Seiten.

![[v2-Sitemap.png]]

Aktueller Stand aller Ansichten im klickbaren Prototyp: [[Prototyp - Stand Pilot]] (gilt bei Abweichung vor den Mockups).

## Struktur

```mermaid
flowchart LR
  R[WEG Manager · eigener Obsidian-Tab]
  R --> L[Lage · Start]
  R --> W[Woche · geführt]
  R --> P[Punkte]
  R --> O[Postausgang]
  R -.-> K[Kontakte · Nebenbereich]
  R -.-> S[Einstellungen · Nebenbereich]
  L --> L1[Neu seit Übergabe]
  L --> L2[Dringend & Datenlücken]
  L --> L3[Nächste 14 Tage]
  L --> L4[Deine 3 Schwerpunkte]
  W --> W1[1 Eingang sichten]
  W1 --> W2[2 Nachhalten]
  W2 --> W3[3 Entscheiden]
  W3 --> W4[4 Senden]
  W4 --> W5[5 Übergabe]
  P --> P1[Punkte · Aufgaben · Filter · Themen]
  P --> P2[Punktakte]
  P2 --> P3([Aufteilen / Zusammenführen])
  P2 --> P4([Bewertung setzen])
  P --> P5[Sachstand ausgeben]
  O --> O1[Entwürfe je Gemeinschaft und Empfänger]
  O --> O2[Entwurf prüfen DE/EN]
  O2 --> O3([Als gesendet markieren])
  O --> O4[Gesendet · wartet]
  K --> K1[Gruppen nach Rolle · Personen und Firmen]
  K --> K2[Verteiler]
  K1 --> K4([Kontakt · Modal])
  K4 --> K3([Kontakt bearbeiten])
  S --> S1[Gemeinschaften]
  S --> S2[Wochenrhythmus]
  S --> S3[Register-Import]
  S --> S4[Sicherung]
  S --> S5[Datenprobleme]
  S --> S6[Hilfe & Erststart]
  S6 --> S7([Einführungstour])
  S --> S8[Eigene Angaben]
  S --> S9[Arten von Gemeinschaften]
  S --> S10[Ablage]
  G([+ Erfassen · überall]) -.-> W1
```

Runde Knoten sind Sheets oder Dialoge, eckige Knoten Ansichten oder Bereiche.

## Navigationsmodell

| Ziel | Rolle | Desktop | Mobil |
| --- | --- | --- | --- |
| Lage | Startpunkt, Lagecheck zwischendurch | Sidebar, Badge = Anzahl dringend | Segment oben |
| Woche | geführter Ablauf, blendet Navigation aus | Sidebar, Badge = Wochentag | Segment oben |
| Punkte | Register, Aufgaben, Akte | Sidebar, Badge = Anzahl | Segment oben |
| Postausgang | Entwürfe und Versanddokumentation | Sidebar, Badge = offene Entwürfe | Segment „Post“ |
| Kontakte | Adressbuch, Nebenbereich | Sidebar unter den Zielen, Badge = Anzahl | Personen-Symbol im Kopf |
| Einstellungen | Stammdaten, Nebenbereich | Sidebar unten | Zahnrad im Kopf |

**Immer erreichbar:** „+ Erfassen“ (Sidebar-Button, Befehl, mobil schwebender Button), Suche und Befehle ⌘K, Gemeinschaftsfilter (Alle · AW · TG). Der Filter ist nie ein stiller Kontextwechsel: Jede Bearbeitung, Nachricht und Ausgabe hat genau eine Gemeinschaft (DF-12).

**Querwege:** Jede Zeile in Lage und Woche öffnet die Punktakte im Seitenpanel; Zurück landet an derselben Stelle. Entscheiden erzeugt Entwürfe im Postausgang und eigene Aufgaben. „Als gesendet markieren“ plant die Prüfung in Nachhalten. „Verantwortlich“ in der Punktakte und „An“ im Postausgang öffnen den Kontakt als Modal über der Ansicht.
