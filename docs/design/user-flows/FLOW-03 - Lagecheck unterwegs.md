---
type: UserFlow
id: FLOW-03
status: entwurf
scope: mvp
version: "2.0"
date: 2026-11-15
pages:
  - "[[VIEW-01 - Lage]]"
  - "[[VIEW-03 - Vorgänge und Vorgangsakte]]"
  - "[[VIEW-04 - Postausgang]]"
requirements:
  - "[[PBI-12 - Verlauf nachvollziehen]]"
  - "[[PBI-23 - Reaktion richtig einordnen]]"
  - "[[PBI-24 - Zwischendurch Dringlichkeit prüfen]]"
  - "[[PBI-33 - Wochenarbeit auf dem Handy abschließen]]"
---

# FLOW-03 · Lagecheck unterwegs

**Stand 21.11.2026:** Der Auslöser am Handy gilt erst nach dem MVP ([[K-09 - Vollständige mobile Wochenarbeit unterstützen]]). Im MVP läuft derselbe Lagecheck auf dem Desktop.

**Auslöser:** kurzer Blick am Handy zwischen zwei Wochenterminen. **Ziel:** in 2–5 Minuten wissen, ob etwas nicht bis zur nächsten Wochenarbeit warten kann.

```mermaid
flowchart LR
  A[Lage öffnen] --> B{Dringend oder neu?}
  B -- nein --> F[Fertig, nichts verpasst]
  B -- ja --> P[Punktakte]
  P --> C{Was ist zu tun?}
  C --> R[Reaktion erfassen · Antwort ≠ Erfüllung]
  C --> N[Nachfassen vorziehen → Entwurf]
  C --> V[Für die Woche vormerken → Schritt 3]
  R & N & V --> L[Zurück zur Lage · Übergabe bleibt erhalten]
```

Kein Zwang zur Bearbeitung: Vormerken ist eine vollwertige Antwort. Die Übergabe-Schwerpunkte werden nicht verändert.
