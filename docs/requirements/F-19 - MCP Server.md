---
type: Feature
parent: "[[E-07 - Cross Cutting Concerns]]"
order: 65000
status: ""
started: ""
finished: ""
horizon: ""
start: ""
due: ""
risk: ""
priority: ""
assignee: ""
iteration: ""
---

# F-19 · MCP Server

**Planungsstand:** Konzeptentwurf · **Umfang:** Später

## Fähigkeit und Ergebnis

Ein MCP Server soll geeigneten Clients einen ausdrücklich freigegebenen Zugang zu Daten und fachlichen Funktionen des WEG Managers ermöglichen. Dadurch können unterstützende Werkzeuge mit demselben fachlichen Stand arbeiten, ohne Regeln ausschließlich in einzelnen Prompts oder separaten Datenbeständen nachzubauen.

## Geplanter fachlicher Umfang

- Freigegebene Vorgänge, Quellenbezüge und Bearbeitungsstände im gewählten Gemeinschaftskontext bereitstellen.
- Unterstützende Clients können auf dieser Grundlage Wochenarbeit oder Folgeaktionen vorbereiten.
- Ob und welche Änderungen ein Client anstoßen darf, wird gesondert festgelegt. Ein Lesezugang erteilt keine Schreib- oder Versandberechtigung.

## Abnahmehinweise für späteres Refinement

- Freigegebener Client, Gemeinschaft und erlaubte Operationen sind erkennbar; nicht freigegebene Daten bleiben ausgeschlossen.
- Fachregeln für Termine, Entscheidungen, Vertraulichkeit und Datenerhalt gelten auch für Operationen über diese Schnittstelle.
- Herkunft und Urheber unterstützter Änderungen sind nachvollziehbar. Wiederholung einer freigegebenen Aktion erzeugt keine stillen Dubletten.
- Persönliche Entscheidung, Entwurf und tatsächlicher menschlicher Versand bleiben getrennt. Der MCP Server führt keinen automatischen Versand ein.
- Der lokale Kern bleibt ohne MCP-Client und ohne verpflichtende KI nutzbar.

## Offene Entscheidungen und User Stories

Noch keine eigenständigen PBIs: Vor ihrer Ableitung sind unterstützte Clients, konkrete Lese-/Schreibhandlungen, menschliche Bestätigung, Zugriffsmodell und lokale beziehungsweise entfernte Ausführung zu klären. Datenlesen und Änderungen sollen nach ihrem jeweiligen Nutzerergebnis geschnitten werden; eine bestimmte Toolliste, Laufzeit oder Anbieterbindung wird hier nicht festgeschrieben.

## Abgrenzung und Herkunft

[[F-18 - Integrationen]] umfasst Verbindungen zu externen Diensten wie Google Workspace. Der MCP Server ist die Schnittstelle zu WEG-Manager-Fähigkeiten und kann fachlich davon unabhängig geplant werden. Kosten- und Lauftransparenz wird bei tatsächlich angebotener kostenpflichtiger Assistenz konkretisiert; MCP allein begründet keine solche Kostenfunktion.

Quellen: Nutzerpräzisierung vom 15.11.2026 (eigenes Feature MCP Server), Pilot-PRD Architekturwunsch und bisheriger F-18-Kandidat KI-/MCP-Unterstützung. Die Aufnahme ins Backlog hebt die fehlende MVP-Pflicht zu MCP aus [[K-10 - Manuelle Quellenübernahme und Registerimport vorsehen]] nicht auf.

## Verhältnis zum direkten Dateizugriff

[[F-22 - Offene Notizen und direkter Agentenzugriff]] ist bereits MVP-Grundlage: Ein freigegebener Agent kann dieselben Markdown-/Frontmatter-Notizen ohne Plugin, Obsidian und MCP lesen und bearbeiten. Dieses spätere MCP-Feature ist eine zusätzliche Schnittstelle, kein exklusiver Zugang zum Datenmodell. Es darf weder eine zweite maßgebliche Datenquelle schaffen noch den offenen Dateivertrag ersetzen. Grundlage: [[K-14 - Markdown und Frontmatter als offene Datengrundlage]].
