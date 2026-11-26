---
type: FileContract
id: DV-06
contract: weg-manager.week/v1
status: gültig
entities:
  - "[[docs/entities/ENT-12 - To-do]]"
requirements:
  - "[[PBI-13 - Aktuelle Wochenlage öffnen]]"
---

# DV-06 · Dateivertrag Woche (`weg-manager.week/v1`)

Eine Wochennotiz hält die Lage einer Woche so, wie der Beirat sie bearbeitet hat. Sie ist genau eine Markdown-Notiz mit YAML-Frontmatter; der Lagetext steht im Text der Notiz ([[K-14 - Markdown und Frontmatter als offene Datengrundlage]], [[DF-22 - Notizen als maßgeblicher Datenbestand]]). Die berechnete Lage (Sätze, Fristen, To-dos, Grundlage) speichert das Plugin nie: Es berechnet sie beim Öffnen der Ansicht Woche aus Vorgängen, To-dos und Quellen ([[K-04 - Wochenpaket beim Einstieg aktualisieren]]). Entschieden vom Produktverantwortlichen am 26.11.2026 ([[PBI-13 - Aktuelle Wochenlage öffnen]], Kommentare).

## Beispiel

```yaml
---
schema: weg-manager.week/v1
id: week-2a3b4c5d-6e7f-4a8b-9c0d-1e2f3a4b5c6d
week_of: 2026-11-23
---
1 Vorgang ist überfällig: AW 005.
Die Firma für die Tür meldet sich am Freitag.
```

## Schlüssel

| Schlüssel | Typ | Regel | Beispiel |
| --- | --- | --- | --- |
| `schema` | Text | Genau `weg-manager.week/v1`. | `weg-manager.week/v1` |
| `id` | Text | `week-` und eine UUID in Kleinbuchstaben. Einmal vergeben, nie geändert. | `week-2a3b…` |
| `week_of` | Datum | `JJJJ-MM-TT`: der erste Tag der Woche, nach der Einstellung „Wochenbeginn“. | `2026-11-23` |

## Woche und Einstellungen

- Die Woche beginnt am Tag der Einstellung „Wochenbeginn“ (Vorgabe Montag) und enthält heute; „heute“ zählt in Europe/Berlin.
- Fristen sind die Termine offener und ungeklärter Vorgänge und die nächsten Tage offener und wartender To-dos bis heute + 14 Tage, überfällige zuerst. Akut ist ein Termin bis zur Einstellung „Frist für akute Probleme“ (Vorgabe 2 Tage).
- Das Zeitziel (Vorgabe 60 Minuten) und die Anzahl regulärer Entscheidungen (Vorgabe 7, [[K-05 - Sieben reguläre Entscheidungen mit sichtbarem Überlauf]]) stehen im Einstellungs-Tab; die Entscheidungsauswahl folgt mit [[PBI-14 - Entscheidungsauswahl und Überlauf prüfen]].

## Ablage und Dateiname

- Neue Wochennotizen legt das Plugin in `<Wurzelordner>/Wochen/` an, eine je Woche, benannt nach `week_of`: `2026-11-23.md`.
- Eine Wochennotiz wird nie gelöscht.

## Was das Plugin schreibt

- Beim ersten Speichern der Lage: `schema`, `id`, `week_of` und den Text.
- Beim weiteren Speichern ersetzt es den ganzen Text der Notiz, aber nur, wenn er noch der ist, den das Formular geladen hat. Wurde er inzwischen außerhalb des Plugins geändert, schreibt es nichts und meldet „Lage nicht gespeichert“; der Mensch öffnet die Lage erneut.
- Das Frontmatter ändert es danach nicht mehr. Unbekannte Schlüssel und Kommentare bleiben.

## Probleme

| Problem (Code) | Wann | Was das Plugin tut |
| --- | --- | --- |
| `field.missing`, `field.date` | `week_of` fehlt oder ist kein gültiger Tag. | Die Notiz zählt zu keiner Woche; sie erscheint unter Datenprobleme. |
| `schema.newer`, `id.*`, `schema.malformed`, `frontmatter.unreadable` | Wie bei [[DV-01 - Gemeinschaft v1]]. | Wie dort. |
