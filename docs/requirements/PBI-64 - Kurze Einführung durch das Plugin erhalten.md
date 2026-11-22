---
type: PBI
parent: "[[F-25 - Onboarding und Einführung]]"
order: 93000
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
entities: []
business-rules: []
decisions:
  - "[[docs/decisions/K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und kurze Tour]]"
hypotheses:
  - "[[docs/hypothesis/H-13 - Einrichtung führt in wenigen Minuten zum ersten Punkt]]"
pages:
  - "[[docs/design/sitemap/VIEW-01 - Lage]]"
  - "[[docs/design/sitemap/VIEW-07 - Einstellungen und Einrichtung]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-09 - Erststart, Einrichtung und Einführung]]"
dependsOn:
  - "[[PBI-63 - Nach der Einrichtung auf der Lage mit Ersten Schritten ankommen]]"
triage: ""
---

# PBI-64 · Kurze Einführung durch das Plugin erhalten

**Planungsstand:** Konzeptentwurf · **Umfang:** offen, siehe [[F-25 - Onboarding und Einführung]]

## User Story

Als neuer Beirat möchte ich mir in einer Minute zeigen lassen, wo die wichtigsten Bereiche des Plugins sind, damit ich mich zurechtfinde, ohne eine Anleitung zu lesen.

## Ausgangslage

Der Designstand v2 sieht eine Tour mit Willkommensdialog und sieben blockierenden Schritten vor, die einmal automatisch startet ([[VIEW-07 - Einstellungen und Einrichtung]]). Die Recherche spricht für eine kürzere, angebotene Einführung ([[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und kurze Tour]]). Nuxt UI bietet `useTour` und `UPopover`; eine fertige Tour-Komponente gibt es nicht.

## Akzeptanzkriterien

1. **Angebot:** Beim ersten Besuch der Lage nach der Einrichtung erscheint eine Karte „Kurze Einführung? Etwa eine Minute“ mit „Starten“ und „Später“. Sie verdeckt keine Bedienelemente der Lage.
2. **Schritte:** Die Einführung hat höchstens fünf Schritte: Lage, Wochenarbeit, Erfassen, Gemeinschaftswechsel, Einstellungen und Hilfe. Jeder Schritt hebt das Element hervor und erklärt es in einem Satz. Er zeigt „n von 5“, Zurück, Weiter beziehungsweise Fertig und Beenden.
3. **Bedienung:** Esc beendet, Pfeiltasten blättern, der Fokus springt auf den Titel der Karte und kehrt nach dem Ende auf das zuvor fokussierte Element zurück. Die Karte verdeckt das hervorgehobene Element nicht. Bei reduzierter Bewegung gibt es keine Animation.
4. **Einmaligkeit:** „Später“, Beenden und Fertig merken sich den Zustand. Das Angebot erscheint danach nicht mehr von selbst, auch nicht auf einem zweiten Gerät mit demselben Vault (Speicherort siehe K-19, O-19b).
5. **Neu starten:** Die Einführung lässt sich jederzeit über den Befehl „Einführung starten“ (ohne Tastenkürzel) und über die Plugin-Einstellungen von Obsidian, Gruppe „Einführung“, neu starten. Dort lässt sich auch die Karte „Erste Schritte“ wieder einblenden.
6. **Ohne Daten:** Die Einführung legt keine Notizen an und ändert keine.
7. **Laufende Arbeit:** Startet der Nutzer die Einführung während der Wochenarbeit, bleibt der Stand der Wochenarbeit erhalten.
8. **Test:** Ein e2e-Test im echten Obsidian prüft Angebot, Durchlauf, Abbruch und Neustart, auch im Pop-out-Fenster.

## Herkunft und Bezüge

Schritt 5 des Ablaufs aus [[F-25 - Onboarding und Einführung]]. Konkretisiert Kriterium 5 von [[PBI-32 - Ohne KI selbstständig beginnen]]. Barrierefreiheit (WCAG 2.2: 2.4.11, 1.4.13) und Nuxt UI: [[Onboarding-Research - Erststart, Einrichtung und Einführung]], Abschnitte 4 und 5.

## Kommentare
