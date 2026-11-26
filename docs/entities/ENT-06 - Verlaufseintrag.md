---
type: Entity
id: ENT-06
status: entwurf
scope: mvp
category: bewegungsdaten
wcs: v1
date: 2026-11-22
---

# ENT-06 · Verlaufseintrag

## Zweck

Eine datierte Information über eine Handlung, Aussage oder Änderung im fachlichen Verlauf eines Vorgangs. Die Verlaufseinträge eines Vorgangs bilden seinen Verlauf. Sie werden nie gelöscht.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | Acht Zeichen, eindeutig im Vorgang: Der Eintrag ist ein Listenpunkt im Abschnitt „Verlauf“ der Vorgangsnotiz, keine eigene Note (entschieden 26.11.2026, [[DV-03 - Vorgang v1]]). |

| Vorgang | – | – | P | Implizit: Der Eintrag steht in der Notiz seines Vorgangs, wie im WCS in `Vorgang.verlauf`. |
| Am | `occurred_on` | Datum | P | WCS `am`. Tag, an dem es geschah. Unbekannt bleibt unbekannt. |
| Von | `actor` | Text | P | WCS `von`. Dokumentierter Akteur: Beirat, Agent, Verwaltung oder eine andere Rolle ([[ENT-02 - Person und Rolle]]). |
| Text | `text` | Text | P | WCS `text`. Was geschah. |
| Quelle | `source` | Text | O | WCS `quelle`. Mail, Dokument, Gespräch ([[ENT-07 - Quelle]]). Fehlt sie, bleibt die Lücke sichtbar. |
| Art | `entry_kind` | Text | O | Unsere Ergänzung (siehe Wertelisten). |
| Erfasst am | `recorded_on` | Datum | O | Unsere Ergänzung: wann der Eintrag erfasst wurde. Ein Importdatum ersetzt nie `occurred_on`. |
| Erfasst von | `recorded_by` | Text | O | Unsere Ergänzung: wer tatsächlich erfasst hat, wenn das nicht der Akteur ist. |
| Korrektur von | `corrects_id` | Text | O | Unsere Ergänzung: verweist auf den berichtigten Eintrag. |

## Wertelisten

**Art (geschlossen, Vorschlag):** Anfrage (`request`), Empfangsbestätigung (`acknowledgement`), sachliche Antwort (`reply`), neuer Termin (`new_date`), Teillieferung (`partial`), Erfüllung (`fulfilment`), Versand (`dispatch`, siehe [[ENT-11 - Versanddokumentation]]), Statuswechsel (`status_change`), Bewertung (`assessment`, siehe [[ENT-16 - Beiratsbewertung]]), Notiz (`note`), Aufteilung (`split`, [[PBI-06 - Sammelvorgänge aufteilen]]), Zusammenführung (`merge`, [[PBI-07 - Dubletten zusammenführen]]). Aufteilung und Zusammenführung nennen die betroffenen Vorgänge im Feld `related`.

## Beziehungen

Gehört zu genau einem Vorgang und erklärt dessen Verlauf. Die Versanddokumentation ist ein besonderer Verlaufseintrag. Quellen belegen die Aussage, sind aber nicht dasselbe wie der Eintrag. Ein Eintrag kann von einer Entscheidungskarte, einer Eskalation oder einer vorbereiteten Aktion ausgelöst sein.

[[ENT-02 - Person und Rolle]], [[ENT-04 - Vorgang]], [[ENT-05 - Termin]], [[ENT-07 - Quelle]], [[ENT-09 - Entscheidungskarte]], [[ENT-11 - Versanddokumentation]], [[ENT-13 - Eskalation]], [[ENT-16 - Beiratsbewertung]], [[ENT-33 - Vorbereitete Aktion]].

## Regeln und Lebenszyklus

- Anfrage, Empfangsbestätigung, sachliche Antwort, neuer Termin, Teillieferung und Erfüllung bleiben unterscheidbar ([[DF-06 - Reaktion und Pause]]).
- Das Importdatum ersetzt nie den Tag des Geschehens. Unbekannte Zeiten werden nicht erfunden.
- Entscheidung, Entwurf, Versand, Antwort und Erfüllung sind verschiedene Verlaufseinträge ([[DF-07 - Wahl, Entwurf und Versand]]).
- Ein Eintrag wird nicht gelöscht. Eine Berichtigung ist ein neuer Eintrag mit Verweis auf den alten.
- Unnötige private Inhalte dürfen kontrolliert entfernt werden; ein Vermerk bleibt, ohne den Inhalt zu wiederholen ([[DF-13 - Historie und kontrollierte Entfernung]]).
- Der Verlauf ist nachvollziehbar, aber nicht als manipulationssicher zugesichert.

## Datenschutz

Der Text kann personenbezogene Angaben enthalten. Er nennt Rollen statt Eigentümernamen. Einträge der Art Bewertung gehören zur Bewertungsschicht und sind nur für Beirat und Vertretung sichtbar. Verlaufstexte gehen nur nach bewusster Auswahl in eine Ausgabe.

## Abweichungen vom WCS

- `von` nennt „Agent“ statt eines Produktnamens.
- Art, Erfassungsdatum, Erfasser und Korrekturverweis sind unsere Ergänzungen.
- Das WCS sagt „nie gelöscht“. Wir erlauben die kontrollierte Entfernung unnötiger privater Inhalte mit Vermerk (DF-13).

## Offene Punkte

- **O-ENT06-1:** Speicherform: Abschnitt im Body des Vorgangs oder eigene Notes mit `matter_id` (siehe O-ENT04-4)?
- **O-ENT06-2:** Kann ein Verlaufseintrag mehrere Vorgänge betreffen, etwa eine Antwort der Verwaltung zu drei Vorgängen? Das WCS sieht einen Vorgang je Eintrag vor.
- **O-ENT06-3 (erledigt):** Entschieden am 22.11.2026 vom Produktverantwortlichen: Ein Verlaufseintrag wird nie gelöscht. Nur private Inhalte darin dürfen kontrolliert und mit Vermerk entfernt werden ([[DF-13 - Historie und kontrollierte Entfernung]]).

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7): VerlaufEintrag, `Vorgang.verlauf`, FR-V1. Unser [MVP-PRD](../02-MVP-PRD.md): B-FR-05, AT-B05. Regeln: [[DF-06 - Reaktion und Pause]], [[DF-07 - Wahl, Entwurf und Versand]], [[DF-13 - Historie und kontrollierte Entfernung]], [[DF-14 - Kennzahlen]].

[[PBI-11 - Nachricht und Original zuordnen]], [[PBI-12 - Verlauf nachvollziehen]], [[PBI-20 - Tatsächlichen Versand dokumentieren]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
