---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 94000
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
triage: ready-for-human
---

# PBI-66 · Erscheinungsbild und Barrierefreiheit in Obsidian abschließen

**Planungsstand:** Restpunkte aus dem UX-Review; die manuellen Prüfungen braucht ein Mensch · **Bezug:** `docs/plans/pre-feature-improvement-plan.md` (Abschnitt 8, Review-Runde vom 22.11.2026)

## User Story

Als Beirat möchte ich die Gemeinschaften mit Tastatur, Screenreader und meinem Theme bedienen können, damit das Plugin für mich so zugänglich ist wie Obsidian selbst.

## Ausgangslage

Die Befunde des UX-Reviews zu Kontrast, Rücksetzen der Grundstile, langen Namen, Fokus, Modalität, Ansagen, Auswahl und Texten sind mit PR #31 und PR #34 umgesetzt und im echten Obsidian 1.15.1 gemessen. Offen sind:

**Von einem Menschen zu prüfen (mit der Vorabversion 0.2.0):**

- Bedienung mit einem echten Screenreader. Geprüft ist bisher nur, was Tests messen können (Rollen, Namen, Fokusziele, `aria-modal`, `inert`). **Als nicht geplant geschlossen am 22.11.2026 (viertes Interview):** ohne Prüfer entfällt die Prüfung; die automatischen Prüfungen genügen vorerst.
- Obsidians eigener Zoom. Die Aussage „bei 200 % erreichbar“ beruht auf Bildschirmfotos mit doppelter Pixeldichte.
- Community-Themes. Die Farbformeln nutzen nur Variablen des Hosts, getestet sind aber nur Obsidians helles und dunkles Standard-Theme.
- Die Liste in `docs/engineering/testing.md` (Abschnitt „Manual checks in Obsidian“).

**Technische Reste:**

- **Fokusring an Eingabefeldern.** Obsidians eigener grauer Ring (`input:focus`, etwa 1,87:1) erscheint neben dem 3 px breiten Akzent-Umriss des Plugins. Der Umriss erreicht etwa 3,4 bis 4:1 (im Review gemessen, vom Umsetzer aus den berechneten Farben nachgerechnet); `appearance.e2e.ts` misst bisher nur das Feld in Ruhe. Obsidians Regeln für Hover und gedrückte Felder greifen ebenfalls noch.
- **Zwei ähnliche Farben.** `teal` und `cyan` unterscheiden sich fast nur im Farbton (Helligkeitsverhältnis 1,02 hell, 1,44 dunkel). Das Kürzel trägt die Bedeutung, zwei benachbarte Abzeichen sehen bei Farbfehlsichtigkeit aber gleich aus. **Entschieden am 22.11.2026:** `cyan` wird durch `amber` (dunkles Gold) ersetzt, vor dem Tag 0.2.0. Eine Notiz, die noch `cyan` nennt, zeigt einen Hinweis und lässt sich neu speichern.
- **Silbentrennung.** Auf Linux hat Obsidians Electron kein Trennwörterbuch; lange Komposita brechen ohne Trennstrich um. Auf macOS und Windows ungeprüft.

**Kleine Punkte aus dem UX-Schritt (PR #34), bisher in keiner Note.** Sie sind im Bericht zu PR #34 nur als Stichworte genannt, ohne Entscheidung und ohne Korrektur; jeder ist zuerst am Bildschirm zu bestätigen:

- die Platzierung von „Löschen“ auf der Karte einer Gemeinschaft,
- die Größe der Auswahlknöpfe in der Konfliktansicht (13 px),
- der Status „Auswahl nötig“, der je geöffneter Ansicht angesagt wird.

**Dokumente, die nicht mehr stimmen:**

**Entschieden am 22.11.2026:** Die drei Handoff-Dokumente und die Archify-Diagramme werden vollständig auf den heutigen Stand gebracht, nicht nur als überholt markiert.

- `docs/design/handoff/02 - Komponenten.md` und `docs/design/handoff/03 - Ansichten, Navigation und Befehle.md` beschreiben einen `CommunityFilter` mit „Alle“ als Filter, „nie Bearbeitungskontext“. Umgesetzt und entschieden ist eine Auswahl ohne „Alle“ (ADR 0008).
- `docs/design/handoff/01 - Design Tokens.md` sieht eine neutrale Primärfarbe und einen eigenen Fokuswert vor. Entschieden am 22.11.2026: Obsidians Akzentfarbe bleibt, für Kontrast abgedunkelt.
- Die Archify-Diagramme unter `docs/archify/` zeigen noch die entfernte Demo.
- Kommentare in `.github/workflows/ci.yml` und `configs/stryker.config.mjs` nennen „blueprint Task“; der Blueprint liegt im Archiv.

## Akzeptanzkriterien

1. Ein Mensch hat die manuelle Prüfliste mit der Vorabversion durchlaufen (Zoom, ein Community-Theme, weitere Plugins; die Bedienung nur mit der Tastatur und der Screenreader sind am 22.11.2026 als nicht geplant geschlossen); die Ergebnisse stehen als Kommentar in dieser Note, Fehler als eigene Notes.
2. Bei fokussiertem Eingabefeld ist genau ein Fokuszeichen sichtbar, und es erreicht 3:1 gegen Feld und Hintergrund; `appearance.e2e.ts` misst das fokussierte Feld in hell und dunkel.
3. Für `teal` und `cyan` ist entschieden, ob eine der Farben ersetzt wird. Eine Änderung braucht einen Nachtrag im Dateivertrag, weil der Farbname in den Notizen steht.
4. Die Handoff-Notes 01, 02 und 03 beschreiben die Auswahl ohne „Alle“ und die Akzentfarbe, oder sie verweisen auf ADR 0008 und die Entscheidung vom 22.11.2026.
5. Die Diagramme unter `docs/archify/` zeigen den Stand mit Modulen, Notizspeicher und Gemeinschaften; die beiden Kommentare nennen keine Blueprint-Aufgabe mehr.

## Offene Entscheidung

Ob `cyan` ersetzt wird (Kriterium 3).

## Herkunft und Bezüge

UX-Review vom 22.11.2026 (Abschnitte C und D), Berichte zu PR #31 und PR #34. [[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]], ADR `docs/adr/0008-navigation-and-view-state.md`.

## Kommentare

- 22.11.2026: Angelegt aus der Review-Runde nach dem Durchstich (vier unabhängige Reviews am Stand `0cb8292`). Die Befunde stammen aus den Review-Berichten und den Berichten der Umsetzer; nichts davon ist bisher umgesetzt, soweit die Note es nicht anders sagt.
- 22.11.2026 (Interview nach der Review-Runde): Entscheidungen eingetragen: `cyan` wird `amber`; Handoff-Dokumente und Diagramme werden neu geschrieben. Drei kleine UX-Punkte aus PR #34 ergänzt. Die manuellen Prüfungen bleiben beim Produktverantwortlichen, deshalb weiter `ready-for-human`.
- 22.11.2026: `cyan` ist durch `amber` ersetzt (PR #42); im hellen Theme wirkt der Farbton wie dunkle Bronze, weil weiße Schrift bei 4,5:1 eine dunkle Fläche verlangt. Der Produktverantwortliche sieht ihn in der manuellen Prüfung von 0.2.0 an. Die Handoff-Dokumente 00 bis 09 und das Ablaufdiagramm der Ereignisse sind auf den heutigen Stand gebracht; das Architekturdiagramm folgt nach dem Modulmanifest. Offen bleiben: die manuellen Prüfungen, der Fokusring an Eingabefeldern, die Silbentrennung, die drei kleinen UX-Punkte.
- 22.11.2026 (zweites Interview am selben Tag): Schrift entschieden: die des Hosts, Geist entfällt (O-D12, Nachtrag in K-13). Von den manuellen Prüfungen übernimmt der Produktverantwortliche mit 0.2.0 unter Windows: sein Theme hell und dunkel und Obsidians Zoom. Offen bleiben mangels Prüfer: Bedienung nur mit der Tastatur, Screenreader, Zusammenspiel mit anderen Plugins und vorhandenen Notizen.
- 22.11.2026 (viertes Interview): Die beiden manuellen Prüfungen der Barrierefreiheit, für die es keinen Prüfer gibt, sind als nicht geplant geschlossen: die Bedienung nur mit der Tastatur und die Bedienung mit einem echten Screenreader. Die automatischen Prüfungen (Rollen, Namen, Fokusziele, `aria-modal`, `inert`, Kontrast) gelten vorerst als ausreichend. Alles andere in dieser Note bleibt offen und die Note bleibt `ready-for-human`, ohne `finished`: Obsidians Zoom und das Theme des Produktverantwortlichen mit 0.2.0 unter Windows (Kriterium 1), das Zusammenspiel mit anderen Plugins und vorhandenen Notizen (Kriterium 1), Community-Themes, die Liste in `docs/engineering/testing.md`, der Fokusring an Eingabefeldern (Kriterium 2), die Silbentrennung, die drei kleinen UX-Punkte aus PR #34, und was die Note zu den Dokumenten (Kriterien 4 und 5) bisher nicht als erledigt vermerkt.
