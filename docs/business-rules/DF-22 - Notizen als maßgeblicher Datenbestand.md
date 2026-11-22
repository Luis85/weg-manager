---
type: BusinessRule
id: DF-22
status: entwurf
scope: mvp
---

# DF-22 · Notizen als maßgeblicher Datenbestand

## Regel

Gespeicherte fachliche Daten sind im Markdown-/Frontmatter-Notizbestand maßgeblich. Kein ausschließlich plugininterner Index, Cache, Obsidian-Workspacezustand oder externer Dienst darf die einzige Quelle einer fachlich notwendigen Information sein. Jeder Vorgang besitzt einen lesbaren Kontext; Beziehungen und Anhänge sind anhand dokumentierter Dateiangaben beziehungsweise IDs ohne Obsidian rekonstruierbar.

Das Speichern bestätigter Bearbeitung aktualisiert den normalen Notizbestand, nicht erst einen späteren Export. Ein technischer Cache darf fehlen oder neu aufgebaut werden, ohne Fachinformationen zu verlieren. Noch ungespeicherte Eingaben bleiben als Entwurf unterscheidbar. Der Dateivertrag beschreibt sowohl lesbare Inhalte als auch zulässige Schreiboperationen und die dafür geltenden Fachregeln.

## Abnahmeanker

Vorgang mit Aufgabe, Termin, Quelle und Original anlegen; Plugin und Obsidian schließen. Ein normaler Editor und ein freigegebener Agent können Kontext und Beziehungen anhand derselben Dateien nachvollziehen. Eine vertragskonforme Änderung ist ohne Export oder MCP möglich und wird beim nächsten Öffnen des Plugins korrekt berücksichtigt. Ein entfernter abgeleiteter Cache lässt sich aus den Notizen neu aufbauen.

## Herkunft und Geltung

Direkte Produktvorgabe [[K-14 - Markdown und Frontmatter als offene Datengrundlage]], MVP-Anforderung in [[F-22 - Offene Notizen und direkter Agentenzugriff]] und [[F-21 - Nichtfunktionale Anforderungen]]. Vorgeschlagener Abnahmefall, keine bereits geprüfte Implementierung.
