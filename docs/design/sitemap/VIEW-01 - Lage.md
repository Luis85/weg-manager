---
type: Page
id: VIEW-01
status: entwurf
scope: mvp
version: "2.0"
date: 2026-11-15
navigation: primär
requirements:
  - "[[F-21 - Nichtfunktionale Anforderungen]]"
  - "[[PBI-01 - Gemeinschaftskontext wählen]]"
  - "[[PBI-13 - Aktuelle Wochenlage öffnen]]"
  - "[[PBI-24 - Zwischendurch Dringlichkeit prüfen]]"
  - "[[PBI-25 - Nächste Wochenarbeit vorbereiten]]"
  - "[[PBI-33 - Wochenarbeit auf dem Handy abschließen]]"
  - "[[PBI-76 - Nach der Einrichtung auf der Lage mit Ersten Schritten ankommen]]"
  - "[[PBI-77 - Beim ersten Benutzen eines Bereichs einen Hinweis erhalten]]"
entities:
  - "[[docs/entities/ENT-01 - Gemeinschaft]]"
  - "[[docs/entities/ENT-04 - Vorgang]]"
  - "[[docs/entities/ENT-05 - Termin]]"
  - "[[docs/entities/ENT-06 - Verlaufseintrag]]"
  - "[[docs/entities/ENT-13 - Eskalation]]"
  - "[[docs/entities/ENT-14 - Übergabe]]"
business-rules:
  - "[[docs/business-rules/DF-04 - Fehlender Termin]]"
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
  - "[[docs/business-rules/DF-09 - Begrenzte Auswahl und Dringlichkeit]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-04 - Wochenpaket beim Einstieg aktualisieren]]"
  - "[[docs/decisions/K-05 - Sieben reguläre Entscheidungen mit sichtbarem Überlauf]]"
  - "[[docs/decisions/K-09 - Vollständige mobile Wochenarbeit unterstützen]]"
hypotheses:
  - "[[docs/hypothesis/H-07 - Obsidian trägt die tatsächliche mobile Arbeit]]"
mockups:
  - "[[docs/design/sitemap/assets/v2-P-D-01-Lage.png]]"
  - "[[docs/design/sitemap/assets/v2-P-M-01-Lage.png]]"
  - "[[docs/design/sitemap/assets/v2-D1-Lage-dark.png]]"
  - "[[docs/design/sitemap/assets/v2-M1-Lage-dark.png]]"
---

# VIEW-01 · Lage

**Rolle:** Start und Lagecheck. Beantwortet in unter einer Minute: Was ist seit meiner Übergabe passiert, was drängt, wann ist die nächste Wochenarbeit?

## Aufbau (von oben nach unten)

1. **Kopf:** „Lage“, Datum, „N Verlaufseinträge seit deiner Übergabe am …“, Stand des Portals („zuletzt geprüft …“). Kein grünes Gesamturteil bei Datenlücken. Neben dem Titel steht der aktive Gemeinschaftsfilter als Chip mit × (FilterTag); ohne Filter „Alle Gemeinschaften“. Gleiches gilt für die Köpfe von Vorgänge und Postausgang.
2. **Vier Kennzahl-Kacheln** (anklickbar): Dringend (rot, mit Grund), Ungeprüft (amber, Eingänge ohne Zuordnung), Wartet auf Antwort (Wartezeit-Balken je Zusage), Entscheidungen (Budgetleiste 7 + roter Überlauf).
3. **Wochenarbeit-Karte:** Datum, geschätzte Dauer, Schrittchips mit Mengen, Button „Woche starten“ bzw. „Fortsetzen bei Schritt N“.
4. **Neu seit Übergabe:** Verlaufseinträge nach Tag gruppiert. Zeile = Symbol (Fakt/Warnung/Handlung) · Gemeinschaftskürzel · Satz mit hervorgehobenem Kern · Status-Chip · Vorgangsnummer.
5. **Seitenspalte:** Deine 3 Schwerpunkte aus der letzten Übergabe (mit Vorgangsnummer und aktuellem Status) und Kontextnotiz; Nächste 14 Tage als Liste (Fremdfrist vs. eigene Wiedervorlage beschriftet), ohne zusätzliche Tagesleiste. Schwerpunkte mit Vorgang und jeder Termin öffnen direkt die Vorgangsakte; der Termin „Wochenarbeit“ startet die Woche.

![[v2-P-D-01-Lage.png]]

## Verhalten und Regeln

- Wird beim Öffnen aktualisiert (K-04); ein ausgeschaltetes Plugin hat nichts im Hintergrund geprüft – der Kopf sagt das.
- Filter „Alle“ zeigt beide Gemeinschaften; jede Zeile trägt ihr Kürzel. Kein Bearbeiten im Filterkontext „Alle“ ohne eindeutige Gemeinschaft.
- Dringendes ist immer vollständig sichtbar, unabhängig vom Entscheidungsbudget (DF-09).
- „Überfällig“ ist ein Prüfvermerk, keine Bewertung (DF-02). Die Bewertung „nicht eingehalten“ erscheint nur, wenn der Beirat sie gesetzt hat.
- Zeile antippen → Vorgangsakte (Desktop: Seitenpanel; mobil: Vollbild) mit Rückweg an dieselbe Stelle.

## Mobil

Segment-Navigation oben (Lage · Woche · Vorgänge · Post), Gemeinschaftsfilter als Pill (mit Rahmen hervorgehoben, wenn aktiv), Kennzahlen als 4er-Reihe, Wochenkarte, Feed. „Erfassen“ schwebt über der Obsidian-Navigation.

![[v2-P-M-01-Lage.png|180]]

## Zustände

| Zustand | Darstellung |
| --- | --- |
| Erststart ohne Daten | Ohne Gemeinschaft zeigt die Plugin-Ansicht statt der Lage die Einrichtung ([[VIEW-09 - Einrichtung]]). |
| Direkt nach der Einrichtung | Karte „Erste Schritte“ oben, „Ersten Vorgang erfassen“ hervorgehoben; leere Bereiche sagen, dass sie leer sind, wie sie sich füllen, und bieten die Aktion an. Kein Modal, keine Tour ([[PBI-76 - Nach der Einrichtung auf der Lage mit Ersten Schritten ankommen]]). Beim ersten Benutzen eines Bereichs ein einzelner Hinweis ([[PBI-77 - Beim ersten Benutzen eines Bereichs einen Hinweis erhalten]]). |
| Nichts neu | „Seit 9.11. nichts Neues bekannt“ + Hinweis auf ungeprüfte Kanäle, falls vorhanden |
| Datenproblem | roter Hinweis oben mit „Klären“ (DF-23) |
| Dunkel | Token-Paar, siehe [[UI-Design - Leitlinien und Reviewumfang]] |
