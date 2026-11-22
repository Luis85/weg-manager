---
type: UserFlow
id: FLOW-07
status: entwurf
scope: mvp
version: "2.0"
date: 2026-11-15
pages:
  - "[[VIEW-03 - Vorgänge und Vorgangsakte]]"
  - "[[VIEW-06 - Sachstand ausgeben]]"
requirements:
  - "[[PBI-26 - Unterlagen einstufen und korrigieren]]"
  - "[[PBI-27 - Unnötige private Inhalte entfernen]]"
  - "[[PBI-28 - Empfängerbezogene Ausgabe prüfen]]"
  - "[[PBI-29 - Sachstand lesbar übergeben]]"
---

# FLOW-07 · Sachstand gezielt ausgeben

```mermaid
flowchart LR
  A[Punkte oder Punktakte] --> B[Sachstand ausgeben]
  B --> C[Empfänger wählen]
  C --> D[Gemeinschaft fest]
  D --> E[Sprache]
  E --> F[Punkte und Bausteine wählen]
  F --> G{Gesperrtes enthalten?}
  G -- privat / intern --> H[nicht auswählbar, sichtbar durchgestrichen]
  G -- ungeprüft --> I[Hinweis, bewusst ein- oder ausschließen]
  H & I --> J[Vorschau prüfen]
  J --> K[Export: Markdown, Kopieren, PDF]
  K --> L[Ausgabestand mit Datum gespeichert]
```

Kontrollierte Entfernung privater Inhalte (PBI-27) passiert in der Punktakte, nicht in der Ausgabe; das Entfernungsprotokoll wiederholt den Inhalt nicht.
