---
type: Handoff
id: HO-02
status: entwurf
scope: mvp
version: "1.1"
date: 2026-11-22
---

# Handoff · Komponenten

**Auf den Stand vom 22.11.2026 gebracht** nach [ADR 0006](../../adr/0006-module-structure.md), [ADR 0007](../../adr/0007-vault-data-access.md) und [ADR 0008](../../adr/0008-navigation-and-view-state.md) mit ihren Nachträgen sowie den Entscheidungen vom 22.11.2026 (Kontakt mit einer Rolle O-D10, Gemeinschaftsauswahl ohne „Alle“, Gemeinschaftspalette). Zeilen, deren Regeln mit „Gebaut“ beginnen, beschreiben die Umsetzung; alle anderen sind Entwurf, noch nicht gebaut, und gelten wie geplant.

Basis Nuxt UI ([[K-13 - Nuxt UI als Frontend-Komponentenbasis]]), über `src/styles/bridge.css` an die Tokens gebunden ([[01 - Design Tokens]]). Nuxt-UI-Komponenten werden einzeln aus `@nuxt/ui/components/*.vue` importiert. Eigene Komponenten nur, wo Nuxt UI nichts Passendes hat. Die konkrete Einbettung (Vue-App in einer Obsidian-View) klärt die technische Konzeption.

## Inventar

| Komponente | Nuxt-UI-Basis | Varianten / Props | Zustände | Regeln |
| --- | --- | --- | --- | --- |
| **AppFrame** (Entwurf: AppShell) | eigene Komposition aus `nav`, Button, Listen | Rahmen je Ansicht: Zurück- und Vorwärts-Knopf, Kontextbereich, Navigation, Inhalt. `mode: normal \| focus` (Wochenarbeit) ist Entwurf | Navigation ab 860 px Containerbreite als Seitenleiste links, darunter als Reihe über dem Inhalt; Rahmen `inert`, solange ein Blatt oder Dialog offen ist | Gebaut. Der Rahmen gehört der Shell; die Gemeinschaftsauswahl füllt den Kontextbereich über `appSurface`. Zurück und Vorwärts erscheinen, sobald die Ansicht einen Schritt dorthin hat; ohne Ziel `aria-disabled`, nie `disabled`. Fokusmodus blendet die Seitenleiste aus und zeigt WeekHeader (Entwurf) |
| **NavItem** | Button (ghost) in einer Liste | icon, label, count, `countTone: neutral \| bad` | aktiv (`aria-current="page"`, Balken am Anfang), hover, Fokus | Gebaut ohne Zahl; Zahl in Mono, rot nur für Dringendes, kommt mit den Ansichten, die Zähler haben. Der Eintrag zu den Einstellungen heißt „Einstellungen“ (entschieden am 22.11.2026) und ist auf jedem Bereich als aktuelle Seite markiert |
| **MobileNav** | Tabs (segmented) | 4 Ziele | aktiv | oben unter dem Titel, nie unten (Host-Navigation) |
| **CaptureButton** | Button | `placement: sidebar \| fab` | — | FAB mobil `bottom: 92px + safe-area` |
| **CommunityBadge** | eigenes Element | `shortCode`, `color` | „?“ ohne gültiges Kürzel; gestrichelter Umriss ohne gültige Farbe | Gebaut. Kürzel 2–5 Zeichen (A–Z, 0–9), als Text auf der Gemeinschaftsfarbe ([[01 - Design Tokens]]); Farbe und Kürzel stehen in der Gemeinschaftsnotiz ([[DV-01 - Gemeinschaft v1]]) |
| **CommunitySwitch** (Gemeinschaftswechsel; Entwurf: CommunityFilter) | `role="radiogroup"` aus Radio-Knöpfen (`CommunityOptions`) mit Beschriftung „Gemeinschaft“ | Gemeinschaften ohne Problem, je Eintrag Kürzel und Name | gewählt (Häkchen), „Wird geladen …“ erst nach 300 ms, „Noch keine Gemeinschaft“, „keine wählbar“, Aufforderung zur Wahl | Gebaut, im Kontextbereich des Rahmens, damit auf jeder Ansicht sichtbar. Es gibt **kein „Alle“**: Die Auswahl ist der Bearbeitungskontext (Glossar: Gemeinschaftskontext), kein Filter. Wählbar sind nur Gemeinschaften ohne Problem; eine schreibgeschützte oder fehlerhafte steht in den Einstellungen mit ihrem Hinweis, nicht hier. Genau eine Gemeinschaft wird von selbst gewählt, bei zwei oder mehr fordert der Wechsel mit Warnzeichen zur Wahl auf („Wähle die Gemeinschaft, in der du arbeitest.“). Eine Auswahl gilt für alle offenen Ansichten und wird je Gerät gespeichert, nicht in `data.json` und nicht per Sync ([ADR 0008](../../adr/0008-navigation-and-view-state.md)). Pfeiltasten wechseln und wählen. Ein Suchfeld ab vier Gemeinschaften ist nicht gebaut. Die Ansicht, die einen Datensatz einer Gemeinschaft bearbeitet, verweigert das, solange keine gewählt ist; das ist noch nicht durchgesetzt, weil bisher nur Gemeinschaften selbst bearbeitet werden |
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
| **FollowUpPreview** | eigene | Entwurf / To-do / Wiedervorlage | — | zeigt, was beim Bestätigen entsteht |
| **FactTile** | Card | label, value, note, tone | — | `next`-Variante invertiert |
| **Timeline** | eigene | Eintragsart fact/judge/act/plan/bad, Quelle | hover, Fokus | jeder Eintrag ist ein Button und öffnet das EventModal; Tagestrenner, „Beginn der Akte“ am Ende, Korrektur als Hinweis |
| **SourceItem** | Button-Card | Original / Link / privat | hover, Fokus | öffnet SourceModal (Pfad im Vault, Vorschau, „In Obsidian öffnen“, „Im Dateiexplorer zeigen“); privat: rot, nie in Ausgaben auswählbar |
| **MessageListItem** | Card | Empfänger, Vorgänge, Status | aktiv | Status: Entwurf, EN prüfen, geprüft, gesendet |
| **LetterEditor** | Textarea + Tabs | Sprachen | bearbeitet → Prüfungen zurückgesetzt | Platzhalter `[…]` als Warn-Markierung, blockieren „geprüft“ |
| **SendBar** | eigene | — | „Als gesendet markieren“ erst bei allen Sprachen geprüft | Kopieren ist kein Versand |
| **ContactList** | eigene Liste | Gruppen nach Rolle (Verwaltung, Beirat, Hausmeister und Dienstleister, Eigentümer), Suche | aktiv, „Nicht mehr verwendet“ eingeklappt | Zeile = Avatar, Name, „Rolle · Firma“, Badges, E-Mail-/Telefon-Link; Firmen vor Personen |
| **ContactAvatar** | Avatar | `kind: person \| org \| list` | — | Initialen ohne Anrede; Organisation und Verteiler als Symbol |
| **ContactModal** | Modal (Desktop 620 px zentriert) / Drawer (mobil) | Rollen je Gemeinschaft, Kontaktdaten, Verantwortlich für, Nachrichten | offen | öffnet aus Liste, Vorgangsakte, Postausgang ohne Navigation; Kopieren je Feld; mobil „Anrufen“/„E-Mail“ (`tel:`/`mailto:`); Klick auf Vorgang oder Entwurf schließt und navigiert |
| **ContactForm** | Form + Slideover/Drawer | `kind: person \| org` (Verteiler eigenes Formular) | Fehler je Feld nach Speichern-Versuch | Name*, Firma (Combobox, legt neue Firma mit an), Zuständig für* (je Gemeinschaft Ankreuzfeld und Rolle aus einer Liste; mindestens eine), E-Mail, Telefon, „Weitere Angaben“ eingeklappt; Dublettenhinweis ab 3 Zeichen; Speichern immer aktiv |
| **ContactLink** | Link | Kontakt-ID | — | in Vorgangsakte („Verantwortlich“), Postausgang („An“), Verlauf; öffnet ContactModal |
| **Sheet** | Slideover (Desktop rechts) / Drawer (mobil unten, nach dem MVP) | title | offen | Gebaut als modales Blatt: Rahmen `inert`, Fokus zuerst im ersten Feld und im Blatt gehalten, Schließen-Button und Esc schließen und geben den Fokus an den Auslöser zurück; nie gestapelt |
| **Tour** | Popover + eigenes Overlay | Schritte `{target, title, body}`, Willkommensdialog | Willkommen, Schritt n/7, beendet | Spotlight über Zielelement (Ring 4 px Akzent, Rest abgedunkelt), Karte rechts, darunter oder darüber; mobil volle Breite; Esc beendet, ←/→ blättern; Ziele über `data-tour` |
| **FirstRunHint** | Alert (info) | Schritt, Text | sichtbar, gesehen | einmal je Wochenschritt; „Verstanden“, „Keine Hinweise“; zurücksetzbar in Einstellungen › Hilfe |
| **EventModal** | Modal / Drawer | Eintrag, Vorgang | — | Art, Datum, Quelle, Inhalt; „Vorgangsakte öffnen“ außerhalb der Akte |
| **SettingsNav** | Liste von Button (ghost) in einem `nav` mit Beschriftung „Bereiche der Einstellungen“ | ein Eintrag je Bereich, optional Zähler | aktiv (`aria-current="page"`, Balken), Fokus | Gebaut. Teil der Einstellungsansicht der Shell, die je Modul einen Bereich zeigt: heute „Gemeinschaften“ und „Datenprobleme“ (Notizen, die das Plugin nicht lesen oder keinem Typ zuordnen kann, mit Zähler). Bei nur einem Bereich entfällt die Navigation. Die Navigation bleibt beim Wechsel der Bereiche eingehängt, damit der Fokus auf dem gewählten Eintrag bleibt; auf 320 px bricht sie um. ([ADR 0008](../../adr/0008-navigation-and-view-state.md), Nachtrag vom 22.11.2026) |
| **CommunityForm** | Form (TanStack Form) + Slideover | neu/bearbeiten | gültig/ungültig; Konflikt mit einer Änderung außerhalb des Formulars | Gebaut. Felder: Name (höchstens 100 Zeichen), Kürzel, Farbe, Art, Einheitenbezeichnung (je höchstens 50 Zeichen). Das Kürzel (2–5 Zeichen) ist auch nach dem Anlegen änderbar ([[PBI-78 - Kürzel einer Gemeinschaft nachträglich ändern]]); ein vergebenes zeigt den Fehler am Feld. Farbe: ein Radio-Knopf je Palettenfarbe (`radiogroup`, Pfeiltasten), vergebene gesperrt mit dem Zusatz „schon vergeben“. Art und Einheitenbezeichnung sind freier Text mit Vorschlägen, die der Sprache der Oberfläche folgen (de: WEG · Einheiten, Tiefgarage · Stellplätze). Vorschau des Abzeichens. Ein misslungenes Speichern zeigt eine Zusammenfassung (`role="alert"`) und setzt den Fokus auf das erste ungültige Feld; Löschen fragt in einem Dialog nach und legt die Notiz in Obsidians Papierkorb. Haben beide Seiten dasselbe Feld verschieden geändert, wählt der Mensch je Feld ([[DF-23 - Externe Bearbeitung ohne stilles Überschreiben]]) |
| **Toast** | Obsidians `Notice` | Text | — | Gebaut als Meldung nach einem Schreibvorgang („Name“ angelegt, gespeichert, in den Papierkorb verschoben); nur Bestätigung kurzlebiger Erfolge, Fehler persistent als Alert |
| **Alert** | Alert (`role="alert"`, `ErrorNotice`) | warn / bad, Aktionen | — | Gebaut für Datenproblem, Speicherfehler, Lesefehler; Text nennt Ursache, dann Handlung, mit Aktionsknopf („Erneut versuchen“, „Diagnose kopieren“) |

## Referenzen

Zustände als Übersicht: `sitemap/assets/v2-Z-Zustaende.png`. Dialoge: `v2-Dlg-*.png` (Desktop als zentrierter Dialog 520 px, mobil als Sheet von unten).

## Querschnittsregeln

- Keine Erklär- oder Beruhigungstexte in Komponenten. Bedeutung entsteht über Label, Status und Verhalten ([[06 - Texte und Begriffe]]).
- Jede interaktive Fläche ist ein echtes `button`, `a` oder Formularelement.
- Leere Zustände: ein Satz, was hier erscheint, plus eine Aktion (z. B. „Keine Entwürfe“ + „Zur Wochenarbeit“).
- Ladezustand nur, wenn > 300 ms (B-NFR-04); sonst nichts anzeigen.
