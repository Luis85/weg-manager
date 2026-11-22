---
type: Actor
kind: System
id: ACT-09
status: entwurf
scope: mvp
---

# AI-Agent mit direktem Dateizugriff

## Ziel und Interaktion

Ein vom Nutzer gewählter externer AI-Agent liest den freigegebenen Vault beziehungsweise Ordner, erfasst den fachlichen Kontext aus Markdown, YAML-Frontmatter und dokumentierten Beziehungen und bearbeitet erlaubte Notizen direkt. Das Plugin muss dazu nicht laufen; Obsidian oder MCP sind keine Voraussetzung.

Der Agent kann innerhalb der Nutzerfreigabe beispielsweise Vorgänge, Quellenbezüge, To-dos und vorbereitete Texte anlegen oder ändern. Er folgt dem mitgelieferten Notizvertrag und den Fachregeln; unbekannte Zusatzfelder und nicht betroffene Inhalte bleiben erhalten. Angegebene Urheberschaft ist Dokumentation, keine technisch authentifizierte Identität allein durch ein Frontmatter-Feld.

## Grenze

Dies ist kein eingebauter Agentendienst und kein automatisch freigegebener Cloudzugang. Die konkrete Agentensoftware, deren Dateirechte und eine mögliche Übertragung an einen Modelldienst werden vom Nutzer gewählt. Das Plugin überträgt dafür nicht selbst automatisch Akten. Es kann direkte Dateischreibrechte außerhalb seiner Oberfläche nicht durch UI-Rollen kontrollieren.

Ein Schreibvorgang erzeugt keine tatsächlich erfolgte menschliche Bestätigung, Sendung, Beauftragung oder Zahlung. Bereits erfolgte externe Handlungen können mit ihrer tatsächlichen Quelle dokumentiert werden; der Agent darf deren Verlaufseinträge nicht aus bloßem Speichern ableiten. Mensch und Agent können denselben Bestand bearbeiten; bei konkurrierenden Änderungen gelten Erhalt und erkennbare Klärung statt stiller Überschreibung.

## Anforderungen

[[F-22 - Offene Notizen und direkter Agentenzugriff]], [[PBI-41 - Vorgänge ohne Plugin und Obsidian nutzen]], [[PBI-42 - AI-Agent direkt mit den Notizen arbeiten lassen]], [[PBI-31 - Konflikte ohne Datenverlust klären]], [[F-21 - Nichtfunktionale Anforderungen]].

## Grundlagen

[[K-14 - Markdown und Frontmatter als offene Datengrundlage]], [[Datenkonzept - Offene Notizen und Agentenzugriff]], [[DF-22 - Notizen als maßgeblicher Datenbestand]], [[DF-23 - Externe Bearbeitung ohne stilles Überschreiben]]. Der eigene spätere [[F-19 - MCP Server]] ist hierfür nicht erforderlich. Die externe Verwalterrolle oder ein Mehrbenutzerportal entsteht dadurch ebenfalls nicht.

## Konkrete Laufzeit für den nativen Chat

[[ACT-11 - Offizielle Claude-Code-Laufzeit]] konkretisiert einen möglichen direkten Ausführungspartner von [[F-23 - Nativer AI-Chat]]. Der allgemeine Agentenzugriff oben bleibt von dieser optionalen Chatoberfläche unabhängig. Es entsteht kein eigener gehosteter Agentendienst und keine automatische Übernahme von Konto-/Connectorrechten.
