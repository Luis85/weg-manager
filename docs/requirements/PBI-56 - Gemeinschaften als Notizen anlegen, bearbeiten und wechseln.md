---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 84000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-05-Obsidian]]"
release: ""
status: ""
started: ""
finished: ""
horizon: ""
start: ""
due: ""
risk: ""
priority: ""
assignee: ""
iteration: ""
entities:
  - "[[docs/design/entities/ENT-01 - Gemeinschaft]]"
business-rules:
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-22 - Notizen als maßgeblicher Datenbestand]]"
  - "[[docs/business-rules/DF-23 - Externe Bearbeitung ohne stilles Überschreiben]]"
decisions:
  - "[[docs/decisions/K-02 - Zwei Gemeinschaften für einen Bearbeiter]]"
  - "[[docs/decisions/K-14 - Markdown und Frontmatter als offene Datengrundlage]]"
hypotheses: []
pages:
  - "[[docs/design/sitemap/VIEW-07 - Einstellungen und Einrichtung]]"
user-flows: []
dependsOn:
  - "[[PBI-54 - Index der Notizen aufbauen und aktuell halten]]"
  - "[[PBI-55 - Navigation und App-Rahmen der Plugin-Ansicht bereitstellen]]"
triage: ready-for-agent
---

# PBI-56 · Gemeinschaften als Notizen anlegen, bearbeiten und wechseln

**Planungsstand:** Technischer Folgepunkt aus dem Plan `docs/plans/pre-feature-improvement-plan.md` (Schritt 3.6); **Durchstich** · **Umfang:** Teil von [[PBI-01 - Gemeinschaftskontext wählen]] (Kriterien 1 und 4)

## User Story

Als Beirat möchte ich meine Gemeinschaften (z. B. WEG und Tiefgarage) anlegen, bearbeiten, löschen und zwischen ihnen wechseln, damit der Kontext vor jeder Bearbeitung sichtbar ist und ich nichts vermische.

## Ausgangslage

Das Plugin hat die technischen Grundlagen (Notizspeicher, Codec, Index, Navigation), aber noch keinen Fachweg durch alle Schichten. Das Demo (Begrüßung, Dateianzahl, Info-Dialog) beweist nur den Weg über `data.json`, nicht den über Notizen. Der Produktverantwortliche hat diesen Schnitt am 21.11.2026 zur Umsetzung freigegeben.

## Akzeptanzkriterien

1. Gemeinschaften lassen sich anlegen, auflisten, bearbeiten und löschen. Löschen legt die Notiz in Obsidians Papierkorb. Jede Gemeinschaft hat Name, Kürzel, Farbe, Art und Einheitenbezeichnung.
2. Jede Gemeinschaft ist eine Markdown-Notiz unter `WEG Manager/Gemeinschaften/`; das Wurzelverzeichnis ist zunächst eine Konstante (als Einstellung ohne Oberfläche folgt es in [[PBI-57 - Einstellungen schemagesteuert lesen und migrieren]]). Der Dateiname ist der Name der Gemeinschaft, bei Kollision mit Zusatz ` (2)`. Frontmatter: `schema: weg-manager.community/v1`, `id`, `name`, `short_code`, `color`, `kind`, `unit_label`.
3. Kürzel: 2 bis 5 Zeichen, nur A–Z und Ziffern, gespeichert in Großbuchstaben, unter den Gemeinschaften eindeutig, nach dem Anlegen nicht änderbar. Ein außerhalb des Plugins entstandenes Duplikat erscheint als Problem.
4. Farbe ist der Name einer Farbe aus der geprüften Palette (`docs/design/handoff/01 - Design Tokens.md`, Tokens `c1`, `c2`). Eine bereits vergebene Farbe ist gesperrt.
5. Art und Einheitenbezeichnung sind einfache Textfelder der Notiz. Das Formular schlägt die eingebauten Paare (WEG mit Einheiten, Tiefgarage mit Stellplätzen) und bereits verwendete Paare vor.
6. Der Gemeinschaftswechsel ist sichtbar, zeigt Name, Kürzel und Farbe und gilt für alle offenen Ansichten; die Auswahl bleibt je Gerät erhalten ([[PBI-55 - Navigation und App-Rahmen der Plugin-Ansicht bereitstellen]]). Damit sind Kriterium 1 und 4 von [[PBI-01 - Gemeinschaftskontext wählen]] erfüllt.
7. Startroute der Ansicht ist `einstellungen/gemeinschaften`.
8. Eine extern geänderte Gemeinschaft wird bei offenem Formular je Feld zusammengeführt; ein auf beiden Seiten geändertes Feld bricht das Speichern mit einem vom Nutzer lösbaren Konflikt ab. Eine Notiz mit neuerer Schemaversion ist schreibgeschützt und als Problem sichtbar; eine ungültige Notiz erscheint als Problem, wird nie geschrieben und stört die übrigen nicht.
9. Das Demo ist vollständig gelöscht: Begrüßungseinstellung, Befehl `show-greeting`, Dateianzahl, Info-Dialog und `LEGACY_DEFAULT_GREETING`, samt Katalogtexten und Tests.
10. Je ein e2e-Spec deckt Anlegen/Bearbeiten/Löschen, externe Bearbeitung, neuere Schemaversion und ungültige Notiz ab; Harness-Szenarien gibt es für leer, geladen, ungültige Notiz und schreibgeschützt. `npm run verify` und `npm run test:e2e` laufen erfolgreich.
11. `docs/engineering/adding-a-feature.md` ist um diesen Durchstich als durchgespieltes Beispiel neu geschrieben.

## Herkunft und Bezüge

[[PBI-01 - Gemeinschaftskontext wählen]]; Plan `docs/plans/pre-feature-improvement-plan.md`, Schritt 3.6. Entscheidungen des Produktverantwortlichen vom 21.11.2026: Gemeinschaft ist die erste Entität; Kontakte, Punkte, Anschrift, Sprachen der Eigentümer und Einrichtungsassistent bleiben draußen, Kriterien 2 und 3 von PBI-01 bleiben offen (sie brauchen Punkte). Mobile folgt nach dem MVP. Fachlich: [[ENT-01 - Gemeinschaft]], [[DF-12 - Gemeinschaftstrennung]], [[K-02 - Zwei Gemeinschaften für einen Bearbeiter]].

## Kommentare

- 21.11.2026: Angelegt als offener Schritt des Plans `docs/plans/pre-feature-improvement-plan.md`. Bereit zur Umsetzung; die Reihenfolge steht in `dependsOn`.
- 21.11.2026: Weitere Entscheidungen des Produktverantwortlichen.
  - **Farbe:** Die Notiz speichert den englischen Namen einer Farbe aus der festen Palette des Prototyps mit acht Farben (`teal`, `violet`, `blue`, `rust`, `slate`, `cyan`, `pink`, `olive`), z. B. `color: teal`. Die genauen Farbwerte je Theme legt das Plugin fest und kann sie ändern, ohne Notizen anzufassen. Das präzisiert Kriterium 4.
  - **Dateivertrag:** Der Vertrag der Gemeinschaftsnotiz (`weg-manager.community/v1`) wird mit dem Durchstich als deutsche Seite unter `docs/` geschrieben: deutscher Text um die englischen Schlüssel und Codes, wie der Vertrag des Gmail-Skills. Je Notiztyp und Version eine Seite.
  - **Keine Auswahl:** Ist keine Gemeinschaft gespeichert ausgewählt (erster Start, neues Gerät, ausgewählte Gemeinschaft gelöscht), wird bei genau einer Gemeinschaft diese gewählt. Bei zwei oder mehr ist nichts ausgewählt, und der Rahmen fordert zur Auswahl auf, bevor bearbeitet werden kann.
  - **Vorabversion:** Nach dem Durchstich entsteht eine Vorabversion (0.2.0) für die manuellen Prüfungen im eigenen Vault, mit einer kurzen Prüfliste.
