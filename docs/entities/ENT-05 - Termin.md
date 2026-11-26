---
type: Entity
id: ENT-05
status: entwurf
scope: mvp
category: bewegungsdaten
wcs: keine
date: 2026-11-22
---

# ENT-05 · Termin

## Zweck

Eine zeitliche Aussage mit fachlicher Bedeutung, Herkunft und Prüfstand. Das WCS führt den Termin nicht als eigenes Objekt, sondern als Datumsfelder am Vorgang (`zugesagtAm`, `bisWann`, `erledigtAm`), an der Eskalation (`seit`), an Entscheidungskarte und To-do (`faellig`).

## Felder

Die Felder sind Bestandteile des betroffenen Objekts, keine eigene Note (siehe O-ENT05-1).

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | – | – | – | Keine eigene `id`; der Termin gehört zur `id` des Vorgangs oder To-dos ([[docs/adr/0007-vault-data-access.md\|ADR 0007]]). |
| Schema | – | – | – | Kein eigenes Schema; Teil von `weg-manager.matter/v1` beziehungsweise des To-do-Schemas. |
| Zugesagt am | `promised_on` | Datum | O | WCS `Vorgang.zugesagtAm`. Tag der Zusage. |
| Bis wann | `due_on` | Datum | P* | WCS `Vorgang.bisWann`. Geltender Termin. *Fehlt er, Prüfvermerk „Termin erfragen“. |
| Bedeutung | `due_kind` | Text | O | Unsere Ergänzung: was der Termin ist (siehe Wertelisten; entschieden 26.11.2026, [[DV-03 - Vorgang v1]]). Die eigene Wiedervorlage ist kein Wert hier, sondern `follow_up_on`. |
| Herkunft | `due_source` | Text | O | Unsere Ergänzung: wer den Termin genannt hat und wo (Quelle). |
| Prüfstand | `due_checked` | Text | O | Unsere Ergänzung: bestätigt, vorgeschlagen oder unbekannt. |
| Uhrzeit und Zeitzone | – | Text | O | Nur wenn genannt. Ohne Uhrzeit gilt Tagesende Europe/Berlin. |
| Erledigt am | `done_on` | Datum | O | WCS `Vorgang.erledigtAm`. |
| Wiedervorlage | `follow_up_on` | Datum | O | Unsere Ergänzung am Vorgang; am To-do WCS `faellig`. |
| Frühere Fassungen | – | – | – | Stehen im Verlauf als [[ENT-06 - Verlaufseintrag]]. Die aktuell akzeptierte Fassung ist `due_on`. |

**Abbildung auf das WCS:** Termin der Zusage = `zugesagtAm`; geltender Termin = `bisWann`; Beginn der Eskalationsstufe = `Eskalation.seit`; Entscheidungsfrist = `Entscheidungskarte.faellig`; Fälligkeit eines To-dos = `ToDo.faellig`. Fristarten trägt im WCS die Vorgangsart (Frist Beirat, Frist gesetzlich).

## Wertelisten

**Bedeutung (geschlossen, entschieden 26.11.2026):** Zusage (`promise`), vertraglicher Termin (`contractual`), angegebene formelle Frist (`formal_deadline`), gewünschter Antworttermin (`requested_reply`). Die eigene Wiedervorlage ist `follow_up_on`, kein Wert dieser Liste.

**Prüfstand (geschlossen, entschieden 26.11.2026):** bestätigt (`confirmed`), vorgeschlagen (`proposed`), unbekannt (`unknown`).

## Beziehungen

Gehört fachlich zum betroffenen Vorgang oder To-do. Ein Vorgang kann unterschiedliche Terminarten und historische Terminangaben haben. Eskalation und Bewertung beziehen sich auf die jeweils relevante Fassung. Später tragen Verträge, Policen und Anlagen eigene Fristen (Kündigungsfrist, Laufzeit, Wartung).

[[ENT-04 - Vorgang]], [[ENT-06 - Verlaufseintrag]], [[ENT-07 - Quelle]], [[ENT-12 - To-do]], [[ENT-13 - Eskalation]], [[ENT-16 - Beiratsbewertung]], [[ENT-29 - Vertrag]], [[ENT-30 - Police]], [[ENT-31 - Anlage]].

## Regeln und Lebenszyklus

- Eine Wiedervorlage verändert keine fremde Frist ([[DF-03 - Terminbedeutung]]).
- Unbekannte Termine bleiben unbekannt; sie sind weder null noch erledigt ([[DF-04 - Fehlender Termin]]).
- Ein Datum ohne Uhrzeit gilt intern bis Tagesende Europe/Berlin. Überfällig ist ein Vorgang ab dem Folgetag.
- Ein neuer akzeptierter Termin ersetzt `due_on`, erhält den bisherigen Verlauf und erledigt den Vorgang nicht ([[DF-06 - Reaktion und Pause]]).
- Keine automatische rechtliche Fristprüfung. Eskalationsfristen sind Arbeitsdefaults ([[DF-05 - Eskalationsleiter und Fristen]]).

## Datenschutz

Termine selbst sind nicht personenbezogen. Die Herkunft nennt eine Rolle oder Quelle, keinen Eigentümer.

## Abweichungen vom WCS

Das WCS kennt nur Datumsfelder ohne Bedeutung, Herkunft und Prüfstand. Die Note bleibt als unsere Ergänzung eigenständig, weil sie die Terminbedeutung und die Regeln zu Wiedervorlage und Tagesende trägt. Die Wiedervorlage am Vorgang ist im WCS nicht vorgesehen.

## Offene Punkte

- **O-ENT05-1:** Bleiben Terminangaben Bestandteile des Vorgangs (WCS-Form), oder bekommen sie eigene Datensätze, um mehrere Fassungen zu führen? Bisher technisch offen.
- **O-ENT05-2:** Werden `due_kind`, `due_source` und `due_checked` in den Vorgangsvertrag aufgenommen oder nur im Verlauf festgehalten?
- **O-ENT05-3:** Wird die Note mit [[ENT-04 - Vorgang]] zusammengeführt?

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7): `Vorgang.zugesagtAm`, `bisWann`, `erledigtAm`, FR-V2, FR-V5. Unser [MVP-PRD](../02-MVP-PRD.md): B-FR-04, B-FR-09, AT-B04, AT-B09. Regeln: [[DF-03 - Terminbedeutung]], [[DF-04 - Fehlender Termin]], [[DF-05 - Eskalationsleiter und Fristen]], [[DF-06 - Reaktion und Pause]].

[[PBI-09 - Termin und Wiedervorlage trennen]], [[PBI-21 - Begründeten Eskalationsschritt prüfen]], [[PBI-23 - Reaktion richtig einordnen]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
