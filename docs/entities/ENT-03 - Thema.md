---
type: Entity
id: ENT-03
status: entwurf
scope: mvp
category: stammdaten
wcs: keine
date: 2026-11-22
---

# ENT-03 · Thema

## Zweck

Ein Zusammenhang mehrerer einzeln erledigbarer Vorgänge innerhalb einer Gemeinschaft, z. B. „Beleuchtung“. Das WCS führt das Thema nicht als eigenes Objekt, sondern als Feld `Vorgang.thema`.

## Felder

Im WCS ist das Thema ein kurzer Pflichttext am Vorgang. Eigene Felder hat es nur, wenn wir es als eigene Note führen (siehe O-ENT03-1).

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `topic-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]], nur bei eigener Note. |
| Schema | `schema` | Text | P | `weg-manager.topic/v1` (vorgeschlagen), nur bei eigener Note. |
| Bezeichnung | `name` | Text | P | Kurz, z. B. „Beleuchtung“. Entspricht dem Wert von `Vorgang.thema`. |
| Gemeinschaft | `community_id` | Text | P | Genau eine Gemeinschaft. |
| Zugehörige Vorgänge | – | – | A | Berechnet aus den Vorgängen, deren `topic` auf das Thema zeigt. Wird nicht gespeichert. |

**Abbildung auf das WCS:** Thema = `Vorgang.thema` (bei uns `topic` an [[ENT-04 - Vorgang]]). Gleiche Themenbezeichnungen in verschiedenen Gemeinschaften sind verschiedene Themen. Entscheidungskarten haben zusätzlich eine `gruppe` (z. B. Leiter, Frist, ETV); das ist kein Thema.

## Beziehungen

Ein Thema bündelt mehrere Vorgänge derselben Gemeinschaft. Ein Vorgang hat im WCS genau ein Thema. Später können sich Regeln ([[ENT-28 - Regel]]) und Beschlüsse thematisch berühren; das ist keine Zuordnung.

[[ENT-01 - Gemeinschaft]], [[ENT-04 - Vorgang]].

## Regeln und Lebenszyklus

- Das Thema hat keinen gemeinsamen Erledigtstatus, der seine Vorgänge automatisch abschließt.
- Es setzt keinen vollständigen Handwerkerprozess voraus.
- Ein Thema ist keine Bündelung zu einem Ergebnis: Ein Vorgang bleibt ein Ergebnis ([[K-03 - Einzeln erledigbarer Vorgang als Kerneinheit]]).

## Datenschutz

Keine personenbezogenen Daten. Die Bezeichnung darf keine Namen von Eigentümern enthalten, weil sie in Karten und Berichten erscheint.

## Abweichungen vom WCS

Das WCS kennt kein Thema-Objekt. Die Note bleibt als unsere Ergänzung eigenständig, weil sie die fachliche Bedeutung des Feldes und die Regel „kein gemeinsamer Erledigtstatus“ trägt. Im WCS ist `thema` Pflicht; bei uns durften Vorgänge bisher ohne Thema geführt werden.

## Offene Punkte

- **O-ENT03-1:** Eigene gespeicherte Identität oder nur ein Textfeld am Vorgang? Bis zur Entscheidung folgt das Modell dem WCS (Textfeld).
- **O-ENT03-2 (erledigt):** Entschieden am 22.11.2026 vom Produktverantwortlichen: Das Thema ist Pflicht wie im WCS, als kurzer Text am Vorgang.
- **O-ENT03-3:** Darf ein Vorgang mehreren Themen zugeordnet werden? Das WCS sieht genau eines vor; unser Konzept hatte es offen gelassen.
- **O-ENT03-4:** Wird die Note mit [[ENT-04 - Vorgang]] zusammengeführt, wenn das Thema ein Textfeld bleibt?

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7): `Vorgang.thema`. Unser [MVP-PRD](../02-MVP-PRD.md): B-FR-03, Fachliches Modell. Entscheidungen: [[K-03 - Einzeln erledigbarer Vorgang als Kerneinheit]], [[K-20 - WCS-Datenmodell als fachliche Grundlage]].

[[PBI-05 - Einen Vorgang erfassen und wiederfinden]], [[PBI-06 - Sammelvorgänge aufteilen]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
