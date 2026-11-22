---
type: Entity
id: ENT-12
status: entwurf
scope: mvp
category: bewegungsdaten
wcs: v1
date: 2026-11-22
---

# ENT-12 · To-do

## Zweck

Ein konkret ausführbarer Arbeitsschritt des Beirats, getrennt von einer fremden Zusage. Das To-do entsteht oft aus einer Entscheidungskarte und trägt dann einen fertigen Entwurf, den der Mensch sendet.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `todo-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. Ersetzt die WCS-`id`. |
| Schema | `schema` | Text | P | `weg-manager.todo/v1` (vorgeschlagen). |
| Titel | `title` | Text | P | WCS `titel`. Konkrete Handlung. |
| Vorgang | `matter_id` | Text | O | WCS `nr`. Bezogener Vorgang. Ein To-do darf ohne Vorgang stehen. |
| Gemeinschaft | `community_id` | Text | P | WCS `gemeinschaft` (dort optional). Bei uns Pflicht (O-ENT12-1). |
| Fällig | `due_on` | Datum | O | WCS `faellig`. Fälligkeit beziehungsweise Wiedervorlage ([[ENT-05 - Termin]]). |
| Entwurf | `message_draft_id` | Text | O | WCS `entwurfUrl` / `kopiertext`. Fertiger Entwurf zum Senden durch den Menschen ([[ENT-10 - Nachrichtenentwurf]]). |
| Status | `status` | Text | P | WCS `status` (siehe Wertelisten). |
| Herkunft aus Karte | `decision_card_id` | Text | O | WCS `karteId`. |
| Verantwortlich | `responsible` | Text | O | Unsere Ergänzung. Meist der Beirat. |
| Grund | `reason` | Text | O | Unsere Ergänzung: Pflicht bei „entfallen“. |

## Wertelisten

**Status (geschlossen):** offen (`open`), erledigt (`done`) wie im WCS, dazu entfallen (`dropped`) für überholte To-dos. Entschieden am 22.11.2026.

## Beziehungen

Gehört genau einer Gemeinschaft und kann ohne Vorgangsbezug geführt werden. Eine Entscheidungskarte kann To-dos erzeugen; das To-do verweist auf seinen Anlass. Eine nicht ausgeführte vorbereitete Aktion wird im nächsten Lauf zum To-do. Später entstehen To-dos auch aus Fristen in Verträgen und Policen.

[[ENT-01 - Gemeinschaft]], [[ENT-02 - Person und Rolle]], [[ENT-04 - Vorgang]], [[ENT-05 - Termin]], [[ENT-09 - Entscheidungskarte]], [[ENT-10 - Nachrichtenentwurf]], [[ENT-11 - Versanddokumentation]], [[ENT-33 - Vorbereitete Aktion]].

## Regeln und Lebenszyklus

- Die Erledigung eines Versand- oder Prüf-To-dos erfüllt keine fremde Zusage ([[DF-07 - Wahl, Entwurf und Versand]]).
- Wiederholte Entscheidungsvorbereitung erzeugt kein doppeltes To-do.
- Ein Entwurf am To-do wird nie automatisch gesendet.
- Übergänge: offen → erledigt; offen → entfallen (mit Grund).

## Datenschutz

Titel und Entwurf enthalten keine Daten anderer Eigentümer. Ein To-do kann in Übergabe und Ausgabe erscheinen.

## Abweichungen vom WCS

- Gemeinschaft ist bei uns Pflicht, im WCS optional.
- Zusätzlicher Status entfallen. Gemeinschaft ist Pflicht (im WCS optional).
- Der Entwurf ist ein Verweis auf einen Nachrichtenentwurf statt einer URL zu einem Postfachentwurf oder eines Kopiertexts.

## Offene Punkte

- **O-ENT12-1 (erledigt):** Entschieden am 22.11.2026 vom Produktverantwortlichen: Jedes To-do gehört genau einer Gemeinschaft ([[DF-12 - Gemeinschaftstrennung]]). Abweichung vom WCS.
- **O-ENT12-2 (erledigt):** Entschieden am 22.11.2026 vom Produktverantwortlichen: Status offen und erledigt wie im WCS, dazu entfallen. „in Arbeit“ und „wartet“ entfallen.
- **O-ENT12-3:** Vorgang der Art „Aufgabe Beirat“ und To-do mit Vorgangsbezug müssen ohne Doppelpflege zusammenpassen; keine zweite Datenstruktur allein aus zwei Begriffen ableiten (siehe O-ENT04-6).

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7): ToDo, To-do-Status, FR-W1, FR-W10. Unser [MVP-PRD](../02-MVP-PRD.md): B-FR-04, B-FR-07, AT-B04, AT-B07. Regeln: [[DF-04 - Fehlender Termin]], [[DF-06 - Reaktion und Pause]], [[DF-07 - Wahl, Entwurf und Versand]].

[[PBI-10 - Eigenes To-do nachhalten]], [[PBI-17 - Folgearbeit aus Entscheidungen vorbereiten]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
