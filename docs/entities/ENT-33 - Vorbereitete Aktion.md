---
type: Entity
id: ENT-33
status: entwurf
scope: spaeter
category: bewegungsdaten
wcs: v1-offen
date: 2026-11-22
---

# ENT-33 · Vorbereitete Aktion

## Zweck

Eine vorbereitete Aktion ist ein Schritt, den ein Wochenlauf vorbereitet, aber nicht selbst ausführt: eine Ablage, eine Archivierung oder ein Entwurf. Der nächste Lauf prüft nach, ob der Mensch sie ausgeführt hat. Ein Vorschlag gilt nie als erledigt.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `prepared-action-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. Das WCS kennt keine eigene Kennung. |
| Schemaversion | `schema` | Text | P | `weg-manager.prepared-action/v1`. |
| Lauf | `run_on` | Datum | P | Datum des Laufs, der die Aktion vorbereitet hat. |
| Art | `kind` | Text (Code) | P | `filing`, `archiving`, `draft` (siehe Wertelisten). |
| Objekt | `target` | Text | P | Was betroffen ist: Datei im Vault, Nachrichtenreferenz oder Entwurf. |
| Nachgeprüft | `checked` | Checkbox | A | Ob der nächste Lauf die Aktion geprüft hat. Berechnet, nicht gespeichert. |
| Ergebnis | `outcome` | Text (Code) | A | `executed` oder `open`. Bei `open` entsteht ein To-do. Berechnet, nicht gespeichert. |

A-Felder berechnet das Plugin. Sie stehen nach ADR 0007 nicht in der Notiz.

## Wertelisten

Art (geschlossen, aus dem WCS):

| Code | Anzeige | Beispiel |
| --- | --- | --- |
| `filing` | Ablage | Datei nach Ablageregel umbenennen und in den Ordner der Gemeinschaft legen. |
| `archiving` | Archivierung | Überholte Fassung nach „Archiv“ verschieben. |
| `draft` | Entwurf | Nachrichtenentwurf zum Senden durch den Menschen bereitlegen. |

Ergebnis (geschlossen, aus dem WCS):

| Code | Anzeige | Folge |
| --- | --- | --- |
| `executed` | ausgeführt | Keine. |
| `open` | offen | Ein [[ENT-12 - To-do]] mit der Aktion. |

Grad der Vorbereitung (geschlossen, aus dem WCS; Werteliste ohne eigenes Feld im WCS-Objekt):

| Code | Anzeige | Bedeutung | Geltung |
| --- | --- | --- | --- |
| `show_only` | nur anzeigen | Der Lauf zeigt, was zu tun ist. | Kern |
| `suggest` | vorschlagen | Der Lauf legt die Aktion fertig vor; der Mensch führt sie aus. | Kern |
| `self_complete` | selbst erledigen | Bei hoher Sicherheit führt der Lauf Ablage oder Archivierung selbst aus. | Nur späterer Ausbau |

Senden ist nie ein Grad der Vorbereitung. Nachrichten sendet immer der Mensch (WCS FR-W12, NFR-1; [[DF-07 - Wahl, Entwurf und Versand]]).

## Beziehungen

Entsteht in einem Wochenlauf; die Nachprüfung steht am Anfang des nächsten Laufs nach der [[ENT-14 - Übergabe]]. Ein Entwurf ist ein [[ENT-10 - Nachrichtenentwurf]]. Ablage und Archivierung betreffen ein [[ENT-08 - Dokument]]. Eine offene Aktion wird ein [[ENT-12 - To-do]]. Die Aktion kann zu einem [[ENT-04 - Vorgang]] und einer [[ENT-09 - Entscheidungskarte]] gehören, deren Folgearbeit sie ist ([[PBI-17 - Folgearbeit aus Entscheidungen vorbereiten]]).

## Regeln und Lebenszyklus

- vorbereitet → im nächsten Lauf nachgeprüft → `executed` oder `open`.
- Ein Vorschlag gilt nie als erledigt (WCS G8). Erst der Nachweis in der Ablage oder ein dokumentierter Versand ([[ENT-11 - Versanddokumentation]]) macht eine Aktion `executed`.
- Eine Aktion `open` wird genau ein To-do. Eine wiederholte Nachprüfung legt kein zweites an.
- Vorbereitung braucht keine KI. Regeln bereiten vor ([[Konzept - Vorbereitung ohne KI]]); ein Agent ist optional ([[K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]).

## Datenschutz

Die Aktion nennt nur das Objekt, nicht seinen Inhalt. Private Dateien anderer Eigentümer werden nicht in geteilte Ordner abgelegt ([[DF-10 - Vertraulichkeitsprüfung]]).

## Abweichungen vom WCS

- Technische `id` und `schema` kommen hinzu.
- Objekt nennt eine allgemeine Nachrichtenreferenz statt einer Gmail-Thread-ID und eine Datei im Vault statt in Drive.
- „Bei hoher Sicherheit selbst erledigen“ ist nur späterer Ausbau ([[K-20 - WCS-Datenmodell als fachliche Grundlage]]).
- Wer vorbereitet, ist ein Lauf aus Regeln oder ein optionaler Agent, nicht ein bestimmtes KI-Produkt.

## Offene Punkte

- O-ENT33-1: „Vorbereitete Aktion“ als eigenes Objekt ins Schema aufnehmen, damit FR-W10 (Nachprüfung) prüfbar wird? (Offener Punkt des WCS.) Bis dahin `scope: spaeter`; im Backlog gibt es keine Story dazu.
- O-ENT33-2: Ist der Grad der Vorbereitung ein Feld jeder Aktion oder eine Einstellung je Art?
- O-ENT33-3: Woran erkennt die Nachprüfung „ausgeführt“? Ablage: Datei am Zielort. Entwurf: dokumentierter Versand. Archivierung: Datei in „Archiv“.
- O-ENT33-4: Wo werden Nachprüfung und Ergebnis gespeichert, wenn berechnete Felder nicht in die Notiz geschrieben werden? Vorschlag: im Verlauf des Laufs.
- O-ENT33-5: Braucht die Aktion eine Gemeinschaft (`community_id`)? Das WCS nennt keine; [[DF-12 - Gemeinschaftstrennung]] spricht dafür.

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7, Roadmap-Vision v0.2): Objekt Vorbereitete Aktion (aus FR-W10, Feld noch nicht im PRD-Schema); Glossar Nachprüfung (FR-W10, G8), Wochenlauf (FR-W1, FR-E6), Ablageregel (FR-E2); Werteliste Grad der Vorbereitung (FR-W12, NFR-1). Unser PRD: B-FR-07 (wiederholbar verarbeitbare Folgearbeit). PBIs: [[PBI-17 - Folgearbeit aus Entscheidungen vorbereiten]], [[PBI-10 - Eigenes To-do nachhalten]], [[PBI-25 - Nächste Wochenarbeit vorbereiten]]. Regeln: [[DF-07 - Wahl, Entwurf und Versand]], [[DF-10 - Vertraulichkeitsprüfung]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
