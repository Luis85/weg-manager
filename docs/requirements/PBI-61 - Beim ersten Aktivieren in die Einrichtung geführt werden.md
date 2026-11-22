---
type: PBI
parent: "[[F-25 - Onboarding und Einführung]]"
order: 90000
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
entities:
  - "[[docs/design/entities/ENT-01 - Gemeinschaft]]"
business-rules:
  - "[[docs/business-rules/DF-22 - Notizen als maßgeblicher Datenbestand]]"
decisions:
  - "[[docs/decisions/K-14 - Markdown und Frontmatter als offene Datengrundlage]]"
  - "[[docs/decisions/K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und kurze Tour]]"
hypotheses: []
pages:
  - "[[docs/design/sitemap/VIEW-09 - Einrichtung]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-09 - Erststart, Einrichtung und Einführung]]"
dependsOn:
  - "[[PBI-55 - Navigation und App-Rahmen der Plugin-Ansicht bereitstellen]]"
  - "[[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]]"
triage: ""
---

# PBI-61 · Beim ersten Aktivieren in die Einrichtung geführt werden

**Planungsstand:** Konzeptentwurf · **Umfang:** offen, siehe [[F-25 - Onboarding und Einführung]]

## User Story

Als Beirat, der das Plugin gerade aktiviert hat, möchte ich ohne Suchen direkt in der Einrichtung landen, damit ich weiß, wo ich anfange.

## Ausgangslage

Heute öffnet sich die Plugin-Ansicht nur über das Symbol in der Seitenleiste oder einen Befehl, und zwar mit der Gemeinschaftsverwaltung als Startroute. Obsidian bietet mit `onUserEnable` einen Hook, der läuft, wenn der Nutzer das Plugin selbst aktiviert, und der laut Doku für eine einmalige Einrichtung gedacht ist.

## Akzeptanzkriterien

1. Aktiviert der Nutzer das Plugin in einem Vault ohne gültige Gemeinschaft, öffnet sich die Plugin-Ansicht einmal in einem neuen Tab mit der Einrichtung ([[VIEW-09 - Einrichtung]]).
2. „Einrichtung nötig“ wird nur aus dem Vault abgeleitet: Es gibt keine gültige Gemeinschaftsnotiz. Ein Vault mit Gemeinschaften, etwa auf einem zweiten Gerät über Sync oder von Hand angelegt, öffnet keine Einrichtung.
3. Bei späteren Starts von Obsidian öffnet das Plugin keine Ansicht, kein Modal und keine Meldung von selbst.
4. Öffnet der Nutzer die Ansicht über Seitenleiste oder Befehl, solange keine Gemeinschaft existiert, zeigt sie die Einrichtung. Gibt es Gemeinschaften, zeigt sie die Startroute.
5. Das Öffnen beim Aktivieren wartet, bis der Arbeitsbereich bereit ist, und bricht nicht ab, wenn der Notizindex noch lädt. Bis der Index bereit ist, zeigt die Einrichtung einen Ladezustand statt einer falschen Entscheidung.
6. Erneutes Aktivieren nach Deaktivieren verhält sich wie Kriterium 1 und 2: Einrichtung nur ohne Gemeinschaft. Ein e2e-Test im echten Obsidian prüft Aktivieren, Neustart und erneutes Aktivieren.
7. Beim Aktivieren entstehen weder Ordner noch Notizen.

## Herkunft und Bezüge

Schritt 2 des Ablaufs aus [[F-25 - Onboarding und Einführung]]; Abwägung in [[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und kurze Tour]]. Plattformbefunde zu `onUserEnable` und `onLayoutReady`: [[Onboarding-Research - Erststart, Einrichtung und Einführung]], Abschnitt 1. Routen nach `docs/adr/0008-navigation-and-view-state.md`.

## Kommentare
