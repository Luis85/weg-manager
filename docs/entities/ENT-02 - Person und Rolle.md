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
| Technische Identität | `id` | Text | P | `contact-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. |
| Schema | `schema` | Text | P | `weg-manager.contact/v1` (entschieden 23.11.2026, [[PBI-02 - Personen und Rollen zuordnen]]). |
| Art | `kind` | Text | P | Person oder Organisation (Firma). Bisherige Angabe unseres Modells. |
| Name | `name` | Text | P | Name beziehungsweise Bezeichnung, z. B. „Verwaltung“, „Hausmeisterdienst“. |
| Firma | `organization_id` | Text | O | Bei Personen die `id` der Firmen-Notiz, für die sie handeln (entschieden 23.11.2026). |
| Rollen je Gemeinschaft | `roles` | Liste | P | WCS „rolle“ und „gemeinschaft“: je Eintrag `<id der Gemeinschaft>:<Rolle>`, etwa Beirat in der WEG und Eigentümer in der Tiefgarage (O-ENT02-1). Kodierte Liste, damit die Schlüssel flach bleiben ([[docs/adr/0007-vault-data-access.md\|ADR 0007]], Nachtrag). Ein fehlerhafter Eintrag ist ein Problem. |
| Privat | `private` | Checkbox | P | Wahr für Eigentümer und andere Privatpersonen. Aus privaten Notizen übernimmt das Plugin nie Inhalte in Entwürfe, Karten, Berichte oder Freigaben; ein Agent liest sie nicht (O-ENT02-2). |
| Kontakt | `email`, `phone` (in v1), `address`, `preferred_channel` (später) | Text | O | WCS „kontakt“. Bei privaten Personen nur, wo nötig; nie in geteilten Bereichen. |
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

Kontaktdaten sind personenbezogen. Seit dem 22.11.2026 werden alle Personen als Notiz geführt, auch Eigentümer, alle im selben Ordner. Eigentümer und andere Privatpersonen tragen `private: true`. Aus solchen Notizen übernimmt das Plugin nie Inhalte in Ausgaben, und ein Agent liest sie nicht. Daten einzelner Eigentümer werden nur gespeichert, wo nötig ([[ENT-24 - Einheit]]). Sie gehen nie in Entwürfe, Karten, Berichte oder ein öffentliches Repository (WCS NFR-2, FR-E4; [[DF-10 - Vertraulichkeitsprüfung]]).

## Abweichungen vom WCS

- Im WCS v1 ist die Person nur Text in `Vorgang.wer`. Bei uns ist sie eine eigene Note mit technischer `id`.
- Die Rolle für den KI-Assistenten heißt „Agent“, nicht nach einem Produkt („Claude“), und ist optional.
- Eine Person hat je Gemeinschaft eine Rolle, gespeichert als kodierte Liste `roles` in einer Notiz je Person; im WCS ist jede Rolle ein eigener Eintrag mit genau einer Gemeinschaft.
- Art (Person/Firma), Firma, getrennte Kontaktfelder, Verteiler und „nicht mehr verwendet“ sind unsere Ergänzungen.

## Offene Punkte

- **O-ENT02-1 (erledigt):** Entschieden am 22.11.2026 vom Produktverantwortlichen: Eine Person hat je Gemeinschaft eine Rolle, wie im WCS; dieselbe Person kann in der WEG Beirat und in der Tiefgarage Eigentümer sein.
- **O-ENT02-2 (erledigt):** Entschieden am 22.11.2026 vom Produktverantwortlichen: Alle Personen werden als eigene Notiz geführt, auch Eigentümer. Alle Personennotizen liegen in einem gemeinsamen Ordner. Eigentümerdaten schützt eine Markierung je Notiz (`private: true`): Das Plugin übernimmt aus markierten Notizen nie Inhalte in Entwürfe, Karten, Berichte oder Freigaben, und ein Agent liest sie nicht. Abweichung vom WCS (dort Rolle als Text in `wer`).
- **O-ENT02-3:** Gilt „Kontakt nur für Gegenüber“ auch für Dritte wie den Hausmeisterdienst? Unser Modell führt für sie bisher Telefon und Anschrift.
- **O-ENT02-4:** Wird der Verteiler als eigene Note geführt oder als Angabe an der Gemeinschaft?

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7, Roadmap-Vision v0.2): Person/Rolle, FR-ROL1, NFR-2, FR-E4. Unser [MVP-PRD](../02-MVP-PRD.md): B-FR-01, Fachliches Modell (bisher „Ansprechpartner“), AT-B01. Regeln: [[DF-01 - Beiratsarbeit und Befugnis]], [[DF-12 - Gemeinschaftstrennung]]. Entscheidung: [[K-20 - WCS-Datenmodell als fachliche Grundlage]]. Ansicht VIEW-08 (Kontakte, Designstand 15.11.2026).

[[PBI-02 - Personen und Rollen zuordnen]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
