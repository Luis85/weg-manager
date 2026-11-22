---
type: Page
id: VIEW-04
status: entwurf
scope: mvp
version: "2.0"
date: 2026-11-15
navigation: primär
requirements:
  - "[[PBI-18 - Nachrichten je Gemeinschaft bündeln]]"
  - "[[PBI-19 - Eigentümertexte zweisprachig prüfen]]"
  - "[[PBI-20 - Tatsächlichen Versand dokumentieren]]"
  - "[[PBI-21 - Begründeten Eskalationsschritt prüfen]]"
entities:
  - "[[docs/entities/ENT-02 - Person und Rolle]]"
  - "[[docs/entities/ENT-10 - Nachrichtenentwurf]]"
  - "[[docs/entities/ENT-11 - Versanddokumentation]]"
  - "[[docs/entities/ENT-13 - Eskalation]]"
business-rules:
  - "[[docs/business-rules/DF-07 - Wahl, Entwurf und Versand]]"
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-07 - Sachstand gezielt teilen und Bewertungen intern halten]]"
mockups:
  - "[[docs/design/sitemap/assets/v2-Dlg-Gesendet.png]]"
  - "[[docs/design/sitemap/assets/v2-P-M-07-Postausgang.png]]"
  - "[[docs/design/sitemap/assets/v2-M8-Nachricht.png]]"
  - "[[docs/design/sitemap/assets/v2-D5-Postausgang-dark.png]]"
  - "[[docs/design/sitemap/assets/v2-P-D-07-Postausgang.png]]"
---

# VIEW-04 · Postausgang

**Rolle:** Alle vorbereiteten Nachrichten an einem Ort, gebündelt je Gemeinschaft und Empfänger. Hier wird geprüft, extern gesendet und der tatsächliche Versand dokumentiert. Kein automatischer Versand.

## Aufbau

- **Liste** gruppiert nach Gemeinschaft → Empfänger („AW · an Verwaltung“). Karte: Empfänger, Anzahl Vorgänge, enthaltene Themen, Status (Entwurf · ✓ geprüft · ▲ EN erneut prüfen). Darunter „Gesendet · wartet“ mit Versanddatum; der Nachrichtentitel ist Link auf den Vorgang, bei mehreren Vorgängen stehen deren Titel als Links darunter.
- **Editor:** Herkunft (aus Entscheidung …, Fassung N), An (Empfänger, öffnet das Kontakt-Modal), Betrifft (Titel jedes enthaltenen Vorgangs als Link direkt in die Vorgangsakte), Betreff, Sprach-Tabs DE/EN mit Prüfstatus je Sprache, Text, Anlagen (nur geprüfte und freigegebene; interne Notizen und Bewertungen als „intern · ausgeschlossen“ markiert).
- **Versandleiste:** Senden · Kopieren · In Mail-App öffnen · **Als gesendet markieren** (Versand erfolgt außerhalb des Plugins).

![[v2-P-D-07-Postausgang.png]]

## Als gesendet markieren (Sheet)

Datum (Standard heute), Kanal (Mail, Portal, Brief, Telefon), Fassung (automatisch die geprüfte aktuelle, DE + EN), optional Bemerkung. Speichern legt einen Verlaufseintrag zum Versand an und plant die Prüfung in Nachhalten (K-06). Keine Zustellungsbehauptung. Auf dem Desktop als Dialog, mobil als Sheet.

![[v2-Dlg-Gesendet.png]]

## Regeln

- Ändert sich der deutsche Text nach Prüfung, wird die EN-Fassung als „erneut prüfen“ markiert und umgekehrt (PBI-19).
- Gleiche Person in beiden Gemeinschaften erhält getrennte Nachrichten (DF-12).
- Markieren ist erst möglich, wenn alle enthaltenen Sprachfassungen geprüft sind; der Button erklärt sonst, was fehlt.

## Mobil

Liste als eigener Bildschirm, Editor als Vollbild mit Sprach-Tabs; Aktionsleiste „geprüft“ und „Als gesendet markieren“ unten über der Obsidian-Navigation, Kopieren im Kopf.

![[v2-P-M-07-Postausgang.png|180]]

![[v2-M8-Nachricht.png]]
