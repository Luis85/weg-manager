---
type: Entity
id: ENT-09
status: entwurf
scope: mvp
category: bewegungsdaten
wcs: v1
date: 2026-11-22
---

# ENT-09 · Entscheidungskarte

## Zweck

Eine Entscheidung im Wochenlauf, die der Beirat über sein nächstes Vorgehen trifft. Die Karte bringt Kontext, zwei bis vier Optionen mit Folgen, eine Empfehlung und einen Entwurf. Die Wahl des Beirats heißt Entscheidung. Höchstens sieben reguläre Karten je Woche.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `decision-card-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. Ersetzt die WCS-`id` „eindeutig je Lauf“. |
| Schema | `schema` | Text | P | `weg-manager.decision-card/v1` (vorgeschlagen). |
| Gemeinschaft | `community_id` | Text | P | WCS `gemeinschaft`. Eine Gemeinschaft je Karte. |
| Vorgang | `matter_ids` | Liste | O | WCS `nr` (ein Vorgang). Bei uns ein oder mehrere Vorgänge derselben Gemeinschaft (O-ENT09-1). |
| Gruppe | `group` | Text | P | WCS `gruppe`, z. B. Leiter, Frist, ETV. Anlass der Karte. |
| Titel | `title` | Text | P | WCS `titel`. Die Frage. |
| Kontext | `context` | Text | P | WCS `kontext`. Zwei bis vier Sätze, ohne Privatdaten, mit Quellenbezug. |
| Fällig | `due_on` | Datum | O | WCS `faellig`. Entscheidungsfrist. |
| Optionen | – | Liste | P | WCS `optionen`: je Option `key`, `label`, `detail`, `folgen`. Zwei bis vier. Speicherform offen (O-ENT09-3). |
| Empfehlung | `recommendation` | Text | P | WCS `empfehlung`. Key der empfohlenen Option. |
| Entwurf | `draft` | Text | O | WCS `entwurf`. Entwurf zur Empfehlung ([[ENT-10 - Nachrichtenentwurf]]). |
| Status | `status` | Text | P | WCS `status`. Kartenstatus (siehe Wertelisten). |
| Wahl | `choice` | Text | O | WCS `wahl`. Key der gewählten Option: die Entscheidung. |
| Notiz | `note` | Text | O | WCS `notiz`. Kontextnotiz, Nuance des Beirats. |
| Entschieden am | `decided_on` | Datum | O | WCS `entschiedenAm`. |
| Abgeschickt | `submitted` | Checkbox | A | WCS `abgeschickt`. Die Entscheidung ist zur Verarbeitung abgegeben. |
| Verarbeitet | `processed` | Checkbox | A | WCS `verarbeitet`. Folgearbeit ist erzeugt. |
| Überholt | `superseded` | Checkbox | O | Unsere Ergänzung: Folgetexte einer geänderten Entscheidung sind prüfbedürftig. |

## Wertelisten

**Kartenstatus (geschlossen, WCS):** offen (`open`), entschieden (`decided`), vertagt (`deferred`), geparkt (`parked`). Unser bisheriger Stand „bestätigt“ entspricht „entschieden“.

## Beziehungen

Bezieht sich auf Vorgänge derselben Gemeinschaft. Kann mehrere passende Nachrichtenentwürfe und konkrete To-dos begründen (`ToDo.karteId`). Bei Eskalationen der Woche bleibt die Entscheidung je betroffenem Vorgang nachvollziehbar. Eine Karte der Gruppe ETV kann einen Beschluss vorbereiten, ist aber keiner.

[[ENT-01 - Gemeinschaft]], [[ENT-04 - Vorgang]], [[ENT-07 - Quelle]], [[ENT-10 - Nachrichtenentwurf]], [[ENT-12 - To-do]], [[ENT-13 - Eskalation]], [[ENT-25 - Beschluss]], [[ENT-33 - Vorbereitete Aktion]].

## Regeln und Lebenszyklus

- Höchstens sieben reguläre Karten je Woche; dringender Überlauf bleibt sichtbar ([[K-05 - Sieben reguläre Entscheidungen mit sichtbarem Überlauf]], [[DF-09 - Begrenzte Auswahl und Dringlichkeit]]).
- Zwei bis vier Optionen, jede mit Folgen.
- Die Entscheidung ist ein interner Arbeitsschritt: kein Versand, kein Auftrag, keine Zahlung, kein Gemeinschaftsbeschluss ([[DF-01 - Beiratsarbeit und Befugnis]], [[DF-15 - Entscheidungskarte und Beschluss]]).
- Wiederholte Verarbeitung erzeugt keine doppelte Folgearbeit ([[DF-07 - Wahl, Entwurf und Versand]]).
- Eine Änderung der Entscheidung macht alte Folgetexte prüfbedürftig, verändert aber keinen bereits dokumentierten Versand rückwirkend.
- Übergänge: offen → entschieden, vertagt oder geparkt; vertagt und geparkt → offen. Nur der Beirat entscheidet.

## Datenschutz

Kontext, Optionen und Entwurf enthalten keine Daten anderer Eigentümer. Bewertungen wie „nicht eingehalten“ oder Eskalationsstufen erscheinen auf der Karte nur für Beirat und Vertretung.

## Abweichungen vom WCS

- Technische `id` statt einer je Lauf eindeutigen Kennung: Die Karte bleibt über Läufe hinweg dieselbe.
- Mehrere Vorgänge je Karte statt höchstens einem `nr`.
- „Überholt“ ist unsere Ergänzung.
- Diese Entität ist von den Produktentscheidungsnotes unter `docs/decisions` zu unterscheiden.

## Offene Punkte

- **O-ENT09-1:** Das WCS verknüpft eine Karte mit höchstens einem Vorgang. Unser Modell kennt Paketentscheidungen zu mehreren Vorgängen. Welches gilt?
- **O-ENT09-2:** „Höchstens 7 pro Woche“ (WCS) und „sieben reguläre plus sichtbarer dringender Überlauf“ (K-05): Zählt der Überlauf als Karte?
- **O-ENT09-3:** Die Optionen sind eine Liste von Objekten. Sie ist im Eigenschaftenbereich von Obsidian nicht bearbeitbar (ADR 0007). Body-Abschnitt oder flache Schlüssel je Option?
- **O-ENT09-4:** Unterschied zwischen „vertagt“ und „geparkt“ festlegen, etwa vertagt = nächste Woche wieder, geparkt = ohne Termin.

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7): Entscheidungskarte, FR-W2, FR-W3, Kartenstatus. Unser [MVP-PRD](../02-MVP-PRD.md): B-FR-06, B-FR-07, B-FR-09, AT-B06, AT-B07. Regeln: [[DF-01 - Beiratsarbeit und Befugnis]], [[DF-07 - Wahl, Entwurf und Versand]], [[DF-09 - Begrenzte Auswahl und Dringlichkeit]], [[DF-15 - Entscheidungskarte und Beschluss]]. Entscheidung: [[K-05 - Sieben reguläre Entscheidungen mit sichtbarem Überlauf]].

[[PBI-14 - Entscheidungsauswahl und Überlauf prüfen]], [[PBI-15 - Eine Entscheidungsvorlage prüfen]], [[PBI-16 - Wahl mit Kontextnotiz bestätigen]], [[PBI-17 - Folgearbeit aus Entscheidungen vorbereiten]], [[PBI-22 - Eskalationen begrenzen oder aussetzen]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
