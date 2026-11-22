---
type: Page
id: VIEW-06
status: entwurf
scope: mvp
version: "2.0"
date: 2026-11-15
navigation: aus Vorgänge
requirements:
  - "[[PBI-26 - Unterlagen einstufen und korrigieren]]"
  - "[[PBI-28 - Empfängerbezogene Ausgabe prüfen]]"
  - "[[PBI-29 - Sachstand lesbar übergeben]]"
  - "[[PBI-33 - Wochenarbeit auf dem Handy abschließen]]"
entities:
  - "[[docs/entities/ENT-15 - Ausgabestand]]"
  - "[[docs/entities/ENT-16 - Beiratsbewertung]]"
business-rules:
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-11 - Sachstand und Bewertung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-07 - Sachstand gezielt teilen und Bewertungen intern halten]]"
mockups:
  - "[[docs/design/sitemap/assets/v2-D7-Ausgabe.png]]"
---

# VIEW-06 · Sachstand ausgeben

Die Mockups zeigen noch die Begriffe vor dem 22.11.2026 (Punkt statt Vorgang usw., [[K-20 - WCS-Datenmodell als fachliche Grundlage]]).

**Rolle:** Eine geprüfte, empfängerbezogene Fassung erzeugen – für Eigentümer, Vertretung/Nachfolge oder Verwaltung. Exportiert, nicht gesendet.

## Fünf nummerierte Spalten

1. **Für wen?** Eigentümer · Vertretung / Nachfolge · Verwaltung (bestimmt Vorbelegung und Ausschlüsse).
2. **Gemeinschaft:** genau eine, fest.
3. **Sprache:** Deutsch, optional + English.
4. **Was gehört hinein?** Vorgänge mit Checkbox; je Vorgang Bausteine als Chips: ✓ Sachstand, ✓ Termin, ✓ Anlage; durchgestrichen „Bewertung · intern“, „Notiz · intern“; rot „privat, gesperrt“; amber „Quelle ungeprüft“. Regel: nichts wird transitiv mitgenommen.
5. **Vorschau:** lesbares Dokument mit Standdatum, Absender „Vom Beirat … ohne Rechtswirkung“, Abschnitten je Vorgang und Hinweis auf Datenlücken. Export: Markdown · Kopieren · PDF. Exportiert, nicht gesendet.

![[v2-D7-Ausgabe.png]]

## Regeln

- Interne Bewertungen und private Originale sind nie auswählbar (DF-10, DF-11).
- Der Ausgabestand wird mit Auswahl, Fassung und Datum gespeichert (ENT-15).
- Vertretung/Nachfolge erhält zusätzlich Quellenverweise und offene nächste Schritte (lesbare Übergabe, kein paralleler Zugang).
