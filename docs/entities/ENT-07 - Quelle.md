---
type: Entity
id: ENT-07
status: entwurf
scope: mvp
category: bewegungsdaten
wcs: keine
date: 2026-11-22
---

# ENT-07 · Quelle

## Zweck

Der nachvollziehbare Herkunftsbezug einer fachlichen Aussage, etwa eine Nachricht, eine Gesprächsnotiz, ein Protokoll oder ein Dokumentverweis. Das WCS führt die Quelle nicht als eigenes Objekt, sondern als Felder am Vorgang und am Verlaufseintrag.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `source-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]], nur falls die Quelle eine eigene Note wird (O-ENT07-1). |
| Schema | `schema` | Text | P | `weg-manager.source/v1` (vorgeschlagen), nur bei eigener Note. |
| Art der Quelle | `source` | Text | P | WCS `Vorgang.quelle` und `VerlaufEintrag.quelle`: Mail, Protokoll, Versammlung, Dokument, Gespräch. |
| Nachrichtenreferenz | `message_ref` | Text | O | Ersetzt WCS `mailRef`. Kennung der Nachricht in einem beliebigen Postfach. |
| Link | `link` | Text | O | WCS `Vorgang.link`. Fundstelle in der Ablage im Vault ([[ENT-08 - Dokument]]). |
| Fundstelle | `locator` | Text | O | Unsere Ergänzung: Seite, Abschnitt, Tagesordnungspunkt. Bei Feststellungen ist die Seite Pflicht ([[ENT-35 - Feststellung]]). |
| Verfügbarkeit | `availability` | Text | O | Unsere Ergänzung: Original vorhanden, nur Link, fehlt. |
| Prüfstand | `checked` | Text | O | Unsere Ergänzung: geprüft oder ungeprüft. |
| Vertraulichkeit | `confidentiality` | Text | O | Unsere Ergänzung, soweit für Verwendung und Ausgabe nötig ([[DF-10 - Vertraulichkeitsprüfung]]). |

**Abbildung auf das WCS:** Quelle = `Vorgang.quelle` (Art in Kurzform) + `Vorgang.link` (Fundort) + Nachrichtenreferenz (statt `mailRef`); im Verlauf `VerlaufEintrag.quelle`. Beschlüsse verweisen mit `quelle` auf das Protokoll, Verträge mit `dokument`.

## Wertelisten

**Verfügbarkeit (geschlossen, Vorschlag):** Original vorhanden (`original`), nur Link (`link_only`), fehlt (`missing`).

## Beziehungen

Belegt Vorgänge, Verlaufseinträge, Termine, Empfehlungen und Bewertungen. Kann ein lokal erhaltenes Dokument referenzieren; ein bloßer externer Link und ein tatsächlich vorhandenes Original bleiben unterscheidbar. Später belegt sie auch Beschlüsse, Regeln (Fundstelle) und Feststellungen.

[[ENT-04 - Vorgang]], [[ENT-05 - Termin]], [[ENT-06 - Verlaufseintrag]], [[ENT-08 - Dokument]], [[ENT-09 - Entscheidungskarte]], [[ENT-15 - Ausgabestand]], [[ENT-16 - Beiratsbewertung]], [[ENT-25 - Beschluss]], [[ENT-28 - Regel]], [[ENT-32 - Unterlage]], [[ENT-35 - Feststellung]].

## Regeln und Lebenszyklus

- Eine fehlende Quelle oder ein ungeprüfter Eingang bleibt sichtbar ([[DF-08 - Quellenabdeckung]]).
- „Keine Antwort bekannt“ ist bei unvollständiger Abdeckung kein Nachweis einer ausgebliebenen Antwort.
- Ein dokumentierter Beschlussnachweis bleibt von einer Empfehlung oder einem Beschlussentwurf unterscheidbar ([[DF-15 - Entscheidungskarte und Beschluss]]).
- Die Nachrichtenreferenz bindet an keinen Dienst. Das Plugin liest kein Postfach von sich aus.

## Datenschutz

Nachrichten und Protokolle können Daten anderer Eigentümer enthalten. Solche Quellen sind vertraulich und gehen nur nach Prüfung in eine Ausgabe. Die Nachrichtenreferenz ist eine Kennung, kein Inhalt.

## Abweichungen vom WCS

- Nachrichtenreferenz statt Gmail-Thread-ID.
- Ablage im Vault statt in einem Cloud-Speicher.
- Das WCS kennt kein Quellenobjekt. Die Note bleibt als unsere Ergänzung eigenständig, weil sie Verfügbarkeit, Prüfstand und Vertraulichkeit trägt, die das WCS nicht hat.

## Offene Punkte

- **O-ENT07-1:** Eigene Note mit Identität oder nur Felder am Vorgang und Verlaufseintrag (WCS-Form)? Die gemeinsame Nutzung einer Quelle durch mehrere Fachobjekte ist offen. **Entschieden am 26.11.2026** ([[PBI-11 - Nachricht und Original zuordnen]]): je Erfassung eine Quellnotiz `weg-manager.source/v1`, die auf die unveränderten Originaldateien verweist; keine Begleitnote je Datei.
- **O-ENT07-2:** Wird die Note mit [[ENT-08 - Dokument]] und [[ENT-32 - Unterlage]] zusammengeführt?
- **O-ENT07-3 (erledigt):** Entschieden am 22.11.2026 vom Produktverantwortlichen: `source` ist Pflicht, „unbekannt“ ist als sichtbare Lücke erlaubt.

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7): `Vorgang.quelle`, `mailRef`, `link`, `VerlaufEintrag.quelle`, FR-E2. Unser [MVP-PRD](../02-MVP-PRD.md): B-FR-05, B-FR-06, B-FR-11, AT-B05. Regeln: [[DF-08 - Quellenabdeckung]], [[DF-10 - Vertraulichkeitsprüfung]], [[DF-15 - Entscheidungskarte und Beschluss]].

[[PBI-11 - Nachricht und Original zuordnen]], [[PBI-12 - Verlauf nachvollziehen]], [[PBI-13 - Aktuelle Wochenlage öffnen]], [[PBI-15 - Eine Entscheidungsvorlage prüfen]], [[PBI-26 - Unterlagen einstufen und korrigieren]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
