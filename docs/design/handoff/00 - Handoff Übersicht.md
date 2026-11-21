---
type: Handoff
id: HO-00
status: entwurf
scope: mvp
version: "1.0"
date: 2026-11-15
---

# Handoff · Übersicht

Paket für die spätere Implementierung des Beirats-MVP als Obsidian-Plugin. Es übersetzt den Designstand v2 in umsetzbare Vorgaben. **Keine Implementierungsfreigabe:** Die offenen Punkte in [[09 - Offene Punkte vor Implementierung]] sind vorher zu klären.

## Quellen der Wahrheit (Reihenfolge bei Widerspruch)

1. Fachregeln `docs/business-rules` (DF-xx) und Akzeptanzkriterien der PBIs
2. [[F-21 - Nichtfunktionale Anforderungen]]
3. Dieses Handoff-Paket
4. Ansichts-Notes (`VIEW-xx`) und User-Flows (`FLOW-xx`)
5. Prototyp, Stand Pilot 15.11.2026 ([[Prototyp - Stand Pilot]], Screens `sitemap/assets/v2-P-*.png`)
6. Ältere Mockups (`sitemap/assets/v2-*.png`) und der Design-Canvas

Bei Abweichung zwischen Prototyp und älteren Mockups gilt der Prototyp. Mockups und Prototyp zeigen Hierarchie und Verhalten mit synthetischen Daten. Pixelwerte sind Richtwerte; Tokens und Komponentenregeln sind verbindlich.

## Inhalt

| Dokument | Wofür |
| --- | --- |
| [[01 - Design Tokens]] · `design-tokens.css` · `design-tokens.json` | Farben hell/dunkel, Typografie, Abstände, Radien, Abbildung auf Obsidian-Variablen |
| [[02 - Komponenten]] | Inventar mit Nuxt-UI-Basis, Varianten, Zuständen und A11y-Regeln |
| [[03 - Ansichten, Navigation und Befehle]] | View-Typen, Routen, Navigationsmodell, Obsidian-Befehle, Deep Links |
| [[04 - Zustände und Abläufe]] | Zustandsautomaten für Wochensitzung, Eingang, Zusage, Entscheidung, Entwurf und Versand |
| [[05 - Datenbindung und Ableitungen]] | Welche Felder welcher Entität angezeigt werden und wie Kennzahlen, Fälligkeiten und Auswahl berechnet werden |
| [[06 - Texte und Begriffe]] | Begriffe DE/EN, Schreibregeln, Datumsformate, Button-Texte |
| [[07 - Responsive, Barrierefreiheit und Plattform]] | Breakpoints, mobile Host-Navigation, Tastatur, Fokus, Theme, Obsidian-Richtlinien |
| [[08 - Abnahme und Testszenarien]] | AT-B01–16 und AT-B18 auf Ansichten und Prototyp-Szenarien abgebildet |
| [[09 - Offene Punkte vor Implementierung]] | Was vor Entwicklungsstart entschieden sein muss |

Fachlicher Hintergrund: [[Konzept - Vorbereitung ohne KI]] (Anlass-Regeln, Entscheidungsarten, Textbausteine), [[UI-Design - Leitlinien und Reviewumfang]], [[00 - Sitemap]], [[FLOW-01 - Gesamtfluss des Beirats-MVP]].

## Prototyp

- Datei: `docs/design/prototype/WEG-Manager-Prototyp.html` – lokal im Browser öffnen, keine Installation, synthetische Daten, Zustand nur im Speicher („Neu starten“ setzt zurück).
- Geteilte Fassung als claude.ai-Artifact (Version 29), dem Pilotnutzer zur Verfügung gestellt; Feedback über die Artifact-Kommentare. Stand und Bildschirme: [[Prototyp - Stand Pilot]].
- Der Prototyp implementiert die Regeln aus [[Konzept - Vorbereitung ohne KI]] beispielhaft (feste Fälle, keine vollständige Regel-Engine). Er ist **keine Codevorlage**: andere Technik (Vanilla JS), keine Persistenz, keine Obsidian-API.

## Definition of Ready für die Umsetzung einer Ansicht

- Zugehörige PBIs fachlich bestätigt, DF-Regeln ohne offene Konflikte
- Datenvertrag der betroffenen Entitäten festgelegt (Frontmatter-Schema, Datei-Ablage, K-14)
- Tokens und Komponenten aus diesem Paket vorhanden oder als Teil der Story geplant
- Testszenarien aus [[08 - Abnahme und Testszenarien]] zugeordnet
- Obsidian-Mindestversion festgelegt (O-02); das Referenz-Handy ist erst für den mobilen Ausbau nach dem MVP nötig (Stand 21.11.2026, [[K-09 - Vollständige mobile Wochenarbeit unterstützen]])
