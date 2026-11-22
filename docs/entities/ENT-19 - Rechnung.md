---
type: Entity
id: ENT-19
status: entwurf
scope: spaeter
category: bewegungsdaten
wcs: keine
date: 2026-11-22
---

# ENT-19 · Rechnung

## Zweck

Die versionierte fachliche Erfassung eines Rechnungsdokuments und seiner eindeutig belegten Betragsbasis. Das WCS führt keine Rechnung als Objekt. Es kennt die [[ENT-36 - Kostenbuchung]] (Buchungs- oder Rechnungsdatum, gemeinschaftsweiter Betrag, Weiterbelastung, Abgleichstatus).

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `invoice-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. |
| Schema | `schema` | Text | P | `weg-manager.invoice/v1` (vorgeschlagen). |
| Gemeinschaft | `community_id` | Text | P | Genau eine Gemeinschaft. WCS `Kostenbuchung.quelle` (zahlende Gemeinschaft). |
| Fachlicher Kontext | `matter_id` | Text | O | Zugehöriger Vorgang, etwa eine Rechnungsfrage. |
| Lieferant | `supplier_id` | Text | P | [[ENT-02 - Person und Rolle]]. |
| Rechnungsnummer | `invoice_number` | Text | P | Lesbare Nummer des Lieferanten, nicht die Identität. |
| Datum | `invoiced_on` | Datum | P | WCS `Kostenbuchung.datum`. |
| Fälligkeit | `due_on` | Datum | O | [[ENT-05 - Termin]]. |
| Art | `invoice_kind` | Text | P | Einzel-, Abschlags- oder Schlussrechnung. |
| Original und Fassung | `link`, `version` | Text | P | [[ENT-08 - Dokument]]. |
| Dokumentgesamtbetrag | `total_eur` | Zahl | P | WCS `Kostenbuchung.betrag`, nur gemeinschaftsweit. |
| Zahlbetrag laut Dokument | `payable_eur` | Zahl | O | Laut Dokument noch zu zahlen. |
| Dokumentbasis | – | – | – | Versionierte Angaben mit bereits berücksichtigten Anrechnungen. |
| Prüfstand | `checked` | Text | O | |
| Freigabevermerk | `approval_note` | Text | O | |
| Klärungsbedarf | `needs_clarification` | Checkbox | O | |
| Vorgänger und Abschläge | `previous_invoice_ids` | Liste | O | |
| Budget, Gemeingut | `budget_id`, `common_property_id` | Text | O | Später, wie WCS `Kostenbuchung.gemeingut / budget`. |
| Dokumentierter Rest | – | Zahl | A | Berechnet nach [[DF-18 - Rechnungsbasis und dokumentierter Rest]]. |

**Abbildung auf das WCS:** Rechnung ↔ Kostenbuchung: Die Rechnung ist der Beleg, die Kostenbuchung die gemeinschaftsweite Buchung daraus. `abgleichstatus` (gebucht, abweichend, fehlt) entspricht unserem Prüf- und Klärungsstand.

## Wertelisten

**Art (geschlossen):** Einzelrechnung (`single`), Abschlagsrechnung (`instalment`), Schlussrechnung (`final`).

## Beziehungen

Lieferant über [[ENT-02 - Person und Rolle]], Fälligkeit über [[ENT-05 - Termin]], Belege über [[ENT-07 - Quelle]] und [[ENT-08 - Dokument]]. Ein [[ENT-20 - Zahlungseintrag]] gehört jeweils genau einer Rechnung und bezieht sich auf eine bestimmte Version ihrer Dokumentbasis. Ein Abschlagsverweis kann eine andere Rechnung referenzieren; er ist kein neuer Zahlungseintrag. Später entsteht aus der Rechnung eine Kostenbuchung, die einem Budget oder Gemeingut zugeordnet wird.

[[ENT-18 - Angebot]], [[ENT-26 - Budget]], [[ENT-27 - Gemeingut]], [[ENT-36 - Kostenbuchung]], [[ENT-37 - Kontobewegung]].

## Regeln und Lebenszyklus

- Dokumentgesamtbetrag und Zahlbetrag zum Dokumentstand sind getrennt.
- Der dokumentierte Rest zieht nur eindeutig zusätzliche, nicht stornierte, als erfolgt gemeldete Zahlungen ab ([[DF-19 - Zahlungsstatus und Korrektur]]).
- Bereits berücksichtigte Abschläge werden nicht erneut abgezogen ([[DF-20 - Abschläge ohne doppelte Anrechnung]]).
- Bei unklarer oder geänderter Basis ist die Zuordnung zu prüfen, statt einen verlässlichen Rest vorzutäuschen ([[DF-21 - Unklare Zuordnung und Sammelzahlungen]]).
- Eine Überzahlung bleibt sichtbar.
- Rechnungsrest, Prüfung und Freigabevermerk bleiben unterschiedliche Aussagen.

## Datenschutz

Nur gemeinschaftsweite Rechnungen. Einzelabrechnungen von Eigentümern werden nicht als Rechnung erfasst.

## Abweichungen vom WCS

Das WCS kennt keine Rechnung, nur die Kostenbuchung. Die Note bleibt als unsere Ergänzung eigenständig, weil sie Dokumentbasis, Abschläge und dokumentierten Rest trägt. Dies ist keine Finanzbuchhaltung. Die Note konkretisiert den späteren Ausbau und erweitert nicht den aktuellen MVP.

## Offene Punkte

- **O-ENT19-1:** Zusammenführung mit [[ENT-36 - Kostenbuchung]]: eine Rechnung mit Buchungsangaben oder zwei Objekte? Hängt an der WCS-Frage, ob Kostenbuchung, Kontobewegung und Budget zusammen gebaut werden (Roadmap-Frage 2).
- **O-ENT19-2:** Dokumentbasis bezeichnet die versionierten Angaben innerhalb der Rechnung, keine vorgeschriebene eigene Tabelle. Das vollständige operative Modell wird vor Umsetzung erneut geprüft.
- **O-ENT19-3:** Technische Speicherung und endgültiger Umfang bleiben offen.

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (Roadmap-Vision v0.2): Kostenbuchung, Durchlaufposten V2, Budget V3. PBI-39 und historisches PRD 1.0, FR-12/14 sowie Zahlungsmodell (Git-Commit `b3a1cc2`, Pfad `docs/history/02-MVP-PRD-v1.0.md`). Unser [MVP-PRD](../02-MVP-PRD.md): Systemgrenze (Rechnungsrest und Buchhaltung später). Regeln: [[DF-18 - Rechnungsbasis und dokumentierter Rest]], [[DF-19 - Zahlungsstatus und Korrektur]], [[DF-20 - Abschläge ohne doppelte Anrechnung]], [[DF-21 - Unklare Zuordnung und Sammelzahlungen]].

[[PBI-39 - Dokumentierten Rechnungsrest nachvollziehen]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
