---
type: Page
id: VIEW-03
status: entwurf
scope: mvp
version: "2.0"
date: 2026-11-15
navigation: primär
requirements:
  - "[[PBI-02 - Personen und Rollen zuordnen]]"
  - "[[PBI-05 - Einen Vorgang erfassen und wiederfinden]]"
  - "[[PBI-06 - Sammelvorgänge aufteilen]]"
  - "[[PBI-07 - Dubletten zusammenführen]]"
  - "[[PBI-08 - Bearbeitungsstand bewusst ändern]]"
  - "[[PBI-09 - Termin und Wiedervorlage trennen]]"
  - "[[PBI-10 - Eigenes To-do nachhalten]]"
  - "[[PBI-11 - Nachricht und Original zuordnen]]"
  - "[[PBI-12 - Verlauf nachvollziehen]]"
  - "[[PBI-17 - Folgearbeit aus Entscheidungen vorbereiten]]"
  - "[[PBI-23 - Reaktion richtig einordnen]]"
  - "[[PBI-26 - Unterlagen einstufen und korrigieren]]"
  - "[[PBI-27 - Unnötige private Inhalte entfernen]]"
  - "[[PBI-33 - Wochenarbeit auf dem Handy abschließen]]"
  - "[[PBI-41 - Vorgänge ohne Plugin und Obsidian nutzen]]"
  - "[[PBI-42 - AI-Agent direkt mit den Notizen arbeiten lassen]]"
entities:
  - "[[docs/entities/ENT-03 - Thema]]"
  - "[[docs/entities/ENT-04 - Vorgang]]"
  - "[[docs/entities/ENT-05 - Termin]]"
  - "[[docs/entities/ENT-06 - Verlaufseintrag]]"
  - "[[docs/entities/ENT-07 - Quelle]]"
  - "[[docs/entities/ENT-08 - Dokument]]"
  - "[[docs/entities/ENT-12 - To-do]]"
  - "[[docs/entities/ENT-16 - Beiratsbewertung]]"
business-rules:
  - "[[docs/business-rules/DF-02 - Bearbeitung, Terminprüfung und Bewertung]]"
  - "[[docs/business-rules/DF-03 - Terminbedeutung]]"
  - "[[docs/business-rules/DF-04 - Fehlender Termin]]"
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
decisions:
  - "[[docs/decisions/K-03 - Einzeln erledigbarer Vorgang als Kerneinheit]]"
mockups:
  - "[[docs/design/sitemap/assets/v2-P-D-08-Vorgaenge.png]]"
  - "[[docs/design/sitemap/assets/v2-D11-To-dos.png]]"
  - "[[docs/design/sitemap/assets/v2-P-M-08-Vorgaenge.png]]"
  - "[[docs/design/sitemap/assets/v2-Dlg-Aufteilen.png]]"
  - "[[docs/design/sitemap/assets/v2-Dlg-Zusammenfuehren.png]]"
  - "[[docs/design/sitemap/assets/v2-Dlg-Bewerten.png]]"
  - "[[docs/design/sitemap/assets/v2-Dlg-Reaktion.png]]"
  - "[[docs/design/sitemap/assets/v2-D4-Vorgangsakte-dark.png]]"
  - "[[docs/design/sitemap/assets/v2-P-D-09-Vorgangsakte.png]]"
  - "[[docs/design/sitemap/assets/v2-P-M-09-Vorgangsakte.png]]"
  - "[[docs/design/sitemap/assets/v2-M3-Vorgangsakte-dark.png]]"
---

# VIEW-03 · Vorgänge und Vorgangsakte

## Vorgänge (Liste)

Segment **Vorgänge | To-dos**. Suche, Filter (Gemeinschaft, Bearbeitungsstand, Prüfvermerke „überfällig“, „Termin fehlt“, „ohne nächsten Schritt“, Thema). Zeile: Kürzel · Vorgangsnummer · Titel · Status-Chips · nächster Schritt · nächstes Datum. Gruppierung optional nach Thema. To-dos (ENT-12) haben eigene Zustände (offen / erledigt / entfallen); ihr Abschluss erfüllt keine fremde Zusage. Die Liste ist ein Kandidat für eine Bases-View (DF-22), technisch offen.

Desktop: Suchfeld, Statusfilter (Offen · Ungeklärt · Erledigt) und Prüfvermerk-Filter als Chips mit Zahl, Tabelle Vorgang · Verantwortlich · Status · Nächster Schritt · Datum, sortiert nach Dringlichkeit. To-dos: Schnelleingabe (Text, Gemeinschaft, Datum), gruppiert nach Überfällig · Diese Woche · Später, Herkunft je To-do (Entscheidung, Übergabe, manuell) mit Link auf den Vorgang, Erledigtes eingeklappt.

![[v2-P-D-08-Vorgaenge.png]]

![[v2-D11-To-dos.png]]

## Vorgangsakte

**Kopf:** Brotkrumen (Vorgänge / Gemeinschaft / Thema / Vorgangsnummer), Titel als prüfbares Ergebnis, Chips (Bearbeitungsstand, Prüfvermerke, Eskalationsstufe, Bewertung), Aktionen „Reaktion“, „Bewerten“, ⋯ (Aufteilen, Zusammenführen, Bearbeitungsstand ändern).

**Fakten-Kacheln:** Prüfbares Ergebnis · Verantwortlich · Fremdtermin (mit Herkunft) · Deine Wiedervorlage („eigene“; ändert keine Fremdfrist) · Nächster Schritt (dunkel, mit Link zum Ort der Handlung).

**Verlauf:** Legende ○ Fakt · ◆ Deine Bewertung · ● Deine Handlung · ◌ geplant. Jeder Eintrag: Akteur, Verb, vorher → nachher, Quellen-Chip (Original/Link/Fassung), Ereignis- und Erfassungsdatum. Korrekturen erscheinen als markierter Hinweis, die alte Fassung bleibt erhalten. Ende: „Beginn der Akte · übernommen aus Register-Import …“ (DF-13).

**Seitenspalte:** Quellen mit Einstufung (Original geprüft · privat · nur Link) und „Hinzufügen“; „Im selben Thema“ (ein Thema hat keinen gemeinsamen Erledigt-Status).

![[v2-P-D-09-Vorgangsakte.png]]

## Dialoge

- **Aufteilen:** neue Teilpunkte mit je eigenem Ergebnis; der Ursprung erhält Status „aufgeteilt“ und Zielverweise (PBI-06).
- **Zusammenführen:** Ziel wählen, Quellen und Verlauf wandern mit, Ursprung „zusammengeführt“ mit Verweis (PBI-07).
- **Bewerten:** Auswahl (z. B. „nicht eingehalten“) + Pflichtbegründung, immer intern (ENT-16).
- **Reaktion erfassen:** Art (Bestätigung · sachliche Antwort · neue Zusage · Teillieferung · Erfüllung), Quelle, Datum. Antwort ≠ Erfüllung (PBI-23).
- **Unterlage einstufen / entfernen:** Einstufung ändern; kontrollierte Entfernung privater Inhalte ohne Wiederholung des Inhalts im Protokoll (PBI-27).

## Dialoge (Mockups)

![[v2-Dlg-Aufteilen.png]]

![[v2-Dlg-Zusammenfuehren.png]]

![[v2-Dlg-Bewerten.png]]

![[v2-Dlg-Reaktion.png]]

## Mobil

Kopf mit Zurück, Chips, Tabs **Fakten · Verlauf · Quellen**; Fakten als 3er-Kacheln, „Nächster Schritt“-Karte, Aktionsleiste „Reaktion erfassen“ + „Bewerten“.

![[v2-P-M-09-Vorgangsakte.png|180]]

![[v2-P-M-08-Vorgaenge.png|180]]

## Verlaufseintrag öffnen

Jeder Eintrag im Verlauf (Vorgangsakte und Mini-Verlauf in der Wochenarbeit) ist anklickbar und öffnet ein Modal: Symbol und Text des Eintrags, Gemeinschaft und Vorgang, Art (Fakt, Handlung, Bewertung, geplant, Prüfvermerk), Datum, Quelle und Inhalt der Quelle (Mailtext, Telefonnotiz, Angebotsdaten, gesendete Fassung). Abgeleitete Prüfvermerke nennen ihre Herkunft. Außerhalb der Vorgangsakte führt „Vorgangsakte öffnen“ dorthin.

## Quelle öffnen

Quellen liegen als Dateien im Vault unter `WEG Manager/Quellen/<Gemeinschaft>/<JJJJ-MM-TT> <Titel>` (Ordner in Einstellungen › Ablage). Jede Quelle in der Vorgangsakte ist anklickbar und öffnet ein Modal: Art (E-Mail, Dokument, Fotos, Telefonnotiz, Verknüpfung), Einstufung (Original, privat, Link), Pfad im Vault mit Kopieren, Vorschau (Mailtext, erste Dokumentseite, Fotos, Ziel der Verknüpfung). Private Quellen tragen „privat · nie in Nachrichten oder Ausgaben“. Aktionen: „In Obsidian öffnen“ (neuer Tab) und „Im Dateiexplorer zeigen“.

## Weitere Bildschirme (Prototyp)

Stand Pilot 15.11.2026, Übersicht in [[Prototyp - Stand Pilot]].

![[v2-P-D-10-Verlauf-Modal.png]]
![[v2-P-M-10-Verlauf-Modal.png|180]]
![[v2-P-D-11-Quelle-Modal.png]]
![[v2-P-M-11-Quelle-Modal.png|180]]
