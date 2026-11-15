---
type: UserFlow
id: FLOW-06
status: entwurf
scope: mvp
version: "2.0"
date: 2026-11-15
pages:
  - "[[VIEW-07 - Einstellungen und Einrichtung]]"
  - "[[VIEW-08 - Kontakte]]"
  - "[[VIEW-01 - Lage]]"
requirements:
  - "[[PBI-01 - Gemeinschaftskontext wählen]]"
  - "[[PBI-02 - Ansprechpartner zuordnen]]"
  - "[[PBI-03 - Registerimport prüfen]]"
  - "[[PBI-04 - Geprüften Bestand übernehmen]]"
  - "[[PBI-30 - Bestand sichern und wiederherstellen]]"
  - "[[PBI-31 - Konflikte ohne Datenverlust klären]]"
  - "[[PBI-32 - Ohne KI selbstständig beginnen]]"
  - "[[PBI-41 - Vorgänge ohne Plugin und Obsidian nutzen]]"
  - "[[PBI-42 - AI-Agent direkt mit den Notizen arbeiten lassen]]"
---

# FLOW-06 · Einrichten, Import und Datenerhalt

```mermaid
flowchart TD
  A[Erststart] --> B[1 Gemeinschaften anlegen: Name, Kürzel, Farbe]
  B --> C[2 Kontakte mit Rolle je Gemeinschaft]
  C --> D{3 Register vorhanden?}
  D -- nein --> L[Lage, leerer Zustand mit Erfassen]
  D -- ja --> E[Datei wählen]
  E --> F[15 Felder zuordnen]
  F --> G[Prüfen: Bereit, Klären, Dublette?]
  G --> H{Klärfälle}
  H -- entscheiden --> I[ungeklärt / offen / auslassen, auch für alle gleichen Werte]
  H -- später --> J[als Klärfall markiert übernehmen]
  I & J --> K[automatisch sichern, dann übernehmen]
  K --> L
  M[Externe Dateiänderung erkannt] --> N[Hinweis in Lage + Akte]
  N --> O[Beide Fassungen vergleichen, wählen oder beide behalten]
  P[Wiederherstellen] --> Q[Vorschau des Sicherungsstands] --> R[bestätigen, aktueller Stand wird vorher gesichert]
```

Wiederholter Import erkennt Zeilen über Gemeinschaft + Altnummer + Herkunft und aktualisiert statt zu verdoppeln. Unterbrechen ist in jedem Schritt möglich.

## Kontakte pflegen

Im laufenden Betrieb über [[VIEW-08 - Kontakte]]: Kontakt suchen oder aus Punktakte bzw. Postausgang öffnen (Modal) → Bearbeiten → Speichern, zurück im Kontakt-Modal; neue Entwürfe nutzen die geänderten Daten, gesendete Nachrichten bleiben unverändert. Ein ausgeschiedener Kontakt wird auf „nicht mehr verwendet“ gesetzt statt gelöscht.

## Einführungstour

Nach dem Erststart öffnet die Lage einmalig den Willkommensdialog: „Tour starten“ führt durch 7 Schritte (Kennzahlen, Wochenarbeit, Erfassen, Navigation, Gemeinschaftsfilter, Kontakte, Einstellungen), „Überspringen“ beendet sie. Neustart über Einstellungen › Hilfe oder den Befehl „Einführungstour starten“ ([[VIEW-07 - Einstellungen und Einrichtung]]).
