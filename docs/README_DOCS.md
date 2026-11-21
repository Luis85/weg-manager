# Dokumentationsstruktur

Die Produktkonzeption wird in Obsidian als verknüpfte Markdown-Notes bearbeitet. Dieses Dokument ist die einzige README unter `docs`. In Unterordnern werden keine README-, Inhaltsverzeichnis- oder Übersichtsnotes als Ersatz angelegt. Zusätzliche Base Views entstehen bei Bedarf; einzelne Notes und ihre Properties bilden die Grundlage.

## Ordner und Inhalte

| Ort                     | Inhalt und Zweck                                                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/`                 | [Produktvision](01-Produktvision.md), [MVP-PRD](02-MVP-PRD.md) und diese Ordnerübersicht. Vision beschreibt Richtung und Nutzen, das PRD Umfang und Abnahme.                    |
| `docs/_intake/`         | Temporärer Eingang für Informationen und erste Auswertungen. Git-ignoriert und regelmäßig geleert; kein dauerhaftes Linkziel für Konzeptnotes.                                  |
| `docs/requirements/`    | Epics, Features und User Stories als PBIs. Hierarchie durch `parent`, nicht durch Unterordner. Querschnittliche Fähigkeiten und nichtfunktionale Anforderungen gehören zu E-07. |
| `docs/design/`          | Fachliche Modellierung und vorbereitende Untersuchung; noch kein technisches Implementierungsschema.                                                                            |
| `docs/design/actors/`   | Beteiligte menschliche Rollen und externe Systeme. `type: Actor`, Unterscheidung über `kind: Human` oder `kind: System`.                                                        |
| `docs/design/entities/` | Fachliche Informationsobjekte mit Angaben, Beziehungen und Regeln. `type: Entity`; `scope` unterscheidet MVP und späteren Ausbau.                                               |
| `docs/design/research/` | Recherche, Quellen und Untersuchungen zur fachlichen und technischen Einordnung. Ergebnisse sind nicht automatisch Produktvorgaben.                                             |
| `docs/design/sitemap/` | Benötigte MVP-Ansichten als `type: Page`, mit Navigation, Zuständen, NuxtUI-Zuordnung, vollständigen fachlichen Verweisen und eingebetteten Desktop-/Mobile-Mockups (Mobile: Ausbau nach dem MVP). |
| `docs/design/sitemap/assets/` | Generierte statische PNG-Reviewboards, Bildschirmfotos des klickbaren Prototyps (`v2-P-*`) und dokumentierte Bildprompts; keine Implementierungsscreenshots oder App-Ressourcen. |
| `docs/design/prototype/` | Klickbarer HTML-Prototyp mit synthetischen Daten und seine Standnote; bei Abweichung maßgeblich vor älteren Mockups, nachrangig zu Regeln, PBIs und Handoff. |
| `docs/design/handoff/` | Umsetzungspaket für die Implementierung: Tokens, Komponenten, Navigation, Zustände, Datenbindung, Texte, Plattform, Abnahme und offene Punkte. |
| `docs/design/user-flows/` | Abläufe als `type: UserFlow` mit Mermaid-Diagrammen, Page-Verweisen, Zustandsübergängen, Abbruch- und Fehlerpfaden. |
| `docs/business-rules/`  | Einzelne fachliche Regeln und Abnahmebeispiele. `type: BusinessRule`, stabile Kennung, Status und Geltungsbereich; keine Backlog-Arbeitselemente.                               |
| `docs/decisions/`       | Einzelne Produkt- und Konzeptentscheidungen mit Begründung, Auswirkungen und offenen Punkten. `type: Decision`; Status trennt Vorschlag und Festlegung.                         |
| `docs/hypothesis/`      | Prüffähige Annahmen mit Herkunft, vorgeschlagener Untersuchung und Evidenzgrenzen. `type: Hypothesis`; ein ungeprüfter Nutzen wird nicht als bewiesen dargestellt.              |
| `docs/releases/`        | Geplante Releases als `type: Release`. Anforderungen werden explizit über `release` zugeordnet; die Zugehörigkeit ist keine Fertigmeldung.                                      |
| `docs/agents/`          | Konfiguration für die Engineering-Skills unter `.claude/skills/` (Issue Tracker, Triage-Labels, Domain Docs), eingebunden über `AGENTS.md`. Agentenkonfiguration, keine Konzeptnotes; ohne `type`, Backlog-Eltern oder Ränge. |
| `docs/contracts/`       | Dateiverträge der Fachnotizen, die das Plugin liest und schreibt, als `type: FileContract`: je Notiztyp und Version eine deutsche Seite `DV-xx - <Typ> v<n>` mit Schlüsseln, Regeln, Beispielen und Problemen; Schlüssel und Codes englisch (ADR 0007). Maßgeblich für Menschen und Agenten, die Notizen ohne Plugin bearbeiten. |
| `docs/adr/`             | Technische Architekturentscheidungen des Plugins (ADR, englisch), z. B. Abhängigkeitsstand. Getrennt von den Produktentscheidungen in `docs/decisions/`. |
| `docs/engineering/`     | Entwicklerdokumentation des Plugins (englisch): Architektur, Features hinzufügen, Tests, Fehlerbehandlung, Release, GitHub-Einrichtung. |
| `docs/plans/`           | Umsetzungspläne für Agentenläufe, die noch gelten (derzeit der Verbesserungsplan vor den Fachfeatures). Arbeitsstand, keine Produktvorgabe. |
| `docs/plans/archive/`   | Abgelöste Pläne und Übergaben (Blueprint und Handoff der Plugin-Shell) als Geschichte. Jede Note nennt oben, dass sie ein historischer Stand ist, und verweist auf die geltende Dokumentation; der Inhalt wird nicht mehr gepflegt. |
| `docs/archify/`         | Mit Archify erzeugte Diagramme und Erklärseiten, je Auftrag ein Ordner `<typ>-<slug>-<zeitstempel>/` mit Quelle (`candidate.json` bzw. `candidate.archify.md`) und eigenständiger HTML-Datei. Anschauungsmaterial, keine Produktvorgabe. |

Die vorhandene [[Product Backlog.base]] enthält die aktuellen View-Konfigurationen. Navigation zu einer Sammlung erfolgt über eine tatsächlich vorhandene View, beispielsweise [[Product Backlog.base#Business Rules]]. `docs/release-notes/` ist dort als künftiger Ablageort für Release Notes konfiguriert, derzeit aber kein vorhandener Dokumentordner. Weitere konfigurierte Ablageorte stehen unten; sie werden erst bei tatsächlichem Bedarf angelegt.

## Benennung und Verknüpfung

Ordner sind keine Obsidian-Linkziele. Für Sammlungen werden die vorhandenen Base Views verwendet; einzelne Notes bleiben direkt verlinkt. View-Namen müssen exakt der Base-Konfiguration entsprechen. Bei Umbenennung einer View sind auch die Links anzupassen. Die View „Design Foundations“ umfasst Akteure, Entitäten und Research und gruppiert sie nach Ordner; ein Alias wie „Entitätsnotes“ setzt keinen zusätzlichen Filter.

| Sammlung | Base View |
| --- | --- |
| Anforderungen | [[Product Backlog.base#Backlog]] |
| Releases | [[Product Backlog.base#Release Management]] |
| Business Rules | [[Product Backlog.base#Business Rules]] |
| Entscheidungen | [[Product Backlog.base#Decisions]] |
| Hypothesen | [[Product Backlog.base#Hypothesis]] |
| Akteure, Entitäten und Research | [[Product Backlog.base#Design Foundations]] |


Der `_intake`-Ordner ist eine vorübergehende Ablage und wird regelmäßig geleert. Konzeptnotes verlinken weder direkt noch per Wikilink auf seinen Inhalt. Quellen werden mit Titel, Version beziehungsweise Datum benannt; relevante Anforderungen, Entscheidungen und Regeln müssen unabhängig davon in den Konzeptnotes verständlich bleiben.

- Notes erhalten verständliche Dateinamen, bei Anforderungen und Fachartefakten mit stabiler ID und Titel. Eine reine ID reicht für den als Titel verwendeten Dateinamen im Backlog nicht aus.
- Bei Verweisen auf Anforderungen und Fachnotes wird der verständliche Titel angezeigt. Keine reinen ID-Aliase wie `|PBI-11` verwenden; bevorzugt den vollständigen Dateinamen ohne Alias verlinken. Sprechende Aliase dürfen den Zusammenhang verdeutlichen, aber nicht auf eine bloße Kennung reduzieren.
- Wikilinks müssen auf vorhandene Notes zeigen. Bei Umbenennungen werden `parent`, `actors`, `entities`, `release` und weitere Verweise mitgepflegt. Ein Alias verändert nur die Beschriftung, nicht das Linkziel.
- `user-flows` verknüpft User Stories als YAML-Liste zitierter Wikilinks mit den relevanten `UserFlow`-Notes unter `docs/design/user-flows`, mit vollständigen Titeln. Die Zuordnung entspricht den expliziten `requirements`-Rückverweisen der Flow-Notes und umfasst auch deren unterstützende Bearbeitungs- und Fehlerpfade. FLOW-01 bildet den gesamten MVP ab; die weiteren Verweise führen zu den jeweiligen Teilabläufen. Beide Richtungen werden gemeinsam gepflegt. PBI-34 bis PBI-40 sowie PBI-43 bis PBI-45 erhalten vorerst `user-flows: []`, da ihre Ausbauabläufe noch nicht ausgearbeitet sind.
- `pages` verknüpft User Stories als YAML-Liste zitierter Wikilinks mit den relevanten Ansichten (`type: Page`, Dateien `VIEW-xx`) unter `docs/design/sitemap`, mit vollständigen Titeln. Die Zuordnung entspricht den Rückverweisen in `requirements` der Ansichten; beide Richtungen werden gemeinsam gepflegt. PBI-01 bis PBI-33 sind im MVP-Design v2 abgedeckt (die mobilen Layouts für PBI-33 beschreiben den Ausbau nach dem MVP); PBI-41/42 ergänzen den offenen Dateiarbeitsweg textuell in bestehenden Ansichten. PBI-46 und PBI-47 haben noch `pages: []`, weil Eingangsanzeige der E-Mail-Quellnotizen und Chatansicht noch nicht gestaltet sind. PBI-34 bis PBI-40 sowie PBI-43 bis PBI-45 erhalten vorerst `pages: []`, da für diese späteren Ausbaustufen noch keine eigenen Ansichten spezifiziert sind. Eine ähnliche MVP-Ansicht wird nicht als bereits fertiges Design einer Ausbau-Story ausgegeben.
- `hypotheses` ist eine YAML-Liste zitierter Wikilinks auf die für eine Story relevanten Annahmen unter `docs/hypothesis`, mit vollständigen Titeln. Die Zuordnung benennt den Lernbezug, keine bestandene Validierung: Eine Story kann eine Annahme stützen oder Gegenbelege liefern. Insbesondere PBI-38/39 verweisen auf H-01, weil der Bedarf nach eigener Angebots- und Zahlungsverwaltung die angenommene ausreichende Beiratsabdeckung infrage stellen kann. Spätere Berichte liefern Hinweise zu Scope und Verständlichkeit, ändern aber nicht rückwirkend die MVP-Abnahme. H-12 zur Wirtschaftlichkeit eines Onlinedienstes bleibt beim späteren Dienstumfang; ohne passende User Story wird kein künstlicher PBI-Bezug erzeugt. Die Status der Hypothesen bleiben durch Verknüpfung oder Implementierung unverändert.
- `decisions` ist eine YAML-Liste zitierter Wikilinks auf die für Zuschnitt, Verhalten oder Abgrenzung einer Story relevanten Konzeptentscheidungen unter `docs/decisions`. Verwendet werden vollständige Titel, etwa `"[[docs/decisions/K-02 - Zwei Gemeinschaften für einen Bearbeiter]]"`. Die Verknüpfung übernimmt den dokumentierten Entscheidungsstand; sie bestätigt keinen noch offenen Vorschlag. Sie bezeichnet Produktentscheidungen, nicht die Laufzeit-Entität Arbeitsentscheidung des Beirats. Allgemeine Vorgaben gelten weiterhin übergreifend; die Property hebt die konkrete Entscheidungsgrundlage der jeweiligen Story hervor.
- `business-rules` ist ebenfalls eine YAML-Liste zitierter Wikilinks auf die konkret geltenden Einzelregeln unter `docs/business-rules`, z. B. `"[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"`. Die Zuordnung folgt Story und Akzeptanzkriterien; sie ist keine Releasezuordnung. Bei DF-14 gilt für MVP-Stories nur die Ereignisgrundlage, die berechnete Auswertung erst für den späteren Ausbau. Vollständige Kernreisen wie PBI-32 (und später PBI-33) berücksichtigen alle anwendbaren MVP-Regeln. Bestehende Regelverweise im Text bleiben als Lesekontext erhalten; bei Regel- oder Scopeänderungen wird die Property mitgepflegt.
- `actors` und `entities` sind YAML-Listen zitierter Wikilinks. Sie benennen die konkret beteiligten Akteure beziehungsweise betroffenen Fachobjekte, keine Zugriffsrechte oder Datenbanktabellen.
- `release` ist ein zitierter Wikilink auf eine vorhandene Release-Note, etwa `release: "[[MVP - Beirat Support]]"`. Die Zuordnung wird ausdrücklich auf der jeweiligen Anforderung gepflegt und nicht aus `parent` abgeleitet.
- Ein gemischtes Epic erhält keine pauschale Releasezuordnung für alle Kinder. F-21 und F-22 sowie PBI-46 aus dem gemischten Feature F-18 gehören zum MVP; die direkten Versand-/Drive-Integrationen und der MCP Server bleiben zunächst späterer Ausbau.
- **`tags` wird ausschließlich von Menschen gepflegt. Assistenten legen keine Tags an und ergänzen oder verändern sie nicht.**
- Bereits gepflegte Properties und menschliche Angaben bleiben bei Dokumentänderungen erhalten. Ein leerer Wert wird nicht ohne fachlichen Grund mit einer Annahme gefüllt.
- Entfernte Übersichts- und README-Dateien werden nicht neu angelegt. Verweise werden auf passende Einzelnotes umgestellt oder als historische Quellen ohne toten Dateilink kenntlich gemacht.
- Das bisherige historische Konzeptmaterial ist, soweit noch benötigt, im vorhandenen Git-Commit `b3a1cc2` nachvollziehbar. Aktuelle Anforderungen und Einzelnotes haben Vorrang vor historischen Scopefassungen.

## Backlog-Schnitt und Geltung

Epic → Feature → PBI ist der Arbeitsschnitt. Ein fachliches Epic bündelt ein größeres Nutzerziel, ein Feature eine zusammenhängende Fähigkeit, ein PBI ein prüfbares Nutzerergebnis als User Story. E-07 „Cross Cutting Concerns“ ist die gewünschte Ausnahme für gemeinsame technische Fähigkeiten und nichtfunktionale Anforderungen. Es entsteht kein zusätzliches Unterfeature-Level.

E-01 bis E-05, F-01 bis F-13 und PBI-01 bis PBI-33 bilden den ursprünglichen funktionalen Beiratskern; F-13 mit PBI-33 (mobile Wochenarbeit) folgt nach dem MVP ([[K-09 - Vollständige mobile Wochenarbeit unterstützen]]). F-22 mit PBI-41/42 ergänzt die offene Dateigrundlage; PBI-46 ergänzt den Claude-Gmail-Eingang; PBI-47 ergänzt den nativen AI-Chat; der geplante funktionale MVP umfasst damit 36 User Stories (PBI-01 bis PBI-32 sowie PBI-41, PBI-42, PBI-46 und PBI-47). F-21 führt die bestehenden B-NFR-01 bis B-NFR-14 mit MVP-Geltung. Spätere Funktionen behalten ihre Ausbaukennzeichnung und erhalten nicht allein durch die Dokumentation eine Releasezusage. ENT-01 bis ENT-16 beschreiben MVP-Entitäten; ENT-17 bis ENT-20 gehören zum späteren Ausbau. Fachregeln gelten entsprechend ihrem `scope`, nicht aufgrund ihres Ordners.

Technische Lösung und Aufwand bleiben in dieser Konzeptphase offen. Fachliche Regeln und NFR gelten für alle betroffenen Stories, ohne dieselbe Story unter mehreren Eltern zu duplizieren. Neue Integrations- oder Ausbau-Stories werden erst mit konkretem Nutzerergebnis und prüfbaren Akzeptanzhinweisen geschnitten.

## Backlog-Regeln aus der bisherigen Konfiguration

Die folgenden strukturellen Regeln wurden aus der entfernten `README_PRODUCT_BACKLOG.md` übernommen. Aktuelle Propertynamen und View-Einstellungen stehen in `docs/Product Backlog.base`; die menschlich gepflegten Konventionen oben ergänzen sie. Diese zentrale README ist keine vom Plugin automatisch erzeugte Datei.

### Typen und zulässige Beziehungen

| Type | Parent may be | Children may be |
| --- | --- | --- |
| `Epic` | *(nothing — it is a root)* | `Feature`, `Issue`, `Bug`, `Idea`, `Deliverable`, `Improvement` |
| `Feature` | *(nothing — it is a root)*, `Epic` | `PBI`, `Issue`, `Bug`, `Idea`, `Deliverable`, `Improvement` |
| `PBI` | *(nothing — it is a root)*, `Feature` | `Task`, `Issue`, `Bug`, `Idea`, `Deliverable`, `Improvement` |
| `Task` | *(nothing — it is a root)*, `PBI`, `Task`, `Issue`, `Bug`, `Idea`, `Deliverable`, `Improvement`, `Test case` | `Task` |
| `Issue` | *(nothing — it is a root)*, `Epic`, `Feature`, `PBI` | `Task` |
| `Bug` | *(nothing — it is a root)*, `Epic`, `Feature`, `PBI` | `Task` |
| `Idea` | *(nothing — it is a root)*, `Epic`, `Feature`, `PBI` | `Task` |
| `Deliverable` | *(nothing — it is a root)*, `Epic`, `Feature`, `PBI` | `Task` |
| `Improvement` | *(nothing — it is a root)*, `Epic`, `Feature`, `PBI` | `Task` |
| `Milestone` | *(nothing — it is a root)* | *(nothing)* |
| `Iteration` | *(nothing — it is a root)* | *(nothing)* |
| `Release` | *(nothing — it is a root)* | *(nothing)* |
| `Test suite` | *(nothing — it is a root)* | `Test case` |
| `Test case` | *(nothing — it is a root)*, `Test suite` | `Task` |

Die Typnamen werden genau in dieser Schreibweise verwendet. `Epic`, `Feature`, `PBI` und `Task` bilden die Arbeitshierarchie; Test suite → Test case ist eine gesonderte Hierarchie. Marker wie Release, Iteration und Milestone haben keine Eltern oder Kinder. Die View-Regeln sind beratend; deshalb wird die fachlich korrekte Hierarchie beim Bearbeiten geprüft und nicht allein auf die Oberfläche vertraut.

Jede Feature-Note erhält genau ein Epic als `parent`, jede PBI-Note genau ein Feature. Epics sind Wurzeln mit leerem oder fehlendem `parent`. Elternlinks werden zitiert, etwa `parent: "[[F-18 - Integrationen]]"`, damit YAML sie nicht als Liste interpretiert. Eigene Typen wie Actor, Entity, Decision, Hypothesis und BusinessRule erhalten keine Backlog-Eltern oder Ränge und werden dadurch nicht künstlich als Arbeitselemente eingeordnet. Der Ordner allein macht eine Note nicht zum Backlog-Element.

### Globale Reihenfolge

`order` ist ein globaler Rang über alle von der View erfassten Arbeitselemente, nicht eine Nummer je Elternknoten. Ränge müssen eindeutig sein. Initiale Abstände von 1000 lassen Platz; beim Verschieben wird möglichst nur der Rang der betroffenen Note geändert. Eine Neuordnung ist keine Schätzung, Prioritätsfreigabe oder Releasezuordnung.

Ohne Rang erscheinen Elemente hinter gerankten Geschwistern; gleiche Ränge sind kein verlässlicher Platz für weitere Verschiebungen. In einer auf einen Typ beschränkten Liste können fehlende oder doppelte Ränge die gesamte Rangsortierung verhindern. Bei Bedarf bietet die View „Seed ranks from the hierarchy“ zur Initialisierung und „Respace ranks“ zum Wiederherstellen von Abständen. Kein unaufgefordertes Renummerieren aller Notes.

Level, Fortschritt und Boardposition werden von der View abgeleitet und nicht als eigene berechnete Properties zurückgeschrieben. Ein nicht auflösbarer Elternlink versteckt die Note nicht verlässlich, sondern kann sie als Wurzel erscheinen lassen; deshalb werden Links geprüft.

### Konfigurierte Ablageorte bei späterem Bedarf

| Type | Folder |
| --- | --- |
| `Epic` | `docs/requirements` |
| `Feature` | `docs/requirements` |
| `PBI` | `docs/requirements` |
| `Task` | `docs/tasks` |
| `Issue` | `docs/issues` |
| `Bug` | `docs/bugs` |
| `Idea` | `docs/ideas` |
| `Deliverable` | `docs/deliverables` |
| `Improvement` | `docs/improvements` |
| `Milestone` | `docs/milestones` |
| `Iteration` | `docs/iterations` |
| `Test suite` | `docs/tests/suites` |
| `Test case` | `docs/tests/cases` |

Diese Ablagezuordnung ist keine Aufforderung, leere Ordner oder vorzeitige Implementierungs-Tasks anzulegen. Vorrang hat der je Typ konfigurierte Ordner, danach der Home-Ordner `docs` und schließlich die vorhandene Ablage. Ordner dienen der Ablage; die eigentliche Hierarchie entsteht über Properties. Release-Notes liegen gemäß aktueller Base-Konfiguration unter `docs/release-notes/`, Release-Notes sind von den Release-Planungsnotes unter `docs/releases/` zu unterscheiden.

## UI-Design zum Review

Die vorhandene View [[Product Backlog.base#Design Foundations]] umfasst auch die Ansichten und User-Flows. Eine gesonderte Sitemap-/Flow-View kann bei Bedarf anhand `type: Page` beziehungsweise `type: UserFlow` angelegt werden; bestehende Views werden durch die Designarbeit nicht verändert.

Aktuell ist Designstand v2: vier Navigationsziele plus Kontakte und Einstellungen als Nebenbereiche, acht Ansichten (`VIEW-01` bis `VIEW-08`), acht User-Flows, Mockups unter `docs/design/sitemap/assets/v2-*.png`. Startpunkte sind [[UI-Design - Leitlinien und Reviewumfang]], [[00 - Sitemap]], [[FLOW-01 - Gesamtfluss des Beirats-MVP]] und [[VIEW-02 - Wochenarbeit]]. [[Konzept - Vorbereitung ohne KI]] beschreibt die regelbasierte Vorbereitung. Der klickbare Prototyp liegt als eigenständige HTML-Datei unter `docs/design/prototype`; `docs/design/handoff` enthält das Umsetzungspaket (Tokens, Komponenten, Zustände, Datenbindung, Texte, Plattform, Abnahme, offene Punkte) mit Einstieg [[00 - Handoff Übersicht]]. Handoff-Notes tragen `type: Handoff`. Ansichten verknüpfen ihre Anforderungen und fachlichen Grundlagen über `requirements`, `actors`, `entities`, `business-rules`, `decisions` und `hypotheses`. `mockups` nennt die tatsächlich gespeicherten PNGs; der Note-Body bettet sie sichtbar ein. `UserFlow`-Notes verknüpfen die beteiligten Ansichten über `pages`. Diese Fachartefakte erhalten keine Backlog-Eltern oder Ränge und keine Tags.

## Offene Fachnotizen als Produktgrundlage

[[K-14 - Markdown und Frontmatter als offene Datengrundlage]] betrifft die später vom Plugin erzeugten Fachnotizen: Markdown und dokumentiertes YAML-Frontmatter sind deren maßgeblicher Bestand. Nutzer und freigegebene externe AI-Agents können ohne Plugin, Obsidian oder MCP auf dieselben normalen Dateien zugreifen und sie vertragskonform bearbeiten. [[Datenkonzept - Offene Notizen und Agentenzugriff]] beschreibt den erforderlichen lokalen Dateivertrag; [[FLOW-08 - Zwischen Plugin und direkter Dateibearbeitung wechseln]] beschreibt den Arbeitsweg. Dies ist vom Frontmatter der Konzeptnotes dieses Repositorys zu unterscheiden.

## Google-Dienste als optionaler Integrationsausbau

[[F-18 - Integrationen]] enthält die angeforderten Verbindungen für Kontoautorisierung, Gmail-Versand und Drive-Dokumentfreigabe (PBI-43 bis PBI-45). Diese Stories sind späterer Ausbau ohne Releasezuordnung und noch ohne eigene Pages/User-Flows. Menschlich ausgelöste Aktionen und Ergebnisse bleiben nachvollziehbar; die lokale offene Dateigrundlage bleibt unabhängig. Die technische Kontoverbindung in PBI-43 hat vorerst `entities: []`, weil keine fachfremde WEG-Entität als Zugangskonfiguration eingesetzt wird.

## Projekt-Skills für die Arbeit am Repository

`.claude/skills/` enthält die Skills, mit denen am Repository gearbeitet wird; Claude Code lädt sie nach dem Auschecken ohne weitere Installation. Dazu gehören die Engineering- und Productivity-Skills aus mattpocock/skills (MIT, Version und Lizenz in `.claude/skills/THIRD_PARTY.md`), konfiguriert über `docs/agents/`. Sie sind Arbeitswerkzeuge für Konzeption und Umsetzung, keine verteilbaren Produkt-Skills wie unter `skills/`.

## Verteilbare Claude Skills

Der Ordner `skills/` enthält Skill-Quellen und das [Paketmanifest](../skills/manifest.json). Die ZIPs werden nicht eingecheckt: `python3 skills/package_claude_skills.py` erzeugt sie unter `skills/dist/`, die CI stellt sie als Artefakt `claude-skills` bereit. [weg-gmail-to-vault](../skills/weg-gmail-to-vault/SKILL.md) ist der erste konkrete MVP-Skill. `skills/package_claude_skills.py` baut das Paket reproduzierbar; `skills/tests/` enthält ausschließlich synthetische Tests für Writer und Paket. Dies ist Skill-Infrastruktur, keine implementierte Pluginoberfläche oder eigener Gmail-Connector. Es werden keine zusätzlichen README-Dateien angelegt.

[[PBI-46 - Gmail-Nachrichten mit Claude als Vault-Notizen übernehmen]] ist explizit dem MVP zugeordnet; das gemischte F-18 erhält keine pauschale Releasezuordnung für alle Kinder. Die Plugininstallation und ein tatsächlicher Claude-/Gmail-Test bleiben offen. `pages` und `user-flows` dieser neuen Story bleiben bis zur konkreten Ergänzung der Sitemap v2 leer; alte oder ähnliche Ansichten werden nicht als bereits fertiges Integrationsdesign ausgegeben.

[[Integrationskonzept - Gmail-Eingang mit Claude Skill]] dokumentiert Laufzeit, Installation und den E-Mail-Notizvertrag. [[Skill-Evaluation - Gmail-Import]] trennt lokale und simulierte Prüfungen vom noch ausstehenden Live-Nachweis. [[ENT-21 - E-Mail-Quellnotiz]] gehört zum MVP; ENT-17 bis ENT-20 bleiben spätere Ausbauentitäten.

## Nativer AI-Chat als zusätzlicher MVP-Umfang

[[F-23 - Nativer AI-Chat]] und [[PBI-47 - AI-Chat über die eigene Claude-Subscription nutzen]] sind dem geplanten MVP zugeordnet. [[K-17 - Nativer AI-Chat über das Nutzerabo]] hält den Nutzerwunsch fest; [[Integrationsresearch - Nativer AI-Chat mit Claude Code]] beschreibt Aboreferenz, Authgrenzen und noch nötige technische Prüfung. Für die noch nicht gestaltete native Chatansicht bleiben `pages` und `user-flows` der Story leer. [[ENT-22 - AI-Gespräch]] beschreibt aufbewahrte lokale Gesprächsinhalte; diese sind nicht mit technisch geheimen Runtime-Sitzungsdaten gleichzusetzen. Keine Runtime wurde installiert und kein Aboaufruf getestet.
