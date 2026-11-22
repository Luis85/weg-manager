---
type: Entity
id: ENT-02
status: entwurf
scope: mvp
---

# ENT-02 · Ansprechpartner

## Zweck

Dokumentierter Kontakt einer beteiligten Person oder Organisation mit einer gemeinschaftsbezogenen Rolle.

## Wesentliche fachliche Angaben

Art (Person oder Firma); Name beziehungsweise Bezeichnung; bei Personen optional die Firma; Rolle (Verwaltung, Beirat, Hausmeister und Dienstleister, Eigentümer, Sonstige); Zuständigkeit für eine oder mehrere Gemeinschaften; benötigte Kontaktdaten (E-Mail, Telefon, Anschrift, Sprache, bevorzugter Kanal); Notiz; Kennzeichnung, wenn der Kontakt nicht mehr verwendet wird.

**Verteiler:** Eigentümer einer Gemeinschaft werden als Verteiler geführt: Gemeinschaft, Anzahl, Sprachaufteilung, Quelle und Stand. Einzelne Eigentümeradressen sind dafür nicht nötig.

## Beziehungen

Wird einer Gemeinschaft zugeordnet und kann als Verantwortlicher, dokumentierter Beteiligter oder Empfänger verwendet werden. Gleiche reale Personen können in mehreren Gemeinschaftskontexten vorkommen; deren Zuordnungen bleiben unterscheidbar.

[[ENT-01 - Gemeinschaft]], [[ENT-04 - Punkt]], [[ENT-06 - Ereignis]], [[ENT-10 - Nachrichtenentwurf]], [[ENT-12 - Eigene Aufgabe]].

## Regeln und Lebenszyklus

Eine Kontaktänderung verändert historische Nachrichten nicht. Eine Rolle verleiht weder Berechtigungen noch rechtliche Befugnisse. Ansprechpartner ist ein gespeicherter Fachbezug, ein Akteur beschreibt dagegen eine Rolle im Systemkontext.

## Modellierungsgrenze und offene Punkte

Designstand 15.11.2026: ein Kontakt mit gemeinsamen Kontaktdaten und Zuständigkeit je Gemeinschaft (VIEW-08). Entschieden am 22.11.2026 (O-D10 in [[09 - Offene Punkte vor Implementierung]]): Ein Kontakt hat eine Rolle; eine abweichende Rolle je Gemeinschaft steht in der Notiz und kann mit einer neuen Schemaversion folgen.

## Herkunft und Anforderungen

PRD 1.1: B-FR-01; Fachliches Modell; DF-01/12.

[[PBI-02 - Ansprechpartner zuordnen]].

[MVP-PRD](../../02-MVP-PRD.md) · [[Product Backlog.base#Business Rules]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]].
