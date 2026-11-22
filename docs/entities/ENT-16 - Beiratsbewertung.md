---
type: Entity
id: ENT-16
status: entwurf
scope: mvp
category: bewegungsdaten
wcs: v1
date: 2026-11-22
---

# ENT-16 · Beiratsbewertung

## Zweck

Die bewusst dokumentierte interne Einschätzung des Beirats zu einer Zusage und ihrem Verlauf. Im WCS heißt der Bereich dieser Felder Bewertungsschicht: Felder, die nur Beirat und Vertretung sehen. Die Beiratsbewertung ist ihr Kern.

## Felder

Die Bewertungsschicht umfasst Felder an mehreren Objekten. Diese Tabelle nennt alle; ihr Speicherort ist offen (O-ENT16-1).

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `assessment-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]], falls eigene Note. |
| Schema | `schema` | Text | P | `weg-manager.assessment/v1` (vorgeschlagen). |
| Vorgang | `matter_id` | Text | P | Bewerteter Vorgang. |
| Bewertung | `verdict` | Text | P | WCS `Vorgang.status = nicht eingehalten`. Nur durch den Beirat (FR-V7). |
| Begründung | `reason` | Text | P | Unsere Ergänzung: warum die Zusage nicht eingehalten ist. |
| Zusagefassung | `due_on` | Datum | P | Unsere Ergänzung: die bewertete Terminfassung ([[ENT-05 - Termin]]). |
| Quellen | `source` | Text | O | Belege ([[ENT-07 - Quelle]]). |
| Bewertet von, am | `assessed_by`, `assessed_on` | Text, Datum | P | Nachvollziehbare Änderung. |
| Antwortzeit | – | Zahl (Tage) | A | WCS `Vorgang.antwortzeit`. Anfrage bis Antwort, Zusage bis Erledigung. Berechnet aus dem Verlauf ([[DF-14 - Kennzahlen]]). |
| Eskalationsstufe | – | – | – | WCS: Die ganze [[ENT-13 - Eskalation]] gehört zur Bewertungsschicht. |
| ETV- und Entlastungsnotiz | `meeting_note` | Text | O | WCS: Notizen für Versammlung und Entlastung, etwa aus Eskalationsstufe 4. |

## Wertelisten

**Bewertung (geschlossen):** nicht eingehalten (`not_kept`). Weitere Bewertungen nur per Schemaänderung.

## Beziehungen

Bezieht sich auf die konkrete Aussage beziehungsweise Terminfassung eines Vorgangs. Frühere Bewertungen bleiben bei neuem Termin nachvollziehbar. Die Verwendung in einer Ausgabe braucht eine bewusste Prüfung. Eskalationen und Antwortzeiten gehören in dieselbe Schicht.

[[ENT-02 - Person und Rolle]], [[ENT-04 - Vorgang]], [[ENT-05 - Termin]], [[ENT-06 - Verlaufseintrag]], [[ENT-07 - Quelle]], [[ENT-13 - Eskalation]], [[ENT-15 - Ausgabestand]].

## Regeln und Lebenszyklus

- Überfälligkeit darf als Prüfvermerk berechnet werden. Die Bewertung setzt der Beirat bewusst ([[DF-02 - Bearbeitung, Terminprüfung und Bewertung]]).
- Die Bewertung erledigt den Vorgang nicht und ist keine automatische rechtliche Tatsachenfeststellung.
- Ein neuer Termin hebt eine alte Bewertung nicht auf: Alter Termin 10.11., neuer akzeptierter Termin 20.11. – die alte Bewertung bleibt, der Vorgang bleibt offen.
- Interne Bewertungen werden nicht pauschal extern geteilt ([[DF-11 - Sachstand und Bewertung]]).
- **Zugriff:** Nur Beirat und Vertretung sehen die Bewertungsschicht. Die Verwaltung hat keinen Zugang (WCS FR-ROL1).

## Datenschutz

Bewertungen betreffen das Verhalten der Verwaltung und können personenbezogen sein. Sie liegen in der Bewertungsschicht und gehen nie in Entwürfe, Karten für Dritte, Berichte oder ein öffentliches Repository, außer nach bewusster Prüfung in einen Ausgabestand.

## Abweichungen vom WCS

- Das WCS führt „nicht eingehalten“ als Status am Vorgang. Wir übernehmen den Status, halten aber fest: Er ist eine Bewertung, nur der Beirat setzt ihn, und er gehört zur Bewertungsschicht. Begründung und Terminfassung sind unsere Ergänzung.
- Ablage im Vault statt in einem Cloud-Speicher.

## Offene Punkte

- **O-ENT16-1:** Speicherort der Bewertungsschicht: eigener, nicht geteilter Bereich im Vault (WCS FR-ROL1, Q1)? Ein Status am Vorgang wäre für jeden sichtbar, der die Vorgangsnote liest, auch für einen Agenten.
- **O-ENT16-2:** Eigene Bewertungsnote oder strukturierter Verlaufseintrag der Art `assessment`?
- **O-ENT16-3:** Die Antwortzeit ist im WCS v1. Nach [[DF-14 - Kennzahlen]] gehört die berechnete Auswertung erst zum späteren Ausbau. Kommt sie in den MVP?
- **O-ENT16-4:** Wie wird „nur Beirat und Vertretung“ ohne Benutzerkonten durchgesetzt? Das Plugin hat einen Bearbeiter; die Grenze entsteht durch Ablage und Ausgabe.

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7): Bewertungsschicht, FR-ROL1, FR-V6, FR-V7, `Vorgang.antwortzeit`, Eskalation. Unser [MVP-PRD](../02-MVP-PRD.md): B-FR-03, B-FR-11, AT-B03, AT-B11. Regeln: [[DF-02 - Bearbeitung, Terminprüfung und Bewertung]], [[DF-11 - Sachstand und Bewertung]], [[DF-14 - Kennzahlen]]. Entscheidung: [[K-07 - Sachstand gezielt teilen und Bewertungen intern halten]].

[[PBI-08 - Bearbeitungsstand bewusst ändern]], [[PBI-12 - Verlauf nachvollziehen]], [[PBI-28 - Empfängerbezogene Ausgabe prüfen]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
