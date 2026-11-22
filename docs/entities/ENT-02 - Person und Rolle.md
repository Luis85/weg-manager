---
type: Entity
id: ENT-02
status: entwurf
scope: mvp
category: stammdaten
wcs: v1-offen
date: 2026-11-22
---

# ENT-02 · Person und Rolle

## Zweck

Eine Person oder Organisation mit einer Rolle in einer Gemeinschaft, etwa die Verwaltung, ein Beirat oder ein Hausmeisterdienst. Sie wird als Verantwortliche, Beteiligte oder Empfängerin verwendet. In der Oberfläche heißt der Bereich weiter „Kontakte“.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `person-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. |
| Schema | `schema` | Text | P | `weg-manager.person/v1` (vorgeschlagen). |
| Art | `kind` | Text | P | Person oder Organisation (Firma). Bisherige Angabe unseres Modells. |
| Name | `name` | Text | P | Name beziehungsweise Bezeichnung, z. B. „Verwaltung“, „Hausmeisterdienst“. |
| Firma | `organization` | Text | O | Bei Personen die Organisation, für die sie handeln. |
| Rolle | `role` | Text | P | WCS „rolle“. Wert aus der Rollenliste (siehe Wertelisten). |
| Gemeinschaft | `community_ids` | Liste | P | WCS „gemeinschaft“: Bezug der Rolle. Bei uns eine oder mehrere Gemeinschaften (siehe O-ENT02-1). |
| Kontakt | `email`, `phone`, `address`, `preferred_channel` | Text | O | WCS „kontakt“. Nur für Gegenüber: Verwaltung, Beiräte, Dritte. Keine Eigentümerdaten in geteilten Bereichen. |
| Sprache | `language` | Text | O | WCS „sprache“: `de` oder `de+en`. Eigentümer immer `de+en`. |
| Notiz | Body | Text | O | Freier Text des Menschen. |
| Nicht mehr verwendet | `inactive` | Checkbox | O | Kennzeichnet einen Kontakt, der nicht mehr genutzt wird. Historische Bezüge bleiben. |

**Verteiler:** Die Eigentümer einer Gemeinschaft werden als Verteiler geführt, nicht als einzelne Personen. Angaben: Gemeinschaft, Anzahl, Sprachaufteilung, Quelle und Stand. Einzelne Eigentümeradressen sind dafür nicht nötig.

## Wertelisten

**Rolle (geschlossen, WCS):**

| Rolle | Code (vorgeschlagen) | Hinweis |
| --- | --- | --- |
| Beirat | `board` | Der Bearbeiter. Sieht die Bewertungsschicht. |
| Vertretung | `deputy` | Vertritt den Beirat. Sieht die Bewertungsschicht. |
| Eigentümer | `owner` | Nur als Verteiler, siehe oben. |
| Verwaltung | `manager` | Ohne Zugang zur Bewertungsschicht. Die Eskalationsleiter gilt nur für sie. |
| Beirat andere Gemeinschaft | `other_board` | Gegenüber in einer Nachbargemeinschaft. |
| Dritte | `third_party` | Etwa Hausmeisterdienst, Dienstleister, Handwerker. |
| Agent | `agent` | Optional. Ein vom Nutzer freigegebener KI-Agent ([[K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]). |

Unsere bisherigen Rollen werden so abgebildet: Verwaltung → Verwaltung; Beirat → Beirat; Hausmeister und Dienstleister → Dritte; Eigentümer → Eigentümer; Sonstige → Dritte.

**Sprache (geschlossen):** `de`, `de+en`.

## Beziehungen

Eine Person wird einer oder mehreren Gemeinschaften zugeordnet. Sie kann Verantwortliche eines Vorgangs (`wer`), Verfasserin eines Verlaufseintrags (`von`), Empfängerin eines Nachrichtenentwurfs oder Verantwortliche eines To-dos sein. Dieselbe reale Person kann in mehreren Gemeinschaften vorkommen; ihre Zuordnungen bleiben unterscheidbar. Später ist die Verwaltung als Verwalter einer Gemeinschaft und als Vertragspartner verknüpft.

[[ENT-01 - Gemeinschaft]], [[ENT-04 - Vorgang]], [[ENT-06 - Verlaufseintrag]], [[ENT-10 - Nachrichtenentwurf]], [[ENT-12 - To-do]], [[ENT-16 - Beiratsbewertung]], [[ENT-24 - Einheit]], [[ENT-29 - Vertrag]].

## Regeln und Lebenszyklus

- Eine Kontaktänderung verändert historische Nachrichten nicht.
- Eine Rolle verleiht weder Berechtigungen noch rechtliche Befugnisse ([[DF-01 - Beiratsarbeit und Befugnis]]). Ausnahme ist nur die Sichtbarkeit der Bewertungsschicht für Beirat und Vertretung.
- Person mit Rolle ist ein gespeicherter Fachbezug. Ein Akteur beschreibt dagegen eine Rolle im Systemkontext.
- Die Rolle „Agent“ ist optional. Ein Agent bereitet vor, sendet aber nie.
- Ein Kontakt wird nicht gelöscht, solange Vorgänge oder Nachrichten auf ihn verweisen; er wird als nicht mehr verwendet gekennzeichnet.

## Datenschutz

Kontaktdaten sind personenbezogen. Gespeichert werden sie nur für Gegenüber: Verwaltung, Beiräte, Dritte. Daten einzelner Eigentümer werden nicht gespeichert, außer wo nötig, und dann getrennt im privaten Bereich ([[ENT-24 - Einheit]]). Sie gehen nie in Entwürfe, Karten, Berichte oder ein öffentliches Repository (WCS NFR-2, FR-E4; [[DF-10 - Vertraulichkeitsprüfung]]).

## Abweichungen vom WCS

- Im WCS v1 ist die Person nur Text in `Vorgang.wer`. Bei uns ist sie eine eigene Note mit technischer `id`.
- Die Rolle für den KI-Assistenten heißt „Agent“, nicht nach einem Produkt („Claude“), und ist optional.
- Eine Person kann bei uns mehreren Gemeinschaften zugeordnet sein; im WCS hat jede Rolle genau eine Gemeinschaft.
- Art (Person/Firma), Firma, getrennte Kontaktfelder, Verteiler und „nicht mehr verwendet“ sind unsere Ergänzungen.

## Offene Punkte

- **O-ENT02-1:** Kann dieselbe Person je Gemeinschaft eine andere Rolle haben (bisher O-D10 in [[09 - Offene Punkte vor Implementierung]])? Das WCS legt die Rolle je Gemeinschaft fest; unser Prototyp hat eine Rolle je Kontakt und Zuständigkeit je Gemeinschaft.
- **O-ENT02-2:** Personen als Objekt oder weiter als Rolle in `Vorgang.wer`? Datenschutzgrenze für Eigentümerdaten klären (WCS, offener Punkt).
- **O-ENT02-3:** Gilt „Kontakt nur für Gegenüber“ auch für Dritte wie den Hausmeisterdienst? Unser Modell führt für sie bisher Telefon und Anschrift.
- **O-ENT02-4:** Wird der Verteiler als eigene Note geführt oder als Angabe an der Gemeinschaft?

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7, Roadmap-Vision v0.2): Person/Rolle, FR-ROL1, NFR-2, FR-E4. Unser [MVP-PRD](../02-MVP-PRD.md): B-FR-01, Fachliches Modell (bisher „Ansprechpartner“), AT-B01. Regeln: [[DF-01 - Beiratsarbeit und Befugnis]], [[DF-12 - Gemeinschaftstrennung]]. Entscheidung: [[K-20 - WCS-Datenmodell als fachliche Grundlage]]. Ansicht VIEW-08 (Kontakte, Designstand 15.11.2026).

[[PBI-02 - Personen und Rollen zuordnen]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
