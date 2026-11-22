---
type: Entity
id: ENT-01
status: entwurf
scope: mvp
category: stammdaten
wcs: v1
date: 2026-11-22
---

# ENT-01 · Gemeinschaft

## Zweck

Die Gemeinschaft ist der eindeutige fachliche Kontext jedes Datensatzes, etwa eine WEG oder ihre Tiefgarage. Jeder Vorgang, jede Entscheidungskarte und jede Ausgabe gehört genau einer Gemeinschaft. Gemeinschaften bleiben strikt getrennt.

## Felder

Für die Felder bis `unit_label` gilt der Dateivertrag [[DV-01 - Gemeinschaft v1]]. Die übrigen Zeilen sind Vorschläge aus dem WCS und unserem bisherigen Modell; sie gehören noch nicht zum Vertrag.

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `community-<uuid>`, einmal vergeben, nie geändert ([[docs/adr/0007-vault-data-access.md\|ADR 0007]]). Andere Notes verweisen mit `community_id` darauf. |
| Schema | `schema` | Text | P | Genau `weg-manager.community/v1`. |
| Name | `name` | Text | P | Offizieller oder gewohnter Name, eine Zeile, höchstens 100 Zeichen. Beispiel: „Wohnanlage Lindenstraße 12“. |
| Kürzel | `short_code` | Text | P | WCS-„id“ (Kurzschlüssel). 2 bis 5 Zeichen `A`–`Z`, `0`–`9`, unter allen Gemeinschaften eindeutig. Änderbar nach [[PBI-73 - Kürzel einer Gemeinschaft nachträglich ändern]]; Verweise laufen nie über das Kürzel. |
| Farbe | `color` | Text | P | Name aus der festen Palette, je Gemeinschaft verschieden. Trägt nie allein Bedeutung. |
| Art | `kind` | Text | P | WCS-„typ“. Freier Text, eine Zeile, höchstens 50 Zeichen, mit Vorschlägen (siehe Wertelisten). Aus der Art folgt weder Rechtsform noch Befugnis. |
| Einheitenbezeichnung | `unit_label` | Text | P | Wie die Gemeinschaft ihre Einheiten nennt, z. B. Einheiten, Stellplätze. |
| Anzahl der Einheiten | `unit_count` | Zahl | O | Bisherige Angabe unseres Modells. Später aus [[ENT-24 - Einheit]] ableitbar. |
| Anschrift | `address` | Text | O | Bisherige Angabe unseres Modells. Nur die Anlage selbst, keine Eigentümeranschriften. |
| Sprachen der Eigentümer-Infos | `owner_languages` | Liste | O | Bisherige Angabe; Werte `de`, `en`. Eigentümertexte sind DE+EN ([[ENT-02 - Person und Rolle]]). |
| Grundstücke | `parcel_ids` | Liste | O | WCS-Vorschlag, später. Verweise auf [[ENT-23 - Grundstück]]. |
| Verwalter | `manager_id` | Text | O | WCS-Vorschlag, später. Verweis auf die bestellte Verwaltung als [[ENT-02 - Person und Rolle]]. |
| Wirtschaftsjahr | `fiscal_year_start` | Text | O | WCS-Vorschlag, später. Beginn des Wirtschaftsjahrs, z. B. `01-01`. |
| Ablageordner | `filing_folder` | Text | O | WCS-Vorschlag, später. Wurzelordner der Unterlagen im Vault, nicht in einem Cloud-Speicher. |

## Wertelisten

**Art (frei):** Vorschläge sind „WEG“, „Tiefgarage“ und „Viertel“. Der Mensch darf jeden anderen Text schreiben. „Viertel“ ist nur ein Vorschlag für eine Ebene über mehreren Gemeinschaften, die Gemeingüter teilen ([[ENT-27 - Gemeingut]]); für sie gilt die Regel „nur teilbare Daten“ (siehe unten).

## Beziehungen

Vorgang, Thema, Entscheidungskarte, Nachrichtenentwurf, To-do und einzelne Berichtsauswahl gehören jeweils genau einer Gemeinschaft. Eine Gesamtlage oder Übergabe darf mehrere Kontexte klar getrennt darstellen. Personen haben ihre Rolle je Gemeinschaft. Später gehören Grundstücke, Einheiten, Beschlüsse, Verträge, Policen, Anlagen und Unterlagen zur Gemeinschaft.

[[ENT-02 - Person und Rolle]], [[ENT-03 - Thema]], [[ENT-04 - Vorgang]], [[ENT-09 - Entscheidungskarte]], [[ENT-10 - Nachrichtenentwurf]], [[ENT-12 - To-do]], [[ENT-14 - Übergabe]], [[ENT-15 - Ausgabestand]], [[ENT-23 - Grundstück]], [[ENT-24 - Einheit]], [[ENT-25 - Beschluss]], [[ENT-27 - Gemeingut]], [[ENT-29 - Vertrag]], [[ENT-30 - Police]], [[ENT-31 - Anlage]], [[ENT-32 - Unterlage]].

## Regeln und Lebenszyklus

- Mindestens zwei Gemeinschaften sind nutzbar ([[K-02 - Zwei Gemeinschaften für einen Bearbeiter]]).
- Gleiche Titel, Kontakte oder Verwaltung begründen keine Zusammenführung ([[DF-12 - Gemeinschaftstrennung]]).
- Ein Gemeinschaftskontext ist kein Benutzerkonto und verleiht keine Befugnis.
- Der Kontext ist bei jeder Bearbeitung und Ausgabe sichtbar (B-FR-01).
- Eine Gemeinschaft der Art „Viertel“ trägt nur teilbare Daten: Gemeingüter, gemeinsame Kosten und Vorgänge, die alle Beteiligten betreffen. Daten einer einzelnen WEG wandern nicht in das Viertel (WCS FR-V11).
- Anlegen, Ändern und Löschen regelt [[DV-01 - Gemeinschaft v1]]. Löschen legt die Note in den Papierkorb.

## Datenschutz

Die Gemeinschaft selbst enthält keine personenbezogenen Daten anderer Eigentümer. Der Verwalter ist ein Gegenüber, kein Eigentümer. Eigentümerbezogene Angaben gehören an [[ENT-24 - Einheit]] in den privaten Bereich, nie in die Gemeinschaftsnote.

## Abweichungen vom WCS

- Die WCS-„id“ ist bei uns das Kürzel `short_code`. Die technische Identität ist die `id` `community-<uuid>` nach ADR 0007.
- Die Art ist freier Text mit Vorschlägen, kein geschlossener Gemeinschaftstyp (WEG, TG, Viertel).
- Die Ablage liegt im Vault, nicht in einem Cloud-Speicher.
- Farbe, Einheitenbezeichnung, Anzahl, Anschrift und Sprachen sind unsere Ergänzungen.

## Offene Punkte

- **O-ENT01-1:** Konkrete Organisationsform und Zuständigkeiten der Tiefgarage (bisher O-05).
- **O-ENT01-2:** Ab wann wird die Gemeinschaft im WCS als eigenes Objekt geführt statt als Zeichenkette (WCS PRD Q9)? Bei uns ist sie schon eine Note; offen ist nur die Übernahme der WCS-Altdaten.
- **O-ENT01-3:** [[DV-01 - Gemeinschaft v1]] und `GLOSSARY.md` nennen das Kürzel noch „nach dem Anlegen fest“. Nach PBI-73 ist es änderbar; Vertrag und Glossar sind nachzuziehen.
- **O-ENT01-4:** Wie wird „nur teilbare Daten“ bei einer Viertel-Gemeinschaft geprüft: als Regel beim Anlegen oder nur als Hinweis?
- **O-ENT01-5:** Wann kommen `parcel_ids`, `manager_id`, `fiscal_year_start` und `filing_folder` in eine neue Vertragsversion?

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7, Roadmap-Vision v0.2): Gemeinschaft, FR-ROL3, FR-V11, V1. Unser [MVP-PRD](../02-MVP-PRD.md): B-FR-01, AT-B01. Regeln: [[DF-12 - Gemeinschaftstrennung]], [[DF-22 - Notizen als maßgeblicher Datenbestand]]. Entscheidungen: [[K-02 - Zwei Gemeinschaften für einen Bearbeiter]], [[K-20 - WCS-Datenmodell als fachliche Grundlage]].

[[PBI-01 - Gemeinschaftskontext wählen]], [[PBI-02 - Personen und Rollen zuordnen]], [[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]], [[PBI-70 - Gemeinschaften im Einrichtungsassistenten anlegen]], [[PBI-73 - Kürzel einer Gemeinschaft nachträglich ändern]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
