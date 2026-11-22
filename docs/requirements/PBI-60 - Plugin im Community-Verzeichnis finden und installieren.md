---
type: PBI
parent: "[[F-25 - Onboarding und Einführung]]"
order: 89000
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
decisions:
  - "[[docs/decisions/K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]"
  - "[[docs/decisions/K-12 - Veröffentlichen vor dem Produktpilot]]"
  - "[[docs/decisions/K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und kurze Tour]]"
hypotheses:
  - "[[docs/hypothesis/H-13 - Einrichtung führt in wenigen Minuten zum ersten Punkt]]"
pages: []
user-flows:
  - "[[docs/design/user-flows/FLOW-09 - Erststart, Einrichtung und Einführung]]"
dependsOn: []
triage: ""
---

# PBI-60 · Plugin im Community-Verzeichnis finden und installieren

**Planungsstand:** Konzeptentwurf · **Umfang:** offen, siehe [[F-25 - Onboarding und Einführung]]

## User Story

Als Beirat, der das Plugin noch nicht kennt, möchte ich es im Community-Verzeichnis von Obsidian finden, verstehen, wofür es ist, und es installieren und aktivieren, damit ich ohne fremde Hilfe anfangen kann.

## Ausgangslage

Obsidian zeigt Community-Plugins erst, wenn der eingeschränkte Modus ausgeschaltet ist. Der Eintrag im Verzeichnis besteht aus Name, Kurzbeschreibung aus dem Manifest und der README des Repositorys. Das Plugin ist bis zum mobilen Ausbau nur für den Desktop freigegeben. Veröffentlichung und Einreichung regelt [[K-12 - Veröffentlichen vor dem Produktpilot]].

## Akzeptanzkriterien

1. Name und Kurzbeschreibung im Manifest sagen in einem Satz, für wen das Plugin ist und was es tut. Die Suche nach „WEG“ und „Beirat“ findet es.
2. Die README beginnt mit einem Absatz für Nutzer: was das Plugin leistet, was es nicht tut (kein Konto, keine KI, keine Verwaltungssoftware), dass es nur auf dem Desktop läuft und dass alle Daten als Notizen im eigenen Vault liegen.
3. Die README nennt die Schritte bis zum ersten Start: eingeschränkten Modus ausschalten, Plugin suchen, installieren, aktivieren. Danach öffnet sich die Einrichtung von selbst ([[PBI-61 - Beim ersten Aktivieren in die Einrichtung geführt werden]]).
4. Die README zeigt einen Screenshot der Einrichtung und einen der Lage, beide mit synthetischen Daten.
5. Die README nennt, welche Ordner und Notizen das Plugin im Vault anlegt und wann: erst nach Bestätigung in der Einrichtung.
6. Das Plugin funktioniert in einem neu angelegten, leeren Vault ohne weitere Plugins.

## Herkunft und Bezüge

Schritt 1 des Ablaufs aus [[F-25 - Onboarding und Einführung]]. Plattformbefunde: [[Onboarding-Research - Erststart, Einrichtung und Einführung]], Abschnitt 1. Abnahme AT-B14 im [[02-MVP-PRD]].

## Kommentare
