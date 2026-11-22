---
type: PBI
parent: "[[F-25 - Onboarding und Einführung]]"
order: 92000
actors:
  - "[[ACT-01-Beirat]]"
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
  - "[[docs/design/entities/ENT-02 - Ansprechpartner]]"
  - "[[docs/design/entities/ENT-04 - Punkt]]"
business-rules:
  - "[[docs/business-rules/DF-22 - Notizen als maßgeblicher Datenbestand]]"
decisions:
  - "[[docs/decisions/K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und kurze Tour]]"
hypotheses:
  - "[[docs/hypothesis/H-13 - Einrichtung führt in wenigen Minuten zum ersten Punkt]]"
pages:
  - "[[docs/design/sitemap/VIEW-01 - Lage]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-09 - Erststart, Einrichtung und Einführung]]"
dependsOn:
  - "[[PBI-13 - Aktuelle Wochenlage öffnen]]"
  - "[[PBI-62 - Gemeinschaften im Einrichtungsassistenten anlegen]]"
triage: ""
---

# PBI-63 · Nach der Einrichtung auf der Lage mit Ersten Schritten ankommen

**Planungsstand:** Konzeptentwurf · **Umfang:** offen, siehe [[F-25 - Onboarding und Einführung]]

## User Story

Als Beirat, der gerade seine Gemeinschaften angelegt hat, möchte ich auf der Lage landen und sehen, was ich als Nächstes tun kann, damit ich nicht vor einer leeren Seite sitze.

## Ausgangslage

Die Lage ([[VIEW-01 - Lage]]) ist das Dashboard des Plugins; sie entsteht mit [[PBI-13 - Aktuelle Wochenlage öffnen]]. Bis es sie gibt, endet die Einrichtung in der Gemeinschaftsverwaltung. Nach `docs/adr/0008-navigation-and-view-state.md` gibt es keine Platzhalter-Ansichten.

## Akzeptanzkriterien

1. Nach „Anlegen“ in der Einrichtung wechselt die Ansicht auf die Lage. Die erste angelegte Gemeinschaft ist ausgewählt; der Gemeinschaftswechsel zeigt alle.
2. Die Lage zeigt oben die Karte „Erste Schritte“ mit höchstens fünf Einträgen, etwa: Gemeinschaften angelegt (erledigt), ersten Punkt erfassen, Verwaltung als Kontakt anlegen, Register übernehmen, Einführung ansehen. Einträge zu Funktionen, die es noch nicht gibt, fehlen.
3. Jeder Eintrag führt mit einem Klick an die passende Stelle. Ob er erledigt ist, ergibt sich aus dem Vault (etwa: Es gibt einen Punkt), nicht aus einem Haken des Nutzers.
4. Sind alle Einträge erledigt, wird die Karte zu einer kurzen Bestätigung und lässt sich schließen. Der Nutzer kann sie auch vorher ausblenden und in den Plugin-Einstellungen von Obsidian wieder einblenden.
5. Leere Bereiche der Lage erklären in einem Satz, was dort erscheinen wird, und bieten die passende Aktion an.
6. Die Lage startet beim ersten Besuch nach der Einrichtung das Angebot der Einführung ([[PBI-64 - Kurze Einführung durch das Plugin erhalten]]).

## Herkunft und Bezüge

Schritt 4 des Ablaufs aus [[F-25 - Onboarding und Einführung]]. Checkliste und Leerzustände statt langer Tour: [[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und kurze Tour]] und [[Onboarding-Research - Erststart, Einrichtung und Einführung]], Abschnitt 3. Konkretisiert Kriterium 1 von [[PBI-32 - Ohne KI selbstständig beginnen]].

## Kommentare
