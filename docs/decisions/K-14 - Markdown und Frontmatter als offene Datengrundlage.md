---
type: Decision
id: K-14
status: festgelegt
date: 2026-11-15
source: "Direkte Nutzerentscheidung: Notizen müssen auch ohne Plugin, Obsidian und MCP nutzbar und durch einen freigegebenen AI-Agent bearbeitbar sein."
---

# K-14 · Markdown und Frontmatter als offene Datengrundlage

## Entscheidung

Das Plugin speichert seine fachlichen Daten grundsätzlich als lesbare Markdown-Dateien mit dokumentiertem YAML-Frontmatter. Diese Notizen sind der maßgebliche Datenbestand, kein nachträglich erzeugter Export einer verborgenen Datenbank. Jeder Vorgang beziehungsweise atomare Punkt besitzt eine verständliche Notiz; zugehörige Fachinformationen, Beziehungen und Originalanhänge sind aus dem Ordner nachvollziehbar.

Ein Nutzer kann dieselben Dateien im Plugin und über einen ausdrücklich zugelassenen AI-Agent oder einen gewöhnlichen Editor bearbeiten. Lesen und zulässige Änderungen benötigen weder das Plugin noch Obsidian, MCP, ein Herstellerkonto oder einen Exportlauf. Der Agent ist optional; das Produkt bleibt ohne KI nutzbar.

## Bedeutung von jederzeit

Bestätigte gespeicherte Arbeit liegt im normalen Notizbestand vor und bleibt bei geschlossenem Plugin oder Obsidian verfügbar. Noch ungespeicherte UI-Eingaben sind als Entwurf erkennbar und werden nicht als bereits extern verfügbar behauptet. Auch bei geöffnetem Plugin müssen externe Änderungen erkannt und berücksichtigt werden; konkurrierende Änderungen dürfen nicht still überschrieben werden. Dies ist kein Versprechen konfliktfreier gleichzeitiger Schreibvorgänge oder eines verteilten Syncdienstes.

## Konsequenzen

Dateiformat, IDs, Referenzen, Zustände, Schemaversionen und relevante Fachregeln müssen als mitgelieferter Dateivertrag verständlich dokumentiert sein. Ein Agent darf den Bestand anhand dieses Vertrags anlegen und ändern. Abgeleitete Ansichten und Indizes dürfen verwendet werden, müssen aber aus dem Notizbestand rekonstruierbar sein. Originalanhänge bleiben als Originaldateien erhalten.

MCP bleibt eine optionale zusätzliche Schnittstelle. Der direkte Ordnerzugriff ist bereits MVP-Anforderung und darf nicht von [[F-19 - MCP Server]] abhängig gemacht werden. Dateizugriff wird durch den Nutzer und die Umgebung vergeben; interne UI-Kennzeichnungen sind keine Zugriffssperre für einen Agenten mit Dateirechten.

## Bezüge

[[F-22 - Offene Notizen und direkter Agentenzugriff]], [[PBI-41 - Vorgänge ohne Plugin und Obsidian nutzen]], [[PBI-42 - AI-Agent direkt mit den Notizen arbeiten lassen]], [[ACT-09 - AI-Agent mit direktem Dateizugriff]], [[DF-22 - Notizen als maßgeblicher Datenbestand]], [[DF-23 - Externe Bearbeitung ohne stilles Überschreiben]], [[Datenkonzept - Offene Notizen und Agentenzugriff]], [[FLOW-08 - Zwischen Plugin und direkter Dateibearbeitung wechseln]].
