---
type: UserFlow
id: FLOW-09
status: entwurf
scope: mvp
version: "1.0"
date: 2026-11-22
pages:
  - "[[VIEW-09 - Einrichtung]]"
  - "[[VIEW-01 - Lage]]"
  - "[[VIEW-07 - Einstellungen und Einrichtung]]"
requirements:
  - "[[PBI-60 - Plugin im Community-Verzeichnis finden und installieren]]"
  - "[[PBI-61 - Beim ersten Aktivieren in die Einrichtung geführt werden]]"
  - "[[PBI-62 - Gemeinschaften im Einrichtungsassistenten anlegen]]"
  - "[[PBI-63 - Nach der Einrichtung auf der Lage mit Ersten Schritten ankommen]]"
  - "[[PBI-64 - Kurze Einführung durch das Plugin erhalten]]"
  - "[[PBI-32 - Ohne KI selbstständig beginnen]]"
---

# FLOW-09 · Erststart, Einrichtung und Einführung

Vom leeren Vault bis zur ersten Arbeit, nach [[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und kurze Tour]]. Ersetzt den Abschnitt „Erststart“ in [[FLOW-06 - Einrichten, Import und Datenerhalt]]; Import und Datenerhalt bleiben dort.

## Hauptablauf

```mermaid
flowchart TD
  subgraph O[In Obsidian]
    A[Neuen Vault anlegen] --> B[Eingeschränkten Modus ausschalten]
    B --> C[WEG Manager im Community-Verzeichnis suchen]
    C --> D[Installieren] --> E[Aktivieren]
  end
  E --> F{Gibt es eine gültige Gemeinschaft im Vault?}
  F -- ja --> Z[Keine Einrichtung: Ansicht bleibt zu, Startroute beim nächsten Öffnen]
  F -- nein --> G[Ansicht öffnet sich einmal in neuem Tab: Einrichtung]
  subgraph W[Einrichtungsassistent]
    G --> H[1 Willkommen]
    H --> I[2 Erste Gemeinschaft: Name und Art]
    I --> J{Weitere Gemeinschaft?}
    J -- ja --> I2[Weitere Gemeinschaft: Name und Art] --> J
    J -- nein --> K[3 Prüfen: alle Angaben und Ablageort]
    K -- Ändern --> I
    K --> L[Anlegen: Notizen werden geschrieben]
  end
  L --> M[Lage mit Karte Erste Schritte]
  M --> N{Einführung starten?}
  N -- Starten --> T[Einführung: bis zu 5 Schritte] --> P[Lage]
  N -- Später --> P
  P --> Q[Ersten Punkt erfassen über Erste Schritte]
```

Bis die Lage existiert ([[PBI-13 - Aktuelle Wochenlage öffnen]]), führt „Anlegen“ in die Gemeinschaftsverwaltung; Karte „Erste Schritte“ und Einführung folgen mit der Lage.

## Abbrüche und Sonderfälle

```mermaid
flowchart TD
  A[Einrichtung läuft] --> B{Was passiert?}
  B -- Ansicht geschlossen vor Anlegen --> C[Nichts geschrieben; nächstes Öffnen beginnt die Einrichtung neu]
  B -- Obsidian neu gestartet --> C
  B -- Kürzel vergeben oder Datei vorhanden --> D[Hinweis am Feld mit Ausweg; Eingaben bleiben]
  B -- Schreiben schlägt fehl --> E[Fehlermeldung; schon angelegte Gemeinschaften genannt; Rest erneut anlegen]
  B -- Gemeinschaft kommt während der Einrichtung per Sync --> F[Hinweis: Gemeinschaft gefunden; Einrichtung beenden oder fortsetzen]
  G[Plugin deaktiviert und wieder aktiviert] --> H{Gemeinschaft vorhanden?}
  H -- ja --> I[Keine Einrichtung]
  H -- nein --> J[Einrichtung wie beim ersten Mal]
  K[Zweites Gerät mit demselben Vault] --> I
```

## Einführung neu starten

```mermaid
flowchart LR
  A[Befehl: Einführung starten] --> T[Einführung]
  B[Einstellungen von Obsidian › WEG Manager › Einführung] --> T
  B --> C[Erste Schritte wieder einblenden] --> L[Lage]
```

## Zustände

| Zustand | Wo gespeichert | Wirkung |
| --- | --- | --- |
| Einrichtung nötig | nicht gespeichert, abgeleitet: keine gültige Gemeinschaft im Vault | Ansicht zeigt die Einrichtung |
| Eingaben im Assistenten | nur im Arbeitsspeicher | gehen beim Schließen verloren; nichts im Vault |
| Gemeinschaften | Notizen unter `WEG Manager/Gemeinschaften/` | maßgeblich ([[DF-22 - Notizen als maßgeblicher Datenbestand]]) |
| Erste Schritte erledigt | abgeleitet aus dem Vault (etwa: Es gibt einen Punkt) | Haken in der Karte |
| Erste Schritte ausgeblendet | Plugin-Daten | Karte erscheint nicht |
| Einführung angeboten, beendet oder übersprungen | Plugin-Daten (Vorschlag, K-19 O-19b) | Angebot erscheint nicht mehr von selbst |

## Bezüge

[[F-25 - Onboarding und Einführung]] · [[FLOW-01 - Gesamtfluss des Beirats-MVP]] · [[FLOW-06 - Einrichten, Import und Datenerhalt]] · [[Onboarding-Research - Erststart, Einrichtung und Einführung]].
