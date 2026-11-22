---
type: Handoff
id: HO-06
status: entwurf
scope: mvp
version: "1.1"
date: 2026-11-22
---

# Handoff · Texte und Begriffe

**Auf den Stand vom 22.11.2026 gebracht** nach [ADR 0005](../../adr/0005-ui-language.md) (Sprache der Oberfläche), [ADR 0006](../../adr/0006-module-structure.md) (Begriffe im Glossar vor dem Code) und den Wortentscheidungen vom 22.11.2026 (`docs/plans/pre-feature-improvement-plan.md`, Abschnitt 8; PBI-56, Kommentare). Maßgeblich für die Begriffe ist `GLOSSARY.md`, für die gebauten Texte sind es die Kataloge `src/application/<modul>/i18n/de.ts` und `en.ts`.

## Sprache der Oberfläche

Jeder sichtbare Text kommt aus den getippten Katalogen, je Modul ein Teil in Deutsch und Englisch. Die Sprache bestimmt Obsidians `getLanguage()`: Deutsch für `de` und seine Varianten, sonst Englisch; sie gilt je Laden des Plugins. Ein neuer Text braucht einen Schlüssel in beiden Katalogen. Die Fachlogik liefert Problemcodes, nie Sätze. Vorschläge in Formularen (Art und Einheitenbezeichnung einer Gemeinschaft: „WEG · Einheiten“, „Tiefgarage · Stellplätze“) folgen der Sprache der Oberfläche; der gewählte Text steht in der Notiz, gemischte Sprachen im Vault werden hingenommen. Der Diagnosebericht bleibt deutsch.

## Schreibregeln

1. **Keine Erklär- und Beruhigungstexte** im UI („Nichts wird gesendet“, „bleibt sichtbar“, „wird nicht erfunden“). Regeln zeigen sich in Verhalten, Status und Beschriftung; Erklärungen gehören in Hilfe und Dokumentation (Review 15.11.2026).
2. Satzanfang-Großschreibung für alle Labels und Befehle (Obsidian-Richtlinie).
3. Buttons beginnen mit einem Verb oder benennen das Ziel: „Woche starten“, „Als gesendet markieren“, „Weiter: Entscheiden“.
4. Schritt-Überschriften benennen die Aufgabe, keine Frage: „Neue Eingänge zuordnen“, „Offene Zusagen prüfen“, „Entscheidungen treffen“, „Nachrichten prüfen und senden“, „Schwerpunkte für nächste Woche festlegen“ (Review 15.11.2026).
5. Du-Form im UI, Sie-Form in Textbausteinen an Verwaltung und Eigentümer.
6. Fehler nennen Ursache und Handlung („Speichern fehlgeschlagen. Eingaben sind erhalten. Erneut speichern“). Deutsch in der Du-Form, Englisch als Satz in Satzanfang-Großschreibung, erst die Ursache, dann die Handlung.
   - Der Ordner mit den Notizen heißt in Texten **Vault**, nicht „Tresor“.
   - Texte zu Programmfehlern und zum Diagnosebericht verweisen auf die GitHub-Seite des Plugins (Issues), nicht auf „den Support“. Der Bericht enthält keine Inhalte von Notizen.
7. Kein „KI“, „automatisch“ oder „intelligent“ in Labels.

- Links tragen den Titel des Ziels (Punkttitel, Nachrichtentitel), nicht nur eine ID.

- Einstellungen erklären sich: je Bereich ein kurzer Einleitungsabsatz, je Option eine Beschreibung von ein bis zwei Sätzen, was sie bewirkt (Obsidian-Muster „Name + Beschreibung“). Das ist keine Ausnahme von der Regel gegen Beruhigungstexte, sondern Funktionsbeschreibung.

## Begriffe (verbindlich)

| Begriff DE | EN (Eigentümertexte, Doku) | Bedeutung | Nicht verwenden |
| --- | --- | --- | --- |
| Gemeinschaft | community | WEG, Tiefgarage … | Mandant, Objekt |
| Punkt | item | einzeln erledigbares Anliegen mit prüfbarem Ergebnis | Ticket, Vorgang, Aufgabe |
| Thema | topic | Zusammenhang mehrerer Punkte | Projekt |
| Zusage | commitment | Ankündigung eines Dritten mit oder ohne Termin | Versprechen |
| Fremdtermin | stated date | von Dritten genannter Termin | Deadline |
| Wiedervorlage | follow-up date | eigenes Prüfdatum | Erinnerung |
| Nachfassen | follow up | dokumentierter nächster Kommunikationsschritt | Mahnen, Eskalieren |
| Eigene Aufgabe | own task | Handlung des Beirats | To-do |
| Entscheidung | decision | persönliche Arbeitsentscheidung des Beirats | Beschluss |
| Bewertung | assessment | interne Beurteilung (◆), z. B. „nicht eingehalten“ | Verstoß, Mahnung |
| Entwurf | draft | vorbereiteter Text, nicht gesendet | Mail |
| Als gesendet markieren | mark as sent | Dokumentation eines externen Versands | Senden |
| Übergabe | handover | Wochenabschluss mit Schwerpunkten | Notiz |
| Lage | situation | Startansicht | Dashboard |
| Kürzel | short code | 2 bis 5 Zeichen (A–Z, 0–9), eindeutig, nach dem Anlegen fest | Abkürzung, Kennung |
| Art | kind | was für eine Gemeinschaft es ist, in eigenen Worten (WEG, Tiefgarage); ohne Rechtsform und Befugnis | Typ, Kategorie |
| Einheitenbezeichnung | unit label | wie die Gemeinschaft ihre Einheiten nennt (Einheiten, Stellplätze) | Einheitentyp |
| Gemeinschaftswechsel | community switch | die Auswahl im Rahmen, die die Gemeinschaft zeigt und ändert | Filter, Dropdown |
| Gemeinschaftskontext | community selection | die Gemeinschaft, in der der Nutzer gerade arbeitet; kein „Alle“ | Filter, Mandant |
| Notiz | note | Markdown-Datei im Vault, die einen Datensatz trägt und sein einziger Speicher ist | Datei, Seite |
| Dateivertrag | file contract | dokumentierte Form der Notizen eines Typs (Felder, Version) | Schema, Datenmodell |
| Schreibgeschützt | read-only | Notiz, die das Plugin zeigt, aber nie schreibt (neuere Version, fehlende oder doppelte Kennung) | gesperrt, deaktiviert |
| Konflikt | conflict | Feld, das Mensch und Notiz verschieden geändert haben; nichts wird gespeichert, bis der Mensch wählt | Kollision |
| Bereich der Einstellungen | settings section | ein Abschnitt der Einstellungsansicht, von einem Modul geliefert | Tab, Kategorie |
| Datenprobleme | data issues | Notizen von WEG Manager, die das Plugin nicht lesen oder keinem Typ zuordnen kann | Fehler, kaputte Notizen |
| Vault | vault | der Ordner, in dem Obsidian die Notizen hält | Tresor |
| Eingang | inbox | ungeprüfte Quellen | Posteingang |
| Postausgang | outbox | vorbereitete Nachrichten | Gesendet |
| Datenlücke | data gap | bekannter, ungeprüfter Kanal oder fehlende Angabe | — |

## Statuswörter

offen · ungeklärt · erledigt · hinfällig (Punkt) — offen · in Arbeit · wartet · erledigt · entfallen (Aufgabe) — überfällig · Termin fehlt · Zusage überschritten (Prüfmerkmale) — Entwurf · EN prüfen · geprüft · gesendet (Nachricht) — Vorschlag (Option) — dringend (Auswahl).

## Formate

- Datum kompakt `16.11.`, mit Jahr `16.11.2026`, Wochentag ausgeschrieben in Überschriften („Montag, 16. November“). EN: `16 Nov 2026`.
- Dauer „19 T“, „41 min“.
- IDs in Mono: `P-041`.
- Beträge nur, wenn erfasst: `3.640 €` (de-DE).

## Textbausteine

Siehe [[Konzept - Vorbereitung ohne KI]] Abschnitt 3: Vorlagen als bearbeitbare Notizen, Platzhalter `{…}`, fehlende Werte als `[Feld fehlt]`.
