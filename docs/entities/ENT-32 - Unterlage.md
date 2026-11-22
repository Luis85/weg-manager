---
type: Entity
id: ENT-32
status: entwurf
scope: spaeter
category: stammdaten
wcs: spaeter
date: 2026-11-22
---

# ENT-32 · Unterlage

## Zweck

Eine Unterlage ist ein Eintrag der Soll-Liste (Unterlagen-Inventar): ein Dokument, das eine Gemeinschaft haben muss, z. B. die Teilungserklärung mit Aufteilungsplan. Der Abgleich mit der Ablage zeigt Lücken; jede Lücke wird ein Vorgang.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `document-requirement-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. Das WCS kennt keine eigene Kennung. |
| Schemaversion | `schema` | Text | P | `weg-manager.document-requirement/v1`. |
| Gemeinschaftstyp | `community_kind` | Text | P | Für welche Art von Gemeinschaft das Soll gilt, z. B. „WEG“ oder „Tiefgarage“. Freier Text wie die Art der Gemeinschaft. |
| Art | `kind` | Text (Code) | P | Siehe Wertelisten. |
| Bezeichnung | `title` | Text | P | Z. B. „Teilungserklärung mit Aufteilungsplan“. |
| Ist vorhanden | `is_present` | Checkbox | A | Ergebnis des Abgleichs mit der Ablage. Berechnet, nicht gespeichert. |
| Ablage | `document_id` | Text (Verweis) | O | Fundort: das [[ENT-08 - Dokument]] im Vault. |
| Vorgang | `matter_id` | Text (Verweis) | A | Bei Lücke angelegter [[ENT-04 - Vorgang]] (siehe O-ENT32-3). |

A-Felder berechnet das Plugin. Sie stehen nach ADR 0007 nicht in der Notiz.

## Wertelisten

Art (geschlossen, aus dem WCS):

| Code | Anzeige |
| --- | --- |
| `deed` | Urkunde |
| `agreement` | Vertrag |
| `insurance_policy` | Police |
| `minutes` | Protokoll |
| `resolution_register` | Beschlusssammlung |
| `annual_statement` | Abrechnung |
| `business_plan` | Wirtschaftsplan |
| `inspection_report` | Abnahme-/Prüfprotokoll |

## Beziehungen

- **Abgrenzung zu [[ENT-08 - Dokument]]:** Die Unterlage ist das Soll („diese Unterlage muss es geben“). Das Dokument ist das vorhandene Original („diese Datei liegt vor“). Eine Unterlage verweist auf höchstens ein Dokument; ein Dokument kann ohne Soll-Eintrag existieren.
- „Unterlagen einstufen“ in [[PBI-26 - Unterlagen einstufen und korrigieren]] meint Inhalte allgemein, nicht diesen Soll-Eintrag.
- Arten wie Vertrag und Police entsprechen [[ENT-29 - Vertrag]] und [[ENT-30 - Police]]; Protokolle belegen [[ENT-25 - Beschluss]]; Abrechnung und Wirtschaftsplan sind Grundlage von [[ENT-34 - Prüfvorgang]].
- Eine Lücke wird ein [[ENT-04 - Vorgang]] der betroffenen [[ENT-01 - Gemeinschaft]].

## Regeln und Lebenszyklus

- Das Soll gilt je Gemeinschaftstyp; der Abgleich läuft je Gemeinschaft.
- Fehlt eine Unterlage, legt der Abgleich genau einen Vorgang an. Ein zweiter Abgleich legt keinen zweiten an (keine Dubletten, vgl. [[PBI-07 - Dubletten zusammenführen]]).
- Ablageregel des WCS: Dateiname `JJJJ-MM-TT Art Thema.pdf`; oben im Ordner nur gültige Endfassungen, Überholtes in „Archiv“, Entwürfe in „Entwürfe und Unterlagen“. Abgelegt wird im Vault.

## Datenschutz

Das Soll ist nicht personenbezogen. Vorhandene Dokumente können private Daten anderer Eigentümer enthalten; dann gilt ihre Einstufung ([[DF-10 - Vertraulichkeitsprüfung]]). Die WCS-Liste „Private Daten“ führt solche Dateien und ihren Ablageort getrennt.

## Abweichungen vom WCS

- Technische `id` und `schema` kommen hinzu.
- Der Gemeinschaftstyp ist freier Text, kein geschlossenes Enum „WEG oder TG“ ([[K-20 - WCS-Datenmodell als fachliche Grundlage]]).
- Die Ablage ist ein Verweis auf ein Dokument im Vault, kein Link nach Drive.
- Automatisch angelegte Vorgänge sind ein Vorschlag des Abgleichs. Ob er ohne Bestätigung entsteht, ist offen (O-ENT32-4).

## Offene Punkte

- O-ENT32-1: Soll-Liste als Vorlage je Gemeinschaftstyp plus Einträge je Gemeinschaft? Ein Eintrag je Typ kann `is_present` und `document_id` nicht je Gemeinschaft tragen. Vorschlag: Vorlage je Typ, Unterlage je Gemeinschaft mit `community_id`.
- O-ENT32-2: Wie findet der Abgleich das passende Dokument? Über `document_id`, über die Ablageregel im Dateinamen oder beides?
- O-ENT32-3: Wo wird der Bezug zwischen Lücke und Vorgang gespeichert? Ein berechnetes Feld steht nicht in der Notiz; der Bezug muss am Vorgang oder an der Unterlage gespeichert werden, damit kein zweiter Vorgang entsteht.
- O-ENT32-4: Legt der Abgleich den Vorgang selbst an oder schlägt er ihn vor? Vorschlag: Vorschlag mit Bestätigung, wie andere vorbereitete Aktionen ([[ENT-33 - Vorbereitete Aktion]]).

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7, Roadmap-Vision v0.2): Objekt Unterlage (Soll-Liste), Status später; Glossar Unterlagen-Inventar (FR-E9, V12), Ablageregel (FR-E2), Private Daten (FR-E3). Keine PRD-Kennung und kein PBI im Backlog. Regeln: [[DF-08 - Quellenabdeckung]], [[DF-10 - Vertraulichkeitsprüfung]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
