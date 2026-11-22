---
type: Entity
id: ENT-29
status: entwurf
scope: spaeter
category: stammdaten
wcs: spaeter
date: 2026-11-22
---

# ENT-29 · Vertrag

## Zweck

Ein Vertrag ist eine laufende Vereinbarung der Gemeinschaft mit einem Partner, z. B. Verwaltervertrag, Hausmeisterdienst, Wartung oder Energie. Er hält Laufzeit, Kündigungsfrist und Preisklausel fest und verweist auf das Original.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `agreement-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. |
| Schemaversion | `schema` | Text | P | `weg-manager.agreement/v1`. |
| Kennung (WCS-„id“) | `agreement_number` | Text | P | Vertragsnummer oder fachliche Kurzkennung, eindeutig je Gemeinschaft. Nicht die technische `id`. |
| Gemeinschaft | `community_id` | Text (Verweis) | P | Vertragspartei ([[ENT-01 - Gemeinschaft]]). |
| Art | `kind` | Text (Code) | P | Siehe Wertelisten. |
| Partner | `partner` | Text | P | Firma oder Dienstleister, z. B. „Verwaltung“, „Hausmeisterdienst“. |
| Beginn | `starts_on` | Datum | P | Vertragsbeginn. |
| Ende | `ends_on` | Datum | O | Leer bei unbefristetem Vertrag. |
| Kündigungsfrist | `notice_period` | Text | O | Z. B. „3 Monate zum Jahresende“. |
| Preisklausel | `price_clause` | Text | O | Z. B. „feste jährliche Steigerung“. |
| Dokument | `document_id` | Text (Verweis) | P | Vertrag in der Ablage ([[ENT-08 - Dokument]]). |

## Wertelisten

Art (geschlossen, aus dem WCS):

| Code | Anzeige |
| --- | --- |
| `property_management` | Verwaltervertrag |
| `caretaker` | Hausmeister |
| `maintenance` | Wartung |
| `energy` | Energie |
| `other` | Sonstiges |

## Beziehungen

Gehört genau einer [[ENT-01 - Gemeinschaft]]. Das Original ist ein [[ENT-08 - Dokument]]. [[ENT-31 - Anlage]] verweist auf ihren Wartungsvertrag. Der Partner ist eine Organisation, die als [[ENT-02 - Person und Rolle]] geführt werden kann. Eine Kündigungsfrist kann einen [[ENT-05 - Termin]] und einen [[ENT-04 - Vorgang]] auslösen. Der Verwaltervertrag ist eine Grundlage der förmlichen Erinnerung in der Eskalationsleiter ([[DF-05 - Eskalationsleiter und Fristen]]).

## Regeln und Lebenszyklus

- Ein Vertrag ohne Original in der Ablage ist eine Lücke in der Soll-Liste ([[ENT-32 - Unterlage]]).
- Das Plugin erinnert vor einer Kündigungsfrist nur über einen Vorgang oder Termin. Es kündigt nie selbst.
- Ein beendeter Vertrag bleibt erhalten; `ends_on` liegt dann in der Vergangenheit.

## Datenschutz

Partner sind Firmen. Namen von Ansprechpersonen beim Partner stehen nicht im Vertrag, sondern bei [[ENT-02 - Person und Rolle]]. Im Repository stehen nur neutrale Beispiele.

## Abweichungen vom WCS

- Technische `id` und `schema` kommen hinzu. Die WCS-„id“ wird zum fachlichen Feld `agreement_number`.
- Der Typname im Code ist `agreement`, weil „contract“ im Code schon den Dateivertrag (File contract) meint.
- Das WCS-Doppelfeld „beginn / ende“ wird in zwei Felder geteilt.

## Offene Punkte

- O-ENT29-1: Partner als Text oder als Verweis auf eine Person bzw. Organisation (`person_id`)? Hängt an der offenen WCS-Frage „Personen als Objekt oder weiter als Rolle“.
- O-ENT29-2: Kündigungsfrist strukturiert (Dauer und Stichtag), damit das Plugin den letzten Kündigungstag berechnen kann?

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7, Roadmap-Vision v0.2): Objekt Vertrag, Status später; Glossar Verwaltervertrag (§ 26 WEG), Eskalationsleiter Stufe 3 (§ 27 Abs. 1 WEG, Verwaltervertrag). Keine PRD-Kennung und kein PBI im Backlog. Regeln: [[DF-05 - Eskalationsleiter und Fristen]], [[DF-12 - Gemeinschaftstrennung]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
