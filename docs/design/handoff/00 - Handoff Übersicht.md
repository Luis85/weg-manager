---
type: Handoff
id: HO-00
status: entwurf
scope: mvp
version: "1.1"
date: 2026-11-22
---

# Handoff · Übersicht

**Auf den Stand vom 22.11.2026 gebracht** nach den ADRs [0002](../../adr/0002-architecture.md), [0005](../../adr/0005-ui-language.md), [0006](../../adr/0006-module-structure.md), [0007](../../adr/0007-vault-data-access.md) und [0008](../../adr/0008-navigation-and-view-state.md) mit ihren Nachträgen und den Entscheidungen vom 22.11.2026 (`docs/plans/pre-feature-improvement-plan.md`, Abschnitt 8). Die Dokumente 01 bis 09 nennen, wo etwas gebaut ist; was dort nicht als gebaut steht, ist Entwurf und gilt wie geplant.

Paket für die Implementierung des Beirats-MVP als Obsidian-Plugin. Es übersetzt den Designstand v2 in umsetzbare Vorgaben. Gebaut ist der Durchstich mit der Gemeinschaft als erstem Datensatz ([[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]]): App-Rahmen, Navigation, Gemeinschaftsauswahl, Einstellungen mit den Bereichen „Gemeinschaften“ und „Datenprobleme“. **Keine Freigabe der übrigen Ansichten:** Die offenen Punkte in [[09 - Offene Punkte vor Implementierung]] sind vor ihrer Umsetzung zu klären.

## Quellen der Wahrheit (Reihenfolge bei Widerspruch)

1. Die technischen Entscheidungen in `docs/adr/` mit ihren Nachträgen und die Entscheidungstabellen in `docs/plans/pre-feature-improvement-plan.md` (Abschnitt 8)
2. Die Dateiverträge in `docs/contracts/` (derzeit [[DV-01 - Gemeinschaft v1]])
3. Fachregeln `docs/business-rules` (DF-xx) und Akzeptanzkriterien der PBIs, Produktentscheidungen in `docs/decisions/`
4. [[F-21 - Nichtfunktionale Anforderungen]]
5. Dieses Handoff-Paket
6. Ansichts-Notes (`VIEW-xx`) und User-Flows (`FLOW-xx`)
7. Prototyp, Stand Pilot 15.11.2026 ([[Prototyp - Stand Pilot]], Screens `sitemap/assets/v2-P-*.png`)
8. Ältere Mockups (`sitemap/assets/v2-*.png`) und der Design-Canvas

Wo das gebaute Plugin und dieses Paket auseinandergehen und keine Entscheidung es erklärt, ist das ein Befund, der gemeldet wird; weder Code noch Dokument werden still angepasst.

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
| [[08 - Abnahme und Testszenarien]] | AT-B01–14 auf Ansichten und Prototyp-Szenarien abgebildet |
| [[09 - Offene Punkte vor Implementierung]] | Was vor Entwicklungsstart entschieden sein muss |

Fachlicher Hintergrund: [[Konzept - Vorbereitung ohne KI]] (Anlass-Regeln, Entscheidungsarten, Textbausteine), [[UI-Design - Leitlinien und Reviewumfang]], [[00 - Sitemap]], [[FLOW-01 - Gesamtfluss des Beirats-MVP]].

## Prototyp

- Datei: `docs/design/prototype/WEG-Manager-Prototyp.html` – lokal im Browser öffnen, keine Installation, synthetische Daten, Zustand nur im Speicher („Neu starten“ setzt zurück).
- Geteilte Fassung als claude.ai-Artifact (Version 29), dem Pilotnutzer zur Verfügung gestellt; Feedback über die Artifact-Kommentare. Stand und Bildschirme: [[Prototyp - Stand Pilot]].
- Der Prototyp implementiert die Regeln aus [[Konzept - Vorbereitung ohne KI]] beispielhaft (feste Fälle, keine vollständige Regel-Engine). Er ist **keine Codevorlage**: andere Technik (Vanilla JS), keine Persistenz, keine Obsidian-API.

## Definition of Ready für die Umsetzung einer Ansicht

- Zugehörige PBIs fachlich bestätigt, DF-Regeln ohne offene Konflikte
- Datenvertrag der betroffenen Entitäten festgelegt: eine Seite `DV-xx` in `docs/contracts/` und eine Zeile in `appNoteTypes` (Frontmatter-Schema, Datei-Ablage, K-14, ADR 0007)
- Alle Texte der Ansicht in beiden Katalogen (de, en) vorgesehen, Begriffe im Glossar (`GLOSSARY.md`)
- Tokens und Komponenten aus diesem Paket vorhanden oder als Teil der Story geplant
- Testszenarien aus [[08 - Abnahme und Testszenarien]] zugeordnet
- Obsidian-Mindestversion festgelegt (O-02); das Referenz-Handy ist erst für den mobilen Ausbau nach dem MVP nötig (Stand 21.11.2026, [[K-09 - Vollständige mobile Wochenarbeit unterstützen]])
