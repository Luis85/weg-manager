---
type: Entity
id: ENT-14
status: entwurf
scope: mvp
---

# ENT-14 · Wochenübergabe

## Zweck

Gespeicherter Anknüpfungspunkt für die nächste eigene Wochenarbeit oder den Lagecheck.

## Wesentliche fachliche Angaben

Zeitpunkt; bestätigter Bearbeitungsstand; bis zu drei Schwerpunkte; Kontextnotiz; eindeutige Gemeinschafts- und Punktbezüge oder konkret benannter neuer Bedarf.

## Beziehungen

Kann Schwerpunkte beider Gemeinschaften enthalten, wenn deren Zugehörigkeit erkennbar bleibt. Wird in Wochenansicht und Lagecheck als letzte bestätigte Übergabe angezeigt.

[[ENT-01 - Gemeinschaft]], [[ENT-04 - Punkt]], [[ENT-09 - Arbeitsentscheidung]].

## Regeln und Lebenszyklus

Ändert weder fachliche Fristen noch Bearbeitungsstände unbemerkt. Neue dringende Ereignisse dürfen durch alte Schwerpunkte nicht verdrängt werden.

## Modellierungsgrenze und offene Punkte

Nicht mit der Ausgabe an eine Vertretung verwechseln: Diese wird als empfängerbezogener Ausgabestand beschrieben. Konkrete Speicherung und spätere Übergabeversionen sind technisch offen.

## Herkunft und Anforderungen

PRD 1.1: B-FR-10; DF-09/12.

[[PBI-24 - Zwischendurch Dringlichkeit prüfen]], [[PBI-25 - Nächste Wochenarbeit vorbereiten]].

[MVP-PRD](../../02-MVP-PRD.md) · [[Product Backlog.base#Business Rules]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]].
