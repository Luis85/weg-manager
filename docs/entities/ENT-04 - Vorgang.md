---
type: Entity
id: ENT-04
status: entwurf
scope: mvp
category: bewegungsdaten
wcs: v1
date: 2026-11-22
---

# ENT-04 · Vorgang

## Zweck

Ein einzeln nachverfolgbares und erledigbares Anliegen mit genau einem überprüfbaren Ergebnis: eine Zusage, eine Frist, eine Frage oder eine Aufgabe. Der Vorgang ist das zentrale Bewegungsobjekt; alle anderen Bewegungsdaten verweisen auf ihn. Ein Vorgang wird nie gelöscht.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `matter-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. Verweise anderer Notes laufen über `matter_id`. |
| Schema | `schema` | Text | P | `weg-manager.matter/v1` (vorgeschlagen). |
| Vorgangsnummer | `number` | Zahl | P | WCS `nr`. Fortlaufend, nie neu vergeben, eindeutig auch bei parallelen Läufen (FR-V12). Lesbare Nummer, nicht die Identität. |
| Art | `kind` | Text | P | WCS `art`. Wert aus der geschlossenen Liste (siehe Wertelisten). |
| Thema | `topic` | Text | P | WCS `thema`. Kurz, z. B. „Beleuchtung“ ([[ENT-03 - Thema]]). |
| Zusage (Ergebnis) | `outcome` | Text | P | WCS `zusage`. Ein Satz, der das erwartete Ergebnis nennt. Ein Vorgang = ein Ergebnis, keine Bündel. |
| Wer | `responsible` | Text | P | WCS `wer`. Verantwortliche Rolle, auch außerhalb der Verwaltung ([[ENT-02 - Person und Rolle]]). Die Eskalationsleiter gilt nur für die Verwaltung (FR-V10). Später ergänzt durch `person_id`. |
| Zugesagt am | `promised_on` | Datum | O | WCS `zugesagtAm`. Tag der Zusage. |
| Bis wann | `due_on` | Datum | P* | WCS `bisWann`. Der geltende Termin. *Fehlt er, setzt das System den Prüfvermerk „Termin erfragen“ (FR-V2). Bedeutung und Herkunft: [[ENT-05 - Termin]]. |
| Status | `status` | Text | P | WCS `status`. Wert aus der geschlossenen Liste. „nicht eingehalten“ setzt nur der Beirat (FR-V7). |
| Erledigt am | `done_on` | Datum | O | WCS `erledigtAm`. Pflicht bei Status „erledigt“. |
| Quelle | `source` | Text | P | WCS `quelle`. Herkunft in Kurzform: Mail, Protokoll, Versammlung, Gespräch ([[ENT-07 - Quelle]]). |
| Nächster Schritt | `next_step` | Text | P | WCS `naechsterSchritt`. Konkrete nächste Handlung. |
| Prüfvermerk | – | Text | A | WCS `pruefung`. „überfällig“, „Termin erfragen“ oder leer. Berechnet (FR-V5), nicht gespeichert. |
| Nachrichtenreferenz | `message_ref` | Text | O | Ersetzt WCS `mailRef`. Kennung der Nachricht oder des Nachrichtenverlaufs in einem beliebigen Postfach, ohne Bindung an einen Dienst. |
| Link | `link` | Text | O | WCS `link`. Dokument in der Ablage im Vault ([[ENT-08 - Dokument]], [[ENT-32 - Unterlage]]). |
| Gemeinschaft | `community_id` | Text | P | WCS `gemeinschaft`. Genau eine Gemeinschaft. Eine Viertel-Gemeinschaft nur mit teilbaren Daten (FR-V11). |
| Verlauf | – | Liste | P | WCS `verlauf`. Datierte Historie aus [[ENT-06 - Verlaufseintrag]]. Nie gelöscht. Speicherform offen (O-ENT04-4). |
| Aufgeteilt in | `split_into_ids` | Liste | O | WCS `aufgeteiltIn`. Nachfolger bei Aufteilung (FR-V3). |
| Zusammengeführt mit | `merged_into_id` | Text | O | WCS `zusammengefuehrtMit`. Ziel bei Dublette (FR-V3). |
| Antwortzeit | – | Zahl (Tage) | A | WCS `antwortzeit`. Anfrage bis Antwort, Zusage bis Erledigung. Gehört zur Bewertungsschicht ([[ENT-16 - Beiratsbewertung]]), nicht in die Vorgangsnote. |
| Wiedervorlage | `follow_up_on` | Datum | O | Unsere Ergänzung: eigenes Datum zum erneuten Ansehen. Ändert nie `due_on`. |
| Herkunft | `origin` | Text | O | Unsere Ergänzung: Import, Aufteilung, Zusammenführung oder manuell. |

## Wertelisten

**Art (geschlossen, WCS):** Zusage Verwaltung (`manager_promise`), Frist Beirat (`board_deadline`), Frist gesetzlich (`legal_deadline`), Frage (`question`), Aufgabe Beirat (`board_task`). Neue Werte nur per Schemaänderung. Mangel, Angebotsfrage, Rechnungsfrage und Protokollkorrektur sind bei uns Vorgänge mit Quelle (PRD-Systemgrenze); sie werden als Frage oder Aufgabe Beirat mit passendem Thema geführt (O-ENT04-2).

**Status (geschlossen, WCS):** offen (`open`), erledigt (`done`), nicht eingehalten (`not_kept`), ungeklärt (`unclear`), hinfällig (`obsolete`).

**Prüfvermerk (berechnet):** überfällig (`overdue`), Termin erfragen (`ask_for_date`), leer.

## Beziehungen

Gehört genau einer Gemeinschaft. Trägt Termine, Verlauf und Quellen. Kann in Entscheidungskarten, To-dos und Eskalationen über die Vorgangsnummer beziehungsweise `matter_id` referenziert werden. Herkunfts- und Zielverweise verbinden aufgeteilte oder zusammengeführte Vorgänge. Später entsteht ein Vorgang auch aus einer Lücke im Unterlagen-Inventar, aus einer Feststellung der Jahresprüfung oder zur Umsetzung eines Beschlusses.

[[ENT-01 - Gemeinschaft]], [[ENT-02 - Person und Rolle]], [[ENT-03 - Thema]], [[ENT-05 - Termin]], [[ENT-06 - Verlaufseintrag]], [[ENT-07 - Quelle]], [[ENT-09 - Entscheidungskarte]], [[ENT-12 - To-do]], [[ENT-13 - Eskalation]], [[ENT-16 - Beiratsbewertung]], [[ENT-25 - Beschluss]], [[ENT-32 - Unterlage]], [[ENT-33 - Vorbereitete Aktion]], [[ENT-35 - Feststellung]].

## Regeln und Lebenszyklus

- **Status:** offen, ungeklärt, erledigt und hinfällig sind Bearbeitungsstände. Jeder Wechsel braucht einen nachvollziehbaren Anlass und erzeugt einen Verlaufseintrag ([[PBI-08 - Bearbeitungsstand bewusst ändern]]).
- **„nicht eingehalten“** übernehmen wir als WCS-Status. Nur der Beirat setzt ihn, bewusst und mit Begründung und Bezug zur Terminfassung. Er ist eine Bewertung und gehört zur Bewertungsschicht: nur Beirat und Vertretung sehen ihn ([[ENT-16 - Beiratsbewertung]], [[DF-02 - Bearbeitung, Terminprüfung und Bewertung]]). Er erledigt den Vorgang nicht.
- **Prüfvermerke** „überfällig“ und „Termin erfragen“ berechnet das System. Sie sind Hinweise, keine Bewertung.
- **Aufgeteilt** und **zusammengeführt** kennzeichnen Herkunft, keine erfüllte Leistung. Ein Sammelvorgang wird in Folgevorgänge aufgeteilt; eine Dublette wird mit dem Ziel zusammengeführt.
- Teilerfüllung und neuer Termin erledigen den Vorgang nicht automatisch ([[DF-04 - Fehlender Termin]], [[DF-06 - Reaktion und Pause]]).
- Ein Vorgang wird nie gelöscht und seine Nummer nie neu vergeben.
- Eine Wiedervorlage ändert keine fremde Frist.

## Datenschutz

Zusage, Thema und nächster Schritt erscheinen in Karten und Entwürfen. Sie enthalten keine Namen oder Daten einzelner Eigentümer. Status „nicht eingehalten“ und Antwortzeit gehören zur Bewertungsschicht und gehen nie ohne bewusste Prüfung in eine Ausgabe ([[DF-11 - Sachstand und Bewertung]]).

## Abweichungen vom WCS

- Technische `id` zusätzlich zur Vorgangsnummer. Verweise laufen über die `id`; das WCS verweist über `nr`.
- `message_ref` statt Gmail-Thread-ID: neutral für jedes Postfach.
- Ablage im Vault, nicht in einem Cloud-Speicher.
- Prüfvermerk und Antwortzeit werden berechnet und nicht gespeichert (ADR 0007: nichts Abgeleitetes wird gespeichert).
- Wiedervorlage und Herkunft sind unsere Ergänzungen.

## Offene Punkte

- **O-ENT04-1:** Der WCS-Status „nicht eingehalten“ steht am Vorgang, gehört aber zur Bewertungsschicht. Wo wird er gespeichert, wenn die Vorgangsnote mit einer Vertretung oder einem Agenten geteilt wird? Hängt an O-ENT16-1.
- **O-ENT04-2:** Unsere bisherige Art „Zusage“ umfasst auch Zusagen Dritter; das WCS kennt nur „Zusage Verwaltung“. Wie wird die Zusage eines Hausmeisterdienstes geführt?
- **O-ENT04-3:** Ist die Vorgangsnummer je Gemeinschaft oder über alle Gemeinschaften fortlaufend? Ein Import kann gleiche Nummern in zwei Gemeinschaften bringen (AT-B02). Nach ADR 0007 sind doppelte Nummern ein Hinweis, kein Fehler.
- **O-ENT04-4:** Wie wird der Verlauf gespeichert: als Abschnitt im Body oder als eigene Notes mit `matter_id`? Eine Liste von Objekten ist im Eigenschaftenbereich von Obsidian nicht bearbeitbar (ADR 0007).
- **O-ENT04-5:** `quelle` ist im WCS Pflicht. Unser Modell erlaubt eine sichtbare Quellenlücke. Gilt „unbekannt“ als zulässiger Wert?
- **O-ENT04-6:** Aufgabe Beirat und To-do: Doppelpflege vermeiden. Dieselbe Aufgabe wird entweder als Vorgang geführt oder als To-do mit Vorgangsbezug; es besteht keine Pflicht zu zwei Datensätzen.

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7): Vorgang, FR-V1, FR-V2, FR-V3, FR-V5, FR-V6, FR-V7, FR-V10, FR-V11, FR-V12, FR-ROL1. Unser [MVP-PRD](../02-MVP-PRD.md): B-FR-03, B-FR-04, B-FR-14, AT-B03, AT-B04, AT-B15. Regeln: [[DF-02 - Bearbeitung, Terminprüfung und Bewertung]], [[DF-04 - Fehlender Termin]], [[DF-06 - Reaktion und Pause]], [[DF-12 - Gemeinschaftstrennung]], [[DF-13 - Historie und kontrollierte Entfernung]]. Entscheidungen: [[K-03 - Einzeln erledigbarer Vorgang als Kerneinheit]], [[K-20 - WCS-Datenmodell als fachliche Grundlage]].

[[PBI-05 - Einen Vorgang erfassen und wiederfinden]], [[PBI-06 - Sammelvorgänge aufteilen]], [[PBI-07 - Dubletten zusammenführen]], [[PBI-08 - Bearbeitungsstand bewusst ändern]], [[PBI-09 - Termin und Wiedervorlage trennen]], [[PBI-10 - Eigenes To-do nachhalten]], [[PBI-41 - Vorgänge ohne Plugin und Obsidian nutzen]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
