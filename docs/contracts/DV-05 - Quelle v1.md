---
type: FileContract
id: DV-05
contract: weg-manager.source/v1
status: gültig
entities:
  - "[[docs/entities/ENT-07 - Quelle]]"
  - "[[docs/entities/ENT-08 - Dokument]]"
requirements:
  - "[[PBI-11 - Nachricht und Original zuordnen]]"
---

# DV-05 · Dateivertrag Quelle (`weg-manager.source/v1`)

Eine Quelle (eine Mail, ein Brief, eine Portalnachricht, ein Gespräch, eine Versammlung oder ein Dokument, mit ihrer Herkunft) ist genau eine Markdown-Notiz mit YAML-Frontmatter. Sie belegt einen oder mehrere Vorgänge einer Gemeinschaft. Der Nachrichtentext oder die Gesprächsnotiz steht im Text der Notiz; die Originaldateien liegen unverändert im Vault, die Notiz verweist auf sie ([[K-14 - Markdown und Frontmatter als offene Datengrundlage]], [[DF-22 - Notizen als maßgeblicher Datenbestand]]). Menschen und Agenten dürfen sie ohne Plugin anlegen und ändern, wenn sie diesen Vertrag einhalten. Schlüssel und Werte-Codes sind englisch (ADR 0006, ADR 0007). Entschieden vom Produktverantwortlichen am 26.11.2026 ([[PBI-11 - Nachricht und Original zuordnen]], Kommentare).

## Beispiel

```yaml
---
schema: weg-manager.source/v1
id: source-7c1d2e3f-4a5b-4c6d-8e7f-9a0b1c2d3e4f
subject: Angebot Beleuchtung
kind: mail
community_id: community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21
matter_ids:
  - matter-5d6e7f80-9a1b-4c2d-8e3f-4a5b6c7d8e9f
received_on: 2026-11-20
origin: Mail der Verwaltung an den Beirat
files:
  - "[[WEG Manager/Quellen/AW/2026-11-20 Mail Angebot Beleuchtung.pdf]]"
---
Sehr geehrter Beirat,
anbei das Angebot für die Treppenhausbeleuchtung.
```

## Schlüssel

Reihenfolge beim Anlegen wie in der Tabelle.

| Schlüssel | Typ | Regel | Beispiel |
| --- | --- | --- | --- |
| `schema` | Text | Genau `weg-manager.source/v1`. | `weg-manager.source/v1` |
| `id` | Text | `source-` und eine UUID in Kleinbuchstaben. Einmal vergeben, nie geändert. | `source-7c1d…` |
| `subject` | Text | Eine Zeile, höchstens 120 Zeichen. Bestimmt den Dateinamen. | `Angebot Beleuchtung` |
| `kind` | Text | `mail`, `letter`, `portal`, `conversation`, `meeting`, `document` oder `other`. | `mail` |
| `community_id` | Text | Die `id` genau einer Gemeinschaft ([[DV-01 - Gemeinschaft v1]]). | `community-3f2b…` |
| `matter_ids` | Liste, optional | Die `id`s der Vorgänge derselben Gemeinschaft, die die Quelle belegt ([[DV-03 - Vorgang v1]]). | |
| `received_on` | Datum, optional | `JJJJ-MM-TT`: wann die Nachricht einging oder das Gespräch war. | `2026-11-20` |
| `origin` | Text | Eine Zeile, höchstens 100 Zeichen: wer es wem geschickt oder gesagt hat. | `Mail der Verwaltung` |
| `message_ref` | Text, optional | Kennung der Nachricht in einem beliebigen Postfach, eine Zeile. | `<abc@example.org>` |
| `link` | Text, optional | Eine Webadresse (`http://`, `https://`, als Link gezeigt) oder ein Pfad im Vault, eine Zeile. | |
| `files` | Liste, optional | Je Original ein Wikilink auf die Datei im Vault. Obsidian hält ihn beim Umbenennen aktuell, wenn „Interne Links automatisch aktualisieren“ an ist, und schreibt ihn dann in der kürzesten Form (`[[Angebot.pdf]]`). | |

## Originale

- Das Plugin legt Originale in `<Wurzelordner>/Quellen/<Kürzel der Gemeinschaft>/` ab, benannt nach der WCS-Ablageregel `JJJJ-MM-TT Art Thema` mit der Endung der Datei in Kleinbuchstaben, etwa `2026-11-20 Mail Angebot Beleuchtung.pdf`; Tag ist `received_on`, sonst der Tag der Erfassung. Zeichen, die ein Dateiname nicht tragen darf, werden wie bei [[DV-01 - Gemeinschaft v1]] ersetzt.
- Nie wird eine Datei überschrieben: Ist der Name vergeben, bekommt die neue Fassung ` (2)`, ` (3)`, … vor der Endung. Den Zielpfad zeigt das Plugin vor dem Speichern.
- Eine Datei von außerhalb des Vaults wird kopiert; am Desktop kann sie stattdessen verschoben werden: Das Original außerhalb wird erst entfernt, wenn Kopie und Notiz geschrieben sind. Gelingt das Entfernen nicht, bleiben Quelle und Kopie, und das Plugin meldet es.
- Den Inhalt einer Datei ändert das Plugin nie.
- Ein Verweis, der auf keine Datei mehr führt, ist „Datei fehlt“; der Mensch repariert ihn in der Notiz.

## Identität und Version

- Die Identität ist allein `id`. Eine Quelle wird nie gelöscht.
- `v1` ist die Version dieses Vertrags; eine Notiz mit höherer Version zeigt das Plugin schreibgeschützt.

## Ablage und Dateiname der Notiz

- Neue Quellen legt das Plugin in `<Wurzelordner>/Quellen/` an, gefunden wie bei [[DV-01 - Gemeinschaft v1]].
- Der Dateiname ist der Betreff mit denselben Regeln wie bei [[DV-01 - Gemeinschaft v1]]; bleibt davon nichts übrig, heißt die Datei `Quelle`.

## Was das Plugin schreibt

- Beim Anlegen: `schema`, `id` und die Felder in der Reihenfolge der Tabelle, nur die mit Wert, dann den Text. Einen Mail-Connector braucht es nicht; das Plugin behauptet nie, ein Postfach vollständig zu kennen ([[DF-08 - Quellenabdeckung]]).
- Beim Speichern nur die geänderten Felder wie bei [[DV-01 - Gemeinschaft v1]]. Unbekannte Schlüssel, Kommentare, Zeilenenden und der Text bleiben.

## Probleme

| Problem (Code) | Wann | Was das Plugin tut |
| --- | --- | --- |
| `field.missing` | Ein Pflichtschlüssel fehlt oder ist leer. | Zeigt das Problem am Feld und schreibt nichts. |
| `field.reference`, `field.references`, `reference.missing` | `community_id` oder ein Eintrag von `matter_ids` ist keine `id` des passenden Typs oder nennt keinen vorhandenen Datensatz. | Zeigt das Problem an der Quelle. |
| `field.list` | `files` ist keine Liste von Texten. | Wie oben. |
| `subject.invalid`, `origin.invalid`, `message-ref.invalid`, `link.invalid` | Kein Text, leer, zu lang oder mehrzeilig. | Wie oben. |
| `kind.unknown` | Kein Wert der Liste. | Wie oben. |
| `field.date` | `received_on` ist kein gültiger Tag `JJJJ-MM-TT`. | Wie oben. |
| `matter.other-community` | Nur beim Erfassen: Ein Vorgang gehört zu einer anderen Gemeinschaft ([[DF-12 - Gemeinschaftstrennung]]). | Zeigt das Problem und schreibt nichts. |
| `schema.newer`, `id.*`, `schema.malformed`, `frontmatter.unreadable` | Wie bei [[DV-01 - Gemeinschaft v1]]. | Wie dort. |
