---
type: Decision
id: K-20
status: festgelegt
date: 2026-11-22
source: "Glossar und Data-Dictionary des WEG Control System (WCS) vom 22.11.2026, übergeben vom Produktverantwortlichen; Entscheidungen des Produktverantwortlichen vom selben Tag"
---

# K-20 · WCS-Datenmodell als fachliche Grundlage

## Entscheidung

Das Glossar und das Data-Dictionary des WEG Control System (WCS) sind die Grundlage des fachlichen Domänenmodells. Das WCS ist die bestehende Ist-Lösung des Beirats. Wir passen uns an:

1. **Begriffe:** Die WCS-Begriffe sind die führende Fachsprache, in allen Docs. Dazu gehören:
   - Vorgang statt Punkt.
   - Verlaufseintrag statt Ereignis.
   - Eskalation statt Nachfassstand.
   - Entscheidungskarte statt Arbeitsentscheidung.
   - To-do statt eigener Aufgabe.
   - Übergabe statt Wochenübergabe.
   - Prüfvermerk statt Prüfmerkmal.
   - Person mit Rolle statt Ansprechpartner.
2. **Ablage:** Jedes Datenobjekt hat eine Entity-Note in `docs/entities`. Die Überblicksnote ist [[00 - Fachliches Domänenmodell]]. Die bisherigen Notes aus `docs/design/entities` sind dorthin umgezogen und mit den WCS-Objekten zusammengeführt. Neue WCS-Objekte haben ENT-23 bis ENT-37.
3. **Gemeinschaft:** Die Art bleibt freier Text mit Vorschlägen. „WEG“, „Tiefgarage“ und „Viertel“ sind Vorschläge, kein geschlossener Typ.
   - Die fachliche WCS-„id“ (Kurzschlüssel) ist unser Kürzel.
   - Die technische Identität bleibt die `id` nach [[docs/adr/0007-vault-data-access.md|ADR 0007]].
   - Das Kürzel ist änderbar ([[PBI-73 - Kürzel einer Gemeinschaft nachträglich ändern]]).
4. **KI, Gmail und Drive:** Diese Teile des WCS übernehmen wir neutral und optional.
   - Statt „Claude“ gibt es die optionale Rolle „Agent“.
   - Statt der Gmail-Thread-ID gibt es eine allgemeine Nachrichtenreferenz.
   - Abgelegt wird im Vault statt in Drive.
   - „Bei hoher Sicherheit selbst erledigen“ ist späterer Ausbau. Senden bleibt immer dem Menschen vorbehalten.
   - [[K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]] bleibt gültig.

## Geltung

Gilt für alle fachlichen Docs: Backlog, Regeln, Entscheidungen, Design und Research ohne Status „historisch“. Code, Dateiverträge und Routen folgen mit ihrer nächsten Änderung. Bis dahin gilt die Zuordnungstabelle in [[00 - Fachliches Domänenmodell]].

## Kontext und Begründung

Der Beirat arbeitet heute mit dem WCS. Dessen Begriffe kennen Beirat und Vertretung bereits, und ihr Datenmodell ist im Betrieb erprobt. Eine zweite Fachsprache im Plugin würde Übersetzungsarbeit und Missverständnisse erzeugen. Das WCS-Modell kennt außerdem Objekte, die unserem Modell fehlten: Grundstück, Einheit, Beschluss, Budget, Gemeingut, Regel, Vertrag, Police, Anlage, Unterlage, Vorbereitete Aktion, Prüfvorgang, Feststellung, Kostenbuchung und Kontobewegung. Sie sollen das Schema für den MVP nicht verbauen.

## Abgrenzung

- Das WCS-Dokument selbst liegt nicht im Repository. Es nennt echte Namen; das Repository nennt keine.
- WCS-Objekte mit dem Status „später“ bekommen eine Entity-Note, aber keine Releasezusage. `scope` folgt dem Backlog, nicht dem WCS-Status.
- Die Begriffe in Mockup-Bildern, Routen, Befehls-IDs, im Referenz-Vault (`scripts/reference-vault.mjs`) und im Code werden nachgezogen. Das hält O-D13 in `docs/design/handoff/09 - Offene Punkte vor Implementierung.md` fest.

## Auswirkungen

- `docs/entities` ersetzt `docs/design/entities`. Die Base-View „Design Foundations“ zeigt beide Ordner.
- Dateien mit alten Begriffen im Titel sind umbenannt, etwa [[PBI-05 - Einen Vorgang erfassen und wiederfinden]], [[VIEW-03 - Vorgänge und Vorgangsakte]] und [[K-03 - Einzeln erledigbarer Vorgang als Kerneinheit]].
- `GLOSSARY.md` führt die englischen Code-Begriffe zu den neuen deutschen Begriffen.
- Die Zahl der MVP-Entitäten ändert sich nicht. Die neuen Notes ENT-23 bis ENT-37 sind späterer Ausbau, solange das Backlog nichts anderes sagt.

## Offene Punkte

Die offenen Punkte des WCS stehen an den betroffenen Entity-Notes und gesammelt in [[00 - Fachliches Domänenmodell]]:
- Prüfvorgang im MVP.
- Vorbereitete Aktion als eigenes Objekt.
- Speicherort der Bewertungsschicht.
- Personen als Objekt.
- Gemeinsame Buchungslogik.

## Verknüpfungen

[[00 - Fachliches Domänenmodell]] · [[K-03 - Einzeln erledigbarer Vorgang als Kerneinheit]] · [[K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]] · [[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]].
