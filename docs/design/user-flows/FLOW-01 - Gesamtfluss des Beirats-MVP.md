---
type: UserFlow
id: FLOW-01
status: entwurf
scope: mvp
version: "2.0"
date: 2026-11-15
pages:
  - "[[VIEW-01 - Lage]]"
  - "[[VIEW-02 - Wochenarbeit]]"
  - "[[VIEW-03 - Vorgänge und Vorgangsakte]]"
  - "[[VIEW-04 - Postausgang]]"
  - "[[VIEW-05 - Erfassen]]"
  - "[[VIEW-06 - Sachstand ausgeben]]"
  - "[[VIEW-07 - Einstellungen und Einrichtung]]"
flows:
  - "[[FLOW-02 - Wochenarbeit geführt]]"
  - "[[FLOW-03 - Lagecheck unterwegs]]"
  - "[[FLOW-04 - Schnell erfassen und Eingang sichten]]"
  - "[[FLOW-05 - Senden, dokumentieren und nachhalten]]"
  - "[[FLOW-06 - Einrichten, Import und Datenerhalt]]"
  - "[[FLOW-07 - Sachstand gezielt ausgeben]]"
  - "[[FLOW-08 - Zwischen Plugin und direkter Dateibearbeitung wechseln]]"
  - "[[FLOW-09 - Erststart, Einrichtung und Einführung]]"
mockups:
  - "[[docs/design/sitemap/assets/v2-Flows.png]]"
requirements:
  - "[[PBI-01 - Gemeinschaftskontext wählen]]"
  - "[[PBI-02 - Personen und Rollen zuordnen]]"
  - "[[PBI-03 - Registerimport prüfen]]"
  - "[[PBI-04 - Geprüften Bestand übernehmen]]"
  - "[[PBI-05 - Einen Vorgang erfassen und wiederfinden]]"
  - "[[PBI-06 - Sammelvorgänge aufteilen]]"
  - "[[PBI-07 - Dubletten zusammenführen]]"
  - "[[PBI-08 - Bearbeitungsstand bewusst ändern]]"
  - "[[PBI-09 - Termin und Wiedervorlage trennen]]"
  - "[[PBI-10 - Eigenes To-do nachhalten]]"
  - "[[PBI-11 - Nachricht und Original zuordnen]]"
  - "[[PBI-12 - Verlauf nachvollziehen]]"
  - "[[PBI-13 - Aktuelle Wochenlage öffnen]]"
  - "[[PBI-14 - Entscheidungsauswahl und Überlauf prüfen]]"
  - "[[PBI-15 - Eine Entscheidungsvorlage prüfen]]"
  - "[[PBI-16 - Wahl mit Kontextnotiz bestätigen]]"
  - "[[PBI-17 - Folgearbeit aus Entscheidungen vorbereiten]]"
  - "[[PBI-18 - Nachrichten je Gemeinschaft bündeln]]"
  - "[[PBI-19 - Eigentümertexte zweisprachig prüfen]]"
  - "[[PBI-20 - Tatsächlichen Versand dokumentieren]]"
  - "[[PBI-21 - Begründeten Eskalationsschritt prüfen]]"
  - "[[PBI-22 - Eskalationen begrenzen oder aussetzen]]"
  - "[[PBI-23 - Reaktion richtig einordnen]]"
  - "[[PBI-24 - Zwischendurch Dringlichkeit prüfen]]"
  - "[[PBI-25 - Nächste Wochenarbeit vorbereiten]]"
  - "[[PBI-26 - Unterlagen einstufen und korrigieren]]"
  - "[[PBI-27 - Unnötige private Inhalte entfernen]]"
  - "[[PBI-28 - Empfängerbezogene Ausgabe prüfen]]"
  - "[[PBI-29 - Sachstand lesbar übergeben]]"
  - "[[PBI-30 - Bestand sichern und wiederherstellen]]"
  - "[[PBI-31 - Konflikte ohne Datenverlust klären]]"
  - "[[PBI-32 - Ohne KI selbstständig beginnen]]"
  - "[[PBI-33 - Wochenarbeit auf dem Handy abschließen]]"
  - "[[PBI-41 - Vorgänge ohne Plugin und Obsidian nutzen]]"
  - "[[PBI-42 - AI-Agent direkt mit den Notizen arbeiten lassen]]"
---

# FLOW-01 · Gesamtfluss des Beirats-MVP (v2)

**Designstand:** 15.11.2026

**Stand 21.11.2026:** Die mobile Bedienung dieser Abläufe ([[PBI-33 - Wochenarbeit auf dem Handy abschließen]], FLOW-03 am Handy) folgt nach dem MVP, siehe [[K-09 - Vollständige mobile Wochenarbeit unterstützen]]. Im MVP laufen sie auf dem Desktop.

Drei Rhythmen tragen das Produkt: **einmal pro Woche** geführt arbeiten, **zwischendurch** kurz die Lage prüfen, **jederzeit** etwas erfassen. Alles andere ist Kontext.

![[v2-Flows.png]]

```mermaid
flowchart LR
  A[Plugin öffnen] --> B{Eingerichtet?}
  B -- nein --> E[FLOW-09 Einrichten]
  E --> L
  B -- ja --> L[Lage]
  L -->|Wochentag| W[FLOW-02 Woche starten]
  W --> W1[Eingang] --> W2[Nachhalten] --> W3[Entscheiden] --> W4[Senden] --> W5[Übergabe]
  W5 --> L
  L -->|zwischendurch| C[FLOW-03 Lagecheck]
  C --> L
  X([+ Erfassen · FLOW-04]) -.-> W1
  W4 -.-> S[FLOW-05 Versand dokumentieren]
  S -.-> W2
  L -.-> P[Vorgangsakte] -.-> O[FLOW-07 Sachstand ausgeben]
  L -.-> K[Kontakte pflegen · FLOW-06]
  P -.-> F[FLOW-08 Dateien direkt bearbeiten]
```

## Prinzipien

- Jede Handlung hat eine Gemeinschaft (DF-12); „Alle“ ist nur Übersicht.
- Entscheidung, Entwurf, Versand, Antwort und Erfüllung sind getrennte Verlaufseinträge (DF-07).
- Unterbrechen ist überall erlaubt; Rückkehr an dieselbe Stelle.
- Keine automatische Aktion nach außen.
