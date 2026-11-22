---
type: Entity
id: ENT-04
status: entwurf
scope: mvp
---

# ENT-04 · Punkt

## Zweck

Einzeln nachverfolgbares und erledigbares Anliegen mit genau einem überprüfbaren Ergebnis.

## Wesentliche fachliche Angaben

Beständige Referenz; Gemeinschaft; Art wie Zusage, Frage oder eigene Aufgabe; optionales Thema; erwartetes Ergebnis; Verantwortlichkeit; Quellen oder sichtbare Quellenlücke; Bearbeitungsstand; nächster Schritt; Herkunft aus Import, Aufteilung oder Zusammenführung.

## Beziehungen

Gehört genau einer Gemeinschaft. Verbindet Termine, Verlauf und Quellen; kann in Arbeitsentscheidungen und eigenen Folgeaufgaben referenziert werden. Herkunfts- und Zielverweise verbinden aufgeteilte oder zusammengeführte Punkte.

[[ENT-01 - Gemeinschaft]], [[ENT-02 - Person und Rolle]], [[ENT-03 - Thema]], [[ENT-05 - Termin]], [[ENT-06 - Verlaufseintrag]], [[ENT-07 - Quelle]], [[ENT-09 - Entscheidungskarte]], [[ENT-12 - To-do]], [[ENT-13 - Eskalation]], [[ENT-16 - Beiratsbewertung]].

## Regeln und Lebenszyklus

Bearbeitungsstände sind offen, ungeklärt, erledigt und hinfällig. Aufgeteilt/zusammengeführt kennzeichnet Herkunft, überfällig/Termin erfragen sind Prüfmerkmale. Nicht eingehalten ist eine getrennte menschliche Bewertung. Abschluss braucht nachvollziehbaren Anlass; Teilerfüllung und neuer Termin erledigen nicht automatisch den Punkt.

## Modellierungsgrenze und offene Punkte

Bei einem Punkt der Art eigene Aufgabe und einer eigenen Folgeaufgabe ist Doppelpflege zu vermeiden. Die spätere Modellierung muss klären, ob dieselbe Aufgabe als Punkt dargestellt oder separat verknüpft wird; es besteht keine Pflicht zu zwei Datensätzen.

## Herkunft und Anforderungen

PRD 1.1: B-FR-03/04; DF-02/04/06/12/13.

[[PBI-05 - Einen Vorgang erfassen und wiederfinden]], [[PBI-06 - Sammelvorgänge aufteilen]], [[PBI-07 - Dubletten zusammenführen]], [[PBI-08 - Bearbeitungsstand bewusst ändern]], [[PBI-09 - Termin und Wiedervorlage trennen]], [[PBI-10 - Eigenes To-do nachhalten]].

[MVP-PRD](../02-MVP-PRD.md) · [[Product Backlog.base#Business Rules]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]].
