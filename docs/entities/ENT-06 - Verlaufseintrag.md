---
type: Entity
id: ENT-06
status: entwurf
scope: mvp
---

# ENT-06 · Ereignis

## Zweck

Datierte Information über eine Handlung, Aussage oder Änderung im fachlichen Verlauf.

## Wesentliche fachliche Angaben

Ereignisdatum; Erfassungsdatum; Ereignisart; dokumentierter Akteur; tatsächlich erfassende Person; Inhalt; Quelle oder Quellenlücke; erkennbare Korrektur.

## Beziehungen

Wird dem betroffenen fachlichen Gegenstand zugeordnet und erklärt dessen Verlauf. Eine Versanddokumentation ist ein spezialisierter Ereignisfall; Quellen belegen die Aussage, sind aber nicht dasselbe wie das Ereignis.

[[ENT-02 - Person und Rolle]], [[ENT-04 - Vorgang]], [[ENT-05 - Termin]], [[ENT-07 - Quelle]], [[ENT-09 - Entscheidungskarte]], [[ENT-11 - Versanddokumentation]], [[ENT-13 - Eskalation]], [[ENT-16 - Beiratsbewertung]].

## Regeln und Lebenszyklus

Anfrage, Empfangsbestätigung, sachliche Antwort, neuer Termin, Teillieferung und Erfüllung bleiben unterscheidbar. Importdatum ersetzt kein Ereignisdatum. Unbekannte Zeiten werden nicht erfunden. Der Verlauf ist nachvollziehbar, aber nicht als manipulationssicher zugesichert.

## Modellierungsgrenze und offene Punkte

Ob ein Ereignis mehrere Punkte referenzieren kann und wie eine Korrektur gespeichert wird, ist noch nicht technisch festgelegt.

## Herkunft und Anforderungen

PRD 1.1: B-FR-05; DF-06/07/13/14.

[[PBI-11 - Nachricht und Original zuordnen]], [[PBI-12 - Verlauf nachvollziehen]], [[PBI-20 - Tatsächlichen Versand dokumentieren]].

[MVP-PRD](../02-MVP-PRD.md) · [[Product Backlog.base#Business Rules]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]].
