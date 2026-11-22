---
type: Page
id: VIEW-09
status: entwurf
scope: mvp
version: "1.0"
date: 2026-11-22
navigation: Erststart, ohne Navigationseintrag
requirements:
  - "[[PBI-61 - Beim ersten Aktivieren in die Einrichtung geführt werden]]"
  - "[[PBI-62 - Gemeinschaften im Einrichtungsassistenten anlegen]]"
  - "[[PBI-63 - Nach der Einrichtung auf der Lage mit Ersten Schritten ankommen]]"
  - "[[PBI-64 - Kurze Einführung durch das Plugin erhalten]]"
entities:
  - "[[docs/design/entities/ENT-01 - Gemeinschaft]]"
business-rules:
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-22 - Notizen als maßgeblicher Datenbestand]]"
decisions:
  - "[[docs/decisions/K-02 - Zwei Gemeinschaften für einen Bearbeiter]]"
  - "[[docs/decisions/K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]"
  - "[[docs/decisions/K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und kurze Tour]]"
mockups:
  - "[[docs/design/sitemap/assets/v2-D18-Einrichtung-Willkommen.png]]"
  - "[[docs/design/sitemap/assets/v2-D19-Einrichtung-Gemeinschaft.png]]"
  - "[[docs/design/sitemap/assets/v2-D20-Einrichtung-Pruefen.png]]"
  - "[[docs/design/sitemap/assets/v2-D21-Lage-Erste-Schritte.png]]"
  - "[[docs/design/sitemap/assets/v2-D22-Einfuehrung-Angebot.png]]"
  - "[[docs/design/sitemap/assets/v2-D23-Einfuehrung-Schritt.png]]"
---

# VIEW-09 · Einrichtung

Ansicht für den ersten Start in einem Vault ohne Gemeinschaft. Sie erscheint einmal beim Aktivieren des Plugins und immer dann, wenn der Nutzer die Plugin-Ansicht öffnet, solange es keine Gemeinschaft gibt ([[PBI-61 - Beim ersten Aktivieren in die Einrichtung geführt werden]]). Sie hat keinen Navigationseintrag: Die übrige Navigation ist ausgeblendet, bis die erste Gemeinschaft angelegt ist. Ablauf und Sonderfälle: [[FLOW-09 - Erststart, Einrichtung und Einführung]]. Abwägungen: [[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und kurze Tour]].

Desktop zuerst; die mobile Fassung folgt mit der mobilen Wochenarbeit nach dem MVP ([[K-09 - Vollständige mobile Wochenarbeit unterstützen]]).

## Aufbau

- **Kopf:** Titel „WEG Manager einrichten“ und ein Stepper mit drei Schritten: 1 Willkommen, 2 Gemeinschaften, 3 Prüfen. Erledigte Schritte sind anklickbar, spätere nicht.
- **Inhalt:** je Schritt eine Frage oder Aufgabe, linksbündig, höchstens etwa 640 px breit.
- **Fuß:** Zurück (ab Schritt 2) und die Hauptaktion des Schritts rechts.
- **Komponenten:** Nuxt UI `UStepper`, `UForm`/`UFormField` mit TanStack Form, `UInput`, `USelectMenu` mit freier Eingabe für die Art, Farbpalette wie in [[VIEW-07 - Einstellungen und Einrichtung]], `UButton`. Komponentenliste: `docs/design/handoff/02 - Komponenten.md`.

## Schritt 1 · Willkommen

![[v2-D18-Einrichtung-Willkommen.png]]

| Element | Inhalt |
| --- | --- |
| Text | „WEG Manager hilft dir, deine Arbeit als Beirat Woche für Woche im Griff zu behalten. Alles liegt als Notizen in deinem Vault, ohne Konto und ohne KI. Die Einrichtung dauert etwa zwei Minuten.“ |
| Hauptaktion | „Los geht's“ |

## Schritt 2 · Gemeinschaften

![[v2-D19-Einrichtung-Gemeinschaft.png]]

| Element | Inhalt und Regel |
| --- | --- |
| Frage | „Für welche Gemeinschaft bist du Beirat?“ |
| Name | Pflicht. Beispiel als Platzhalter: „Wohnanlage Lindenstraße 12“. |
| Art | Pflicht. Vorschläge „WEG“ und „Tiefgarage“, freie Eingabe möglich. Keine Rechtsform, keine Befugnisse ([[ENT-01 - Gemeinschaft]]). |
| Weitere Angaben (eingeklappt) | Kürzel: aus dem Namen vorbelegt, 2–5 Zeichen, Hinweis „Kann später nicht geändert werden“. Farbe: erste freie Farbe der Palette. Einheitenbezeichnung: aus der Art vorbelegt („Einheiten“, bei Tiefgarage „Stellplätze“). |
| Frage danach | „Bist du für eine weitere Gemeinschaft Beirat, etwa eine Tiefgarage?“ mit „Ja, hinzufügen“ und „Nein, weiter“. „Ja“ zeigt dasselbe Formular erneut, mit der nächsten freien Farbe. |
| Fehler | Am Feld, mit Ursache und Ausweg, z. B. „Das Kürzel AW gibt es schon. Wähle ein anderes.“ |

## Schritt 3 · Prüfen und anlegen

![[v2-D20-Einrichtung-Pruefen.png]]

| Element | Inhalt und Regel |
| --- | --- |
| Liste | Je Gemeinschaft Farbpunkt, Kürzel, Name, Art, Einheitenbezeichnung und „Ändern“. „Ändern“ springt zum Formular dieser Gemeinschaft und danach wieder hierher. |
| Ablage | „Ablage im Vault: WEG Manager/Gemeinschaften/“ (nur Anzeige, siehe K-19 O-19c). |
| Hinweis | „Erst mit ‚Anlegen‘ entstehen die Notizen.“ |
| Hauptaktion | „Anlegen“. Während des Schreibens deaktiviert mit Fortschrittsanzeige. Danach Wechsel auf die Lage. |
| Schreibfehler | Meldung oben: welche Gemeinschaften angelegt wurden, welche nicht, und „Erneut versuchen“. |

## Nach der Einrichtung · Lage mit Ersten Schritten

![[v2-D21-Lage-Erste-Schritte.png]]

Die Lage ([[VIEW-01 - Lage]]) zeigt oben die Karte „Erste Schritte“ ([[PBI-63 - Nach der Einrichtung auf der Lage mit Ersten Schritten ankommen]]): Fortschritt „1 von 4“, Einträge mit Haken, wenn der Vault sie erfüllt, und je einem Knopf zur passenden Stelle. Leere Bereiche der Lage erklären in einem Satz, was dort erscheinen wird.

## Einführung

![[v2-D22-Einfuehrung-Angebot.png]]

![[v2-D23-Einfuehrung-Schritt.png]]

Beim ersten Besuch der Lage erscheint das Angebot „Kurze Einführung? Etwa eine Minute.“ mit „Starten“ und „Später“ ([[PBI-64 - Kurze Einführung durch das Plugin erhalten]]). Die Einführung hat fünf Schritte: Lage, Wochenarbeit, Erfassen, Gemeinschaftswechsel, Einstellungen und Hilfe. Jeder Schritt hebt ein Element hervor, ohne es zu verdecken, und zeigt eine Karte mit Titel, einem Satz, „n von 5“, Zurück, Weiter und Beenden. Umsetzung mit `useTour` und `UPopover` aus Nuxt UI. Sie ersetzt die Tour mit sieben Schritten aus [[VIEW-07 - Einstellungen und Einrichtung]].

## Zustände

| Zustand | Darstellung |
| --- | --- |
| Index lädt noch | Stepper ausgegraut, Hinweis „Vault wird gelesen …“; keine Entscheidung über Einrichtung oder Startroute, bevor der Index bereit ist. |
| Gemeinschaft taucht während der Einrichtung auf (Sync, Hand) | Hinweis „In deinem Vault gibt es schon eine Gemeinschaft.“ mit „Zur Lage“ und „Einrichtung fortsetzen“. |
| Schreiben läuft | Hauptaktion deaktiviert, Fortschritt sichtbar. |
| Schreibfehler | siehe Schritt 3. |
| Abbruch | Schließen der Ansicht verwirft die Eingaben ohne Rückfrage; nichts wurde geschrieben. |

## Barrierefreiheit

- Beim Schrittwechsel springt der Fokus auf die Überschrift des Schritts; der Stepper nennt „Schritt 2 von 3“.
- Pflichtfelder sind beschriftet, Fehler stehen am Feld und sind mit ihm verknüpft.
- Eingaben werden zwischen den Schritten nicht erneut abgefragt (WCAG 2.2, 3.3.7).
- Tastatur: Tab-Reihenfolge folgt der Leserichtung, Enter löst die Hauptaktion aus.
- Kontrast und Größen nach `docs/design/handoff/07 - Responsive, Barrierefreiheit und Plattform.md`.

## Texte

Du-Form, kurze Sätze, keine Fachbegriffe ohne Erklärung, Deutsch und Englisch je nach Sprache von Obsidian (`docs/adr/0005-ui-language.md`). Die englischen Texte entstehen mit der Umsetzung im Katalog des Moduls.
