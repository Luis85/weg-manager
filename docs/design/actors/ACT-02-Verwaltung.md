---
type: Actor
kind: Human
---

# Ansprechpartner der Verwaltung

**Einordnung im MVP:** Indirekter externer Beteiligter.

## Ziel

Anliegen erhalten, Rückfragen beantworten und Zusagen sowie Unterlagen bereitstellen.

## Interaktion

Erhält vom Beirat geprüfte Nachrichten über vorhandene Kommunikationswege. Liefert Antworten, Termine, Angebote, Protokolle oder andere Nachweise. Der Beirat dokumentiert diese Aussagen mit Quelle und Datum im System.

## Systemgrenze und Einschränkungen

Gemeint ist die handelnde Person bei der Verwaltung, nicht ein Verwaltungssystem. Kein eigener Pluginzugang und kein Zugriff auf interne Beiratsbewertungen. Eine erfasste Aussage ist keine authentifizierte Anmeldung dieses Akteurs.

## Anforderungen

[[docs/requirements/PBI-11 - Nachricht und Original zuordnen|PBI-11 · Nachricht und Original zuordnen]], [[docs/requirements/PBI-12 - Verlauf nachvollziehen|PBI-12 · Ereignisse nachvollziehen]], [[docs/requirements/PBI-18 - Nachrichten je Gemeinschaft bündeln|PBI-18 · Nachrichten je Gemeinschaft bündeln]], [[docs/requirements/PBI-20 - Tatsächlichen Versand dokumentieren|PBI-20 · Tatsächlichen Versand dokumentieren]], [[docs/requirements/PBI-21 - Begründeten Eskalationsschritt prüfen|PBI-21 · Begründeten Nachfassschritt prüfen]], [[docs/requirements/PBI-23 - Reaktion richtig einordnen|PBI-23 · Reaktion richtig einordnen]], [[docs/requirements/PBI-28 - Empfängerbezogene Ausgabe prüfen|PBI-28 · Empfängerbezogene Ausgabe prüfen]].

Grundlage: [MVP-PRD 1.1](../../02-MVP-PRD.md) und Intake-Abgleich (historische Quelle im Git-Commit `b3a1cc2`, Pfad `docs/03-Intake-Abgleich.md`).

## Abgrenzung zur späteren Verwalterpersona

[[ACT-08 - Wohnungsverwalter]] beschreibt eine mögliche direkte operative Nutzung des Produkts. Diese kann dieselbe reale Person betreffen, ist aber ein anderer Nutzungskontext als das hier dokumentierte externe Gegenüber des Beirats. Der erste MVP-Zugang und die aktuellen User Stories bleiben unverändert. Erste Rollenuntersuchung: [[Persona-Research - Wohnungsverwalter]].
