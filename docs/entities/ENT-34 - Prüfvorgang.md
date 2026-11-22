---
type: Entity
id: ENT-34
status: entwurf
scope: spaeter
category: bewegungsdaten
wcs: v1-offen
date: 2026-11-22
---

# ENT-34 · Prüfvorgang

## Zweck

Ein Prüfvorgang ist die Jahresprüfung des Beirats für eine Gemeinschaft und ein Wirtschaftsjahr. Er führt die Checkliste, gleicht Wirtschaftsplan, Vorschüsse und Jahresabrechnung ab, sammelt Feststellungen und endet mit der Stellungnahme des Beirats (§ 29 Abs. 2 WEG).

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `annual-audit-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. Das WCS kennt keine eigene Kennung. |
| Schemaversion | `schema` | Text | P | `weg-manager.annual-audit/v1`. |
| Gemeinschaft | `community_id` | Text (Verweis) | P | Geprüfte [[ENT-01 - Gemeinschaft]]. |
| Jahr | `fiscal_year` | Zahl | P | Geprüftes Wirtschaftsjahr. Ein Prüfvorgang je Gemeinschaft und Jahr. |
| Checkliste | `checklist` | Liste Text | P | Prüfschritte. Die Liste trägt den Weg von Hand vollständig. |
| Abgleich Plan | `plan_check` | Text (Code) | A | Wirtschaftsplan gegen Abrechnung: Ansätze und Ist. Berechnet, nicht gespeichert. |
| Abgleich Vorschüsse | `advance_payments_check` | Text (Code) | A | Beschlossene Vorschüsse gegen gebuchte Vorschüsse. Berechnet, nicht gespeichert. |
| Abgleich Abrechnung | `statement_check` | Text (Code) | A | Abrechnung in sich: Summen, Vermögensbericht, Erhaltungsrücklage. Berechnet, nicht gespeichert. |
| Feststellungen | `finding_ids` | Liste (Verweise) | A | [[ENT-35 - Feststellung]] dieses Prüfvorgangs. Ergibt sich aus deren `annual_audit_id`. |
| Stellungnahme | `statement_draft` | Text | P | Entwurf der Stellungnahme des Beirats. Freigabe durch den Beirat. |

A-Felder berechnet das Plugin. Sie stehen nach ADR 0007 nicht in der Notiz.

## Wertelisten

Ergebnis je Abgleich (Vorschlag, noch nicht im WCS; offen):

| Code | Anzeige |
| --- | --- |
| `consistent` | stimmig |
| `deviating` | abweichend |
| `missing` | Angabe fehlt |

Der Drei-Schritt-Abgleich (WCS FR-P4) ist kein einzelnes Feld, sondern drei berechnete Abgleiche: Plan, Vorschüsse, Abrechnung. Jeder Abgleich mit `deviating` oder `missing` ist ein Kandidat für eine Feststellung.

## Beziehungen

Gehört genau einer [[ENT-01 - Gemeinschaft]]. Grundlage sind Wirtschaftsplan und Jahresabrechnung als [[ENT-08 - Dokument]] (Soll-Liste: [[ENT-32 - Unterlage]]) und die Beschlüsse über Vorschüsse ([[ENT-25 - Beschluss]]). Jede [[ENT-35 - Feststellung]] gehört zu genau einem Prüfvorgang und wird ein [[ENT-04 - Vorgang]]. Die Stellungnahme kann als [[ENT-10 - Nachrichtenentwurf]] an die Verwaltung gehen; eine Freigabe ist eine Entscheidung ([[ENT-09 - Entscheidungskarte]]). Später können [[ENT-36 - Kostenbuchung]] und [[ENT-37 - Kontobewegung]] die Abgleiche speisen.

## Regeln und Lebenszyklus

- Zustände (Vorschlag): offen → in Prüfung → Stellungnahme freigegeben → abgeschlossen.
- Die Checkliste reicht, um ohne Plugin-Berechnung von Hand zu prüfen. Die Abgleiche sind Hilfe, kein Ersatz.
- Die Stellungnahme gibt nur der Beirat frei. Das Plugin sendet sie nie.
- Ein Abgleich stellt keine Rechtsfolge fest. Über die Jahresabrechnung beschließt die Gemeinschaft nur Nachschüsse und Anpassung der Vorschüsse (§ 28 Abs. 2 WEG).

## Datenschutz

Nur gemeinschaftsweite Zahlen werden übernommen. Einzelabrechnungen anderer Eigentümer gehören nicht in den Prüfvorgang. Notizen zu Entlastung und Verhalten der Verwaltung gehören in die Bewertungsschicht ([[ENT-16 - Beiratsbewertung]]), nicht in die Stellungnahme.

## Abweichungen vom WCS

- Technische `id` und `schema` kommen hinzu.
- Das WCS-Feld „abgleich“ wird in drei berechnete Felder geteilt.
- Feststellungen sind eigene Notes ([[ENT-35 - Feststellung]]), keine Unterfelder.
- Die Werteliste der Abgleiche ist ein Vorschlag.

## Offene Punkte

- O-ENT34-1 (erledigt): Entschieden am 22.11.2026 vom Produktverantwortlichen: Erster Schritt nach dem MVP. Im MVP erfasst der Beirat Feststellungen als Vorgänge (Art Frage, Thema Jahresabrechnung oder Wirtschaftsplan).
- O-ENT34-2: Woher kommen die Zahlen für die Abgleiche, solange es keine Kostenbuchungen gibt? Vorschlag: von Hand erfasste Summen je Abgleich.
- O-ENT34-3: Stellungnahme im Frontmatter oder als Abschnitt im Notiztext? ADR 0007 erlaubt einen Abschnitt nur, wenn der Vertrag ihn festlegt.
- O-ENT34-4: Wie wird die Freigabe der Stellungnahme festgehalten? Vorschlag: Verlaufseintrag mit Datum statt eigenem Feld.
- O-ENT34-5: Werteliste der Abgleiche festlegen.

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7, Roadmap-Vision v0.2): Objekt Prüfvorgang und Feststellung (Jahresprüfung, v1 laut Q8 offen); FR-P2, FR-P4; Glossar Beirat, Stellungnahme (§ 29 WEG), Jahresabrechnung (§ 28 Abs. 2, 4 WEG), Wirtschaftsplan und Vorschuss (§ 28 Abs. 1 WEG), Erhaltungsrücklage (§ 19 Abs. 2 Nr. 4 WEG). Keine PRD-Kennung und kein PBI im Backlog; verwandt mit [[F-14 - Berichte und Versammlungsvorbereitung]]. Regeln: [[DF-11 - Sachstand und Bewertung]], [[DF-12 - Gemeinschaftstrennung]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
