---
type: UserFlow
id: FLOW-02
status: entwurf
scope: mvp
version: "2.0"
date: 2026-11-15
pages:
  - "[[VIEW-01 - Lage]]"
  - "[[VIEW-02 - Wochenarbeit]]"
  - "[[VIEW-04 - Postausgang]]"
requirements:
  - "[[PBI-07 - Dubletten zusammenführen]]"
  - "[[PBI-09 - Termin und Wiedervorlage trennen]]"
  - "[[PBI-10 - Eigenes To-do nachhalten]]"
  - "[[PBI-11 - Nachricht und Original zuordnen]]"
  - "[[PBI-13 - Aktuelle Wochenlage öffnen]]"
  - "[[PBI-14 - Entscheidungsauswahl und Überlauf prüfen]]"
  - "[[PBI-15 - Eine Entscheidungsvorlage prüfen]]"
  - "[[PBI-16 - Wahl mit Kontextnotiz bestätigen]]"
  - "[[PBI-17 - Folgearbeit aus Entscheidungen vorbereiten]]"
  - "[[PBI-21 - Begründeten Eskalationsschritt prüfen]]"
  - "[[PBI-22 - Eskalationen begrenzen oder aussetzen]]"
  - "[[PBI-23 - Reaktion richtig einordnen]]"
  - "[[PBI-25 - Nächste Wochenarbeit vorbereiten]]"
  - "[[PBI-26 - Unterlagen einstufen und korrigieren]]"
  - "[[PBI-33 - Wochenarbeit auf dem Handy abschließen]]"
---

# FLOW-02 · Wochenarbeit geführt

**Auslöser:** Wochentag laut Rhythmus oder „Woche starten“ in der Lage. **Ziel:** alle wartenden Zusagen beurteilt, bis zu 7 Entscheidungen getroffen, Nachrichten vorbereitet, Übergabe gespeichert – in ≤ 60 min aktiver Zeit (H-03).

**Stand 21.11.2026:** Die mobile Bedienung ([[PBI-33 - Wochenarbeit auf dem Handy abschließen]]) folgt nach dem MVP, siehe [[K-09 - Vollständige mobile Wochenarbeit unterstützen]]. Im MVP läuft die Wochenarbeit auf dem Desktop.

```mermaid
flowchart TD
  S[Woche starten] --> E1{Ungeprüfte Eingänge?}
  E1 -- ja --> E[1 Eingang: je Eingang zuordnen, Dublette, später, verwerfen]
  E1 -- nein --> N
  E --> N[2 Nachhalten: je Zusage eine Antwort]
  N --> N1{Antwort}
  N1 -- Eingegangen --> NE[Ereignis + ggf. neuer Termin, Punkt bleibt offen]
  N1 -- Weiter warten --> NW[neues Prüfdatum, optional Pause mit Grund]
  N1 -- Nachfassen --> NF[Entwurf nächste Stufe im Postausgang, optional Bewertung]
  N1 -- Neu planen --> NP[eigene Wiedervorlage ändern, Fremdfrist bleibt]
  NE & NW & NF & NP --> D[3 Entscheiden: max. 7 regulär + dringender Überlauf]
  D --> D1{Wahl}
  D1 -- Option + Notiz --> DF[Entwürfe + Aufgaben, idempotent]
  D1 -- Zurückstellen --> DZ[bleibt im Budget nächster Woche]
  DF & DZ --> P[4 Senden: Postausgang dieser Woche]
  P --> U[5 Übergabe: 3 Schwerpunkte, Notiz, Zeit + Doppelpflege]
  U --> L[Lage]
  S -. Zurück zur Lage .-> L
  L -. Fortsetzen bei Schritt N .-> N
```

## Abbrüche und Sonderfälle

| Fall | Verhalten |
| --- | --- |
| „← Zurück zur Lage“ (pausiert) / App schließen | Schritt, Position, Eingaben gespeichert; Lage zeigt „Fortsetzen“. |
| Mehr als 7 Entscheidungen | Budgetleiste voll; weitere bleiben sichtbar für nächste Woche; Dringendes zusätzlich. |
| Bestätigen zweimal | keine doppelten Entwürfe oder Aufgaben; alte Fassung „überholt“. |
| Neue Eingänge während der Arbeit | Hinweis, kein stiller Listenumbau. |
| Keine Anlässe | Woche kann mit „Nichts zu tun“ abgeschlossen werden; zählt nicht als Abbruch. |
