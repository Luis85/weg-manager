---
type: UserFlow
id: FLOW-09
status: entwurf
scope: mvp
version: "1.1"
date: 2026-11-22
pages:
  - "[[VIEW-09 - Einrichtung]]"
  - "[[VIEW-01 - Lage]]"
  - "[[VIEW-07 - Einstellungen und Einrichtung]]"
requirements:
  - "[[PBI-68 - Plugin im Community-Verzeichnis finden und installieren]]"
  - "[[PBI-69 - Beim ersten Aktivieren in die Einrichtung geführt werden]]"
  - "[[PBI-70 - Gemeinschaften im Einrichtungsassistenten anlegen]]"
  - "[[PBI-71 - Nach der Einrichtung auf der Lage mit Ersten Schritten ankommen]]"
  - "[[PBI-72 - Beim ersten Benutzen eines Bereichs einen Hinweis erhalten]]"
  - "[[PBI-73 - Kürzel einer Gemeinschaft nachträglich ändern]]"
  - "[[PBI-32 - Ohne KI selbstständig beginnen]]"
---

# FLOW-09 · Erststart, Einrichtung und Einführung

Vom leeren Vault bis zur ersten Arbeit, nach [[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]]. Ersetzt den Abschnitt „Erststart“ in [[FLOW-06 - Einrichten, Import und Datenerhalt]]; Import und Datenerhalt bleiben dort.

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
    G --> I[1 Gemeinschaften: Name und Art]
    I -- Weitere Gemeinschaft hinzufügen --> I
    I -- Prüfen --> K[2 Prüfen: alle Angaben, Kürzel, Farbe, Ablageort]
    K -- Ändern --> I
    K --> L[Gemeinschaften anlegen: Notizen werden geschrieben]
  end
  L --> M[Lage mit Karte Erste Schritte und erklärenden Leerzuständen]
  M --> Q[Ersten Punkt erfassen über Erste Schritte]
  Q --> R[Erstes Benutzen eines Bereichs: einzelner Hinweis am Element]
  R -- Verstanden oder Element benutzt --> S[Weiterarbeiten]
```

Bis die Lage existiert ([[PBI-13 - Aktuelle Wochenlage öffnen]]), führt das Anlegen in die Gemeinschaftsverwaltung; die Karte „Erste Schritte“ folgt mit der Lage. Die Hinweise im Kontext folgen nach dem MVP ([[PBI-72 - Beim ersten Benutzen eines Bereichs einen Hinweis erhalten]]). Es gibt keine Tour ([[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]]).

## Abbrüche und Sonderfälle

```mermaid
flowchart TD
  A[Einrichtung läuft] --> B{Was passiert?}
  B -- Ansicht geschlossen vor dem Anlegen --> C[Nichts geschrieben; Eingaben bleiben im Arbeitsspeicher; nächstes Öffnen setzt fort]
  B -- Obsidian neu gestartet --> C2[Nichts geschrieben; Einrichtung beginnt leer]
  B -- Kürzel vergeben oder Datei vorhanden --> D[Hinweis am Feld mit Ausweg; Eingaben bleiben]
  B -- Schreiben schlägt fehl --> E[Fehlermeldung; schon angelegte Gemeinschaften genannt; Rest erneut anlegen]
  B -- Gemeinschaft kommt während der Einrichtung per Sync --> F[Hinweis: Gemeinschaft gefunden; Einrichtung beenden oder fortsetzen]
  G[Plugin deaktiviert und wieder aktiviert] --> H{Gemeinschaft vorhanden?}
  H -- ja --> I[Keine Einrichtung]
  H -- nein --> J[Einrichtung wie beim ersten Mal]
  K[Zweites Gerät mit demselben Vault] --> I
```

## Hinweise und Erste Schritte zurückholen

```mermaid
flowchart LR
  A[Befehl: Hinweise erneut zeigen] --> T[Hinweise erscheinen wieder beim nächsten Benutzen]
  B[Befehl: Erste Schritte wieder einblenden] --> L[Lage mit Karte Erste Schritte]
```

## Zustände

| Zustand | Wo gespeichert | Wirkung |
| --- | --- | --- |
| Einrichtung nötig | nicht gespeichert, abgeleitet: keine gültige Gemeinschaft im Vault | Ansicht zeigt die Einrichtung |
| Eingaben im Assistenten | nur im Arbeitsspeicher | bleiben bis zum Neustart von Obsidian; nichts im Vault, nichts in den Plugin-Daten |
| Gemeinschaften | Notizen unter `WEG Manager/Gemeinschaften/` | maßgeblich ([[DF-22 - Notizen als maßgeblicher Datenbestand]]) |
| Erste Schritte erledigt | abgeleitet aus dem Vault (etwa: Es gibt einen Punkt) | Haken in der Karte |
| Erste Schritte ausgeblendet | je Gerät (`DeviceStore`, K-19 O-19b) | Karte erscheint auf diesem Gerät nicht |
| Hinweis gesehen | je Gerät (`DeviceStore`, K-19 O-19b) | dieser Hinweis erscheint auf diesem Gerät nicht wieder |

## Bezüge

[[F-25 - Onboarding und Einführung]] · [[FLOW-01 - Gesamtfluss des Beirats-MVP]] · [[FLOW-06 - Einrichten, Import und Datenerhalt]] · [[Onboarding-Research - Erststart, Einrichtung und Einführung]].
