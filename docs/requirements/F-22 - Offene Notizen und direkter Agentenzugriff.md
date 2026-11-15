---
type: Feature
parent: "[[E-07 - Cross Cutting Concerns]]"
order: 66000
release: "[[MVP - Beirat Support]]"
---

# F-22 · Offene Notizen und direkter Agentenzugriff

**Planungsstand:** Konzeptentwurf auf Basis einer festgelegten Produktvorgabe · **Umfang:** MVP

## Fähigkeit und Ergebnis

Nutzer behalten ihre Vorgänge unabhängig vom Plugin und Obsidian und können einem externen AI-Agent direkten, freigegebenen Lese-/Schreibzugriff auf die Notizen geben. Markdown und dokumentiertes YAML-Frontmatter bilden die offene Dateischnittstelle; sie ist kein Exportformat und setzt keinen MCP Server voraus.

## User Stories

- [[PBI-41 - Vorgänge ohne Plugin und Obsidian nutzen]]
- [[PBI-42 - AI-Agent direkt mit den Notizen arbeiten lassen]]

## Abgrenzung

[[F-12 - Daten erhalten und selbstständig starten]] bleibt für Einstieg, Sicherung und Konfliktklärung zuständig. Dieses Querschnittsfeature ergänzt ausdrücklich die werkzeugunabhängige Datenbasis und die unterstützte externe Bearbeitung. [[F-19 - MCP Server]] bietet erst später eine optionale weitere Schnittstelle; weder dessen Umsetzung noch ein laufender Obsidian-Prozess ist eine Zugangsvoraussetzung.

Fachliche Daten liegen in Notizen; binäre Originalanhänge bleiben unveränderte Dateien. Kein Bank-/Versandautomat, kein eigener Agentenhost und keine Mehrpersonen-/Cloud-Synchronisation werden daraus abgeleitet. Technische Mechanismen werden erst später entworfen; der offene, konsistente Dateizugang ist bereits jetzt verbindliches Produktziel.

## Abnahme und Grundlagen

[[K-14 - Markdown und Frontmatter als offene Datengrundlage]], [[DF-22 - Notizen als maßgeblicher Datenbestand]], [[DF-23 - Externe Bearbeitung ohne stilles Überschreiben]], [[Datenkonzept - Offene Notizen und Agentenzugriff]] und B-NFR-10/13/14 in [[F-21 - Nichtfunktionale Anforderungen]]. Ein Wechsel zwischen Plugin und externem Werkzeug muss ohne Export/Import-Rundreise möglich sein.
