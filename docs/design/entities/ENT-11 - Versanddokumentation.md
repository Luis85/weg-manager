---
type: Entity
id: ENT-11
status: entwurf
scope: mvp
---

# ENT-11 · Versanddokumentation

## Zweck

Ausdrücklich erfasster tatsächlicher menschlicher Versand einer bestimmten Nachricht.

## Wesentliche fachliche Angaben

Versanddatum; dokumentierte Empfänger; tatsächlich versandte Fassung; Gemeinschaft und betroffene Anliegen; Erfassung beziehungsweise Korrekturvermerk.

## Beziehungen

Spezialisierter fachlicher Ereignisfall mit Bezug auf die versandte Nachricht. Kann einen Zeitanker für interne Nachverfolgung liefern. Begründet keine zweite, unabhängig zu pflegende Kopie des Verlaufs.

[[ENT-06 - Ereignis]], [[ENT-10 - Nachrichtenentwurf]], [[ENT-13 - Nachfassstand]].

## Regeln und Lebenszyklus

Nur eine ausdrückliche Nutzeraktion dokumentiert den tatsächlichen Versand. Versand bestätigt weder Zustellung noch Antwort oder Erfüllung. Eine Korrektur des lokalen Eintrags ruft die Nachricht nicht zurück.

## Modellierungsgrenze und offene Punkte

Ob die Versanddokumentation als Ereignisart oder eigener Datensatz umgesetzt wird, bleibt offen.

## Herkunft und Anforderungen

PRD 1.1: B-FR-08/09; DF-05/07.

[[PBI-20 - Tatsächlichen Versand dokumentieren]], [[PBI-21 - Begründeten Nachfassschritt prüfen]].

[MVP-PRD](../../02-MVP-PRD.md) · [[Product Backlog.base#Business Rules]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]].

## Erweiterung für den geplanten Gmail-Versand

[[PBI-44 - Geprüfte E-Mails über Gmail versenden]] kann später zusätzlich zur manuellen Erfassung einen Dienstnachweis nach ausdrücklicher menschlicher Versandaktion liefern. Herkunft des Nachweises, Dienstreferenz und bekannter Ergebnisstand müssen vom manuellen Eintrag sowie von Zustellung/Lesen unterscheidbar bleiben. Ein unklarer Ausgang wird nicht in Erfolg umgedeutet. Details nach [[DF-24 - Bestätigter Dienstversand und unklarer Ausgang]]; kein bereits bestehendes Integrationsschema.
