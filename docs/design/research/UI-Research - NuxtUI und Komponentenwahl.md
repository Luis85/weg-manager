---
type: Research
status: entwurf
scope: mvp
date: 2026-11-15
---

# Nuxt UI und Komponentenwahl

Recherchiert am **15.11.2026**. Ausschließlich offizielle Nuxt-UI-Primärquellen; alle unten verlinkten Seiten wurden geöffnet. Grundlage der Produktzuordnung sind [[02-MVP-PRD]] Version 1.1 und [[F-21 - Nichtfunktionale Anforderungen]]. Die Recherche belegt Bibliotheksfähigkeiten, keine Implementierung, Integration oder bestandene Produktabnahme. Eine konkrete Paketversion wird hier nicht ausgewählt.

## Komponentenbasis und Architekturgrenze

**Beleg:** Nuxt UI beschreibt sich als Vue-Komponentenbibliothek auf Reka UI, Tailwind CSS und Tailwind Variants. Nuxt ist ausdrücklich optional; die Vue-Installationsanleitung beschreibt Vite. Die Einleitung nennt Tastaturbedienung, Fokusmanagement und Screenreader-Unterstützung. Quellen: [Introduction](https://ui.nuxt.com/docs/getting-started), [Installation für Vue](https://ui.nuxt.com/docs/getting-started/installation/vue), geprüft 15.11.2026.

**Designentscheidung:** Nuxt UI ist die neue Komponentenbasis des MVP-Entwurfs. Dies legt weder Nuxt-SSR noch Backend, Hosting, Konten, externe Dienste oder eine eigenständige Web-App fest. Der lokale Obsidian-Kontext, Offlinearbeit und vollständige mobile Kernreise bleiben maßgeblich.

**Offen:** Die genannten Quellen belegen keine fertige Obsidian-Einbettung. Mounting/Lebenszyklus, CSS-Isolation, Overlays, Fokus, Host-Themes, lokale Assets und mobile Dateiauswahl müssen im technischen Konzept geklärt und später geprüft werden.

## Quellenmatrix und begründete Verwendung

Alle Quellen in dieser Matrix: Abruf/Prüfung **15.11.2026**. Links sind bewusst auf Komponenten-Dokumentation gerichtet, nicht auf Marketing-Screenshots oder ungeprüfte Drittanbieterempfehlungen.

| Familie / Primärquellen | Belegte Fähigkeit | Gewählte Verwendung / Grenze |
| --- | --- | --- |
| [DashboardSidebar](https://ui.nuxt.com/docs/components/dashboard-sidebar), [DashboardNavbar](https://ui.nuxt.com/docs/components/dashboard-navbar), [DashboardPanel](https://ui.nuxt.com/docs/components/dashboard-panel) | Sidebar einklappbar/veränderbar; Navbar mit mobilem Toggle; Panels nebeneinander, Zustand über DashboardGroup. | Desktop-Arbeitsbereich mit optionaler Quellenzone; mobile Einspaltenansicht. Keine doppelte allgemeine App-Navigation neben Obsidian ungeprüft voraussetzen. Layoutpersistenz ist keine Fachdatenspeicherung. |
| [NavigationMenu](https://ui.nuxt.com/docs/components/navigation-menu) | Horizontale/vertikale Linknavigation mit Untereinträgen. | Drei primäre Ziele Wochenarbeit, Register, Lagecheck. Einrichtung, Quellen, Kommunikation und Ausgabe kontextuell ergänzen. Gemeinschaft bei jedem bearbeiteten Objekt sichtbar halten. |
| [Table](https://ui.nuxt.com/docs/components/table) | Auf TanStack Table; Sortierung, Filter, Pagination, Auswahl, Expansion, Gruppierung, Pinning, Virtualisierung. | Desktop-Register mit relevanten Spalten; mobile Punktkarten/listenförmige Darstellung. Die dokumentierte Responsive-Eigenschaft ersetzt keinen Entwurf für 15 Fachangaben auf schmalem Bildschirm. |
| [Form](https://ui.nuxt.com/docs/components/form), [Input](https://ui.nuxt.com/docs/components/input), [Select](https://ui.nuxt.com/docs/components/select), [Textarea](https://ui.nuxt.com/docs/components/textarea) | Form unterstützt eigene/Schema-Validierung und FormField-Fehler. Keine Validierungsbibliothek enthalten. Text-, Auswahl- und Mehrzeilenfelder; Textarea optional mit automatischer Höhe. | Kurze Titel, explizite Zustände, längere Notiz/Entwurf getrennt. Fehlende Werte nicht erfinden. Eingabeerhalt, Konfliktklärung und fachliche Regeln müssen zusätzlich gestaltet/implementiert werden. |
| [Stepper](https://ui.nuxt.com/docs/components/stepper) | Schritte mit Titel, Inhalt und steuerbarem Zustand zur Darstellung mehrstufiger Prozesse. | Wochenarbeit als Lage → Entscheidungen → Kommunikation → Übergabe. Fortschritt im Arbeitsablauf bedeutet weder Erfüllung einer Zusage noch Versand. |
| [Modal](https://ui.nuxt.com/docs/components/modal), [Slideover](https://ui.nuxt.com/docs/components/slideover) | Dialog beziehungsweise seitlich einfahrender Dialog, Titel/Beschreibung und Inhaltsbereiche. | Kurze Bestätigungen, Pause und tatsächlichen Versand dokumentieren; lange Kernarbeit als volle Seite. Fokus-/Schließverhalten mit ungespeicherten Daten im Host prüfen. |
| [Tabs](https://ui.nuxt.com/docs/components/tabs) | Gruppen von Panels, jeweils eines sichtbar. | Aktenabschnitte und mobile DE/EN-Bearbeitung. Sprache wechseln ist keine Inhaltsprüfung; Prüfstand außerhalb des versteckten Panels erkennbar halten. |
| [Alert](https://ui.nuxt.com/docs/components/alert), [Badge](https://ui.nuxt.com/docs/components/badge) | Hinweis mit Titel/Beschreibung beziehungsweise kurzer Status-/Kategorietext, Farben und Varianten. | Dauerhafte Hinweise für Lücken, Konflikt, Fehler und dringenden Überlauf; Badges für Gemeinschaft und Zustand. Status, Terminmerkmal und menschliche Bewertung getrennt halten. |
| [FileUpload](https://ui.nuxt.com/docs/components/file-upload) | Dateieingabe mit nativen File-Objekten oder eigenen Dateiobjekten, Mehrfachauswahl und optionalem Dropbereich. | Im Produkt „Original hinzufügen“; lokales Auswählen, Kopierfortschritt, Quellzuordnung und Prüfen unterscheiden. Der Name belegt weder externen Upload noch sichere lokale Ablage. |
| [InputDate](https://ui.nuxt.com/docs/components/input-date), [Calendar](https://ui.nuxt.com/docs/components/calendar) | Datumseingabe bzw. Kalender für Einzel-/Mehrfachdaten oder Bereiche; Locale-basierte Formatierung. | DatePicker als zusammengesetztes Pattern aus InputDate/Calendar, keine ungeprüfte UDatePicker-Komponente. Fremdtermin, Wunschfrist, eigene Fälligkeit und Wiedervorlage gesondert beschriften. |
| [Toast](https://ui.nuxt.com/docs/components/toast), [Design System](https://ui.nuxt.com/docs/getting-started/theme/design-system) | Kurze Rückmeldung über useToast mit App/Toaster-Kontext; CSS-Themetokens für Gestaltung. | Ergänzende Bestätigung „Text kopiert“, nie einziger Hinweis auf Speicherfehler. Weiß/Slate, Primärakzent Petrol #0F766E und 16 px Body sind gewählte Designwerte, keine Nuxt-UI-Pflicht. |

## Designregeln aus dem Produktkontext

1. **Arbeitsfähigkeit vor Dashboard-Dekoration.** Vorbereitete Kontexttexte, Quellen, Optionen, Folgen und Empfehlungen müssen ohne KI nutzbar bleiben. Diagramme oder Kennzahlen dürfen diese Vorbereitung nicht ersetzen.
2. **Gemeinschaft sichtbar halten.** WEG Lindenhof und Tiefgarage Lindenhof dienen nur als synthetische Beispiele. Eine gemeinsame Übersicht kennzeichnet jeden Eintrag; Entscheidung, Entwurf und Ausgabe bleiben sauber zugeordnet.
3. **Zustände sprachlich trennen.** Wahl, Entwurf, menschliche Prüfung, kopierter Text, tatsächlicher Versand, Antwort und Erfüllung sind verschiedene Ereignisse. „Überfällig“ ist kein Bearbeitungsstatus und „nicht eingehalten“ eine menschliche Bewertung.
4. **Responsive Komposition ist eigenes Design.** Entwürfe für 1440×1024 und 390×844; zusätzlich Konzeptprüfung bei 320 px und 200 % Zoom. Desktop-Seitenspalten werden mobile volle Ansichten. Keine Kernaktion darf einen Desktopausweichschritt verlangen.
5. **Unvollständige Grundlage sichtbar machen.** Unbekannte Termine, fehlende Originale, alte Quellenstände, noch nicht dokumentierter Versand und dringender Überlauf werden nicht durch leere Felder oder grüne Erfolgsanzeigen verdeckt.
6. **Rückmeldung hält fachlichen Grenzen stand.** Kurzer Toast bei Kopieren/Speichern, dauerhafter Fehlerhinweis bei Konflikt oder Datenverlustgefahr. Angezeigte Prüfung läuft beim Einstieg/Wiederaufnehmen, nicht angeblich während eines geschlossenen Plugins.

## Accessibility und nicht belegte Garantien

Die Accessibility-Aussage der Bibliothek ist eine Komponentenbasis, kein Nachweis für die zusammengesetzte Oberfläche. B-NFR-06 verlangt Tastaturkernreise, sichtbaren Fokus, Text zusätzlich zur Statusfarbe und erreichbare Aktionen/Fehler bei 200 % Zoom. Zu prüfen sind besonders Dialogfokus/Rückkehr, mobile Tastatur, Tabellenaktionen, Tabs, Fehlerübersichten und Änderungen des Speicher-/Prüfstands. Bewegte oder verschwindende Rückmeldungen dürfen wichtige Informationen nicht allein tragen.

Ebenso wenig belegen Komponenten Datenerhalt, sichere Fremdtextdarstellung, unveränderte Originale, Konfliktauflösung, Wiederherstellung oder Offlinebetrieb. Font-/Icon-/sonstige Assets müssen ohne unbeabsichtigtes externes Nachladen verfügbar sein. Auswahl und Vorschau von Dateien dürfen keine ungewählten Dateien offenlegen. Das sind Produkt- und Integrationsanforderungen aus F-21, keine hier geprüften technischen Eigenschaften.

Virtualisierung und anpassbare Komponenten begründen keine Leistungszusage. Die Desktop-Ziele aus F-21 bleiben spätere Messziele am dort beschriebenen Referenzbestand; mobile Referenzgeräte und Messziele bleiben offen. Keine Benchmarks, Installationsversuche oder Runtime-Tests wurden in dieser Recherche durchgeführt.

## Spätere Entscheidungs- und Prüfpunkte

| Frage | Benötigte Klärung vor Umsetzung/Abnahme |
| --- | --- |
| Obsidian-Einbettung | Vue-/Nuxt-UI-Lebenszyklus, Host-Styles, Portal-/Overlay-Ziel, Deaktivierung und Fokus. |
| Offline-Assets | Lokale Fonts/Icons, keine obligatorischen Netzwerk-/KI-Aufrufe. |
| Fachlicher Zustand | Versionierung, wiederholbare Folgearbeit, Eingabeerhalt, erneute Sprachprüfung und tatsächliche Versandfassung. |
| Mobile | Referenz-Handy, Tastatur, Dateiübernahme, Unterbrechung/Wiederaufnahme und vollständige Kernreise. |
| Zugänglichkeit | Geplante reale Tastatur-/Zoom-/Screenreader-Prüfung nach Implementierung. |
| Nuxt-UI-Version | Geeignete Version später konkret festlegen; dann Komponenten-API und Host-Verhalten erneut prüfen. |

Diese Note begründet die Komponentenwahl für den visuellen Entwurf. Sie gibt keine technische Architektur oder Entwicklung frei.
