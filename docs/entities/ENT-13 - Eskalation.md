---
type: Entity
id: ENT-13
status: entwurf
scope: mvp
category: bewegungsdaten
wcs: v1
date: 2026-11-22
---

# ENT-13 · Eskalation

## Zweck

Der nachvollziehbare Stand der Eskalationsleiter für eine Zusage der Verwaltung ohne Termin oder mit verpasstem Termin. Die Eskalation zeigt die aktuelle Stufe, seit wann sie gilt und welcher Schritt zuletzt gesendet wurde. Sie gehört zur Bewertungsschicht und ist keine rechtliche Sanktion.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `escalation-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]], falls eigene Note (O-ENT13-3). |
| Schema | `schema` | Text | P | `weg-manager.escalation/v1` (vorgeschlagen). |
| Vorgang | `matter_id` | Text | P | WCS `nr`. Nur Vorgänge, für die die Verwaltung verantwortlich ist (FR-V10). |
| Stufe | `level` | Zahl | P | WCS `stufe`, 1 bis 4 (siehe Wertelisten). |
| Seit | `since` | Datum | P | WCS `seit`. Beginn der aktuellen Stufe. |
| Letzter Schritt | `last_step` | Text | P | WCS `letzterSchritt`. Zuletzt gesendete Anfrage oder Frist; belegt durch [[ENT-11 - Versanddokumentation]]. |
| Ausgenommen | `paused` | Checkbox | P | WCS `ausgenommen`. Für eine Woche ausgesetzt (FR-L3). |
| Grund der Pause | `pause_reason` | Text | O | Unsere Ergänzung: Pflicht, wenn ausgenommen. |
| Ende der Pause | `pause_until` | Datum | O | Unsere Ergänzung. Nach dem WCS eine Woche nach Beginn. |
| Geltender Termin | – | Datum | A | Aus `Vorgang.due_on` ([[ENT-05 - Termin]]). |
| Vorschlag | – | Text | A | Begründeter nächster Stufenvorschlag. Berechnet, nicht gespeichert. |

## Wertelisten

**Eskalationsstufe (geschlossen, WCS):**

| Stufe | Schritt | Eskalationsfrist |
| --- | --- | --- |
| 1 | Termin erfragen | Erneute Prüfung beim nächsten Wochenlauf nach mindestens sieben Kalendertagen seit Versand ([[DF-05 - Eskalationsleiter und Fristen]]). |
| 2 | Frist setzen | Antworttermin +14 Tage. |
| 3 | Förmliche Erinnerung mit Bezug auf § 27 Abs. 1 und § 18 WEG und den Verwaltervertrag | Frist +10 Tage. |
| 4 | Vormerkung für Bericht, ETV und Entlastung | Nur Zusagen der Verwaltung. |

Die Fristen sind Arbeitsdefaults, keine gesetzlichen Fristen oder Zugangsnachweise. Der Mensch bestätigt das tatsächlich genannte Datum.

## Beziehungen

Bezieht sich auf genau einen Vorgang. Die Eskalationen der Woche einer Gemeinschaft werden gemeinsam vorgelegt und können gemeinsam versandt werden; jeder Vorgang behält seine eigenen Schritte und Ausnahmen. Stufe 4 bereitet Inhalte für Bericht, ETV oder Entlastung vor.

[[ENT-04 - Vorgang]], [[ENT-05 - Termin]], [[ENT-06 - Verlaufseintrag]], [[ENT-09 - Entscheidungskarte]], [[ENT-11 - Versanddokumentation]], [[ENT-16 - Beiratsbewertung]], [[ENT-29 - Vertrag]].

## Regeln und Lebenszyklus

- Die Wochenprüfung schlägt den nächsten Schritt vor. Sie vollzieht keine Stufe automatisch; der Beirat bestätigt ([[K-06 - Eskalation an Versand und Fristen ausrichten]], [[DF-05 - Eskalationsleiter und Fristen]]).
- Maßgeblich sind ein dokumentierter tatsächlicher Schritt und der kommunizierte Termin. Laufende kommunizierte Fristen bleiben maßgeblich.
- Ein neuer akzeptierter Termin beendet das aktuelle Terminnachfragen, nicht den Vorgang ([[DF-06 - Reaktion und Pause]]).
- Nach einer Pause oder erneutem Verzug folgt eine erneute Prüfung statt mehrfacher Hochsetzung.
- Eine Pause braucht einen Grund und endet sichtbar ([[PBI-22 - Eskalationen begrenzen oder aussetzen]]).
- Der Einstieg berücksichtigt vorhandene Historie.

## Datenschutz

Die Eskalation gehört zur Bewertungsschicht. Stufe, Seit-Datum und Vormerkungen sehen nur Beirat und Vertretung, nicht die Verwaltung. Der Inhalt der versandten Nachricht selbst ist keine Bewertung.

## Abweichungen vom WCS

- Grund und Ende der Pause sind unsere Ergänzungen; das WCS kennt nur „ausgenommen für eine Woche“.
- Stufe 1 hat bei uns eine Eskalationsfrist von mindestens sieben Tagen; das WCS nennt dafür keine Frist.

## Offene Punkte

- **O-ENT13-1:** Das WCS sagt, die Stufe „steigt je Woche ohne Antwort um eins“. Nach DF-05 und K-06 ist der Wochenwechsel allein kein Grund für eine neue Stufe; maßgeblich sind Versand und laufende Frist (AT-B09). Die WCS-Regel ist als Vorschlag, nicht als automatischer Stufenwechsel zu lesen. Bestätigen.
- **O-ENT13-2:** Eine Pause gilt im WCS genau eine Woche. Unser Modell erlaubt ein frei gewähltes Ende. Welches gilt?
- **O-ENT13-3:** Welche Teile aus Verlaufseinträgen berechnet und welche bewusst gespeichert werden, ist offen. Eigene Note, Felder am Vorgang oder Bewertungsschicht (O-ENT16-1)?

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7): Eskalation, Eskalationsleiter, FR-L1 bis FR-L5, FR-V10, FR-ROL1. Unser [MVP-PRD](../02-MVP-PRD.md): B-FR-09, AT-B09. Regeln: [[DF-03 - Terminbedeutung]], [[DF-04 - Fehlender Termin]], [[DF-05 - Eskalationsleiter und Fristen]], [[DF-06 - Reaktion und Pause]], [[DF-08 - Quellenabdeckung]]. Entscheidung: [[K-06 - Eskalation an Versand und Fristen ausrichten]].

[[PBI-21 - Begründeten Eskalationsschritt prüfen]], [[PBI-22 - Eskalationen begrenzen oder aussetzen]], [[PBI-23 - Reaktion richtig einordnen]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
