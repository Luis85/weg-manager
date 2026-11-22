---
type: UserFlow
id: FLOW-04
status: entwurf
scope: mvp
version: "2.0"
date: 2026-11-15
pages:
  - "[[VIEW-05 - Erfassen]]"
  - "[[VIEW-02 - Wochenarbeit]]"
  - "[[VIEW-03 - Vorgänge und Vorgangsakte]]"
requirements:
  - "[[PBI-01 - Gemeinschaftskontext wählen]]"
  - "[[PBI-05 - Einen Vorgang erfassen und wiederfinden]]"
  - "[[PBI-07 - Dubletten zusammenführen]]"
  - "[[PBI-10 - Eigenes To-do nachhalten]]"
  - "[[PBI-11 - Nachricht und Original zuordnen]]"
  - "[[PBI-26 - Unterlagen einstufen und korrigieren]]"
---

# FLOW-04 · Schnell erfassen und Eingang sichten

```mermaid
flowchart TD
  A([+ Erfassen]) --> B[Art wählen]
  B --> C[Gemeinschaft wählen · Pflicht]
  C --> D{Vorgang bekannt?}
  D -- ja --> E[zuordnen + Quelle] --> G[gespeichert am Vorgang]
  D -- nein / später --> F[gespeichert im Eingang]
  F --> H[Woche · 1 Eingang sichten]
  H --> I{Einordnen}
  I -- Zu Vorgang --> G
  I -- Neuer Vorgang --> J[Vorgang mit Ergebnis, Verantwortlich, nächster Schritt]
  I -- Dublette --> K[mit Eingang verbinden, Herkunft bleibt]
  I -- Später --> L[bleibt als Datenlücke sichtbar]
  I -- Nicht relevant --> M[mit Grund archiviert, wiederherstellbar]
```

Erkannte Termine werden nur nach Bestätigung (Checkbox) als Zusage übernommen; die Quelle bleibt als Original oder ausdrücklich als Link gekennzeichnet (DF-08).
