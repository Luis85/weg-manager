---
type: Decision
id: K-18
status: vorgeschlagen
date: 2026-11-21
source: "Prüfung der Notes außerhalb des Product Backlogs am 21.11.2026"
---

# K-18 · Fachnotes außerhalb des Backlogs einheitlich führen

## Entscheidung

Vorschlag: Alle Notes, die nicht über das Product Backlog geführt werden, folgen einem gemeinsamen Grundschema für Kennung, Dateiname, Typ, Status und Verknüpfungen. Ein Prüfskript hält das Schema ein. Die Umstellung erfolgt in drei Stufen, damit zu keinem Zeitpunkt Links brechen.

## Geltung

Betrifft rund 130 Notes in `docs/design/`, `docs/research/`, `docs/jobs-to-be-done/`, `docs/decisions/`, `docs/business-rules/`, `docs/hypothesis/`, `docs/plans/` sowie Produktvision und PRD. Epics, Features, PBIs und Releases bleiben unverändert, weil das Backlog-Plugin ihre Struktur vorgibt. Die Note ist ein Vorschlag und ändert noch keine Konvention in [[README_DOCS]].

## Kontext und Begründung

Die Prüfung am 21.11.2026 hat gezeigt, dass die Notes außerhalb des Backlogs ohne gemeinsames Schema gewachsen sind:

| Befund | Beispiel |
| --- | --- |
| Zehn verschiedene Statuswerte, teils mit gleicher Bedeutung | `entwurf` und `im-entwurf`; dazu `research`, `arbeitsstand`, `pilot`, `geprueft-mit-synthetischen-daten` |
| Typen in gemischter Sprache und Schreibweise | `Productvision`, `ProductRequirementsDocument`, `ResearchSynthese`, `Quellenverzeichnis`, `Entscheidungsregister`, `Prototyp`, `DesignSpec` |
| Fehlende Kennungen | 16 von 18 Research-Notes, ACT-01 bis ACT-07, Vision und PRD haben kein `id` |
| Uneinheitliche Dateinamen | `ACT-01-Beirat` neben `ACT-08 - Wohnungsverwalter`; `00-Research-Synthese` neben `UI-Research - …`; Handoff-Kennungen HO-xx nur im Frontmatter |
| Lokale Kennungen kollidieren | A1–A7 und E1–E5 in [[Konzept - Vorbereitung ohne KI]], D1–D9 und M1–M5 als Bildschirmkennungen, H-01 bis H-08 in [[05-Annahmen-und-Entscheidungen]] mit anderem Inhalt als unter `docs/hypothesis` |
| Veraltete Notes ohne Kennzeichnung | Research vom 15.11.2026 beschreibt noch den Handwerker-Zuschnitt; inzwischen mit `status: historisch` und Geltungshinweisen behoben |
| Verknüpfungen nur in eine Richtung | Neue Jobs und Interviews waren von keiner Produkt-Note aus erreichbar; Pages tragen kein `actors` |
| Notes in keiner View | Produktvision, PRD, `docs/plans/`, `docs/engineering/`, `docs/adr/`; die View „Design Foundations“ zeigt zugleich PNG-, CSS- und HTML-Dateien |

Für PBIs lösen Plugin und Konventionen diese Fragen bereits. Für die übrigen Notes fehlt eine solche Grundlage. Je mehr Research, Jobs und Interviews entstehen, desto teurer wird das.

## Vorschlag im Einzelnen

### 1. Gemeinsames Grundschema

Jede Fachnote trägt mindestens diese Properties:

```yaml
type: Research          # kanonischer Typ, siehe 2.
id: R-07                # stabile Kennung mit Präfix, siehe 3.
status: entwurf         # Vokabular je Typ, siehe 4.
scope: mvp              # mvp | spaeter | gemischt | uebergreifend
date: 2026-11-21        # letzte inhaltliche Änderung
```

Optional, aber in fester Schreibweise: `version`, `kind`, `superseded-by`, und die Verknüpfungslisten `actors`, `entities`, `requirements`, `decisions`, `hypotheses`, `business-rules`, `jobs`, `research`, `pages`, `user-flows`. Alle Verknüpfungen sind zitierte Wikilinks mit vollem Dateinamen, wie heute bei PBIs.

`scope: uebergreifend` ersetzt den heute verwendeten Leerwert `""` für Notes wie den Jobkatalog, die nicht einem Release-Zuschnitt angehören.

### 2. Kanonische Typen

Ein Typ pro Notenart, englisch in PascalCase wie die vorhandenen `Actor`, `Entity`, `Decision`. Untertypen über `kind`, nicht über neue Typen.

| Heute | Vorschlag |
| --- | --- |
| `Productvision` | `Vision` |
| `ProductRequirementsDocument` | `PRD` |
| `Research`, `ResearchSynthese`, `Quellenverzeichnis`, `Entscheidungsregister` | `Research` mit `kind: studie`, `synthese`, `quellen`, `register` |
| `DesignSpec` | `DesignSpec` (bleibt) |
| Skill-Evaluation (heute `Research`) | `Research` mit `kind: evaluation` |
| Interviewleitfaden, später Interviewprotokolle | `Research` mit `kind: leitfaden` bzw. `kind: interview` |
| `Prototyp` | `Prototype` |
| `JobsToBeDone`, `Actor`, `Entity`, `Page`, `Sitemap`, `UserFlow`, `Handoff`, `Decision`, `BusinessRule`, `Hypothesis` | bleiben |

### 3. Kennungen und Dateinamen

Jede Fachnote bekommt eine Kennung, und der Dateiname folgt überall `<ID> - <Titel>.md`. Registrierte Präfixe:

| Präfix | Notenart | Präfix | Notenart |
| --- | --- | --- | --- |
| `ACT-` | Akteur | `K-` | Entscheidung |
| `ENT-` | Entität | `DF-` | Fachregel |
| `VIEW-` | Ansicht | `H-` | Hypothese |
| `FLOW-` | User-Flow | `JTBD-` | Jobkatalog |
| `HO-` | Handoff | `J-` | einzelner Job, nur innerhalb eines Katalogs |
| `UI-DESIGN-` | Design-Spezifikation | `R-` | Research-Note |
| `INT-` | Interviewprotokoll | `FF-` | Forschungsfrage, nur innerhalb eines Leitfadens |

Kennungen, die nur innerhalb einer Note gelten, bekommen ein eigenes Präfix statt freier Buchstaben-Ziffern-Kombinationen (etwa `AN-1` statt A1 für Anlässe und `S-D1` statt D1 für Bildschirme). Die Liste der Präfixe gehört in [[README_DOCS]].

### 4. Statusvokabular je Lebenszyklus

| Notenart | Werte |
| --- | --- |
| Konzept- und Designnotes (Vision, PRD, Actor, Entity, Page, UserFlow, Handoff, DesignSpec, JobsToBeDone) | `entwurf` → `geprueft` → `festgelegt`, zusätzlich `historisch` |
| Research | `entwurf` → `aktuell`, zusätzlich `historisch` |
| Decision | `vorgeschlagen` → `im-entwurf` → `teilweise-festgelegt` → `festgelegt`, zusätzlich `verworfen` und `abgeloest` |
| Hypothesis | `ungeprueft` → `gestuetzt` oder `widerlegt` |
| BusinessRule | `entwurf` → `festgelegt` |

Besondere Prüfstände wie „mit synthetischen Daten geprüft“ stehen im Text, nicht im Status. Eine historische Note trägt `superseded-by` mit Verweis auf die maßgebliche Nachfolgerin und einen Geltungshinweis am Anfang. Historische Notes werden nicht gelöscht.

### 5. Ordnerschnitt

- `docs/research/` enthält Erkenntnisse: Studien, Quellen, Evaluationen, Interviewleitfäden und anonymisierte Interviewprotokolle (`docs/research/interviews/`, erst mit dem ersten Protokoll anlegen).
- Konzepte und Spezifikationen mit Produktvorgaben (heute `type: DesignSpec` in `docs/research/`: Datenkonzept, Integrationskonzept, Vorbereitung ohne KI, UI-Design-Leitlinien) ziehen nach `docs/design/konzepte/`. Damit bleibt `docs/research/` frei von Vorgaben, wie es [[README_DOCS]] beschreibt.
- `docs/jobs-to-be-done/` bleibt für Jobkataloge je Rolle; ein weiterer Katalog entsteht als Erstes für „Beirat im Viertel“.
- Rohnotizen aus Interviews mit möglichen personenbezogenen Daten bleiben in `docs/_intake/` und werden nicht versioniert.

### 6. Base Views

`Product Backlog.base` erhält Views nach Notenart statt nach Ordner und zeigt nur Markdown-Notes (`file.ext == "md"`):

| View | Inhalt |
| --- | --- |
| Grundlagen | `Vision`, `PRD` |
| Research | `type: Research`, gruppiert nach `kind`, historische Notes ausgeblendet oder getrennt |
| Jobs | `type: JobsToBeDone` |
| Design Foundations | Actor, Entity, Page, Sitemap, UserFlow, Handoff, DesignSpec, Prototype |
| Historisch | alle Notes mit `status: historisch` |

Die bestehenden Views „Business Rules“, „Decisions“ und „Hypothesis“ bleiben. Links auf „Design Foundations“ bleiben gültig, weil der Name erhalten bleibt.

### 7. Verknüpfungen in beide Richtungen

Wie bei PBIs und Pages werden Verknüpfungen beidseitig gepflegt: Ein Job, der eine Hypothese berührt, steht in deren Note und umgekehrt. Interviewprotokolle verweisen auf Job-Kennungen. Hypothesen bekommen eine Property `jobs`, Akteure die Property `jobs` auf ihren Katalog.

### 8. Prüfskript

Ein Skript unter `scripts/` prüft bei jedem Commit:

- Pflicht-Properties und erlaubte Werte je Typ,
- eindeutige Kennungen und das Dateinamenmuster,
- auflösbare Wikilinks und relative Links; auf Build-Ausgaben wie `skills/dist/` wird nicht verlinkt, sondern mit Pfad und Build-Befehl verwiesen,
- keine Links in `docs/_intake/`,
- `superseded-by` bei `status: historisch`.

Es läuft lokal und in der CI, ändert keine Dateien und meldet nur. Ablage und Tests folgen den Konventionen unter `docs/engineering/`.

## Abgrenzung und betrachtete Alternative

- **Alles so lassen:** Der Aufwand wächst mit jeder neuen Research- und Interviewnote. Verwechslungen wie bei den doppelten H-Kennungen bleiben möglich.
- **Ein Schema nur dokumentieren, ohne Prüfung:** Die heutigen Abweichungen zeigen, dass dokumentierte Konventionen ohne Prüfung auseinanderlaufen.
- **Alle Notes in einen Ordner mit Typfilter:** Spart Ordnerentscheidungen, erschwert aber die Arbeit außerhalb von Obsidian, die [[K-14 - Markdown und Frontmatter als offene Datengrundlage]] ausdrücklich vorsieht.

## Auswirkungen

Vorgeschlagene Reihenfolge, jede Stufe einzeln umsetzbar:

1. **Ohne Umbenennung:** Prüfskript, Statusvokabular, kanonische Typen und fehlende Kennungen im Frontmatter ergänzen; Präfixliste in [[README_DOCS]] aufnehmen; Views auf Markdown begrenzen. Kein Link bricht.
2. **Umbenennung:** ACT-01 bis ACT-07 und Research-Notes auf `<ID> - <Titel>` umstellen; lokale Kennungen in Konzept- und Designnotes mit Präfix versehen. Umbenennen in Obsidian selbst, damit Links automatisch angepasst werden, oder per Skript mit Linkprüfung.
3. **Ordner und Views:** DesignSpec-Notes nach `docs/design/konzepte/` verschieben, Views nach Notenart einrichten, beidseitige Verknüpfungen nachziehen.

Aufwand je Stufe: etwa ein halber bis ein Arbeitstag, Stufe 2 abhängig davon, ob Obsidian zum Umbenennen genutzt wird.

## Offene Punkte und Überprüfung

- O-18a: Typen auf Englisch belassen oder alle auf Deutsch umstellen? Der Vorschlag folgt der Mehrheit der vorhandenen Typen.
- O-18b: Soll das Prüfskript Commits blockieren oder nur warnen?
- O-18c: Sollen Interviewprotokolle überhaupt versioniert werden, oder nur ihre Auswertung im Jobkatalog?
- O-18d: Reihenfolge und Zeitpunkt der Stufen gegenüber der laufenden Umsetzung des MVP.

## Verknüpfungen

[[README_DOCS]] · [[K-14 - Markdown und Frontmatter als offene Datengrundlage]] · [[JTBD - Verwaltungsbeirat]] · [[Interviewleitfaden - Beirats-Interviews]] · [[Product Backlog.base#Design Foundations]] · [[Product Backlog.base#Decisions]].
