---
type: FileContract
id: DV-01
contract: weg-manager.community/v1
status: gültig
entities:
  - "[[docs/design/entities/ENT-01 - Gemeinschaft]]"
requirements:
  - "[[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]]"
---

# DV-01 · Dateivertrag Gemeinschaft (`weg-manager.community/v1`)

Eine Gemeinschaft (eine WEG, ihre Tiefgarage) ist genau eine Markdown-Notiz mit YAML-Frontmatter. Die Notiz ist der einzige Speicher der Gemeinschaft ([[K-14 - Markdown und Frontmatter als offene Datengrundlage]], [[DF-22 - Notizen als maßgeblicher Datenbestand]]). Menschen und Agenten dürfen sie ohne Plugin anlegen und ändern, wenn sie diesen Vertrag einhalten. Die Schlüssel und Werte-Codes sind englisch, der Text darum deutsch (ADR 0006, ADR 0007).

## Beispiel

```yaml
---
schema: weg-manager.community/v1
id: community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21
name: Ahornweg 12
short_code: AW
color: teal
kind: WEG
unit_label: Einheiten
---
```

Darunter darf beliebiger Text stehen. Er gehört dem Menschen.

## Schlüssel

Alle Schlüssel sind Pflicht. Ein leerer Wert (wie Obsidian ihn beim Leeren einer Eigenschaft schreibt) zählt als fehlend.

| Schlüssel | Typ | Regel | Beispiel |
| --- | --- | --- | --- |
| `schema` | Text | Genau `weg-manager.community/v1`. Erkennt die Notiz als Gemeinschaft, egal in welchem Ordner sie liegt. | `weg-manager.community/v1` |
| `id` | Text | `community-` und eine UUID in Kleinbuchstaben. Einmal vergeben, nie geändert. | `community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21` |
| `name` | Text | Eine Zeile, nicht leer, höchstens 100 Zeichen. So, wie der Mensch ihn schreibt. | `Ahornweg 12` |
| `short_code` | Text | 2 bis 5 Zeichen, nur `A`–`Z` und `0`–`9`, in Großbuchstaben. Unter allen Gemeinschaften eindeutig. Nach dem Anlegen fest. | `AW` |
| `color` | Text | Ein Name der Palette: `teal`, `violet`, `blue`, `rust`, `slate`, `cyan`, `pink`, `olive`. Jede Gemeinschaft eine andere Farbe. Die Farbtöne je Theme legt das Plugin fest. | `teal` |
| `kind` | Text | Die Art in eigenen Worten. Eine Zeile, nicht leer, höchstens 50 Zeichen. Aus ihr folgt weder Rechtsform noch Befugnis. | `WEG`, `Tiefgarage` |
| `unit_label` | Text | Wie die Gemeinschaft ihre Einheiten nennt. Eine Zeile, nicht leer, höchstens 50 Zeichen. | `Einheiten`, `Stellplätze` |

## Identität und Version

- Die Identität ist allein `id`. Der Dateiname und der Ordner sind für Menschen und dürfen sich ändern; andere Notizen verweisen später mit `community_id` auf die `id`.
- `v1` ist die Version dieses Vertrags. Eine Notiz mit höherer Version (`v2`) stammt aus einer neueren Plugin-Version. Dieses Plugin zeigt sie schreibgeschützt und schreibt sie nie.

## Ablage und Dateiname

- Das Plugin legt neue Gemeinschaften in `<Wurzelordner>/Gemeinschaften/` an. Der Wurzelordner ist die Einstellung `rootFolder`, vorgegeben `WEG Manager`. Der Ordnername `Gemeinschaften` ist in jeder Sprache deutsch, weil ein Vault zwischen Geräten geteilt wird.
- Der Dateiname ist der Name der Gemeinschaft. Zeichen, die ein Dateiname oder ein Wikilink nicht tragen kann (`\ / : * ? " < > | # ^ [ ]` und Steuerzeichen), werden je Folge durch einen Bindestrich ersetzt. Mehrere Leerzeichen werden zu einem; Punkte und Leerzeichen am Anfang und Ende fallen weg. Bleibt nichts übrig, heißt die Datei wie das Kürzel. Aus `Ahornweg 12/14` wird `Ahornweg 12-14.md`; `name` behält `Ahornweg 12/14`.
- Ist der Name im Ordner schon vergeben (auch in anderer Groß- und Kleinschreibung), heißt die Datei `Name (2).md`, `Name (3).md` und so weiter.
- Ändert der Mensch im Plugin den Namen, benennt das Plugin die Datei mit um, solange sie noch den Namen trägt, den das Plugin ihr gegeben hat (der alte Name, auch mit Zusatz ` (2)`). Hat der Mensch der Datei einen eigenen Namen gegeben, bleibt dieser. Klappt das Umbenennen nicht, bleibt die gespeicherte Notiz, wo sie ist.

## Was das Plugin schreibt

- Beim Anlegen: `schema`, `id` und die fünf Felder in dieser Reihenfolge, der Text darunter leer.
- Beim Speichern nur die Felder, die der Mensch im Formular geändert hat. Wurde ein Feld inzwischen außerhalb des Plugins geändert, gilt die Änderung des Feldes, das nur eine Seite geändert hat. Haben beide Seiten dasselbe Feld verschieden geändert, schreibt das Plugin nichts und lässt den Menschen je Feld wählen ([[DF-23 - Externe Bearbeitung ohne stilles Überschreiben]]).
- Unbekannte Schlüssel, ihre Reihenfolge und der Text unter dem Frontmatter bleiben unverändert.
- Löschen legt die Notiz in den Papierkorb, den der Mensch in Obsidian eingestellt hat.
- Welche Gemeinschaft gerade ausgewählt ist, steht nicht in der Notiz. Das Plugin merkt es sich je Gerät.

## Was Menschen und Agenten ändern dürfen

- `name`, `color`, `kind` und `unit_label` nach den Regeln oben.
- Dateiname und Ordner frei; die Notiz bleibt dieselbe Gemeinschaft.
- Den Text unter dem Frontmatter frei, und eigene zusätzliche Schlüssel.
- Neue Gemeinschaften, mit einer neuen `id` und einem Kürzel, das noch keine andere Gemeinschaft hat.
- Nicht ändern: `id` und `schema`. `short_code` nur, solange es ungültig ist oder eine andere Gemeinschaft dasselbe hat.

## Probleme

Eine Notiz, die den Vertrag bricht, wird nie still repariert. Das Plugin zeigt sie mit dem Problem an; die übrigen Gemeinschaften bleiben davon unberührt.

| Problem (Code) | Wann | Was das Plugin tut |
| --- | --- | --- |
| `field.missing` | Ein Schlüssel fehlt oder ist leer. | Zeigt das Problem am Feld; im Formular reparierbar. |
| `name.invalid`, `kind.invalid`, `unit-label.invalid` | Kein Text, leer, zu lang oder mehrzeilig. | Wie oben. |
| `short-code.invalid` | Nicht 2 bis 5 Zeichen aus `A`–`Z` und `0`–`9`, etwa in Kleinbuchstaben. | Wie oben; das Kürzel ist dann im Formular änderbar. |
| `short-code.duplicate` | Eine andere Gemeinschaft hat dasselbe Kürzel. | Zeigt es an beiden; das Kürzel ist im Formular änderbar. |
| `color.unknown` | Kein Name der Palette. | Wie oben. |
| `schema.newer` | Höhere Version als `v1`. | Schreibgeschützt, Felder werden nicht gelesen. |
| `id.missing`, `id.malformed`, `id.other-type` | `id` fehlt, hat nicht die Form `community-<uuid>` oder gehört zu einem anderen Typ. | Schreibgeschützt. |
| `id.duplicate` | Eine andere Notiz hat dieselbe `id`. | Beide schreibgeschützt. |
| `schema.malformed` | `schema` beginnt mit `weg-manager.`, hat aber nicht die Form `weg-manager.<typ>/v<n>`. | Unter „Notizen mit Problemen“. |
| `frontmatter.unreadable` | Das Frontmatter ist kein gültiges YAML; nur im Wurzelordner erkennbar. | Unter „Notizen mit Problemen“. |
