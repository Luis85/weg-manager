---
type: Handoff
id: HO-04
status: entwurf
scope: mvp
version: "1.0"
date: 2026-11-15
---

# Handoff · Zustände und Abläufe

Zustandsnamen sind fachliche Vorschläge; das technische Schema folgt in der technischen Konzeption. Jeder Übergang erzeugt ein Ereignis (ENT-06) mit Ereignis- und Erfassungszeit.

## Wochensitzung

```mermaid
stateDiagram-v2
  [*] --> bereit: Wochentag erreicht / Lage geöffnet
  bereit --> aktiv: Woche starten
  aktiv --> pausiert: Zurück zur Lage / Ziel wechseln / App schließen
  pausiert --> aktiv: Fortsetzen
  aktiv --> abgeschlossen: Woche abschließen
  abgeschlossen --> bereit: nächster Wochentag
```

Gespeichert: Schritt (1–5), Position im Schritt, aktive Minuten (nur bei sichtbarer View gezählt), Doppelpflege-Minuten, Ergebnisse je Schritt. Ein zweites Gerät übernimmt eine pausierte Sitzung; eine aktive Sitzung auf zwei Geräten zeigt Konflikt (O-D3).

## Eingang

```mermaid
stateDiagram-v2
  [*] --> ungeprueft
  ungeprueft --> zugeordnet: Zu Punkt
  ungeprueft --> neuer_punkt: Neuer Punkt
  ungeprueft --> dublette: Dublette
  ungeprueft --> spaeter: Später
  ungeprueft --> verworfen: Nicht relevant (Grund)
  spaeter --> ungeprueft: nächste Wochenarbeit
  verworfen --> ungeprueft: wiederherstellen
```

`ungeprueft` und `spaeter` zählen als Datenlücke (Lage-Kachel „Ungeprüft“). Die Karte „Termin im Text“ bietet „Als Fremdtermin übernehmen“ oder „Nicht übernehmen“; Übernehmen legt beim Zuordnen einen Termin mit Herkunft an; der alte bleibt im Verlauf.

## Zusage und Nachfassen (DF-03–06)

```mermaid
stateDiagram-v2
  [*] --> wartet
  wartet --> wartet: Weiter warten (neues Prüfdatum) / Pause mit Grund
  wartet --> nachfassen_vorbereitet: Nachfassen
  nachfassen_vorbereitet --> nachgefasst: Versand dokumentiert
  nachgefasst --> wartet: Prüfdatum gesetzt
  wartet --> eingegangen: Eingegangen
  eingegangen --> erfuellt: Ergebnis bestätigt
  eingegangen --> wartet: nur Antwort, keine Erfüllung
```

Stufe (1 Termin erfragen → 2 Antwortfrist → 3 förmlich → 4 Bericht/ETV) wird nur nach dokumentiertem Versand und Ablauf der kommunizierten Frist vorgeschlagen. Ein Entwurf startet keinen Zeitanker.

## Arbeitsentscheidung

```mermaid
stateDiagram-v2
  [*] --> vorgeschlagen: Anlass-Regel
  vorgeschlagen --> bestaetigt: Wahl + Notiz bestätigen
  vorgeschlagen --> zurueckgestellt: Zurückstellen
  bestaetigt --> bestaetigt: Ändern (alte Folgen überholt)
  zurueckgestellt --> vorgeschlagen: nächste Wochenarbeit (A7)
```

Bestätigen erzeugt Folgen idempotent: Schlüssel (Entscheidung, Option, Empfänger, Sprache) für Entwürfe; (Entscheidung, Option) für Aufgaben.

## Nachricht (gebündelter Entwurf)

```mermaid
stateDiagram-v2
  [*] --> entwurf
  entwurf --> teilgeprueft: eine Sprache geprüft
  teilgeprueft --> geprueft: alle Sprachen geprüft
  geprueft --> entwurf: Text oder Inhalt geändert
  teilgeprueft --> entwurf: Text geändert
  geprueft --> gesendet: Als gesendet markieren (Datum, Kanal)
  entwurf --> ueberholt: Entscheidung geändert
```

- Platzhalter `[…]` verhindern „geprüft“.
- Änderung in einer Sprache setzt alle Sprachen auf ungeprüft (DF-07: gleicher freigegebener Inhalt).
- `gesendet` ist endgültig; spätere Änderungen erzeugen eine neue Fassung. Kopieren ändert keinen Zustand.

## Speichern und Fehler

- Jede bestätigende Aktion speichert sofort (Ziel < 500 ms, B-NFR-05). Fehlschlag: Eingabe bleibt, Alert am Element mit Handlung („Erneut speichern“).
- Externe Dateiänderung während der Bearbeitung: Alert „Geändert außerhalb des Plugins“ mit „Vergleichen“; nie still überschreiben (DF-23).
