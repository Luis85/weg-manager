---
type: Feature
parent: "[[E-07 - Cross Cutting Concerns]]"
order: 78000
release: "[[MVP - Beirat Support]]"
---

# F-24 · Technische Plugin-Grundlagen

**Planungsstand:** Angelegt am 21.11.2026 auf Entscheidung des Produktverantwortlichen · **Umfang:** Querschnitt, Grundlage für alle Fachfeatures

## Fähigkeit und Ergebnis

Das Plugin verhält sich im Alltag verlässlich, auch wenn Obsidian Sync, mehrere Geräte oder externe Werkzeuge im Spiel sind. Einstellungen und Notizen werden nicht still überschrieben, jede Einstellung hat genau einen Bearbeitungsort, und Fachfeatures erfahren von Änderungen im Vault, ohne selbst auf Obsidian-Ereignisse zuzugreifen.

## User Stories

- [[PBI-48 - Externe Änderungen an den Einstellungen übernehmen]]
- [[PBI-49 - Eine Einstellung hat genau einen Bearbeitungsort]]
- [[PBI-50 - Grundlage für Vault-Ereignisse und Indexierung]]
- [[PBI-51 - Plugin-Code in Module gliedern]]
- [[PBI-52 - Notizspeicher für Vault-Notizen bereitstellen]]
- [[PBI-53 - Notizformat mit Schemaversion lesen und schreiben]]
- [[PBI-54 - Index der Notizen aufbauen und aktuell halten]]
- [[PBI-55 - Navigation und App-Rahmen der Plugin-Ansicht bereitstellen]]
- [[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]]
- [[PBI-57 - Einstellungen schemagesteuert lesen und migrieren]]
- [[PBI-58 - CI und Abhängigkeiten gepflegt halten]]
- [[PBI-59 - Entwicklerdokumentation an die neue Architektur anpassen]]

## Abgrenzung

[[F-21 - Nichtfunktionale Anforderungen]] bleibt die Quelle der Qualitätsanforderungen (B-NFR-02, B-NFR-11, B-NFR-12, B-NFR-14). Dieses Feature bündelt die technischen Schritte, die sie im Plugin umsetzen, damit F-21 keine rein technischen User Stories führen muss. Die Architektur dazu steht in `docs/engineering/architecture.md` und in den ADRs unter `docs/adr/`.

## Herkunft

Code-Review und Best-Practice-Recherche der Plugin-Shell vom 21.11.2026 ([[Plugin research - Obsidian best practices]]). Die drei PBIs wurden zuerst unter F-21 angelegt und am selben Tag hierher verschoben.
