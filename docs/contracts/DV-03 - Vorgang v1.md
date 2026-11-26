---
type: FileContract
id: DV-03
contract: weg-manager.matter/v1
status: gültig
entities:
  - "[[docs/entities/ENT-04 - Vorgang]]"
requirements:
  - "[[PBI-05 - Einen Vorgang erfassen und wiederfinden]]"
---

# DV-03 · Dateivertrag Vorgang (`weg-manager.matter/v1`)

Ein Vorgang (eine Zusage, eine Frist, eine Frage oder eine Aufgabe mit genau einem überprüfbaren Ergebnis) ist genau eine Markdown-Notiz mit YAML-Frontmatter. Die Notiz ist der einzige Speicher des Vorgangs ([[K-14 - Markdown und Frontmatter als offene Datengrundlage]], [[DF-22 - Notizen als maßgeblicher Datenbestand]]). Menschen und Agenten dürfen sie ohne Plugin anlegen und ändern, wenn sie diesen Vertrag einhalten. Schlüssel und Werte-Codes sind englisch (ADR 0006, ADR 0007). Entschieden vom Produktverantwortlichen am 26.11.2026 ([[PBI-05 - Einen Vorgang erfassen und wiederfinden]], Kommentare).

## Beispiel

```yaml
---
schema: weg-manager.matter/v1
id: matter-5d6e7f80-9a1b-4c2d-8e3f-4a5b6c7d8e9f
number: 41
community_id: community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21
kind: manager_promise
topic: Beleuchtung
outcome: Die defekte Lampe im Treppenhaus ist ersetzt.
responsible_id: contact-9a1d2c3b-4e5f-4a6b-8c7d-0e1f2a3b4c5d
promised_on: 2026-11-02
due_on: 2026-11-30
status: open
source: Mail
next_step: Bei der Verwaltung nachfragen, ob der Elektriker beauftragt ist.
---
```

Darunter darf beliebiger Text stehen. Er gehört dem Menschen; der Abschnitt „Verlauf“ folgt mit dem Verlauf ([[PBI-12 - Verlauf nachvollziehen]]).

## Schlüssel

Pflicht sind `schema`, `id`, `number`, `community_id`, `kind`, `topic`, `outcome`, `responsible_id`, `status`, `source` und `next_step`. Ein leerer Wert zählt als fehlend.

| Schlüssel | Typ | Regel | Beispiel |
| --- | --- | --- | --- |
| `schema` | Text | Genau `weg-manager.matter/v1`. | `weg-manager.matter/v1` |
| `id` | Text | `matter-` und eine UUID in Kleinbuchstaben. Einmal vergeben, nie geändert. Andere Notizen verweisen mit `matter_id` darauf. | `matter-5d6e…` |
| `number` | Zahl | Ganze Zahl ab 1, eine Folge über alle Gemeinschaften. Angezeigt mit dem Kürzel der Gemeinschaft und dreistellig: „AW 041“. | `41` |
| `community_id` | Text | Die `id` genau einer Gemeinschaft ([[DV-01 - Gemeinschaft v1]]). | `community-3f2b…` |
| `kind` | Text | `manager_promise`, `third_party_promise`, `board_deadline`, `legal_deadline`, `question` oder `board_task`. | `manager_promise` |
| `topic` | Text | Eine Zeile, höchstens 80 Zeichen. Bündelt Vorgänge, ohne ihren Stand zu verbinden. | `Beleuchtung` |
| `outcome` | Text | Eine Zeile, höchstens 300 Zeichen: das eine erwartete Ergebnis. Bestimmt den Dateinamen. | |
| `responsible_id` | Text | Die `id` des verantwortlichen Kontakts ([[DV-02 - Kontakt v1]]). | `contact-9a1d…` |
| `promised_on` | Datum, optional | `JJJJ-MM-TT`: wann zugesagt wurde. | `2026-11-02` |
| `due_on` | Datum, optional | `JJJJ-MM-TT`: der geltende Termin. Fehlt er bei einem offenen Vorgang, zeigt das Plugin „Termin erfragen“. | `2026-11-30` |
| `follow_up_on` | Datum, optional | `JJJJ-MM-TT`: eigene Wiedervorlage. Ändert nie `due_on`. | `2026-11-20` |
| `status` | Text | `open`, `unclear`, `done` oder `obsolete`. | `open` |
| `done_on` | Datum, optional | `JJJJ-MM-TT`. Pflicht bei `status: done`, sonst leer. | `2026-12-01` |
| `source` | Text | Eine Zeile, höchstens 100 Zeichen: Mail, Protokoll, Versammlung, Gespräch. `unknown` ist als sichtbare Quellenlücke erlaubt. | `Mail` |
| `next_step` | Text | Eine Zeile, höchstens 300 Zeichen: die konkrete nächste Handlung. | |
| `message_ref` | Text, optional | Kennung einer Nachricht in einem beliebigen Postfach, eine Zeile. | |
| `link` | Text, optional | Ein Pfad im Vault oder eine Adresse, eine Zeile. | |

## Identität, Nummer und Version

- Die Identität ist allein `id`. Die Nummer ist lesbar, nicht die Identität.
- Beim Anlegen vergibt das Plugin die höchste `number` aller Vorgänge im Vault plus eins. Haben nach einem Sync zwei Vorgänge dieselbe Nummer, zeigt das Plugin `number.duplicate` an beiden; der Mensch gibt einem eine neue. Eine Nummer wird nie neu vergeben, solange ein Vorgang sie trägt.
- Ein Vorgang wird nie gelöscht.
- `v1` ist die Version dieses Vertrags; eine Notiz mit höherer Version zeigt das Plugin schreibgeschützt.

## Ablage und Dateiname

- Neue Vorgänge legt das Plugin in `<Wurzelordner>/Vorgänge/` an, gefunden wie bei [[DV-01 - Gemeinschaft v1]].
- Der Dateiname ist das Ergebnis, `Die defekte Lampe im Treppenhaus ist ersetzt.md`, mit denselben Regeln wie bei [[DV-01 - Gemeinschaft v1]] (ersetzte Zeichen, ` (2)` bei Kollision, höchstens 255 Bytes); bleibt davon nichts übrig, heißt die Datei `Vorgang <Nummer>`. Ändert sich das Ergebnis im Plugin, folgt der Dateiname, solange die Datei noch den alten trägt.

## Was das Plugin schreibt

- Beim Anlegen: `schema`, `id` und die Felder in der Reihenfolge der Tabelle, nur die mit Wert. Der Text darunter bleibt leer.
- Beim Speichern nur die geänderten Felder, je Feld zusammengeführt mit einer Änderung außerhalb des Plugins wie bei [[DV-01 - Gemeinschaft v1]]. Unbekannte Schlüssel, Kommentare, Zeilenenden und der Text darunter bleiben.
- Der Prüfvermerk („überfällig“, „Termin erfragen“) wird berechnet und nie gespeichert.

## Probleme

| Problem (Code) | Wann | Was das Plugin tut |
| --- | --- | --- |
| `field.missing` | Ein Pflichtschlüssel fehlt oder ist leer. | Zeigt das Problem am Feld; im Formular reparierbar. |
| `number.invalid` | Keine ganze Zahl ab 1. | Wie oben. |
| `number.duplicate` | Ein anderer Vorgang hat dieselbe Nummer. | Zeigt es an beiden; die Nummer ist im Formular änderbar. |
| `number.taken` | Nur beim Speichern: Die eingegebene Nummer hat schon ein anderer Vorgang. | Zeigt das Problem am Feld und schreibt nichts. |
| `field.reference`, `reference.missing` | `community_id` oder `responsible_id` ist keine `id` des passenden Typs oder nennt keinen vorhandenen Datensatz. | Wie oben. |
| `kind.unknown`, `status.unknown` | Kein Wert der Liste. | Wie oben. |
| `topic.invalid`, `outcome.invalid`, `source.invalid`, `next-step.invalid`, `message-ref.invalid`, `link.invalid` | Kein Text, leer, zu lang oder mehrzeilig. | Wie oben. |
| `outcome.too-long` | Nur beim Speichern: Der Dateiname hätte mehr als 255 Bytes. | Zeigt das Problem am Feld und schreibt nichts. |
| `field.date` | Ein Datum ist kein gültiger Tag `JJJJ-MM-TT`. | Wie oben. |
| `done-on.missing` | `status: done` ohne `done_on`. | Wie oben. |
| `done-on.not-done` | `done_on` bei einem Status außer `done`. | Wie oben. |
| `schema.newer`, `id.*`, `schema.malformed`, `frontmatter.unreadable` | Wie bei [[DV-01 - Gemeinschaft v1]]. | Wie dort. |
