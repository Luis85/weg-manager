---
type: Entity
id: ENT-25
status: entwurf
scope: spaeter
category: stammdaten
wcs: v1-should
date: 2026-11-22
---

# ENT-25 · Beschluss

## Zweck

Ein Beschluss ist die Willensbildung der Gemeinschaft in der Versammlung oder im Umlaufverfahren. Das WCS führt ihn mit Umsetzungsstatus und verknüpft die Vorgänge, die ihn umsetzen.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `resolution-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. |
| Schemaversion | `schema` | Text | P | `weg-manager.resolution/v1`. |
| Nummer (WCS-„id“) | `resolution_number` | Text | P | Nummer laut Beschlusssammlung, z. B. „2026-07“. Eindeutig je Gemeinschaft. Nicht die technische `id`. |
| Gemeinschaft | `community_id` | Text (Verweis) | P | [[ENT-01 - Gemeinschaft]], die beschlossen hat. |
| Datum | `resolved_on` | Datum | P | Tag der Beschlussfassung. |
| TOP | `agenda_item` | Text | O | Tagesordnungspunkt, z. B. „TOP 5“. |
| Wortlaut | `wording` | Text | P | Beschlusstext, wie im Protokoll. |
| Art | `kind` | Text (Code) | O | `meeting` (Versammlung) oder `circulation` (Umlauf). |
| Umsetzungsstatus | `implementation_status` | Text (Code) | P | `implemented`, `open`, `superseded` (siehe Wertelisten). |
| Prüfgröße | `check_measure` | Text | O | Messbare Größe, z. B. „Vorschusshöhe je Monat“. |
| Vorgänge | `matter_ids` | Liste (Verweise) | O | Vorgänge zur Umsetzung ([[ENT-04 - Vorgang]]). |
| Quelle | `source_document_id` | Text (Verweis) | P | Protokoll in der Ablage ([[ENT-08 - Dokument]]). |

## Wertelisten

Umsetzungsstatus (geschlossen, aus dem WCS):

| Code | Anzeige |
| --- | --- |
| `implemented` | umgesetzt |
| `open` | offen |
| `superseded` | überholt |

Art (geschlossen): `meeting` = Versammlung, `circulation` = Umlauf.

## Beziehungen

Gehört genau einer [[ENT-01 - Gemeinschaft]]. Belegt durch ein Protokoll als [[ENT-08 - Dokument]], über [[ENT-07 - Quelle]] zuordenbar. [[ENT-04 - Vorgang]] setzt ihn um. Ein [[ENT-26 - Budget]] braucht einen Beschluss als Grundlage. Eine [[ENT-28 - Regel]] kann einen Beschluss als Fundstelle nennen. Eine [[ENT-09 - Entscheidungskarte]] kann einen Beschluss vorbereiten, ist aber kein Beschluss.

## Regeln und Lebenszyklus

- Entscheidung des Beirats, Empfehlung, Tagesordnungspunkt, Beschlussentwurf und dokumentierter Beschluss bleiben verschieden ([[DF-15 - Entscheidungskarte und Beschluss]]). Eine Entscheidungskarte erzeugt nie einen Beschluss.
- Ein Beschluss entsteht nur aus einer Quelle (Protokoll, Umlaufergebnis). Ohne Quelle gibt es keinen Beschluss.
- `open` → `implemented`, wenn die umsetzenden Vorgänge erledigt sind und die Prüfgröße stimmt; das setzt ein Mensch. `superseded`, wenn ein späterer Beschluss ihn ersetzt.
- Keine automatische Wirksamkeitsprüfung (DF-15). Umlaufbeschlüsse brauchen Allstimmigkeit, außer nach Absenkungsbeschluss (§ 23 Abs. 3 WEG); das Plugin prüft das nicht.
- Kein Agentenschreiben erzeugt einen Beschluss ([[PBI-42 - AI-Agent direkt mit den Notizen arbeiten lassen]]).

## Datenschutz

Wortlaut und Datum sind Sachinformation der Gemeinschaft. Namen von Eigentümern aus dem Protokoll (Abstimmungsverhalten, Wortmeldungen) werden nicht übernommen. Eine Einschätzung zur Umsetzung durch die Verwaltung gehört in die Bewertungsschicht ([[ENT-16 - Beiratsbewertung]]).

## Abweichungen vom WCS

- Technische `id` und `schema` kommen hinzu. Die WCS-„id“ wird zum fachlichen Feld `resolution_number`.
- Die Quelle ist ein Verweis auf ein Dokument im Vault, kein Link in eine externe Ablage.
- Das WCS stuft den Beschluss als v1-Should ein. Unser Backlog hat keine MVP-Story dafür. Das MVP bietet nur Quellenbezug, keine Beschluss-Sammlung (PRD Systemgrenze, DF-15). Daher `scope: spaeter`.

## Offene Punkte

- O-ENT25-1: Beschluss im MVP? Das WCS sagt v1-Should; Backlog und PRD sagen später. Zu entscheiden vor dem nächsten Release-Schnitt. Bis dahin gilt: Quellenbezug am Vorgang genügt ([[F-15 - Auswertungen und Feedback vertiefen]], WCS FR-V9).
- O-ENT25-2: Wortlaut im Frontmatter oder als Abschnitt im Notiztext? Lange Texte passen schlecht in Properties; ADR 0007 erlaubt einen Abschnitt nur, wenn der Vertrag ihn festlegt.
- O-ENT25-3: Wird der Umsetzungsstatus aus den Vorgängen vorgeschlagen? Vorschlag: nur ein Hinweis, gesetzt vom Menschen.
- O-ENT25-4: Gerichtliche Entscheidungen stehen auch in der Beschlusssammlung (§ 24 Abs. 7 WEG). Eigene Art oder außerhalb des Modells?

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7, Roadmap-Vision v0.2): Objekt Beschluss, Status v1 Should; Glossar Beschluss, Beschlusssammlung, Umlaufbeschluss, Entlastung (FR-V9, V4; §§ 23–25 WEG). Unser PRD: Systemgrenze „vollständige Beschluss-Sammlung“ später. Regel: [[DF-15 - Entscheidungskarte und Beschluss]]. PBIs: [[PBI-15 - Eine Entscheidungsvorlage prüfen]], [[PBI-35 - Versammlungsvorlage vorbereiten]], [[PBI-36 - Abgegrenzte Zeiträume auswerten]] (Durchlaufzeit Angebot bis Beschluss). Feature: [[F-15 - Auswertungen und Feedback vertiefen]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
