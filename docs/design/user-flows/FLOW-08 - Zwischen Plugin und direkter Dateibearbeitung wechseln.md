---
type: UserFlow
id: FLOW-08
status: entwurf
scope: mvp
pages:
  - "[[VIEW-07 - Einstellungen und Einrichtung]]"
  - "[[VIEW-03 - Punkte und Punktakte]]"
requirements:
  - "[[PBI-31 - Konflikte ohne Datenverlust klären]]"
  - "[[PBI-41 - Vorgänge ohne Plugin und Obsidian nutzen]]"
  - "[[PBI-42 - AI-Agent direkt mit den Notizen arbeiten lassen]]"
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-09 - AI-Agent mit direktem Dateizugriff]]"
---

# FLOW-08 · Zwischen Plugin und direkter Dateibearbeitung wechseln

## Ziel und Voraussetzungen

Der Nutzer arbeitet wahlweise im Plugin oder mit einem Editor beziehungsweise freigegebenen AI-Agent direkt auf demselben Notizbestand. Der lokal verfügbare Dateivertrag erklärt Lesen, Beziehungen und zulässige Änderungen. MCP ist nicht erforderlich. Direkter Zugriff kann jederzeit auch ohne laufendes Obsidian beginnen; der Einstieg im folgenden Diagramm ist nur ein möglicher Wechselpunkt.

## Ablauf

```mermaid
flowchart TD
  A[Bestätigte Arbeit liegt als normale Notizdateien vor] --> B[Nutzer gibt Ordnerzugriff frei]
  B --> C[Agent oder Editor liest lokalen Dateivertrag und Kontext]
  C --> D{Nur lesen oder erlaubte Änderung?}
  D -- Lesen --> E[Kontext ohne Plugin oder Obsidian nutzen]
  D -- Ändern --> F[Aktuellen Dateistand prüfen und vertragskonform bearbeiten]
  F --> G[Plugin erkennt Änderung oder liest beim Start neu ein]
  G --> H{Dateien und Schema verständlich?}
  H -- Nein --> I[Bestand erhalten und Problem zur Klärung zeigen]
  H -- Ja --> J{Konkurrierende eigene Bearbeitung?}
  J -- Nein --> K[Ansicht aktualisieren und betroffene Prüfstände neu prüfen]
  J -- Ja --> L[Eigene Eingaben und Dateistand vergleichen]
  L --> M[Geprüfte Auswahl ohne stilles Überschreiben übernehmen]
  M --> K
  I --> C
```

## Übergänge und Ansichten

| Schritt | Kontext | Ergebnis |
| --- | --- | --- |
| Datenvertrag verstehen | [[VIEW-07 - Einstellungen und Einrichtung]] oder lokal verfügbare Dokumentation außerhalb der App | Dateien, Beziehungen und Grenzen ohne laufendes Plugin verständlich. |
| Kontext lesen oder ändern | Gewöhnlicher Dateieditor oder [[ACT-09 - AI-Agent mit direktem Dateizugriff]] | Dieselben fachlichen Notizen statt eines separaten Agentenexports. |
| Gültige Änderungen einlesen | [[VIEW-03 - Punkte und Punktakte]] (Akte und Quellen) | Aktueller Fachstand, Herkunft und erforderliche erneute Prüfung sichtbar. |
| Konflikt klären | [[VIEW-07 - Einstellungen und Einrichtung]] | Eigene Eingaben und externer Dateistand bleiben bis zur geklärten Übernahme erhalten. |
| Bestand erhalten | [[VIEW-07 - Einstellungen und Einrichtung]] | Vollständige normale Dateien und Originale bleiben übertragbar; kein Datenverlust durch fehlenden Cache. |

## Abzweigungen und Grenzen

- Ohne Plugin kann der Agent weiterhin lesen und vertragskonform schreiben; nur die Pluginansicht fehlt. Keine vorgeschaltete Verbindung zu Obsidian oder MCP.
- Noch ungespeicherte Formularinhalte werden nicht als bereits im Ordner verfügbar behauptet.
- Ungültige, unvollständige oder unbekannte Dateien werden nicht still verworfen. Beim erneuten Einlesen nach Korrektur keine doppelten Fachobjekte.
- Ändert sich die Datei erneut während der Konfliktklärung, erneut gegen diesen Stand prüfen; keine blinde Übernahme einer veralteten Lösung.
- Eigene Dateirechte und Modellzugriff werden vom Nutzer beziehungsweise seiner Umgebung vergeben. Keine neue Kontoverwaltung oder automatische externe Übertragung des Plugins.
- Normale Dateiänderung ist keine tatsächlich erfolgte menschliche Freigabe oder Sendung. Geänderte Grundlagen können bestehende Prüfstände erneut prüfbedürftig machen.

## Ende und Review

Ergebnis ist ein weiter nutzbarer gemeinsamer Dateibestand, eine bewusst erhaltene offene Klärung oder reine Kontextnutzung ohne Änderung. Der technische Zugriff und die Konflikterkennung sind noch nicht implementiert. Als Reviewfälle gelten [[PBI-41 - Vorgänge ohne Plugin und Obsidian nutzen]], [[PBI-42 - AI-Agent direkt mit den Notizen arbeiten lassen]] und [[Datenkonzept - Offene Notizen und Agentenzugriff]].
