---
type: Entity
id: ENT-12
status: entwurf
scope: mvp
---

# ENT-12 · Eigene Aufgabe

## Zweck

Konkret ausführbarer eigener Arbeitsschritt, getrennt von einer fremden Zusage.

## Wesentliche fachliche Angaben

Handlung; Gemeinschaft; optionaler Punktbezug; Verantwortlicher; Zustand; Fälligkeit beziehungsweise Wiedervorlage; bei Warten ein Grund; bei Entfallen ein Grund; gegebenenfalls Entscheidung und Entwurfsbezug.

## Beziehungen

Gehört genau einer Gemeinschaft und kann ohne Punktbezug geführt werden. Eine Arbeitsentscheidung kann Folgeaufgaben erzeugen; die Aufgabe verweist auf ihren fachlichen Anlass.

[[ENT-01 - Gemeinschaft]], [[ENT-02 - Person und Rolle]], [[ENT-04 - Vorgang]], [[ENT-05 - Termin]], [[ENT-09 - Entscheidungskarte]], [[ENT-10 - Nachrichtenentwurf]].

## Regeln und Lebenszyklus

Zustände: offen, in Arbeit, wartet, erledigt, entfallen. Erledigung einer Versand- oder Prüfaufgabe erfüllt keine fremde Zusage. Wiederholte Entscheidungsvorbereitung erzeugt keine doppelte Aufgabe.

## Modellierungsgrenze und offene Punkte

Punkt der Art eigene Aufgabe und verknüpfte Folgeaufgabe müssen in der späteren Modellierung ohne doppelte Pflege zusammenpassen; keine zweite Datenstruktur allein aus zwei Begriffen ableiten.

## Herkunft und Anforderungen

PRD 1.1: B-FR-04/07; DF-04/06/07.

[[PBI-10 - Eigenes To-do nachhalten]], [[PBI-17 - Folgearbeit aus Entscheidungen vorbereiten]].

[MVP-PRD](../02-MVP-PRD.md) · [[Product Backlog.base#Business Rules]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]].
