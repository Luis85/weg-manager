---
type: Entity
id: ENT-05
status: entwurf
scope: mvp
---

# ENT-05 · Termin

## Zweck

Zeitliche Aussage mit fachlicher Bedeutung, Herkunft und Prüfstand.

## Wesentliche fachliche Angaben

Datum und gegebenenfalls Uhrzeit/Zeitzone; Bedeutung wie Zusage, vertraglicher Termin, angegebene formelle Frist, gewünschter Antworttermin oder eigene Wiedervorlage; Herkunft; Prüfstand; bisherige und aktuell akzeptierte Fassung.

## Beziehungen

Gehört fachlich zum betroffenen Punkt oder zur eigenen Aufgabe. Ein Punkt kann unterschiedliche Terminarten und historische Terminangaben besitzen; Nachfassstand und Bewertung beziehen sich auf die jeweils relevante Fassung.

[[ENT-04 - Vorgang]], [[ENT-06 - Verlaufseintrag]], [[ENT-07 - Quelle]], [[ENT-12 - To-do]], [[ENT-13 - Eskalation]], [[ENT-16 - Beiratsbewertung]].

## Regeln und Lebenszyklus

Wiedervorlage verändert keine fremde Frist. Unbekannte Termine bleiben unbekannt. Datum ohne Uhrzeit gilt intern bis Tagesende Europe/Berlin; Überfälligkeit erscheint ab Folgetag. Ein neuer Termin erhält den bisherigen Verlauf und erledigt den Punkt nicht. Keine automatische rechtliche Fristprüfung.

## Modellierungsgrenze und offene Punkte

Ob Terminangaben eigene Datensätze oder Bestandteile des betroffenen Objekts sind, bleibt technisch offen.

## Herkunft und Anforderungen

PRD 1.1: B-FR-04/09; DF-03/04/05/06.

[[PBI-09 - Termin und Wiedervorlage trennen]], [[PBI-21 - Begründeten Eskalationsschritt prüfen]], [[PBI-23 - Reaktion richtig einordnen]].

[MVP-PRD](../02-MVP-PRD.md) · [[Product Backlog.base#Business Rules]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]].
