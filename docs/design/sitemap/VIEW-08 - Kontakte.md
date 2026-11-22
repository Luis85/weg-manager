---
type: Page
id: VIEW-08
status: entwurf
scope: mvp
version: "2.1"
date: 2026-11-15
navigation: Nebenbereich
requirements:
  - "[[PBI-01 - Gemeinschaftskontext wählen]]"
  - "[[PBI-02 - Personen und Rollen zuordnen]]"
  - "[[PBI-18 - Nachrichten je Gemeinschaft bündeln]]"
  - "[[PBI-28 - Empfängerbezogene Ausgabe prüfen]]"
entities:
  - "[[docs/entities/ENT-01 - Gemeinschaft]]"
  - "[[docs/entities/ENT-02 - Person und Rolle]]"
  - "[[docs/entities/ENT-04 - Vorgang]]"
  - "[[docs/entities/ENT-10 - Nachrichtenentwurf]]"
  - "[[docs/entities/ENT-11 - Versanddokumentation]]"
business-rules:
  - "[[docs/business-rules/DF-01 - Beiratsarbeit und Befugnis]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
mockups:
  - "[[docs/design/sitemap/assets/v2-P-D-14-Kontakte.png]]"
  - "[[docs/design/sitemap/assets/v2-P-M-14-Kontakte.png]]"
  - "[[docs/design/sitemap/assets/v2-P-M-15-Kontakt-Modal.png]]"
  - "[[docs/design/sitemap/assets/v2-P-D-16-Kontakt-neu.png]]"
  - "[[docs/design/sitemap/assets/v2-P-D-15-Kontakt-Modal.png]]"
  - "[[docs/design/sitemap/assets/v2-P-M-16-Kontakt-neu.png]]"
---

# VIEW-08 · Kontakte

**Rolle:** Adressbuch für alle Beteiligten. Beantwortet: Wer ist wofür zuständig, wie erreiche ich ihn, was läuft gerade mit ihm?

**Navigation:** Nebenbereich. Desktop in der Sidebar unter den vier Zielen, mobil über das Personen-Symbol im Kopf. Einzelne Kontakte öffnen als Modal auch aus Punktakte („Verantwortlich“) und Postausgang („An“). Erfassen schlägt Kontakte bei „Wer sagt zu?“ vor und bietet „„Name“ als Kontakt anlegen“, wenn es ihn noch nicht gibt.

## Review 15.11. (v2.0 → v2.1)

| Befund v2.0 | Wirkung | Änderung v2.1 |
| --- | --- | --- |
| Liste getrennt in „Personen und Firmen“ und „Verteiler“ (Tabs) | Nutzer denkt in Zuständigkeiten, nicht in Datentypen; Verteiler versteckt | Eine Liste, gruppiert nach Rolle: Verwaltung · Beirat · Hausmeister und Dienstleister · Eigentümer |
| Firma und ihre Personen als gleichrangige Zeilen, Untertitel doppelt („Hausverwaltung Kern · Verwaltung · Objektbetreuung“) | Unübersichtlich, Zusammenhang unklar | Firma zuerst in der Gruppe, Personen mit „Rolle · Firma“; Firmen-Modal listet ihre Personen mit „Person hinzufügen“ |
| Kontaktwege nur im Modal (mobil) bzw. als Kopieren-Symbol | Zusätzlicher Klick für den häufigsten Zweck | E-Mail- und Telefon-Symbol direkt in jeder Zeile; im Modal „E-Mail schreiben“ und „Anrufen“ auf allen Geräten |
| Formular startet mit Art Person / Organisation / Verteiler | Abstrakte Entscheidung vor dem Namen; Verteiler passt nicht ins Kontaktformular | Art nur Person oder Firma; Verteiler über „+ Verteiler“ in der Gruppe Eigentümer, eigenes Formular |
| „Rollen je Gemeinschaft“ als Zeilen aus Auswahl + Freitext + „Rolle hinzufügen“ | Schwer verständlich, Tippfehler, keine einheitlichen Rollen | „Zuständig für“: je Gemeinschaft ein Ankreuzfeld, danach Rolle aus fester Liste (Verwaltung, Hausmeister, Beirat, Dienstleister, Prüffirma, Handwerker, Eigentümer) |
| Speichern ausgegraut ohne Grund | Nutzer weiß nicht, was fehlt | Speichern immer aktiv; Pflichtfelder mit *, Fehlermeldung direkt am Feld |
| Organisation als freies Feld ohne Rückmeldung | Unklar, ob eine Firma neu entsteht | Feld „Firma“ mit Vorschlägen; bei neuem Namen „… wird als neue Firma mit angelegt“ |
| Keine Dublettenprüfung | Doppelte Kontakte | Ab 3 Zeichen „Bereits vorhanden: …“ mit Link auf den Kontakt |
| Sprache, Kanal, Notiz immer sichtbar | Formular wirkt lang | Unter „Weitere Angaben“ eingeklappt |
| Anlegen nur in der Kontaktansicht | Kontakt fehlt genau dann, wenn er beim Erfassen gebraucht wird | Aus Erfassen anlegen, danach zurück ins Erfassen mit eingetragenem Namen; bei leerer Suche „„Suchbegriff“ anlegen“ |
| „nicht mehr verwendet“ als Gruppe und Chip | Doppelte Kennzeichnung, Liste länger | Eingeklappte Gruppe „Nicht mehr verwendet · n“ am Ende |

## Inhalt

| Art | Felder | Hinweis |
| --- | --- | --- |
| **Person** | Name*, Firma, Zuständig für* (Gemeinschaft + Rolle), E-Mail, Telefon; weitere: Sprache, bevorzugter Kanal, Notiz | Rolle ist Fachbezug, keine Befugnis (DF-01) |
| **Firma oder Organisation** | wie Person ohne Feld Firma; zugeordnete Personen | Verwaltung, Dienstleister, Prüffirmen |
| **Verteiler** | Bezeichnung*, genau eine Gemeinschaft*, Anzahl Empfänger*, Sprachen, Versandweg, Stand der Liste | Eigentümer werden nicht einzeln geführt (O-D7) |

## Liste

1. **Kopf:** „Kontakte“ mit FilterTag, Suche (Name, Firma, Rolle, E-Mail, Telefon), „+ Neuer Kontakt“.
2. **Gruppen nach Rolle** mit Anzahl: Verwaltung · Beirat · Hausmeister und Dienstleister · Eigentümer (mit „+ Verteiler“). Firmen vor Personen.
3. **Zeile:** Avatar (Initialen, Firmen- bzw. Verteilersymbol), Name, „Rolle · Firma“ (nur Rollen der gefilterten Gemeinschaft), Gemeinschaftskürzel, E-Mail- und Telefon-Symbol. Beide öffnen ein kleines Modal mit Adresse bzw. Nummer groß und gut lesbar, bevorzugtem Kanal sowie „In Mail-App öffnen“ bzw. „Anrufen“ und „Kopieren“; ebenso „E-Mail-Adresse“ und „Telefonnummer“ im Kontakt-Modal, Schließen kehrt dorthin zurück.
4. **Nicht mehr verwendet** eingeklappt am Ende.
5. **Keine Treffer:** „„Suchbegriff“ anlegen“ und „Suche zurücksetzen“.

![[v2-P-D-14-Kontakte.png]]

## Kontakt-Modal

Öffnet über der aktuellen Ansicht (Desktop zentriert 620 px, mobil Sheet). Kopf: Avatar, Name, Firma, Schließen. Inhalt: „E-Mail-Adresse“ und „Telefonnummer“ (jeweils kleines Modal), Zuständig für, Kontaktdaten mit Kopieren, bei Firmen „Personen · n“ mit „Person hinzufügen“, Verantwortlich für (Punkte), Nachrichten (Entwürfe, gesendete mit Titel-Link). Fuß: „Bearbeiten“, „Nicht mehr verwenden“ / „Wieder verwenden“. Ein Klick auf Punkt oder Entwurf schließt das Modal und navigiert.

![[v2-P-D-15-Kontakt-Modal.png]]

## Anlegen und Bearbeiten

Sheet rechts (Desktop) bzw. von unten (mobil), nie gestapelt; „Bearbeiten“ ersetzt das Modal, Speichern oder Abbrechen kehrt zurück.

1. Art: Person · Firma oder Organisation (nur beim Anlegen).
2. Name* mit Dublettenhinweis.
3. Firma (nur Person) mit Vorschlägen; neuer Name legt die Firma mit denselben Zuständigkeiten an.
4. Zuständig für*: je Gemeinschaft Ankreuzfeld mit Kürzel; angekreuzt erscheint die Rollenauswahl. Vorbelegt mit der gefilterten Gemeinschaft bzw. der Gemeinschaft aus Erfassen; „Person hinzufügen“ einer Firma übernimmt deren Zuständigkeiten.
5. E-Mail, Telefon nebeneinander.
6. Weitere Angaben (eingeklappt): Sprache, bevorzugter Kanal (Mail, Telefon, Portal, Brief), Notiz.
7. Fuß: „Abbrechen“, „Kontakt speichern“. Fehlende Pflichtangaben werden nach dem Klick am Feld genannt.

![[v2-P-D-16-Kontakt-neu.png]]

## Regeln

- „Nicht mehr verwenden“ löscht nicht. Der Kontakt bleibt in Quellen, Verlauf und gesendeten Nachrichten verlinkt und erscheint nicht mehr in Vorschlägen (PBI-02, DF-13).
- Kontaktänderungen wirken nur auf neue Entwürfe; gesendete Nachrichten behalten Empfänger und Anrede zum Versandzeitpunkt.
- Sprache des Kontakts bzw. des Verteilers bestimmt die Sprachfassungen im Postausgang.
- Kontaktdaten sind intern und werden nie automatisch in Ausgaben übernommen.
- Ablage als Notiz je Kontakt unter `WEG Manager/Kontakte/` mit Frontmatter (K-14); Punkte verweisen per Link.

## Mobil

Liste mit Gruppen und Kontaktsymbolen; Modal als Sheet von unten mit „E-Mail schreiben“ und „Anrufen“ oben.

![[v2-P-M-14-Kontakte.png|180]]
![[v2-P-M-15-Kontakt-Modal.png|180]]
![[v2-P-M-16-Kontakt-neu.png|180]]

## Zustände

| Zustand | Darstellung |
| --- | --- |
| Erststart | Schritt 2 der Einrichtung legt die ersten Kontakte an ([[VIEW-07 - Einstellungen und Einrichtung]]) |
| Keine Treffer | „Keine Kontakte für „…““ + „„…“ anlegen“ + „Suche zurücksetzen“ |
| Punkt ohne Kontakt | „Verantwortlich“ als Freitext, ohne Link |
