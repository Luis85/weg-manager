---
type: Entity
id: ENT-14
status: entwurf
scope: mvp
category: bewegungsdaten
wcs: v1
date: 2026-11-22
---

# ENT-14 · Übergabe

## Zweck

Der Abschluss einer Wochenarbeit oder eines Lagechecks: bis zu drei Schwerpunkte und eine Notiz. Die Übergabe ist der gespeicherte Anknüpfungspunkt für den nächsten Lauf.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `handover-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. |
| Schema | `schema` | Text | P | `weg-manager.handover/v1` (vorgeschlagen). |
| Am | `ended_on` | Datum | P | WCS `am`. Ende der Stunde. |
| Ablauf | `flow` | Text | P | WCS `ablauf`: `week` oder `situation_check` (siehe Wertelisten). |
| Schwerpunkte | `focus` | Liste | P | WCS `schwerpunkte`. Höchstens drei Einträge; Startpunkte des nächsten Laufs. |
| Bezüge der Schwerpunkte | `matter_ids`, `community_ids` | Liste | O | Unsere Ergänzung: eindeutige Gemeinschafts- und Vorgangsbezüge oder ein konkret benannter neuer Bedarf. |
| Notiz | Body | Text | P | WCS `notiz`. Freitext, auch Feedback an den Entwickler. |
| Bestätigter Stand | `confirmed` | Checkbox | O | Unsere Ergänzung: Der Beirat hat die Übergabe bestätigt. |

## Wertelisten

**Ablauf (geschlossen, WCS):** Woche (`week`), Lagecheck (`situation_check`).

## Beziehungen

Kann Schwerpunkte mehrerer Gemeinschaften enthalten, wenn ihre Zugehörigkeit erkennbar bleibt. Wird in Wochenarbeit und Lagecheck als letzte bestätigte Übergabe angezeigt. Feedback in der Notiz kann zu einem Produktfeedback werden.

[[ENT-01 - Gemeinschaft]], [[ENT-04 - Vorgang]], [[ENT-09 - Entscheidungskarte]], [[ENT-12 - To-do]], [[ENT-15 - Ausgabestand]], [[ENT-17 - Produktfeedback]].

## Regeln und Lebenszyklus

- Höchstens drei Schwerpunkte (WCS FR-W8, B-FR-10).
- Die Übergabe ändert weder fachliche Fristen noch Bearbeitungsstände unbemerkt.
- Neue dringende Verlaufseinträge werden durch alte Schwerpunkte nicht verdrängt ([[DF-09 - Begrenzte Auswahl und Dringlichkeit]]).
- Die jüngste bestätigte Übergabe ist der Start des nächsten Laufs. Ältere Übergaben bleiben erhalten.

## Datenschutz

Schwerpunkte und Notiz sind intern. Sie können Bewertungen enthalten und gehen nur nach bewusster Auswahl in einen Ausgabestand. Das Feedback an den Entwickler enthält keine Daten anderer Eigentümer.

## Abweichungen vom WCS

- Gemeinschafts- und Vorgangsbezüge der Schwerpunkte sind unsere Ergänzung; im WCS sind Schwerpunkte freier Text.
- Nicht mit der Ausgabe an eine Vertretung verwechseln: Diese ist ein empfängerbezogener [[ENT-15 - Ausgabestand]].

## Offene Punkte

- **O-ENT14-1 (erledigt):** Entschieden am 22.11.2026 vom Produktverantwortlichen: Schwerpunkte sind freier Text wie im WCS, wahlweise mit Link auf einen Vorgang; dann gilt dessen Gemeinschaft.
- **O-ENT14-2:** Konkrete Speicherung und spätere Übergabeversionen sind technisch offen.
- **O-ENT14-3:** Gehört das Feedback an den Entwickler in die Übergabe (WCS) oder in ein eigenes [[ENT-17 - Produktfeedback]]?

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7): Übergabe, Lagecheck, FR-W8, FR-A1 bis FR-A3. Unser [MVP-PRD](../02-MVP-PRD.md): B-FR-10, AT-B10. Regeln: [[DF-09 - Begrenzte Auswahl und Dringlichkeit]], [[DF-12 - Gemeinschaftstrennung]].

[[PBI-24 - Zwischendurch Dringlichkeit prüfen]], [[PBI-25 - Nächste Wochenarbeit vorbereiten]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
