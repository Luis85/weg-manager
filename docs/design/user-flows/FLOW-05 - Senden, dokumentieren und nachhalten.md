---
type: UserFlow
id: FLOW-05
status: entwurf
scope: mvp
version: "2.0"
date: 2026-11-15
pages:
  - "[[VIEW-04 - Postausgang]]"
  - "[[VIEW-02 - Wochenarbeit]]"
requirements:
  - "[[PBI-18 - Nachrichten je Gemeinschaft bündeln]]"
  - "[[PBI-19 - Eigentümertexte zweisprachig prüfen]]"
  - "[[PBI-20 - Tatsächlichen Versand dokumentieren]]"
  - "[[PBI-21 - Begründeten Nachfassschritt prüfen]]"
  - "[[PBI-22 - Nachfasspaket begrenzen oder pausieren]]"
  - "[[PBI-23 - Reaktion richtig einordnen]]"
---

# FLOW-05 · Senden, dokumentieren und nachhalten

```mermaid
flowchart TD
  A[Entwurf im Postausgang] --> B[Empfänger, Text, Anlagen prüfen]
  B --> C{Eigentümertext?}
  C -- ja --> D[DE und EN je prüfen]
  D --> D1{Text danach geändert?}
  D1 -- ja --> D
  D1 -- nein --> E
  C -- nein --> E[Kopieren / Mail-App öffnen]
  E --> F[außerhalb menschlich senden]
  F --> G([Als gesendet markieren: Datum, Kanal, Fassung])
  G --> H[Versand-Ereignis + Prüfdatum]
  H --> I[Woche · Nachhalten am Prüfdatum]
  I --> J{Reaktion?}
  J -- Termin genannt --> K[neue Zusage, alter Termin bleibt im Verlauf]
  J -- keine --> L[Nachfassen nächste Stufe oder Pause mit Grund]
```

Testfall aus dem PRD (AT-B09): Versand 16.11., Antworttermin 30.11., eigene Prüfung 23.11. → am 23.11. kein Stufenwechsel; erst nach dem 30.11. wird Nachfassen vorgeschlagen.
