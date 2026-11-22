---
type: Handoff
id: HO-02
status: entwurf
scope: mvp
version: "1.0"
date: 2026-11-15
---

# Handoff · Komponenten

Basis Nuxt UI ([[K-13 - Nuxt UI als Frontend-Komponentenbasis]]), über Theme-Konfiguration an `design-tokens.css` gebunden. Eigene Komponenten nur, wo Nuxt UI nichts Passendes hat. Die konkrete Einbettung (Vue-App in einer Obsidian-View) klärt die technische Konzeption.

## Inventar

| Komponente | Nuxt-UI-Basis | Varianten / Props | Zustände | Regeln |
| --- | --- | --- | --- | --- |
| **AppShell** | DashboardGroup, DashboardSidebar, DashboardPanel | `mode: normal \| focus` | Sidebar ein/aus (< 860 px aus); Sidebar fest auf Fensterhöhe, scrollt nicht mit dem Inhalt, „Einstellungen“ immer unten sichtbar | Fokusmodus (Wochenarbeit) blendet Sidebar aus, zeigt WeekHeader |
| **NavItem** | NavigationMenu-Item | icon, label, count, `countTone: neutral \| bad` | aktiv (`aria-current="page"`), hover, Fokus | Zahl in Mono, rot nur für Dringendes |
| **MobileNav** | Tabs (segmented) | 4 Ziele | aktiv | oben unter dem Titel, nie unten (Host-Navigation) |
| **CaptureButton** | Button | `placement: sidebar \| fab` | — | FAB mobil `bottom: 92px + safe-area` |
| **CommunityBadge** | Badge | `community`, `size` | „?“ (gestrichelt) wenn ungeklärt | Kürzel 2–3 Zeichen, Farbe aus Gemeinschaftsdaten |
| **CommunityFilter** | Select / NavigationMenu | Alle + je Gemeinschaft | aktiv hervorgehoben | Filter, nie Bearbeitungskontext |
| **FilterTag** | Badge + Button | community | — | im Ansichtskopf neben dem Titel; × setzt Filter auf „Alle“; ohne Filter Text „Alle Gemeinschaften“ |
| **CommunityPicker** | Tabs (segmented) / CommandPalette | selected, communities, recent | gewählt, keine Treffer | ≤ 3 Gemeinschaften Segment; ab 4 Suchfeld + Liste „Zuletzt“/„Weitere“ mit Badge; `role="radiogroup"` |
| **FilePicker** | FileUpload (`multiple`) + RadioGroup | `mode: move \| copy`, Zielpfad, Dateiliste | leer, 1 bis n Dateien | Liste mit Entfernen je Datei, „Weitere Dateien“; je Datei eine Quelle; System-Dateidialog auch außerhalb des Vaults; Ziel `WEG Manager/Quellen/<Gemeinschaft>/<Datum> <Datei>`; Link als Quelle in der Notiz |
| **StatusChip** | Badge (pill) | `tone: bad \| warn \| info \| ok \| neutral \| judge`, Symbol | — | Text Pflicht; Symbol ● ▲ ◆ ○ ◌ nach Bedeutung |
| **KpiTile** | Button + eigene Komposition | label, value, sub, tone | hover, Fokus | gesamte Kachel klickbar, führt in Wochenschritt bzw. gefilterte Liste (O-D1) |
| **BudgetBar** | eigene | regular (0–7), urgent (n) | — | 7 Segmente + Abstand + rote Überlaufsegmente; `aria-label` mit Zahlen |
| **AgeBar** | Progress | Tage, Schwelle 14 T | info / bad | Länge relativ zu 19 T (max), Zahl immer daneben |
| **WeekHeader** | eigene + Stepper | aktueller Schritt, aktive Minuten | — | Schritte anklickbar (zurück jederzeit, vorwärts erlaubt), „Zurück zur Lage“ links (pausiert die Sitzung) |
| **InboxItem** | Card | Kanal, Datum, Gemeinschaft | aktiv, erledigt (Ergebnis-Chip) | — |
| **TriageActions** | Button, ButtonGroup | Vorschlag + 4 Aktionen | Zuordnen deaktiviert ohne Gemeinschaft | Tasten 1/N/D/S/X auf Desktop |
| **WaitCard** | Card + Segmented | Zusage, Wartezeit, zugesagt, Prüfung | offen, beantwortet (eingeklappt mit „Ändern“), nicht fällig (gestrichelt) | genau eine Antwort; Fremdfrist unverändert |
| **DecisionQueue** | eigene Liste | regulär / dringend | aktiv, erledigt, zurückgestellt | BudgetBar oben |
| **OptionCard** | RadioGroup (Karten) | label, Folgen, `suggested` | gewählt | `role="radio"`, Pfeiltasten wechseln |
| **FollowUpPreview** | eigene | Entwurf / Aufgabe / Wiedervorlage | — | zeigt, was beim Bestätigen entsteht |
| **FactTile** | Card | label, value, note, tone | — | `next`-Variante invertiert |
| **Timeline** | eigene | Eintragsart fact/judge/act/plan/bad, Quelle | hover, Fokus | jeder Eintrag ist ein Button und öffnet das EventModal; Tagestrenner, „Beginn der Akte“ am Ende, Korrektur als Hinweis |
| **SourceItem** | Button-Card | Original / Link / privat | hover, Fokus | öffnet SourceModal (Pfad im Vault, Vorschau, „In Obsidian öffnen“, „Im Dateiexplorer zeigen“); privat: rot, nie in Ausgaben auswählbar |
| **MessageListItem** | Card | Empfänger, Punkte, Status | aktiv | Status: Entwurf, EN prüfen, geprüft, gesendet |
| **LetterEditor** | Textarea + Tabs | Sprachen | bearbeitet → Prüfungen zurückgesetzt | Platzhalter `[…]` als Warn-Markierung, blockieren „geprüft“ |
| **SendBar** | eigene | — | „Als gesendet markieren“ erst bei allen Sprachen geprüft | Kopieren ist kein Versand |
| **ContactList** | eigene Liste | Gruppen nach Rolle (Verwaltung, Beirat, Hausmeister und Dienstleister, Eigentümer), Suche | aktiv, „Nicht mehr verwendet“ eingeklappt | Zeile = Avatar, Name, „Rolle · Firma“, Badges, E-Mail-/Telefon-Link; Firmen vor Personen |
| **ContactAvatar** | Avatar | `kind: person \| org \| list` | — | Initialen ohne Anrede; Organisation und Verteiler als Symbol |
| **ContactModal** | Modal (Desktop 620 px zentriert) / Drawer (mobil) | Rollen, Kontaktdaten, Verantwortlich für, Nachrichten | offen | öffnet aus Liste, Punktakte, Postausgang ohne Navigation; Kopieren je Feld; mobil „Anrufen“/„E-Mail“ (`tel:`/`mailto:`); Punkt- oder Entwurfsklick schließt und navigiert |
| **ContactForm** | Form + Slideover/Drawer | `kind: person \| org` (Verteiler eigenes Formular) | Fehler je Feld nach Speichern-Versuch | Name*, Firma (Combobox, legt neue Firma mit an), Zuständig für* (Ankreuzfeld je Gemeinschaft + Rollenliste), E-Mail, Telefon, „Weitere Angaben“ eingeklappt; Dublettenhinweis ab 3 Zeichen; Speichern immer aktiv |
| **ContactLink** | Link | Kontakt-ID | — | in Punktakte („Verantwortlich“), Postausgang („An“), Verlauf; öffnet ContactModal |
| **Sheet** | Slideover (Desktop rechts) / Drawer (mobil unten) | title | offen | Schließen-Button + Esc + Zurück; nie gestapelt |
| **Tour** | Popover + eigenes Overlay | Schritte `{target, title, body}`, Willkommensdialog | Willkommen, Schritt n/7, beendet | Spotlight über Zielelement (Ring 4 px Akzent, Rest abgedunkelt), Karte rechts, darunter oder darüber; mobil volle Breite; Esc beendet, ←/→ blättern; Ziele über `data-tour` |
| **FirstRunHint** | Alert (info) | Schritt, Text | sichtbar, gesehen | einmal je Wochenschritt; „Verstanden“, „Keine Hinweise“; zurücksetzbar in Einstellungen › Hilfe |
| **EventModal** | Modal / Drawer | Eintrag, Punkt | — | Art, Datum, Quelle, Inhalt; „Punktakte öffnen“ außerhalb der Akte |
| **SettingsNav** | NavigationMenu (vertikal) | Bereiche | aktiv | mobil als umbrechende Chips |
| **CommunityForm** | Form + Slideover/Drawer | neu/bearbeiten | gültig/ungültig | Kürzel 2–5 Zeichen, eindeutig und änderbar ([[PBI-65 - Kürzel einer Gemeinschaft nachträglich ändern]]); Farbe aus Palette, vergebene gesperrt |
| **Toast** | Toast | Text | — | nur Bestätigung kurzlebiger Erfolge; Fehler persistent als Alert |
| **Alert** | Alert | warn / bad | — | Datenproblem, Speicherfehler, Datenlücke |

## Referenzen

Zustände als Übersicht: `sitemap/assets/v2-Z-Zustaende.png`. Dialoge: `v2-Dlg-*.png` (Desktop als zentrierter Dialog 520 px, mobil als Sheet von unten).

## Querschnittsregeln

- Keine Erklär- oder Beruhigungstexte in Komponenten. Bedeutung entsteht über Label, Status und Verhalten ([[06 - Texte und Begriffe]]).
- Jede interaktive Fläche ist ein echtes `button`, `a` oder Formularelement.
- Leere Zustände: ein Satz, was hier erscheint, plus eine Aktion (z. B. „Keine Entwürfe“ + „Zur Wochenarbeit“).
- Ladezustand nur, wenn > 300 ms (B-NFR-04); sonst nichts anzeigen.
