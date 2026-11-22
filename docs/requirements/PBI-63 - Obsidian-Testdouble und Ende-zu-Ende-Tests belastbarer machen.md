---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 91000
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

# PBI-63 · Obsidian-Testdouble und Ende-zu-Ende-Tests belastbarer machen

**Planungsstand:** Befunde des Test-Reviews, bereit zur Umsetzung · **Bezug:** `docs/plans/pre-feature-improvement-plan.md` (Abschnitt 8, Review-Runde vom 22.11.2026)

## User Story

Als Beirat möchte ich, dass die automatischen Prüfungen das echte Obsidian richtig nachbilden, damit ein Fehler nicht erst in meinem Vault auffällt.

## Ausgangslage

Befunde des Test-Reviews (B2, B3, B4). Ein Schritt für die Tests der Randschichten (`bootstrap`, `mount`, Einstellungsspiegel, Plattformnamen), einen zweiten, nicht blockierenden Mutationslauf und die Zeitannahmen in Unit- und DOM-Tests ist am 22.11.2026 in Arbeit. Diese Note deckt ab, was jener Schritt nicht anfasst.

**Wo das Testdouble mehr verspricht, als geprüft ist** (`tests/support/obsidian/`):

1. **Frontmatter und YAML.** `tests/support/obsidian/yaml.ts` ist nach eigenem Kommentar strenger als Obsidian: verschachtelte Maps, Block-Skalare, zitierte Listeneinträge und Anker lösen einen Fehler aus. Die gemeinsamen Szenarien prüfen nur flache Werte und Listen. Wie Cache und Lesepfade mit Dataview-artigen verschachtelten Eigenschaften, mehrzeiligen Texten, Wikilinks, `tags`/`aliases` und doppelten Schlüsseln umgehen, ist gegen das echte Obsidian nirgends geprüft. Seit PR #29 schreibt das Plugin zeilenweise über `vault.process`; die Lesepfade bleiben betroffen.
2. **Zeit und Reihenfolge.** Das Double indexiert genau einen Makrotask nach einem Schreibvorgang. Das echte Obsidian indexiert in einem Worker und ordnet von Lauf zu Lauf anders. Die Szenarien warten im Double 5 ms und in der App 400 ms; ein Ereignis nach 100 ms sieht die Double-Seite nicht. Änderungen von außen feuern im Double sofort, Obsidians Dateiwächter ist entprellt.
3. **Arbeitsbereich und Ansichten.** `Workspace`, `WorkspaceLeaf` und `Plugin` haben kein eigenes gemeinsames Szenario. Nicht nachgebildet: verzögert geladene Ansichten (Hintergrund-Tabs ab Obsidian 1.7), die Wiederverwendung durch `getLeaf(false)`, das Wiederherstellen des Layouts, Ordner-Umbenennungen. Das `Setting`-Double ist nur für die Auswahl des Log-Levels und den Schreibschutz gegen das echte Obsidian geprüft.

Dazu: Plugin und Double sind über Casts verbunden (im Review 28 `as never` und 39 `as unknown as` in den Tests); eine Abweichung vom echten `obsidian.d.ts` sieht die Typprüfung nicht. Der Vertrag des Notizspeichers (rund 39 Fälle) läuft nur gegen das Double und den Speicher im Arbeitsspeicher; im echten Obsidian läuft ein Szenario mit 17 Schritten.

**Feste Wartezeiten in e2e.** Zum Review standen zehn feste Pausen in den Specs (`browser.pause(300)` und `pause(500)`, dazu `setTimeout(200)` in `tests/e2e/support.ts`); am 22.11.2026 findet die Suche nach `pause(` 13 Stellen unter `tests/e2e/`. Pausen vor einer Prüfung „nichts wurde geschrieben“ bestehen leer, wenn die Wirkung später käme; Pausen vor einer Änderung sind ein Wettlauf mit dem Indexer. `tests/e2e/specs/vault-ready.e2e.ts` prüft außerdem, wie schnell Obsidian auf dieser Maschine ist (weniger als 2000 Einträge beim Layout, `resolved` mit unvollständigem Cache); ein schneller Runner könnte das umdrehen.

**Wörtliche Sätze.** Etwa sechs e2e-Prüfungen halten deutsche Sätze wörtlich fest. Die DOM-Tests der Gemeinschaften prüfen seit PR #34 über den typisierten Katalog.

## Akzeptanzkriterien

1. Ein Szenario „Notiz mit schwierigem Frontmatter“ (verschachtelte Eigenschaften, mehrzeilige Texte, Wikilinks, `tags`/`aliases`, Kommentare, doppelte Schlüssel) läuft mit denselben Erwartungen im Double und im echten Obsidian. Weicht das Double ab, wird das Double angepasst, nicht die Erwartung.
2. Ein Szenario für Tabs und Ansichten läuft auf beiden Seiten, einschließlich eines verzögert geladenen Hintergrund-Tabs und des Öffnens einer Route dorthin.
3. Die gemeinsamen Szenarien halten die Reihenfolge der Ereignisse fest, nicht nur ihre Menge; ein Szenario „Schreiben direkt nach dem Anlegen“ kommt dazu.
4. Je Klasse des Doubles prüft ein `satisfies Pick<…>` gegen `obsidian.d.ts` die genutzten Signaturen; die Zahl der Casts in den Tests sinkt.
5. Die Lese- und Schreibfälle des Notizspeicher-Vertrags laufen über das Probe-Plugin auch im echten Obsidian.
6. Keine e2e-Spec wartet eine feste Zeit auf eine Wirkung: Jede Pause ist durch ein Warten auf die beobachtbare Bedingung ersetzt; Negativprüfungen warten auf ein positives Zeichen danach. Die maschinenabhängigen Prüfungen in `vault-ready.e2e.ts` werden aufgezeichnet und berichtet statt als Bedingung geprüft.
7. Wörtliche Sätze stehen nur noch in `language.e2e.ts` und in höchstens zwei weiteren Specs; die übrigen prüfen über den Katalog.
8. `npm run verify` endet mit Exit 0, und die e2e-Suite besteht fünfmal hintereinander.

## Herkunft und Bezüge

Test-Review vom 22.11.2026, Befunde B2, B3 und B4. `docs/engineering/testing.md`. [[PBI-52 - Notizspeicher für Vault-Notizen bereitstellen]].

## Kommentare

- 22.11.2026: Angelegt aus der Review-Runde nach dem Durchstich (vier unabhängige Reviews am Stand `0cb8292`). Die Befunde stammen aus den Review-Berichten und den Berichten der Umsetzer; nichts davon ist bisher umgesetzt, soweit die Note es nicht anders sagt.
- 22.11.2026: Die Kriterien 6 bis 8 sind erfüllt (e2e-Specs ohne feste Wartezeit auf eine Wirkung bis auf die begründete Sekunde in `no-network.e2e.ts`, maschinenabhängige Beobachtungen in `vault-ready.e2e.ts` aufgezeichnet statt geprüft, Texte über den Katalog, e2e-Suite mehrfach hintereinander grün); die Kriterien 1 bis 5 sind offen.
