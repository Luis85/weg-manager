---
type: Entity
id: ENT-01
status: entwurf
scope: mvp
---

# ENT-01 · Gemeinschaft

## Zweck

Eindeutiger fachlicher Kontext für WEG beziehungsweise Tiefgarage.

## Wesentliche fachliche Angaben

Bezeichnung und Kurzname; eindeutiges, änderbares Kürzel zur Unterscheidung (Verweise laufen über die `id`, [[PBI-73 - Kürzel einer Gemeinschaft nachträglich ändern]]); Farbe; Art aus einer editierbaren Liste mit Einheitenbezeichnung (z. B. Einheiten, Stellplätze) und Anzahl; Anschrift; Sprachen der Eigentümer-Infos; dokumentierte Ansprechpartner und deren Rollen; bekannte Organisationsangaben, ohne eine Rechtsform aus Name oder Art abzuleiten.

## Beziehungen

Punkt, Thema, Arbeitsentscheidung, Nachricht und einzelne Berichtsauswahl gehören jeweils genau einer Gemeinschaft. Eine Gesamtlage oder Wochenübergabe darf beide Kontexte klar getrennt darstellen.

[[ENT-02 - Ansprechpartner]], [[ENT-03 - Thema]], [[ENT-04 - Punkt]], [[ENT-09 - Arbeitsentscheidung]], [[ENT-10 - Nachrichtenentwurf]], [[ENT-15 - Ausgabestand]].

## Regeln und Lebenszyklus

Mindestens zwei Gemeinschaften sind nutzbar. Gleiche Titel, Kontakte oder Verwaltung begründen keine Zusammenführung. Ein Gemeinschaftskontext ist kein Benutzerkonto.

## Modellierungsgrenze und offene Punkte

Konkrete Organisationsform und Zuständigkeiten der Tiefgarage sind unter O-05 offen.

## Herkunft und Anforderungen

PRD 1.1: B-FR-01; DF-12.

[[PBI-01 - Gemeinschaftskontext wählen]], [[PBI-02 - Ansprechpartner zuordnen]].

[MVP-PRD](../../02-MVP-PRD.md) · [[Product Backlog.base#Business Rules]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]].
