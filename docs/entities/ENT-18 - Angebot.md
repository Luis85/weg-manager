---
type: Entity
id: ENT-18
status: entwurf
scope: spaeter
---

# ENT-18 · Angebot

## Zweck

Fachlich vergleichbare Angebotsfassung eines Anbieters mit nachvollziehbarem Leistungs- und Quellenstand.

## Wesentliche fachliche Angaben

Anbieter; Gemeinschaft und fachlicher Kontext; Angebotsfassung; Leistungsbeschreibung beziehungsweise deren referenzierter Stand; Betrag in EUR; Termin; Ausschlüsse; Angebotsbindung; Quelle und vorhandenes Original; dokumentierte Auswahlbegründung.

## Beziehungen

Anbieter wird über [[ENT-02 - Person und Rolle]] beschrieben; Termine über [[ENT-05 - Termin]]. [[ENT-07 - Quelle]] und [[ENT-08 - Dokument]] belegen die Angebotsfassung. Zugehöriger Punkt oder Themenkontext verbindet das Angebot mit dem Anliegen. Eine bereits im System erstellte Anfrage ist keine Voraussetzung.

## Regeln und Lebenszyklus

Fehlende Werte bleiben unbekannt. Alte Leistungsstände werden sichtbar, frühere Originalfassungen nicht still ersetzt. Null, ein oder mehrere Angebote bleiben bearbeitbar; keine pauschale Mindestzahl und keine automatische Auswahl. Alternative Angebote werden nicht zu einer Auftragssumme addiert.

## Modellierungsgrenze und offene Punkte

Die Leistungsfassung ist vorerst ein Bestandteil beziehungsweise Referenzbedarf des Angebots, keine zusätzlich festgelegte Entität. Anfrage- und Auftragsmodell sowie endgültige Beziehung zum bisherigen Handwerkervorgang werden vor Umsetzung gesondert konkretisiert.

Die Note konkretisiert den späteren Ausbau und erweitert nicht den aktuellen MVP. Technische Speicherung und endgültiger Umfang bleiben offen.

## Herkunft und Anforderungen

PBI-38 und historisches PRD 1.0, FR-07. Der frühere operative Umfang ist weiterhin späterer Ausbau.

[[PBI-38 - Angebote fachlich vergleichen]].

**Business Rules:** [[DF-17 - Angebotsfassungen und Vergleich]].

[MVP-PRD](../02-MVP-PRD.md) · PRD 1.0 als historische Quelle (historische Quelle im Git-Commit `b3a1cc2`, Pfad `docs/history/02-MVP-PRD-v1.0.md`) · [[Product Backlog.base#Design Foundations|Entitätsnotes]].
