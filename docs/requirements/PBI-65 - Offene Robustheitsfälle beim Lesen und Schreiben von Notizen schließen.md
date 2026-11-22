---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 93000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-05-Obsidian]]"
release: ""
status: ""
started: ""
finished: ""
horizon: ""
start: ""
due: ""
risk: ""
priority: ""
assignee: ""
iteration: ""
entities: []
business-rules: []
decisions: []
hypotheses: []
pages: []
user-flows: []
dependsOn: []
triage: ready-for-agent
---

# PBI-65 · Offene Robustheitsfälle beim Lesen und Schreiben von Notizen schließen

**Planungsstand:** Entschieden am 22.11.2026; vier Punkte vor der Vorabversion 0.2.0, drei bleiben offen · **Bezug:** `docs/plans/pre-feature-improvement-plan.md` (Abschnitt 8, Review-Runde vom 22.11.2026)

## User Story

Als Beirat möchte ich, dass das Plugin auch in seltenen Lagen meines Vaults eine zutreffende Meldung zeigt und nichts verliert, damit ich nicht vor einem „Versuche es erneut“ stehe, das nie hilft.

## Ausgangslage

Die sieben nachgestellten Fehler des Korrektheits-Reviews sind mit PR #29 und PR #30 behoben. Offen sind diese Fälle; keiner ist ein nachgestellter Datenverlust.

1. **`VaultReady` ohne Rückfall.** Das Ereignis kommt erst, wenn jede Markdown-Datei einen Cache-Eintrag hat. Würde eine Datei nie indexiert, bliebe der Index stehen. Der Reviewer hat im echten Obsidian 1.15.1 keinen solchen Fall gefunden (Null-Byte, binäre `.md`, 30 MB, ausgeschlossene Dateien, Symlinks, Datei ohne Leserecht).
2. **Wurzelordner, der sich nur in der Schreibweise unterscheidet.** Besteht `weg manager/` und die Einstellung lautet `WEG Manager`, erkennt das Plugin den Ordner nicht. Auf Windows und macOS scheitert dann voraussichtlich jedes Anlegen mit „Folder already exists“ und der Meldung „Versuche es erneut“. Der Reviewer begründet das aus Obsidians Quelltext; auf Linux ist es nicht prüfbar. Bekannte Lücke aus [[PBI-52 - Notizspeicher für Vault-Notizen bereitstellen]].
3. **Lange Namen in Schriften mit drei Bytes je Zeichen.** Die Grenze von 100 Zeichen zählt UTF-16-Einheiten. 100 CJK-Zeichen ergeben einen Dateinamen von 300 Bytes; auf Linux und macOS liegt die Grenze bei 255 Bytes. Erwartet: Schreibfehler mit „Versuche es erneut“. Nicht nachgestellt.
4. **Datei gelöscht, während Obsidian sie noch führt.** `vault.process` lehnt dann mit ENOENT ab, `getFileByPath` liefert die Datei aber noch. Das Ergebnis ist ein Schreibfehler statt „Notiz nicht gefunden“; ein zweiter Versuch meldet es richtig. Vom Umsetzer von PR #29 hergeleitet, nicht nachgestellt.
5. **Kommentar am Zeilenende.** Schreibt das Plugin einen Schlüssel, der einen Kommentar in derselben Zeile trägt (`kind: WEG # Art`), geht dieser Kommentar verloren; die ganze Zeile wird ersetzt. Kommentare an anderen Stellen bleiben.
6. **Abgelehnte Schreibweisen (`layout`).** Seit PR #29 schreibt das Plugin nur, wenn Zeilenbearbeitung und YAML-Leser dasselbe Ergebnis sehen. Abgelehnt werden: ein Abschluss `----` oder `---` mit Leerzeichen dahinter (Obsidian liest beides), ein Block in Flow-Schreibweise `{a: 1}`, Anker auf der bearbeiteten Zeile, Schlüssel, die YAML anders liest als sie geschrieben sind (`01:`, `1.10:`, `~:`), Schlüssel mit `-`, `?` oder `:` am Anfang, `"k":v` ohne Leerzeichen, Fortsetzungszeilen in Spalte 0. Die Meldung sagt, wie die Eigenschaften zu schreiben sind. Ein Speichern, das nichts ändert, gelingt auch bei diesen Notizen.
7. **Meldung nach geschlossener Ansicht.** Scheitert das Speichern der Einstellungen, nachdem die Ansicht geschlossen wurde, sagt die Meldung „Deine Eingabe ist erhalten. Speichere erneut.“ Das stimmt dann nicht mehr.

## Akzeptanzkriterien

1. Für `VaultReady` ist entschieden und umgesetzt, was nach einer Frist ohne vollständigen Cache geschieht (Vorschlag: Index mit dem vorhandenen Stand aufbauen und die Zahl der fehlenden Dateien einmal protokollieren, ohne Pfade); ein Test deckt den Fall mit einer nie indexierten Datei ab.
2. Der Wurzelordner wird unabhängig von Groß- und Kleinschreibung gefunden (Vergleich wie bei Namenskonflikten: NFC, dann Kleinschreibung), oder das Anlegen meldet den Konflikt zutreffend statt als Schreibfehler. Die Prüfung auf Windows oder macOS ist als manueller Punkt festgehalten.
3. Die Namensregel begrenzt den Dateinamen auf 255 Bytes in UTF-8 einschließlich Endung und Konflikt-Zusatz; ein zu langer Name ist ein Hinweis am Feld, kein Schreibfehler.
4. Eine während des Schreibens gelöschte Notiz meldet „Notiz nicht gefunden“, soweit sich der Fall im Double nachstellen lässt; sonst ist begründet, warum er bleibt.
5. Für die abgelehnten Schreibweisen ist entschieden, welche unterstützt werden; für die übrigen bleibt die Meldung. Der verlorene Zeilenkommentar ist entweder erhalten oder im Dateivertrag (`docs/contracts/`) als Regel genannt.
6. Die Meldung nach geschlossener Ansicht sagt, was zutrifft.
7. Jede Änderung beginnt mit einem scheiternden Test; `npm run verify` und die e2e-Suite bestehen.

## Entscheidungen (22.11.2026)

- **Abgelehnte Schreibweisen (Punkt 6):** Das Plugin lernt nur die beiden Abschlusszeilen, die Obsidian liest: `---` mit Leerzeichen dahinter und `----`. Flow-Schreibweise, Anker und ungewöhnliche Schlüssel bleiben abgelehnt; die Meldung bleibt.
- **Kommentar am Zeilenende (Punkt 5):** Der Kommentar bleibt erhalten; der neue Wert steht davor.
- **Vor dem Tag 0.2.0** werden umgesetzt: die beiden Punkte oben, der Wurzelordner in anderer Schreibweise (Punkt 2) und die Grenze von 255 Bytes für Dateinamen (Punkt 3). Diese beiden können einen echten Vault treffen.
- **Im Backlog bleiben:** `VaultReady` ohne Rückfall (Punkt 1), die Meldung für eine während des Speicherns gelöschte Notiz (Punkt 4) und die Meldung nach geschlossener Ansicht (Punkt 7). Keiner verliert Daten.

## Herkunft und Bezüge

Korrektheits-Review vom 22.11.2026 (Verdachtsfälle), Berichte zu PR #29 und PR #30, „Not done“ im Plan. ADR `docs/adr/0007-vault-data-access.md`, `docs/contracts/DV-01 - Gemeinschaft v1.md`.

## Kommentare

- 22.11.2026: Angelegt aus der Review-Runde nach dem Durchstich (vier unabhängige Reviews am Stand `0cb8292`). Die Befunde stammen aus den Review-Berichten und den Berichten der Umsetzer; nichts davon ist bisher umgesetzt, soweit die Note es nicht anders sagt.
- 22.11.2026 (Interview nach der Review-Runde): Entscheidungen eingetragen; `triage` auf `ready-for-agent`. Kriterien 2, 3 und 5 vor dem Tag 0.2.0; Kriterien 1, 4 und 6 bleiben offen.
