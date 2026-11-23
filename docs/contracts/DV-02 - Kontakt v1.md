---
type: FileContract
id: DV-02
contract: weg-manager.contact/v1
status: gültig
entities:
  - "[[docs/entities/ENT-02 - Person und Rolle]]"
requirements:
  - "[[PBI-02 - Personen und Rollen zuordnen]]"
---

# DV-02 · Dateivertrag Kontakt (`weg-manager.contact/v1`)

Ein Kontakt (eine Person oder eine Firma, etwa die Verwaltung, ein Beirat, ein Eigentümer oder ein Hausmeisterdienst) ist genau eine Markdown-Notiz mit YAML-Frontmatter. Die Notiz ist der einzige Speicher des Kontakts ([[K-14 - Markdown und Frontmatter als offene Datengrundlage]], [[DF-22 - Notizen als maßgeblicher Datenbestand]]). Menschen und Agenten dürfen sie ohne Plugin anlegen und ändern, wenn sie diesen Vertrag einhalten. Die Schlüssel und Werte-Codes sind englisch, der Text darum deutsch (ADR 0006, ADR 0007). Entschieden vom Produktverantwortlichen am 23.11.2026 ([[PBI-02 - Personen und Rollen zuordnen]], Kommentare).

## Beispiel

```yaml
---
schema: weg-manager.contact/v1
id: contact-9a1d2c3b-4e5f-4a6b-8c7d-0e1f2a3b4c5d
name: Hausverwaltung Beispiel
kind: company
roles:
  - community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21:manager
  - community-7c0d5e2a-1b3f-4c8d-9e0a-2b4c6d8e0f1a:manager
email: info@example.org
phone: "+49 30 1234567"
---
```

```yaml
---
schema: weg-manager.contact/v1
id: contact-2b3c4d5e-6f70-4812-9a3b-4c5d6e7f8091
name: Erika Beispiel
kind: person
organization_id: contact-9a1d2c3b-4e5f-4a6b-8c7d-0e1f2a3b4c5d
roles:
  - community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21:board
  - community-7c0d5e2a-1b3f-4c8d-9e0a-2b4c6d8e0f1a:owner
private: true
language: de+en
---
```

Darunter darf beliebiger Text stehen. Er gehört dem Menschen.

## Schlüssel

Pflicht sind `schema`, `id`, `name`, `kind` und `roles`. Ein leerer Wert (wie Obsidian ihn beim Leeren einer Eigenschaft schreibt) zählt als fehlend. Eine leere Liste `roles` ist das Problem `roles.missing`.

| Schlüssel | Typ | Regel | Beispiel |
| --- | --- | --- | --- |
| `schema` | Text | Genau `weg-manager.contact/v1`. Erkennt die Notiz als Kontakt, egal in welchem Ordner sie liegt. | `weg-manager.contact/v1` |
| `id` | Text | `contact-` und eine UUID in Kleinbuchstaben. Einmal vergeben, nie geändert. | `contact-2b3c4d5e-6f70-4812-9a3b-4c5d6e7f8091` |
| `name` | Text | Eine Zeile, nicht leer, höchstens 100 Zeichen: der Name der Person oder die Bezeichnung der Firma. Der Dateiname, der daraus wird, darf mit ` (100).md` höchstens 255 Bytes in UTF-8 haben. | `Erika Beispiel`, `Hausverwaltung Beispiel` |
| `kind` | Text | `person` oder `company`. | `person` |
| `organization_id` | Text, optional | Nur bei `kind: person`: die `id` der Firma, für die die Person handelt. Die Firma ist selbst ein Kontakt mit `kind: company`. | `contact-9a1d…` |
| `roles` | Liste | Mindestens ein Eintrag `<id einer Gemeinschaft>:<Rolle>`. Je Gemeinschaft höchstens ein Eintrag. Rollen (geschlossen): `board` (Beirat), `deputy` (Vertretung), `owner` (Eigentümer), `manager` (Verwaltung), `other_board` (Beirat andere Gemeinschaft), `third_party` (Dritte), `agent` (Agent). Eine Rolle verleiht keine Befugnis ([[DF-01 - Beiratsarbeit und Befugnis]]). | siehe Beispiel |
| `email` | Text, optional | Eine Zeile, höchstens 254 Zeichen, mit genau einem `@` und Text auf beiden Seiten. | `info@example.org` |
| `phone` | Text, optional | Eine Zeile, höchstens 50 Zeichen, so wie der Mensch sie schreibt. In Anführungszeichen, wenn sie mit `+` beginnt, damit YAML sie als Text liest. | `"+49 30 1234567"` |
| `language` | Text, optional | `de` oder `de+en`: in welchen Sprachen der Kontakt Nachrichten bekommt. | `de+en` |
| `private` | Checkbox, optional | `true` für Eigentümer und andere Privatpersonen. Fehlt der Schlüssel, ist er `false`. | `true` |
| `inactive` | Checkbox, optional | `true` für einen Kontakt, der nicht mehr verwendet wird. Fehlt der Schlüssel, ist er `false`. | `true` |

## Identität und Version

- Die Identität ist allein `id`. Dateiname und Ordner sind für Menschen und dürfen sich ändern; andere Notizen verweisen mit `contact_id` (eine Person) oder `contact_ids` (mehrere) auf die `id`.
- Rollen nennen die Gemeinschaft über ihre `id`, nie über ihr Kürzel: Ein geändertes Kürzel bricht keine Rolle.
- `v1` ist die Version dieses Vertrags. Eine Notiz mit höherer Version (`v2`) stammt aus einer neueren Plugin-Version. Dieses Plugin zeigt sie schreibgeschützt und schreibt sie nie.

## Ablage und Dateiname

- Das Plugin legt neue Kontakte in `<Wurzelordner>/Kontakte/` an, Personen und Firmen im selben Ordner, private Personen auch. Der Ordner und der Wurzelordner werden gefunden wie bei [[DV-01 - Gemeinschaft v1]].
- Der Dateiname ist der Name des Kontakts, mit denselben Regeln wie bei [[DV-01 - Gemeinschaft v1]] (ersetzte Zeichen, ` (2)` bei Kollision, höchstens 255 Bytes). Bleibt vom Namen nichts übrig, heißt die Datei `Kontakt`.

## Was das Plugin schreibt

- Beim Anlegen: `schema`, `id` und die Felder in der Reihenfolge der Tabelle, nur die mit Wert; `private` und `inactive` nur, wenn sie `true` sind. Der Text darunter bleibt leer.
- Beim Speichern nur die Felder, die der Mensch im Formular geändert hat, je Feld zusammengeführt mit einer Änderung außerhalb des Plugins, wie bei [[DV-01 - Gemeinschaft v1]] beschrieben ([[DF-23 - Externe Bearbeitung ohne stilles Überschreiben]]). Unbekannte Schlüssel, ihre Reihenfolge, Kommentare, Zeilenenden und der Text darunter bleiben.
- Wählt der Mensch für eine Gemeinschaft die Rolle `owner`, setzt das Formular `private: true`; solange eine Eigentümerrolle besteht, lässt es sich dort nicht entfernen.
- Nennt der Mensch beim Anlegen einer Person eine Firma, die es noch nicht gibt, legt das Plugin die Firma mit an (`kind: company`, mit den Rollen der Person; eine Rolle `owner` wird dort `third_party`, denn eine Firma ist nie privat).
- Ein Kontakt wird nie gelöscht. „Nicht mehr verwendet“ setzt `inactive: true`; die Notiz bleibt, wo sie ist.

## Was Menschen und Agenten ändern dürfen

- Alle Felder außer `id` und `schema` nach den Regeln oben, Dateiname und Ordner frei, den Text unter dem Frontmatter frei und eigene zusätzliche Schlüssel.
- Neue Kontakte, mit einer neuen `id`.
- Aus einer privaten Notiz darf kein Agent Inhalte übernehmen ([[DF-10 - Vertraulichkeitsprüfung]]).

## Probleme

Eine Notiz, die den Vertrag bricht, wird nie still repariert. Das Plugin zeigt sie mit dem Problem an; die übrigen Kontakte bleiben davon unberührt.

| Problem (Code) | Wann | Was das Plugin tut |
| --- | --- | --- |
| `field.missing` | `name`, `kind` oder `roles` fehlt oder ist leer. | Zeigt das Problem am Feld; im Formular reparierbar. |
| `name.invalid` | Kein Text, leer, zu lang oder mehrzeilig. | Wie oben. |
| `name.too-long` | Nur beim Speichern eines neuen oder geänderten Namens: Der Dateiname hätte mehr als 255 Bytes. | Zeigt das Problem am Feld und schreibt nichts. |
| `kind.unknown` | Weder `person` noch `company`. | Wie oben. |
| `field.reference` | `organization_id` ist keine `id` eines Kontakts. | Wie oben. |
| `reference.missing` | Kein Kontakt hat die `id` in `organization_id`. | Wie oben. |
| `organization.not-company` | `organization_id` nennt einen Kontakt, der keine Firma ist, oder eine Firma nennt selbst eine Firma. | Wie oben. |
| `roles.missing` | `roles` ist eine leere Liste. | Wie oben. |
| `roles.invalid` | Ein Eintrag hat nicht die Form `<id einer Gemeinschaft>:<Rolle>` oder nennt keine der Rollen. | Wie oben. |
| `roles.duplicate-community` | Zwei Einträge nennen dieselbe Gemeinschaft. | Wie oben. |
| `roles.community-missing` | Ein Eintrag nennt eine Gemeinschaft, die es nicht gibt. | Wie oben; der Eintrag bleibt, bis der Mensch ihn ändert. |
| `email.invalid`, `phone.invalid` | Nicht nach den Regeln oben. | Wie oben. |
| `language.unknown` | Weder `de` noch `de+en`. | Wie oben. |
| `private.missing` | Eine Rolle `owner`, aber kein `private: true`, etwa von Hand oder über Sync angelegt. | Zeigt das Problem mit dem Ausweg „Markierung privat setzen“. Bis dahin behandelt das Plugin den Kontakt wie einen privaten und übernimmt nichts daraus in Ausgaben. |
| `schema.newer`, `id.*`, `schema.malformed`, `frontmatter.unreadable` | Wie bei [[DV-01 - Gemeinschaft v1]]. | Wie dort. |
