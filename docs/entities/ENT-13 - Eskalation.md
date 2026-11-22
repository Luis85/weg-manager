---
type: Entity
id: ENT-13
status: entwurf
scope: mvp
---

# ENT-13 · Nachfassstand

## Zweck

Nachvollziehbarer Stand der Nachverfolgung einer Verwaltungszusage.

## Wesentliche fachliche Angaben

Betroffener Punkt; bekannte tatsächlich erfolgte Schritte und Zeitpunkte; dokumentierter Versand; geltender Termin; bekannte Reaktion; begründeter nächster Stufenvorschlag; bewusste Freigabe; gegebenenfalls Pause mit Grund und Ende.

## Beziehungen

Bezieht sich auf den einzelnen Punkt. Ein gemeinschaftsbezogenes Nachfasspaket bündelt mehrere Punkte, erhält aber deren individuelle Schritte und Ausnahmen.

[[ENT-04 - Vorgang]], [[ENT-05 - Termin]], [[ENT-06 - Verlaufseintrag]], [[ENT-09 - Entscheidungskarte]], [[ENT-11 - Versanddokumentation]].

## Regeln und Lebenszyklus

Wöchentliches Prüfen vollzieht keine automatische Stufe. Laufende kommunizierte Fristen bleiben maßgeblich. Neuer akzeptierter Termin beendet aktuelles Terminnachfragen, nicht den Punkt. Nach Pause oder erneutem Verzug erfolgt erneute Prüfung statt Mehrfachhochsetzung.

## Modellierungsgrenze und offene Punkte

Welche Teile aus Ereignissen berechnet und welche bewusst gespeichert werden, ist offen. Der Nachfassstand ist keine rechtliche Sanktion.

## Herkunft und Anforderungen

PRD 1.1: B-FR-09; DF-03/04/05/06/08.

[[PBI-21 - Begründeten Eskalationsschritt prüfen]], [[PBI-22 - Eskalationen begrenzen oder aussetzen]], [[PBI-23 - Reaktion richtig einordnen]].

[MVP-PRD](../02-MVP-PRD.md) · [[Product Backlog.base#Business Rules]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]].
