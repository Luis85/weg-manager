---
type: Page
id: VIEW-02
status: entwurf
scope: mvp
version: "2.0"
date: 2026-11-15
navigation: primär · geführter Modus
requirements:
  - "[[F-21 - Nichtfunktionale Anforderungen]]"
  - "[[PBI-10 - Eigene Folgeaufgabe nachhalten]]"
  - "[[PBI-11 - Nachricht und Original zuordnen]]"
  - "[[PBI-13 - Aktuelle Wochenlage öffnen]]"
  - "[[PBI-14 - Entscheidungsauswahl und Überlauf prüfen]]"
  - "[[PBI-15 - Eine Entscheidungsvorlage prüfen]]"
  - "[[PBI-16 - Wahl mit Kontextnotiz bestätigen]]"
  - "[[PBI-17 - Folgearbeit aus Entscheidungen vorbereiten]]"
  - "[[PBI-21 - Begründeten Nachfassschritt prüfen]]"
  - "[[PBI-22 - Nachfasspaket begrenzen oder pausieren]]"
  - "[[PBI-23 - Reaktion richtig einordnen]]"
  - "[[PBI-25 - Nächste Wochenarbeit vorbereiten]]"
  - "[[PBI-26 - Unterlagen einstufen und korrigieren]]"
  - "[[PBI-27 - Unnötige private Inhalte entfernen]]"
  - "[[PBI-33 - Wochenarbeit auf dem Handy abschließen]]"
  - "[[PBI-42 - AI-Agent direkt mit den Notizen arbeiten lassen]]"
entities:
  - "[[docs/design/entities/ENT-04 - Punkt]]"
  - "[[docs/design/entities/ENT-05 - Termin]]"
  - "[[docs/design/entities/ENT-06 - Ereignis]]"
  - "[[docs/design/entities/ENT-07 - Quelle]]"
  - "[[docs/design/entities/ENT-08 - Dokument]]"
  - "[[docs/design/entities/ENT-09 - Arbeitsentscheidung]]"
  - "[[docs/design/entities/ENT-10 - Nachrichtenentwurf]]"
  - "[[docs/design/entities/ENT-12 - Eigene Aufgabe]]"
  - "[[docs/design/entities/ENT-13 - Nachfassstand]]"
  - "[[docs/design/entities/ENT-14 - Wochenübergabe]]"
  - "[[docs/design/entities/ENT-16 - Beiratsbewertung]]"
business-rules:
  - "[[docs/business-rules/DF-01 - Beiratsarbeit und Befugnis]]"
  - "[[docs/business-rules/DF-02 - Bearbeitung, Terminprüfung und Bewertung]]"
  - "[[docs/business-rules/DF-03 - Terminbedeutung]]"
  - "[[docs/business-rules/DF-05 - Nachfassfristen und Stufen]]"
  - "[[docs/business-rules/DF-06 - Reaktion und Pause]]"
  - "[[docs/business-rules/DF-07 - Wahl, Entwurf und Versand]]"
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
  - "[[docs/business-rules/DF-09 - Begrenzte Auswahl und Dringlichkeit]]"
  - "[[docs/business-rules/DF-14 - Kennzahlen]]"
  - "[[docs/business-rules/DF-15 - Arbeitsentscheidung und Beschluss]]"
decisions:
  - "[[docs/decisions/K-04 - Wochenpaket beim Einstieg aktualisieren]]"
  - "[[docs/decisions/K-05 - Sieben reguläre Entscheidungen mit sichtbarem Überlauf]]"
  - "[[docs/decisions/K-06 - Nachfassen an Versand und Fristen ausrichten]]"
  - "[[docs/decisions/K-10 - Manuelle Quellenübernahme und Registerimport vorsehen]]"
hypotheses:
  - "[[docs/hypothesis/H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]"
  - "[[docs/hypothesis/H-04 - Sieben Entscheidungen sind ein brauchbares Arbeitsbudget]]"
  - "[[docs/hypothesis/H-05 - Manuelle Eingangsübernahme bleibt alltagstauglich]]"
  - "[[docs/hypothesis/H-06 - Vorbereitete Wochenarbeit ist ohne verpflichtende KI nützlich]]"
mockups:
  - "[[docs/design/sitemap/assets/v2-P-D-02-Woche-Eingang.png]]"
  - "[[docs/design/sitemap/assets/v2-P-D-03-Woche-Nachhalten.png]]"
  - "[[docs/design/sitemap/assets/v2-P-D-04-Woche-Entscheiden.png]]"
  - "[[docs/design/sitemap/assets/v2-P-M-02-Woche-Eingang.png]]"
  - "[[docs/design/sitemap/assets/v2-P-M-04-Woche-Entscheiden.png]]"
  - "[[docs/design/sitemap/assets/v2-P-M-06-Woche-Uebergabe.png]]"
---

# VIEW-02 · Wochenarbeit (geführt)

**Rolle:** Die reguläre Wochenarbeit als Assistent in fünf Schritten. Auswahl, Optionen, Vorschläge und Entwurfstexte entstehen nach [[Konzept - Vorbereitung ohne KI]]. Die Hauptnavigation tritt zurück; oben stehen „← Zurück zur Lage“ (pausiert die Woche), aktive Zeit (Ziel ≤ 60 min) und ein Stepper. Jeder Schritt hat genau eine Aufgabe als Überschrift und eine Primäraktion „Weiter“.

| Schritt | Überschrift (Aufgabe) | Entscheidung pro Element | Ergebnis |
| --- | --- | --- | --- |
| 1 Eingang sichten | Neue Eingänge zuordnen | Zu Punkt · Neuer Punkt · Dublette · Später · Nicht relevant (mit Grund) | Quelle + Ereignis an Punkt; erkannte Termine als neue Zusage |
| 2 Nachhalten | Offene Zusagen prüfen | Eingegangen · Weiter warten (opt. Pause mit Grund) · Nachfassen · Neu planen | Nachfass-Entwurf, neue Prüfdaten, optional Bewertung |
| 3 Entscheiden | Entscheidungen treffen | Option wählen + Notiz · Zurückstellen | Entwürfe im Postausgang, eigene Aufgaben |
| 4 Senden | Nachrichten prüfen und senden | Postausgang (gefiltert auf diese Woche) | dokumentierter Versand |
| 5 Übergabe | Schwerpunkte für nächste Woche festlegen | bis 3 Schwerpunkte + Kontextnotiz + Zeit | Wochenübergabe, Rückkehr zur Lage |

## Schritt 1 · Eingang sichten

Links die ungeprüften Eingänge (Kanal, Datum, Gemeinschaft oder „?“), Mitte das Original mit Metadaten (Kanal, Absender, Ereignis- und Erfassungsdatum), rechts „Einordnen“ mit regelbasierten Vorschlägen (gleicher Absender, Stichwort, offener Punkt) und Einzeltasten (1, 2, N, D, S, X). Erkennt die Regel ein Datum, erscheint die Karte „Termin im Text“ mit „Als Fremdtermin übernehmen“ / „Nicht übernehmen“; Checkbox „Original speichern“. Die Gemeinschaft bleibt änderbar, der Vorschlag passt sich an. Regel: Zuordnen trägt eine neue Zusage ein; der alte Termin bleibt im Verlauf, der Punkt bleibt offen.

![[v2-P-D-02-Woche-Eingang.png]]

## Schritt 2 · Nachhalten

Je wartender Zusage eine Karte: Kürzel, Punkt-ID, Titel, Status-Chip (Zusage überschritten / Termin fehlt), „wartet auf …“, Wartezeit-Balken, zugesagt bis, Prüfung am. Darunter ein Segment mit vier Antworten. Bereits entschiedene Zusagen klappen zu einer Zeile mit „Ändern“; noch nicht fällige erscheinen gestrichelt. Kontextpanel rechts: Mini-Verlauf (jeder Eintrag öffnet das Verlaufs-Modal mit Art, Datum, Quelle und Inhalt, z. B. dem Mailtext; „Punktakte öffnen“), „Akte öffnen“, vorbereiteter Entwurf (gebündelt je Empfänger), Bewertung der Zusage als Auswahl „Keine“ / „Nicht eingehalten“ (intern), nächstes Prüfdatum.

![[v2-P-D-03-Woche-Nachhalten.png]]

## Schritt 3 · Entscheiden

Links die Warteschlange: Budgetleiste 6/7, reguläre Entscheidungen, darunter „Dringend · zusätzlich“ (zählt nicht ins Budget, Regel DF-09). Mitte: Frage, Quellen-Chips (Original/Link), Fakten-Kacheln mit sichtbarer Lücke, Optionen als große Radio-Karten mit Folgen-Zeile und „Vorschlag“-Kennzeichen, Notizfeld. Rechts: „Danach entsteht“ (Entwürfe, Aufgaben). Regel: nichts wird gesendet; erneutes Bestätigen erzeugt keine Dubletten.

![[v2-P-D-04-Woche-Entscheiden.png]]

## Schritt 4 · Senden

Öffnet [[VIEW-04 - Postausgang]] gefiltert auf die Entwürfe dieser Woche; „Weiter“ ist auch möglich, wenn noch nicht alles gesendet ist – offene Entwürfe bleiben sichtbar.

## Schritt 5 · Übergabe

Zusammenfassung (entschieden, gesendet, nachgefasst), bis zu drei Schwerpunkte, je mit Text und Auswahl des Punkts (oder „Ohne Punkt“ + Gemeinschaft; Punktwahl schlägt den Titel vor), Kontextnotiz, aktive Zeit mit Feld für Doppelpflege außerhalb (DF-14). „Woche abschließen“.

![[v2-P-M-06-Woche-Uebergabe.png|180]]

## Mobil

Gleiche Schritte, ein Element pro Bildschirm, Fortschrittsbalken oben, Aktionsleiste unten mit Abstand zur Obsidian-Navigation. Alle Eingaben (Notiz, Schwerpunkte, Bewertung) sind im mobilen Ausbau nach dem MVP möglich (K-09).

![[v2-P-M-04-Woche-Entscheiden.png|180]]

## Unterbrechung und Fehler

- „Zurück zur Lage“ (links im Kopf der Woche) pausiert: Schritt, Position und Eingaben bleiben gespeichert, die Lage zeigt „Fortsetzen bei Schritt N“. Die Schaltfläche heißt nach ihrem Ziel, weil sich die Ansicht vollständig ändert.
- Die Zeit zählt nur aktiv (Fokus im Tab).
- Speicherfehler: persistenter Hinweis am betroffenen Element, Eingabe bleibt erhalten.
- Neue Eingänge während der Arbeit erscheinen als Hinweis „1 neuer Eingang“ – kein stiller Umbau der Liste.

## Hinweise beim ersten Durchlauf

Beim ersten Durchlauf zeigt jeder Schritt oben einmal einen Hinweis (Infofläche, nicht blockierend) mit „Verstanden“ und „Keine Hinweise“. Gesehene Hinweise werden je Schritt gespeichert; Einstellungen › Hilfe › „Wieder anzeigen“ setzt sie zurück.

| Schritt | Hinweis |
| --- | --- |
| 1 Eingang | Ordne jeden Eingang einem Punkt zu, lege einen neuen Punkt an oder verschiebe ihn auf später. |
| 2 Nachhalten | Wähle für jede fällige Zusage eine Antwort. „Nachfassen“ legt einen Entwurf im Postausgang an. |
| 3 Entscheiden | Höchstens 7 Entscheidungen pro Woche, Dringendes zusätzlich. Bestätigen erzeugt Entwürfe oder Aufgaben; gesendet wird nichts. |
| 4 Senden | Prüfe jede Sprachfassung, versende extern und markiere die Nachricht hier als gesendet. |
| 5 Übergabe | Lege bis zu 3 Schwerpunkte fest. Sie stehen nächste Woche oben in der Lage. |

## Erkannter Termin im Eingang

Enthält ein Eingang ein Datum, zeigt Schritt 1 die Karte „Termin im Text“ mit Datum, Absender und Eingangsdatum und der Wahl „Als Fremdtermin übernehmen“ / „Nicht übernehmen“ (Standard: übernehmen). Darunter steht die Folge für den vorgeschlagenen Punkt, z. B. „Fremdtermin 10.11. → 02.12., der alte Termin bleibt im Verlauf“ bzw. „Fremdtermin bleibt; die Nachricht wird nur als Quelle abgelegt“. Keine Checkbox.

## Eingangsliste

Die Liste „Eingänge“ rechts (mobil unter dem aktuellen Eingang) ist anklickbar: offene Eingänge werden direkt zur Bearbeitung geöffnet, unabhängig von der Reihenfolge; zugeordnete Eingänge führen mit „Zum Punkt →“ in die Punktakte; „später“, „Dublette“ oder „nicht relevant“ markierte Eingänge lassen sich erneut bearbeiten.

Eingänge ohne erkannte Gemeinschaft zeigen die Gemeinschaftsauswahl dauerhaft; die Wahl bleibt bis zum Zuordnen änderbar. Ein Wechsel passt den vorgeschlagenen Punkt an die gewählte Gemeinschaft an (DF-12: nie Vorschlag aus der anderen Gemeinschaft).

## Weitere Bildschirme (Prototyp)

Stand Pilot 15.11.2026, Übersicht in [[Prototyp - Stand Pilot]].

![[v2-P-M-02-Woche-Eingang.png|180]]
![[v2-P-M-03-Woche-Nachhalten.png|180]]
![[v2-P-D-05-Woche-Senden.png]]
![[v2-P-M-05-Woche-Senden.png|180]]
![[v2-P-D-06-Woche-Uebergabe.png]]
