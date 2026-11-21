---
type: Epic
parent:
order: 62500
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

# E-07 · Cross Cutting Concerns

**Planungsstand:** Konzeptentwurf · **Umfang:** Querschnitt; F-21, F-22, F-23 und der Skill-Eingang in F-18 gelten für den MVP; übrige F-18-Funktionen und F-19 sind spätere Ausbaustufen

## Ziel

Gemeinsam benötigte technische Fähigkeiten und nichtfunktionale Anforderungen werden an einer Stelle gepflegt, damit mehrere fachliche Abläufe dieselben kontrollierten Anbindungen, Schnittstellen und Qualitätsmaßstäbe nutzen können.

## Enthaltene Fähigkeiten und Qualitätsanforderungen

- [[F-24 - Technische Plugin-Grundlagen]] — Verlässliches Plugin-Verhalten bei Sync und externen Änderungen, ein Bearbeitungsort je Einstellung, Vault-Ereignisse für Fachfeatures; technische Umsetzung von F-21.

- [[F-23 - Nativer AI-Chat]] — Chat im Plugin über offizielle Claude-Code-Laufzeit und berechtigte Nutzer-Subscription; geplanter MVP-Zusatz, Integrationsnachweis offen.

- [[F-22 - Offene Notizen und direkter Agentenzugriff]] — Maßgebliche Markdown-/Frontmatter-Dateien und direkter Lese-/Schreibzugriff ohne Obsidian oder MCP; MVP.

- [[F-21 - Nichtfunktionale Anforderungen|F-21 · Nichtfunktionale Anforderungen]] — B-NFR-01 bis B-NFR-14 einschließlich Prüfziele und Referenzprofil; gilt bereits für den MVP.

- [[F-18 - Integrationen|F-18 · Integrationen]] — Anbindungen an externe Dienste, ausdrücklich auch Google Workspace.
- [[F-19 - MCP Server|F-19 · MCP Server]] — Kontrollierter Zugriff geeigneter Clients auf freigegebene Daten und fachliche Funktionen des WEG Managers.

## Schnitt und Geltung

Dieses Epic ist die vom Produktverantwortlichen gewünschte Ausnahme zum sonstigen Zuschnitt nach fachlichen Nutzerzielen. Features beschreiben wiederverwendbare Fähigkeiten; spätere PBIs bleiben User Stories mit konkret prüfbarem Nutzen. Ein externer Dienst ist ein Integrationsziel, kein zusätzliches Hierarchielevel.

Die Zuordnung zum Epic bestimmt keinen Release. Die direkten Google-Versand-/Drive-Anbindungen und der MCP Server bleiben spätere Ausbaustufen. PBI-46 ergänzt den MVP um einen optional nutzbaren Gmail-Eingang über den bestehenden Claude-Connector; der lokale Kern bleibt ohne KI und Verbindung nutzbar. Nichtfunktionale Anforderungen werden organisatorisch unter F-21 in diesem Epic geführt und gelten weiterhin querschnittlich für den MVP. Ihre fachliche Geltung hängt nicht vom Eltern-Epic des betroffenen PBI ab.

Fachliche Mehrpersonenarbeit und ein optionales Dienstangebot werden separat unter [[F-20 - Zusammenarbeit und Onlinedienst]] gepflegt. Ein MCP-Zugang ersetzt weder dieses Rollenmodell noch eine Google-Workspace-Anbindung.

## Herkunft

Produktvorgabe zur Backlog-Struktur vom 15.11.2026: Cross Cutting Concerns mit Integrationen einschließlich Google Workspace und einem eigenen Feature MCP Server; anschließend ergänzt um nichtfunktionale Anforderungen als F-21. Grundlage für die bestehenden Grenzen: [[02-MVP-PRD]] und 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`).
