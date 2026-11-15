---
type: Entity
id: ENT-19
status: entwurf
scope: spaeter
---

# ENT-19 · Rechnung

## Zweck

Versionierte fachliche Erfassung eines Rechnungsdokuments und seiner eindeutig belegten Betragsbasis.

## Wesentliche fachliche Angaben

Gemeinschaft und fachlicher Kontext; Lieferant; Rechnungsnummer; Datum; Fälligkeit; Art Einzel-/Abschlags-/Schlussrechnung; Original und Fassung; Dokumentgesamtbetrag; laut Dokument noch zu zahlender Betrag; Dokumentbasis mit bereits berücksichtigten Anrechnungen; Prüfstand; Freigabevermerk; Klärungsbedarf; Bezug auf Vorgänger oder Abschläge.

## Beziehungen

Lieferant über [[ENT-02 - Ansprechpartner]], Fälligkeit über [[ENT-05 - Termin]], Belege über [[ENT-07 - Quelle]] und [[ENT-08 - Dokument]]. [[ENT-20 - Zahlungseintrag]] gehört jeweils genau einer Rechnung und bezieht sich auf eine bestimmte Version ihrer Dokumentbasis. Ein Abschlagsverweis kann eine andere Rechnung referenzieren; er ist kein neuer Zahlungseintrag.

## Regeln und Lebenszyklus

Dokumentgesamtbetrag und Zahlbetrag zum Dokumentstand sind getrennt. Der dokumentierte Rest zieht nur eindeutig zusätzliche, nicht stornierte, als erfolgt gemeldete Zahlungen ab. Bereits berücksichtigte Abschläge werden nicht erneut abgezogen. Bei unklarer oder geänderter Basis ist Zuordnung zu prüfen, statt einen verlässlichen Rest vorzutäuschen. Eine Überzahlung bleibt sichtbar.

## Modellierungsgrenze und offene Punkte

Dokumentbasis bezeichnet hier die versionierten Angaben innerhalb der Rechnung, keine vorgeschriebene eigene Tabelle. Rechnungsrest, Prüfung und Freigabevermerk bleiben unterschiedliche Aussagen. Dies ist keine Finanzbuchhaltung; das vollständige operative Modell wird vor Umsetzung erneut geprüft.

Die Note konkretisiert den späteren Ausbau und erweitert nicht den aktuellen MVP. Technische Speicherung und endgültiger Umfang bleiben offen.

## Herkunft und Anforderungen

PBI-39 und historisches PRD 1.0, FR-12/14 sowie Zahlungsmodell.

[[PBI-39 - Dokumentierten Rechnungsrest nachvollziehen]].

**Business Rules:** [[DF-18 - Rechnungsbasis und dokumentierter Rest]], [[DF-19 - Zahlungsstatus und Korrektur]], [[DF-20 - Abschläge ohne doppelte Anrechnung]], [[DF-21 - Unklare Zuordnung und Sammelzahlungen]].

[MVP-PRD](../../02-MVP-PRD.md) · PRD 1.0 als historische Quelle (historische Quelle im Git-Commit `b3a1cc2`, Pfad `docs/history/02-MVP-PRD-v1.0.md`) · [[Product Backlog.base#Design Foundations|Entitätsnotes]].
