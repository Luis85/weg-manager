---
type: PBI
parent: "[[F-24 - Technische Plugin-Grundlagen]]"
order: 86000
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

# PBI-58 · CI und Abhängigkeiten gepflegt halten

**Planungsstand:** Technischer Folgepunkt aus dem Plan `docs/plans/pre-feature-improvement-plan.md` (Schritt 4.4) · **Bezug:** B-NFR-11, B-NFR-14

## User Story

Als Beirat möchte ich, dass das Plugin mit geprüften, aktuellen Abhängigkeiten gebaut und ausgeliefert wird, damit ein fehlerhaftes Update oder eine manipulierte Aktion nicht ungeprüft in meine Version gelangt.

## Ausgangslage

Das mehrfach eingebundene `obsidian-guard`-Plugin lässt Vitest bei jedem Lauf warnen (`configs/vitest.config.ts`). Workflow-Aktionen sind nicht auf Commit-SHAs festgelegt. Alle Versionen sind exakt festgelegt und drei Overrides warten auf Upstream, es gibt aber keine automatischen Updates. `CI / e2e` ist keine Pflichtprüfung.

## Akzeptanzkriterien

1. Die doppelte Vitest-Plugin-Warnung ist beseitigt; ein Testlauf zeigt sie nicht mehr.
2. Alle Aktionen in `.github/workflows/` sind auf Commit-SHAs festgelegt, die Version steht als Kommentar daneben.
3. Dependabot läuft wöchentlich und gruppiert Updates; Overrides und exakt festgelegte Versionen bleiben respektiert.
4. `npm run verify` endet mit Exit 0.
5. `CI / e2e` wird erst Pflichtprüfung, wenn Vault-Specs vorhanden sind (nach [[PBI-52 - Notizspeicher für Vault-Notizen bereitstellen]]). Das ist eine Repository-Einstellung des Produktverantwortlichen; der Agent weist darauf hin und ändert sie nicht.

## Herkunft und Bezüge

Plan `docs/plans/pre-feature-improvement-plan.md`, Schritt 4.4. Einrichtung: `docs/engineering/github-setup.md`.

## Kommentare

- 21.11.2026: Angelegt als offener Schritt des Plans `docs/plans/pre-feature-improvement-plan.md`. Bereit zur Umsetzung; die Reihenfolge steht in `dependsOn`.
- 21.11.2026: Kriterien 1 bis 4 sind mit PR #8 ausgeliefert (Vitest-Warnung, Actions per Commit-SHA, Dependabot, Dokumentation). Offen bleibt Kriterium 5: `CI / e2e` als Pflichtprüfung, sobald Vault-Specs bestehen. Das ist eine Repository-Einstellung des Eigentümers.
