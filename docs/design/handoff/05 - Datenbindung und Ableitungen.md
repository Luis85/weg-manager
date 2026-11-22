---
type: Handoff
id: HO-05
status: entwurf
scope: mvp
version: "1.0"
date: 2026-11-15
---

# Handoff · Datenbindung und Ableitungen

Welche fachlichen Angaben (Entitätsnotes `docs/entities`) wo erscheinen und wie abgeleitete Werte berechnet werden. Stichtag aller Berechnungen: Öffnen der Ansicht bzw. Start der Wochenarbeit (K-04), Zeitzone Europe/Berlin, Datum ohne Uhrzeit gilt bis Tagesende (DF-05).

## Anzeige je Ansicht

| Ansicht | Entitäten | Angezeigte Felder |
| --- | --- | --- |
| Lage · Feed | ENT-06 Verlaufseintrag, ENT-04 Vorgang | Ereignisdatum (gruppiert nach Tag), Gemeinschaft, Kurztext, Statuschip, Vorgangsnummer |
| Lage · Schwerpunkte | ENT-14 Übergabe | bis 3 Schwerpunkte mit Gemeinschaft, aktueller Status des verknüpften Vorgangs, Kontextnotiz |
| Lage · 14 Tage | ENT-05 Termin, ENT-12 To-do | Datum, Gemeinschaft, Titel, Art (Fremdfrist / eigene) |
| Woche 1 | ENT-07 Quelle, ENT-08 Dokument | Kanal, Absender, Ereignis-/Erfassungsdatum, Original, erkannter Termin |
| Woche 2 | ENT-13 Eskalation, ENT-05 | wartet auf, angefragt, Wartetage, zugesagt, Prüfdatum, Stufe |
| Woche 3 | ENT-09 Entscheidungskarte | Anlass-Chip, Frage, Quellen, Faktenkacheln, Optionen + Folgen, Vorschlag, Notiz |
| Woche 5 | ENT-14 | Zählwerte, Schwerpunkte, Notiz, aktive Minuten, Doppelpflege |
| Vorgangsakte | ENT-04, 05, 06, 07, 16 | Ergebnis, Verantwortlich, Fremdtermin + Herkunft, Wiedervorlage, nächster Schritt, Verlauf, Quellen mit Einstufung |
| Postausgang | ENT-10 Entwurf, ENT-11 Versand | Empfänger, Gemeinschaft, enthaltene Vorgänge, Text je Sprache, Prüfstatus, Anlagen mit Einstufung |
| Kontakte | ENT-02 Person und Rolle, ENT-04, ENT-10, ENT-11 | Art, Name, Organisation, „Zuständig für“ (Gemeinschaften) + Rolle, Kontaktdaten, Sprache, Kanal, aktiv; abgeleitet: verantwortete Vorgänge, offene Entwürfe, gesendete Nachrichten. Verteiler: Gemeinschaft, Anzahl, Sprachaufteilung, Quelle, Stand |
| Ausgabe | ENT-15 Ausgabestand | Empfängerart, Auswahl, Bausteine, Standdatum |

## Abgeleitete Werte

| Wert | Berechnung |
| --- | --- |
| **Überfällig** (Prüfvermerk) | Fremdtermin < Stichtag und keine Reaktion „Termin genannt“/„Erfüllung“ danach. Nie automatisch „nicht eingehalten“ (DF-02). |
| **Termin fehlt** | Zusage ohne Termin; ab 14 Tagen seit Zusage Anlass A3 (DF-04). |
| **Wartetage** | Stichtag − Datum der dokumentierten Anfrage (Versand), nicht des Entwurfs. Balken rot ab > 14 T. |
| **Prüfung fällig** | eigenes Prüfdatum ≤ Stichtag oder kommunizierte Frist + 1 Tag ≤ Stichtag. |
| **Dringend** | Frist vor nächster Wochenarbeit, Merkmal „akut“ oder „drohende Kosten“ (DF-09). |
| **Entscheidungsauswahl** | Anlass-Regeln A1–A7 und Reihenfolge nach [[Konzept - Vorbereitung ohne KI]]; regulär max. 7, Dringendes zusätzlich; Rückstand zählen. |
| **Vorschlag** | Regel der Entscheidungsart; kein Vorschlag, wenn Regel nicht greift. |
| **Kennzahl Ungeprüft** | Eingänge im Zustand `ungeprueft` + `spaeter`. |
| **Verlaufseinträge seit Übergabe** | Verlaufseinträge mit Erfassungszeit > Zeitpunkt letzte Übergabe. |
| **Aktive Minuten** | Summe der Intervalle mit sichtbarer, fokussierter View in Wochensitzung; Leerlauf > 5 min zählt nicht. |
| **Textanteil umgeschrieben** | Zeichen-Diff Entwurf vs. versendete Fassung > 30 % (Messung H-06). |

## Datenschutz in der Anzeige

- Beiratsbewertungen (ENT-16) und private Originale nie in Postausgang-Anlagen, Ausgaben oder Toasts.
- Diagnose- und Fehlertexte ohne Namen, Akteninhalte oder vollständige Pfade (B-NFR-07).
