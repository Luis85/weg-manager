---
type: Entity
id: ENT-22
status: entwurf
scope: mvp
category: bewegungsdaten
wcs: keine
date: 2026-11-22
---

# ENT-22 · AI-Gespräch

## Zweck

Ein Gespräch im nativen Chat verbindet Nutzerauftrag, Antworten und nachvollziehbare Bearbeitung mit dem freigegebenen Arbeitskontext. Das WCS führt kein Gesprächsobjekt. Dort erscheint der Assistent als Rolle (bei uns „Agent“) in `VerlaufEintrag.von`, und vorbereitete Arbeit als [[ENT-33 - Vorbereitete Aktion]].

## Felder

Endgültige Schema- und Feldnamen bleiben offen; die Schlüssel sind Vorschläge.

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `conversation-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]: stabile lokale Referenz. |
| Schema | `schema` | Text | P | `weg-manager.conversation/v1` (vorgeschlagen). |
| Laufzeitreferenz | `runtime_ref` | Text | O | Sichtbare Laufzeit- oder Sitzungsreferenz, ohne Geheimnisse. |
| Kontext | `community_id` | Text | P | Gemeinschaft oder ausdrücklich übergreifender Kontext. |
| Notizbezüge | `context_ids` | Liste | O | Ausgewählte Notes, etwa Vorgänge oder Quellen. |
| Nachrichten | Body | Text | P | Nachrichtenrollen und Zeitpunkte als nachvollziehbarer Gesprächsinhalt. |
| Ausführungsstand | `state` | Text | P | Siehe Wertelisten. |
| Dateiaktionen | Body | Text | O | Tatsächlich ausgeführte Aktionen mit betroffenen Dateien und bekanntem Ausgang. |

**Abbildung auf das WCS:** Der Agent als Verfasser = `VerlaufEintrag.von` mit Rolle Agent; vorbereitete Ablage, Archivierung oder Entwürfe = Vorbereitete Aktion mit Nachprüfung im nächsten Lauf (FR-W10).

## Wertelisten

**Ausführungsstand (geschlossen, Vorschlag):** bereit (`ready`), laufend (`running`), wartet auf Berechtigung oder Bestätigung (`awaiting_approval`), abgeschlossen (`completed`), abgebrochen (`cancelled`), fehlgeschlagen (`failed`).

**Grad der Vorbereitung (WCS, geschlossen):** nur anzeigen, vorschlagen. „Bei hoher Sicherheit selbst erledigen“ ist späterer Ausbau. Senden nie.

## Beziehungen

Der Kontext verweist auf passende [[ENT-01 - Gemeinschaft]], [[ENT-04 - Vorgang]], [[ENT-07 - Quelle]] oder andere freigegebene Fachnotizen. Das Gespräch selbst ist keine [[ENT-09 - Entscheidungskarte]] und keine [[ENT-11 - Versanddokumentation]]. Eine gespeicherte Antwort ersetzt keinen tatsächlichen Handlungsnachweis. Eine Änderung durch den Agenten erscheint als [[ENT-06 - Verlaufseintrag]] mit Rolle Agent ([[ENT-02 - Person und Rolle]]).

## Regeln und Lebenszyklus

- Ausführungsnachweise nennen betroffene Dateien und bekannten Ausgang ([[DF-28 - Chatantwort und ausgeführte Fachaktion unterscheiden]]).
- Eine unvollständige Antwort oder eine vor einem Abbruch erfolgte Änderung darf nicht als vollständig rückgängig gemacht erscheinen.
- Kein stiller Wechsel der Abrechnung ([[DF-27 - Abo-Nutzung ohne stillen Abrechnungswechsel]]).
- Der Agent sendet nie und setzt nie den Status „nicht eingehalten“.
- Wenn das Plugin Gespräche aufbewahrt, liegen Gesprächsinhalt und relevante Aktionsbezüge als Markdown mit dokumentiertem Frontmatter vor ([[K-14 - Markdown und Frontmatter als offene Datengrundlage]]). Ein nur in der Laufzeit vorhandener undokumentierter Verlauf ist keine exklusive Quelle des Plugin-Gesprächs. Externe Runtime-Historie kann existieren, ersetzt aber nicht den offenen lokalen Fachstand.

## Datenschutz

Tokens, Passwörter und API-Schlüssel gehören nicht in Gesprächsnotizen. Kontextdaten und Antworten können vertraulich sein; sie werden nicht automatisch in Empfängerexporte aufgenommen. Inhalte der Bewertungsschicht und Daten anderer Eigentümer gehen nur in den Kontext, wenn der Mensch sie ausdrücklich auswählt.

## Abweichungen vom WCS

- Das WCS kennt kein Gesprächsobjekt. Die Note bleibt als unsere Ergänzung eigenständig.
- Der Assistent ist eine optionale Rolle „Agent“, kein bestimmtes Produkt. Der lokale Kern bleibt ohne KI nutzbar ([[K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]).

## Offene Punkte

- **O-ENT22-1:** Dateinamen, Speicherung, Wiederaufnahme und Löschregeln sind vor Umsetzung auszuarbeiten. Die Note beschreibt ein Konzept, kein implementiertes Chatschema.
- **O-ENT22-2:** Zusammenführung der Dateiaktionen mit [[ENT-33 - Vorbereitete Aktion]]: gleiche Nachprüfung für Chat und Wochenlauf?
- **O-ENT22-3 (erledigt):** Entschieden am 22.11.2026 vom Produktverantwortlichen: Nein. Der Ordner der Bewertungsschicht und als privat markierte Personennotizen sind vom Agentenzugriff ausgenommen ([[ENT-16 - Beiratsbewertung]], [[ENT-02 - Person und Rolle]]).

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7): Rolle Agent, Grad der Vorbereitung, FR-W10, FR-W12, NFR-1. Unser [MVP-PRD](../02-MVP-PRD.md): B-FR-16, AT-B18. Regeln: [[DF-27 - Abo-Nutzung ohne stillen Abrechnungswechsel]], [[DF-28 - Chatantwort und ausgeführte Fachaktion unterscheiden]]. Entscheidungen: [[K-14 - Markdown und Frontmatter als offene Datengrundlage]], [[K-17 - Nativer AI-Chat über das Nutzerabo]], [[K-20 - WCS-Datenmodell als fachliche Grundlage]].

[[PBI-47 - AI-Chat über die eigene Claude-Subscription nutzen]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
