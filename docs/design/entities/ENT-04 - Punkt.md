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

[[ENT-01 - Gemeinschaft]], [[ENT-02 - Ansprechpartner]], [[ENT-03 - Thema]], [[ENT-05 - Termin]], [[ENT-06 - Ereignis]], [[ENT-07 - Quelle]], [[ENT-09 - Arbeitsentscheidung]], [[ENT-12 - Eigene Aufgabe]], [[ENT-13 - Nachfassstand]], [[ENT-16 - Beiratsbewertung]].

## Regeln und Lebenszyklus

Bearbeitungsstände sind offen, ungeklärt, erledigt und hinfällig. Aufgeteilt/zusammengeführt kennzeichnet Herkunft, überfällig/Termin erfragen sind Prüfmerkmale. Nicht eingehalten ist eine getrennte menschliche Bewertung. Abschluss braucht nachvollziehbaren Anlass; Teilerfüllung und neuer Termin erledigen nicht automatisch den Punkt.

## Modellierungsgrenze und offene Punkte

Bei einem Punkt der Art eigene Aufgabe und einer eigenen Folgeaufgabe ist Doppelpflege zu vermeiden. Die spätere Modellierung muss klären, ob dieselbe Aufgabe als Punkt dargestellt oder separat verknüpft wird; es besteht keine Pflicht zu zwei Datensätzen.

## Herkunft und Anforderungen

PRD 1.1: B-FR-03/04; DF-02/04/06/12/13.

[[PBI-05 - Einen Punkt erfassen und wiederfinden]], [[PBI-06 - Sammelpunkte aufteilen]], [[PBI-07 - Dubletten zusammenführen]], [[PBI-08 - Bearbeitungsstand bewusst ändern]], [[PBI-09 - Termin und Wiedervorlage trennen]], [[PBI-10 - Eigene Folgeaufgabe nachhalten]].

[MVP-PRD](../../02-MVP-PRD.md) · [[Product Backlog.base#Business Rules]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]].
