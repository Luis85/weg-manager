---
type: Entity
id: ENT-08
status: entwurf
scope: mvp
category: bewegungsdaten
wcs: keine
date: 2026-11-22
---

# ENT-08 · Dokument

## Zweck

Ein erhaltenes Original beziehungsweise dessen nachvollziehbar zugeordnete Fassung, etwa ein Protokoll, eine Nachricht als Datei oder eine Abrechnung. Das WCS führt kein Dokumentobjekt. Es kennt den Link am Vorgang, die Ablageregel und die Soll-Liste der Unterlagen ([[ENT-32 - Unterlage]]).

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `document-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]], falls das Dokument eine Begleitnote erhält (O-ENT08-1). |
| Schema | `schema` | Text | P | `weg-manager.document/v1` (vorgeschlagen), nur bei Begleitnote. |
| Original | `file` | Text | P | Pfad der Datei im Vault. Dateiname nach der WCS-Ablageregel `JJJJ-MM-TT Art Thema.pdf`. |
| Gemeinschaft | `community_id` | Text | P | Genau eine Gemeinschaft. |
| Herkunft | `source` | Text | O | Woher das Dokument kam ([[ENT-07 - Quelle]]). |
| Fassung | `version` | Text | O | Fassung des Originals. Eine neue Fassung bleibt von früheren unterscheidbar. |
| Ablagestand | `filing_state` | Text | O | WCS-Ablageregel: gültige Endfassung, Entwurf oder Archiv. |
| Prüfstand | `checked` | Text | O | Geprüft oder ungeprüft. |
| Vertraulichkeit | `confidentiality` | Text | O | Einstufung nach [[PBI-26 - Unterlagen einstufen und korrigieren]]. Enthält das Dokument Daten anderer Eigentümer, steht es in der Liste „Private Daten“ (WCS FR-E3). |
| Unterlagenart | `document_kind` | Text | O | Bezug zur Soll-Liste: Urkunde, Vertrag, Police, Protokoll, Beschlusssammlung, Abrechnung, Wirtschaftsplan, Abnahme-/Prüfprotokoll. |
| Fachliche Bezüge | `matter_ids` | Liste | O | Vorgänge, die das Dokument belegt. Im WCS umgekehrt über `Vorgang.link`. |

**Abbildung auf das WCS:** Dokument ↔ Unterlage: Die Unterlage ist der Soll-Eintrag („Teilungserklärung mit Aufteilungsplan muss vorhanden sein“), das Dokument die tatsächlich abgelegte Datei. `Unterlage.ablage` zeigt auf ein Dokument; `Vorgang.link`, `Beschluss.quelle` und `Vertrag.dokument` ebenso.

## Wertelisten

**Ablagestand (geschlossen, aus der WCS-Ablageregel):** gültige Endfassung (`final`, oben im Ordner), Entwurf (`draft`, Ordner „Entwürfe und Unterlagen“), Archiv (`archived`, Ordner „Archiv“).

## Beziehungen

Kann als Original einer Quelle dienen und bewusst als Anlage einer Nachricht oder Ausgabe ausgewählt werden. Erfüllt einen Eintrag im Unterlagen-Inventar. Später belegt es Beschlüsse, Verträge, Policen, Feststellungen und Kostenbuchungen.

[[ENT-07 - Quelle]], [[ENT-10 - Nachrichtenentwurf]], [[ENT-15 - Ausgabestand]], [[ENT-25 - Beschluss]], [[ENT-29 - Vertrag]], [[ENT-30 - Police]], [[ENT-32 - Unterlage]], [[ENT-35 - Feststellung]].

## Regeln und Lebenszyklus

- Originale werden nicht still überschrieben ([[DF-13 - Historie und kontrollierte Entfernung]]).
- Umbenennung erhält Beziehungen oder erzeugt sichtbaren Reparaturbedarf.
- Nicht ausgewählte Anlagen werden nicht über weitere Links automatisch mitgegeben ([[DF-10 - Vertraulichkeitsprüfung]]).
- Kontrollierte Entfernung unnötiger privater Inhalte erhält einen Vermerk ohne deren Wiederholung.
- Überholte Fassungen gehen ins Archiv, nicht in den Papierkorb.
- Dokumentverwaltung begründet weder ein Rechnungsmodul noch eine vollständige Beschlusssammlung.

## Datenschutz

Dokumente können Daten anderer Eigentümer enthalten (Einzelabrechnungen, Protokolle mit Namen). Sie werden getrennt abgelegt und in „Private Daten“ geführt. Aus Abrechnungen werden nur gemeinschaftsweite Zahlen übernommen. Solche Dokumente gehen nie in Entwürfe, Karten, Berichte oder ein öffentliches Repository.

## Abweichungen vom WCS

- Ablage im Vault statt in einem Cloud-Speicher.
- Das WCS kennt kein Dokumentobjekt. Die Note bleibt als unsere Ergänzung eigenständig, weil sie Fassung, Prüfstand und Vertraulichkeit trägt.

## Offene Punkte

- **O-ENT08-1:** Bekommt jedes Dokument eine Begleitnote mit Frontmatter, oder reichen Datei und Link? Speicherorte und Dateiaufteilung sind offen.
- **O-ENT08-2:** Zusammenführung mit [[ENT-32 - Unterlage]] (Soll-Liste) und [[ENT-07 - Quelle]]: ein Objekt mit Soll- und Ist-Stand oder drei getrennte?
- **O-ENT08-3:** Wo liegt die Liste „Private Daten“ (WCS FR-E3), und wer pflegt sie?

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7, Roadmap-Vision v0.2): Ablageregel FR-E2, Private Daten FR-E3, Unterlagen-Inventar FR-E9, V12, `Vorgang.link`. Unser [MVP-PRD](../02-MVP-PRD.md): B-FR-05, B-FR-11, B-FR-12, AT-B11. Regeln: [[DF-10 - Vertraulichkeitsprüfung]], [[DF-12 - Gemeinschaftstrennung]], [[DF-13 - Historie und kontrollierte Entfernung]].

[[PBI-11 - Nachricht und Original zuordnen]], [[PBI-26 - Unterlagen einstufen und korrigieren]], [[PBI-27 - Unnötige private Inhalte entfernen]], [[PBI-28 - Empfängerbezogene Ausgabe prüfen]], [[PBI-30 - Bestand sichern und wiederherstellen]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
