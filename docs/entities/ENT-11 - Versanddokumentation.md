---
type: Entity
id: ENT-11
status: entwurf
scope: mvp
category: bewegungsdaten
wcs: keine
date: 2026-11-22
---

# ENT-11 · Versanddokumentation

## Zweck

Der ausdrücklich erfasste tatsächliche menschliche Versand einer bestimmten Nachricht. Das WCS führt den Versand nicht als eigenes Objekt. Er erscheint als [[ENT-06 - Verlaufseintrag]] am Vorgang, als `Eskalation.letzterSchritt` und als erledigtes To-do.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | Die `id` des Verlaufseintrags nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]], wenn der Versand ein Verlaufseintrag ist (O-ENT11-1). |
| Schema | `schema` | Text | P | Wie [[ENT-06 - Verlaufseintrag]]; Art `dispatch`. |
| Versanddatum | `occurred_on` | Datum | P | WCS `VerlaufEintrag.am`. Tag des tatsächlichen Versands. |
| Von | `actor` | Text | P | WCS `VerlaufEintrag.von`. Immer ein Mensch, nie ein Agent. |
| Empfänger | `recipient_ids` | Liste | P | Dokumentierte Empfänger. |
| Versandte Fassung | `message_draft_id`, `revision` | Text, Zahl | P | Die tatsächlich versandte Fassung des Nachrichtenentwurfs. |
| Gemeinschaft | `community_id` | Text | P | Genau eine Gemeinschaft. |
| Vorgänge | `matter_ids` | Liste | P | Betroffene Anliegen. |
| Nachrichtenreferenz | `message_ref` | Text | O | Kennung der gesendeten Nachricht im Postfach, ohne Bindung an einen Dienst. |
| Korrekturvermerk | `corrects_id` | Text | O | Berichtigt einen früheren Eintrag. |
| Herkunft des Nachweises | `proof_source` | Text | O | Manuell oder Dienstnachweis (siehe unten). |

**Abbildung auf das WCS:** Versand = Verlaufseintrag (`am`, `von`, `text`, `quelle`) + `Eskalation.letzterSchritt` (zuletzt gesendete Anfrage oder Frist) + To-do mit Status „erledigt“.

## Wertelisten

**Herkunft des Nachweises (geschlossen, Vorschlag):** manuell erfasst (`manual`), Dienstnachweis (`service`, später).

## Beziehungen

Besonderer Verlaufseintrag mit Bezug auf die versandte Nachricht. Liefert den Zeitanker für die Eskalation. Begründet keine zweite, unabhängig zu pflegende Kopie des Verlaufs.

[[ENT-06 - Verlaufseintrag]], [[ENT-10 - Nachrichtenentwurf]], [[ENT-12 - To-do]], [[ENT-13 - Eskalation]].

## Regeln und Lebenszyklus

- Nur eine ausdrückliche Nutzeraktion dokumentiert den tatsächlichen Versand ([[DF-07 - Wahl, Entwurf und Versand]]).
- Versand bestätigt weder Zustellung noch Antwort oder Erfüllung.
- Ein Entwurf startet keinen Zeitanker; erst der dokumentierte Versand tut es ([[DF-05 - Eskalationsleiter und Fristen]]).
- Eine Korrektur des lokalen Eintrags ruft die Nachricht nicht zurück.

## Datenschutz

Empfängerangaben sind personenbezogen. Bei Eigentümern wird der Verteiler genannt, keine einzelnen Adressen.

## Abweichungen vom WCS

Das WCS kennt keine eigene Versanddokumentation. Die Note bleibt als unsere Ergänzung eigenständig, weil sie die Regel „nur tatsächlicher menschlicher Versand“ und die versandte Fassung trägt.

## Offene Punkte

- **O-ENT11-1:** Verlaufseintrag der Art `dispatch` oder eigener Datensatz? Bisher offen.
- **O-ENT11-2:** Wird die Note mit [[ENT-06 - Verlaufseintrag]] zusammengeführt?

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7): VerlaufEintrag, `Eskalation.letzterSchritt`, FR-W12, NFR-1. Unser [MVP-PRD](../02-MVP-PRD.md): B-FR-08, B-FR-09, AT-B08, AT-B09. Regeln: [[DF-05 - Eskalationsleiter und Fristen]], [[DF-07 - Wahl, Entwurf und Versand]].

[[PBI-20 - Tatsächlichen Versand dokumentieren]], [[PBI-21 - Begründeten Eskalationsschritt prüfen]].

### Erweiterung für den geplanten Gmail-Versand

[[PBI-44 - Geprüfte E-Mails über Gmail versenden]] kann später zusätzlich zur manuellen Erfassung einen Dienstnachweis nach ausdrücklicher menschlicher Versandaktion liefern. Herkunft des Nachweises, Dienstreferenz und bekannter Ergebnisstand müssen vom manuellen Eintrag sowie von Zustellung und Lesen unterscheidbar bleiben. Ein unklarer Ausgang wird nicht in Erfolg umgedeutet. Details nach [[DF-24 - Bestätigter Dienstversand und unklarer Ausgang]]; kein bereits bestehendes Integrationsschema.

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
