---
type: FileContract
id: DV-04
contract: weg-manager.todo/v1
status: gültig
entities:
  - "[[docs/entities/ENT-12 - To-do]]"
requirements:
  - "[[PBI-10 - Eigenes To-do nachhalten]]"
---

# DV-04 · Dateivertrag To-do (`weg-manager.todo/v1`)

Ein To-do (ein eigener, konkret ausführbarer Arbeitsschritt des Beirats, getrennt von einer fremden Zusage) ist genau eine Markdown-Notiz mit YAML-Frontmatter. Die Notiz ist der einzige Speicher des To-dos ([[K-14 - Markdown und Frontmatter als offene Datengrundlage]], [[DF-22 - Notizen als maßgeblicher Datenbestand]]). Menschen und Agenten dürfen sie ohne Plugin anlegen und ändern, wenn sie diesen Vertrag einhalten. Schlüssel und Werte-Codes sind englisch (ADR 0006, ADR 0007). Entschieden vom Produktverantwortlichen am 26.11.2026 ([[PBI-10 - Eigenes To-do nachhalten]], Kommentare).

## Beispiel

```yaml
---
schema: weg-manager.todo/v1
id: todo-1b2c3d4e-5f60-4a1b-8c2d-3e4f5a6b7c8d
title: Bei der Firma nach dem Termin fragen
community_id: community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21
matter_id: matter-5d6e7f80-9a1b-4c2d-8e3f-4a5b6c7d8e9f
responsible: board
status: waiting
follow_up_on: 2026-12-03
reason: Die Firma meldet sich nach der Prüfung.
---
```

Darunter darf beliebiger Text stehen. Er gehört dem Menschen.

## Schlüssel

Reihenfolge beim Anlegen wie in der Tabelle.

| Schlüssel | Typ | Regel | Beispiel |
| --- | --- | --- | --- |
| `schema` | Text | Genau `weg-manager.todo/v1`. | `weg-manager.todo/v1` |
| `id` | Text | `todo-` und eine UUID in Kleinbuchstaben. Einmal vergeben, nie geändert. | `todo-1b2c…` |
| `title` | Text | Eine Zeile, höchstens 300 Zeichen: die konkrete Handlung. Bestimmt den Dateinamen. | |
| `community_id` | Text | Die `id` genau einer Gemeinschaft ([[DV-01 - Gemeinschaft v1]]). | `community-3f2b…` |
| `matter_id` | Text, optional | Die `id` eines Vorgangs derselben Gemeinschaft ([[DV-03 - Vorgang v1]]). Ein To-do darf ohne Vorgang stehen. | `matter-5d6e…` |
| `responsible` | Text | `board` (der Beirat) oder die `id` eines Kontakts ([[DV-02 - Kontakt v1]]). | `board` |
| `status` | Text | `open`, `waiting`, `done` oder `dropped`. | `open` |
| `due_on` | Datum, optional | `JJJJ-MM-TT`: wann der Schritt fällig ist. | `2026-11-30` |
| `follow_up_on` | Datum, optional | `JJJJ-MM-TT`: Wiedervorlage. Pflicht bei `status: waiting`. | `2026-12-03` |
| `reason` | Text, optional | Eine Zeile, höchstens 300 Zeichen. Pflicht bei `waiting` (worauf gewartet wird) und `dropped` (warum der Schritt entfällt). | |

## Identität und Version

- Die Identität ist allein `id`.
- Ein To-do wird nie gelöscht; ein überholtes steht auf `dropped`.
- `v1` ist die Version dieses Vertrags; eine Notiz mit höherer Version zeigt das Plugin schreibgeschützt.

## Ablage und Dateiname

- Neue To-dos legt das Plugin in `<Wurzelordner>/To-dos/` an, gefunden wie bei [[DV-01 - Gemeinschaft v1]].
- Der Dateiname ist der Titel, mit denselben Regeln wie bei [[DV-01 - Gemeinschaft v1]]; bleibt davon nichts übrig, heißt die Datei `To-do`.

## Was das Plugin schreibt

- Beim Anlegen: `schema`, `id` und die Felder in der Reihenfolge der Tabelle, nur die mit Wert.
- Beim Speichern nur die geänderten Felder, je Feld zusammengeführt mit einer Änderung außerhalb des Plugins wie bei [[DV-01 - Gemeinschaft v1]]. Unbekannte Schlüssel, Kommentare, Zeilenenden und der Text darunter bleiben.
- „Erledigt“ setzt nur `status: done` am To-do. Den Vorgang schreibt es nie: Ein erledigter eigener Schritt erfüllt keine fremde Zusage ([[PBI-10 - Eigenes To-do nachhalten]], Kriterium 3).
- Die Gruppe („Überfällig“, „Diese Woche“, „Später“) und die Klärungsliste werden berechnet und nie gespeichert. Maßgeblich ist bei `waiting` die Wiedervorlage, sonst `due_on`; die Woche endet am Sonntag, „heute“ in Europe/Berlin.

## Probleme

| Problem (Code) | Wann | Was das Plugin tut |
| --- | --- | --- |
| `field.missing` | Ein Pflichtschlüssel fehlt oder ist leer. | Zeigt das Problem am Feld; im Formular reparierbar. |
| `field.reference`, `reference.missing` | `community_id` oder `matter_id` ist keine `id` des passenden Typs oder nennt keinen vorhandenen Datensatz. | Wie oben. |
| `title.invalid`, `reason.invalid` | Kein Text, leer, zu lang oder mehrzeilig. | Wie oben. |
| `responsible.invalid` | Weder `board` noch die `id` eines Kontakts. | Wie oben. |
| `status.unknown` | Kein Wert der Liste. | Wie oben. |
| `field.date` | Ein Datum ist kein gültiger Tag `JJJJ-MM-TT`. | Wie oben. |
| `follow-up.missing`, `reason.missing` | Nur beim Speichern: `waiting` ohne Wiedervorlage oder Grund, `dropped` ohne Grund. | Zeigt das Problem am Feld und schreibt nichts. |
| `matter.other-community` | Nur beim Speichern: Der Vorgang gehört zu einer anderen Gemeinschaft ([[DF-12 - Gemeinschaftstrennung]]). | Wie oben. |
| `schema.newer`, `id.*`, `schema.malformed`, `frontmatter.unreadable` | Wie bei [[DV-01 - Gemeinschaft v1]]. | Wie dort. |
