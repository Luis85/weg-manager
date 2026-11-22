---
type: Page
id: VIEW-09
status: entwurf
scope: mvp
version: "1.1"
date: 2026-11-22
navigation: Erststart, ohne Navigationseintrag
requirements:
  - "[[PBI-69 - Beim ersten Aktivieren in die Einrichtung geführt werden]]"
  - "[[PBI-70 - Gemeinschaften im Einrichtungsassistenten anlegen]]"
  - "[[PBI-71 - Nach der Einrichtung auf der Lage mit Ersten Schritten ankommen]]"
  - "[[PBI-72 - Beim ersten Benutzen eines Bereichs einen Hinweis erhalten]]"
  - "[[PBI-73 - Kürzel einer Gemeinschaft nachträglich ändern]]"
entities:
  - "[[docs/entities/ENT-01 - Gemeinschaft]]"
business-rules:
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-22 - Notizen als maßgeblicher Datenbestand]]"
decisions:
  - "[[docs/decisions/K-02 - Zwei Gemeinschaften für einen Bearbeiter]]"
  - "[[docs/decisions/K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]"
  - "[[docs/decisions/K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]]"
mockups:
  - "[[docs/design/sitemap/assets/v2-D19-Einrichtung-Gemeinschaft.png]]"
  - "[[docs/design/sitemap/assets/v2-D20-Einrichtung-Pruefen.png]]"
  - "[[docs/design/sitemap/assets/v2-D21-Lage-Erste-Schritte.png]]"
  - "[[docs/design/sitemap/assets/v2-D22-Hinweis-Wochenarbeit.png]]"
---

# VIEW-09 · Einrichtung

Ansicht für den ersten Start in einem Vault ohne Gemeinschaft. Sie erscheint einmal beim Aktivieren des Plugins und immer dann, wenn der Nutzer die Plugin-Ansicht öffnet, solange es keine Gemeinschaft gibt ([[PBI-69 - Beim ersten Aktivieren in die Einrichtung geführt werden]]). Sie hat keinen Navigationseintrag: Die übrige Navigation ist ausgeblendet, bis die erste Gemeinschaft angelegt ist. Ablauf und Sonderfälle: [[FLOW-09 - Erststart, Einrichtung und Einführung]]. Abwägungen und Entscheidungen: [[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]].

Desktop zuerst; die mobile Fassung folgt mit der mobilen Wochenarbeit nach dem MVP ([[K-09 - Vollständige mobile Wochenarbeit unterstützen]]).

**Fassung 1.1 vom 22.11.2026:** nach NN/g gekürzt. Kein Willkommensschritt, keine Farbpalette im Assistenten, Knöpfe nennen die Aktion, keine Tour mehr, stattdessen einzelne Hinweise im Kontext.

## Aufbau

- **Kopf:** Titel „WEG Manager einrichten“, darunter ein Satz zum Nutzen: „Behalte deine Arbeit als Beirat Woche für Woche im Griff. Alles liegt als Notizen in deinem Vault, ohne Konto und ohne KI.“ Rechts ein Stepper mit zwei Schritten: 1 Gemeinschaften, 2 Prüfen. Ein erledigter Schritt ist anklickbar.
- **Inhalt:** je Schritt eine Frage oder Aufgabe, linksbündig, höchstens etwa 640 px breit.
- **Fuß:** Zurück (in Schritt 2) und die Hauptaktion des Schritts rechts, beschriftet mit der Aktion.
- **Komponenten:** Nuxt UI `UStepper`, `UForm`/`UFormField` mit TanStack Form, `UInput`, `USelectMenu` mit freier Eingabe für die Art, `UButton`. Die Farbpalette wie in [[VIEW-07 - Einstellungen und Einrichtung]] erscheint nur im Formular „Ändern“ von Schritt 2. Komponentenliste: `docs/design/handoff/02 - Komponenten.md`.

## Schritt 1 · Gemeinschaften

![[v2-D19-Einrichtung-Gemeinschaft.png]]

| Element | Inhalt und Regel |
| --- | --- |
| Frage | „Für welche Gemeinschaft bist du Beirat?“ |
| Name | Pflicht. Beispiel als Platzhalter: „Wohnanlage Lindenstraße 12“. |
| Art | Pflicht. Vorschläge „WEG“ und „Tiefgarage“, freie Eingabe möglich. Keine Rechtsform, keine Befugnisse ([[ENT-01 - Gemeinschaft]]). |
| Vorbelegt, nicht sichtbar | Kürzel aus dem Namen (2–5 Zeichen), Farbe als erste freie Farbe der Palette, Einheitenbezeichnung aus der Art („Einheiten“, bei Tiefgarage „Stellplätze“). Ändern geht auf der Prüfseite. |
| Erfasste Gemeinschaften | Liste unter dem Formular: Farbpunkt, Kürzel, Name, Art, „Bearbeiten“ und „Entfernen“. |
| Weitere | Link „Weitere Gemeinschaft hinzufügen“ mit dem Zusatz „etwa eure Tiefgarage“. Er übernimmt die aktuelle Eingabe in die Liste und leert das Formular. |
| Hauptaktion | „Prüfen“. Ein leeres Formular unter einer gefüllten Liste blockiert nicht. |
| Fehler | Am Feld, mit Ursache und Ausweg, z. B. „Gib einen Namen ein, etwa die Anschrift der Wohnanlage.“ |

## Schritt 2 · Prüfen und anlegen

![[v2-D20-Einrichtung-Pruefen.png]]

| Element | Inhalt und Regel |
| --- | --- |
| Liste | Je Gemeinschaft Farbpunkt, Kürzel, Name, Art, Einheitenbezeichnung und „Ändern“. „Ändern“ öffnet das Formular dieser Gemeinschaft mit allen Feldern, also auch Kürzel und Farbe, und führt danach wieder hierher. |
| Ablage | „Ablage im Vault: WEG Manager/Gemeinschaften/“, nur Anzeige (K-19, O-19c). |
| Hinweis | „Erst beim Anlegen entstehen die Notizen. Alles lässt sich später ändern.“ |
| Hauptaktion | „Gemeinschaft anlegen“ beziehungsweise „2 Gemeinschaften anlegen“. Während des Schreibens deaktiviert mit Fortschrittsanzeige. Danach Wechsel auf die Lage. |
| Schreibfehler | Meldung oben: welche Gemeinschaften angelegt wurden, welche nicht, und „Erneut versuchen“. |

## Nach der Einrichtung · Lage mit Ersten Schritten

![[v2-D21-Lage-Erste-Schritte.png]]

Die Lage ([[VIEW-01 - Lage]]) zeigt oben die Karte „Erste Schritte“ ([[PBI-71 - Nach der Einrichtung auf der Lage mit Ersten Schritten ankommen]]): Fortschritt „1 von 4“, Einträge mit Haken, wenn der Vault sie erfüllt, und je einen Knopf, der die Aktion nennt. „Ersten Punkt erfassen“ ist hervorgehoben. Jeder leere Bereich sagt, dass er leer ist, wie er sich füllt, und bietet die Aktion an. Es erscheint kein Modal und kein Tour-Angebot.

## Hinweise im Kontext

![[v2-D22-Hinweis-Wochenarbeit.png]]

Beim ersten Benutzen eines Bereichs erscheint ein einzelner Hinweis neben dem wichtigsten Element, etwa beim ersten Öffnen der Wochenarbeit am Schritt „Eingang sichten“ ([[PBI-72 - Beim ersten Benutzen eines Bereichs einen Hinweis erhalten]], nach dem MVP). Er hat Titel, einen Satz und „Verstanden“. Er dunkelt nichts ab, sperrt nichts und zählt keine Schritte. Umsetzung mit `UPopover` und Bezugselement. Er ersetzt die Tour aus [[VIEW-07 - Einstellungen und Einrichtung]].

## Zustände

| Zustand | Darstellung |
| --- | --- |
| Index lädt noch | Stepper ausgegraut, Hinweis „Vault wird gelesen …“; keine Entscheidung über Einrichtung oder Startroute, bevor der Index bereit ist. |
| Gemeinschaft taucht während der Einrichtung auf (Sync, Hand) | Hinweis „In deinem Vault gibt es schon eine Gemeinschaft.“ mit „Zur Lage“ und „Einrichtung fortsetzen“. |
| Schreiben läuft | Hauptaktion deaktiviert, Fortschritt sichtbar. |
| Schreibfehler | siehe Schritt 2. |
| Geschlossen vor dem Anlegen | Nichts wurde geschrieben. Die Eingaben bleiben im Arbeitsspeicher; beim nächsten Öffnen geht es dort weiter. Nach einem Neustart von Obsidian beginnt die Einrichtung leer. |

## Barrierefreiheit

- Beim Schrittwechsel springt der Fokus auf die Überschrift des Schritts; der Stepper nennt „Schritt 1 von 2“.
- Pflichtfelder sind beschriftet, Fehler stehen am Feld und sind mit ihm verknüpft.
- Eingaben werden zwischen den Schritten nicht erneut abgefragt (WCAG 2.2, 3.3.7).
- Tastatur: Tab-Reihenfolge folgt der Leserichtung, Enter löst die Hauptaktion aus.
- Ein Hinweis im Kontext nimmt den Fokus nicht an sich, ist aber per Tastatur erreichbar und schließbar (WCAG 2.2, 1.4.13).
- Kontrast und Größen nach `docs/design/handoff/07 - Responsive, Barrierefreiheit und Plattform.md`.

## Texte

Du-Form, kurze Sätze, keine Fachbegriffe ohne Erklärung, Deutsch und Englisch je nach Sprache von Obsidian (`docs/adr/0005-ui-language.md`). Die englischen Texte entstehen mit der Umsetzung im Katalog des Moduls.
