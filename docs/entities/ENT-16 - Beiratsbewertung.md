---
type: Entity
id: ENT-16
status: entwurf
scope: mvp
---

# ENT-16 · Beiratsbewertung

## Zweck

Bewusst dokumentierte interne Einschätzung zu einer konkreten Zusage und ihrem Verlauf.

## Wesentliche fachliche Angaben

Bewertung wie nicht eingehalten; Begründung; betroffener Punkt und Zusage-/Terminversion; vorhandene Quellen; bewertende Person und Zeitpunkt als nachvollziehbare Änderung.

## Beziehungen

Bezieht sich auf die konkrete Aussage beziehungsweise Terminversion eines Punkts. Frühere Bewertungen bleiben bei neuem Termin nachvollziehbar. Die Verwendung in einer Ausgabe benötigt eine passende bewusste Prüfung.

[[ENT-04 - Vorgang]], [[ENT-05 - Termin]], [[ENT-06 - Verlaufseintrag]], [[ENT-07 - Quelle]], [[ENT-15 - Ausgabestand]].

## Regeln und Lebenszyklus

Überfälligkeit darf als Hinweis berechnet werden, die Bewertung setzt der Beirat bewusst. Bewertung erledigt den Punkt nicht und ist keine automatische rechtliche Tatsachenfeststellung. Interne Bewertungen werden nicht pauschal extern geteilt.

## Modellierungsgrenze und offene Punkte

Ob Bewertungen als eigene Objekte oder strukturierte Verlaufseinträge geführt werden, ist offen. Die separate Note macht die fachliche Bedeutung unterscheidbar.

## Herkunft und Anforderungen

PRD 1.1: B-FR-03/11; DF-02/11.

[[PBI-08 - Bearbeitungsstand bewusst ändern]], [[PBI-12 - Verlauf nachvollziehen]], [[PBI-28 - Empfängerbezogene Ausgabe prüfen]].

[MVP-PRD](../02-MVP-PRD.md) · [[Product Backlog.base#Business Rules]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]].
