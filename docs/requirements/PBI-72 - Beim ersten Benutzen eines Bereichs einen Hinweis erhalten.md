---
type: PBI
parent: "[[F-25 - Onboarding und Einführung]]"
order: 101000
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
  - "[[docs/decisions/K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]]"
hypotheses:
  - "[[docs/hypothesis/H-13 - Einrichtung führt in wenigen Minuten zum ersten Punkt]]"
pages:
  - "[[docs/design/sitemap/VIEW-01 - Lage]]"
  - "[[docs/design/sitemap/VIEW-07 - Einstellungen und Einrichtung]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-09 - Erststart, Einrichtung und Einführung]]"
dependsOn:
  - "[[PBI-71 - Nach der Einrichtung auf der Lage mit Ersten Schritten ankommen]]"
triage: ""
---

# PBI-72 · Beim ersten Benutzen eines Bereichs einen Hinweis erhalten

**Planungsstand:** Konzeptentwurf · **Umfang:** nach dem MVP, siehe [[F-25 - Onboarding und Einführung]]

## User Story

Als neuer Beirat möchte ich beim ersten Öffnen eines Bereichs einen kurzen Hinweis direkt am wichtigsten Element sehen, damit ich mich zurechtfinde, ohne vorher eine Tour durchklicken oder eine Anleitung lesen zu müssen.

## Ausgangslage

Der Designstand v2 sah eine Tour mit sieben blockierenden Schritten vor ([[VIEW-07 - Einstellungen und Einrichtung]]), der erste Entwurf von F-25 eine angebotene Tour mit fünf Schritten. Beides ist verworfen: Laut NN/g helfen vorgeschaltete Tutorials nicht und lassen Aufgaben schwerer wirken. Hinweise wirken, wenn sie einzeln, im richtigen Moment und am betroffenen Element erscheinen ([[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]]). Nuxt UI bietet `UPopover` mit einem Bezugselement; `useTour` wird nicht gebraucht.

## Akzeptanzkriterien

1. **Auslöser:** Ein Hinweis erscheint, wenn der Nutzer einen Bereich zum ersten Mal benutzt, nicht beim Start und nicht auf einen Zeitgeber hin. Erste Hinweise: Wochenarbeit, Erfassen und Punktakte, jeweils beim ersten Öffnen. Direkt nach der Einrichtung erscheint kein Hinweis. Weitere Hinweise kommen nur mit eigener Begründung dazu.
2. **Einzeln:** Es ist höchstens ein Hinweis zugleich sichtbar. Hinweise bilden keine Kette und haben keine Zählung „n von m“.
3. **Inhalt:** Titel und ein Satz zur Funktion, kein Werbetext. Der Hinweis steht neben dem Element und verdeckt weder das Element noch die Hauptaktion des Bereichs.
4. **Nichtmodal:** Der Hinweis dunkelt nichts ab und sperrt nichts. Der Nutzer kann weiterarbeiten; der Hinweis bleibt, bis er ihn schließt oder das Element benutzt.
5. **Bedienung:** „Verstanden“ und Esc schließen den Hinweis. Er ist per Tastatur erreichbar, ohne den Fokus an sich zu reißen, und wird von Screenreadern angesagt. Bei reduzierter Bewegung gibt es keine Animation (WCAG 2.2: 1.4.13, 2.4.11).
6. **Einmaligkeit:** Ein geschlossener Hinweis erscheint auf diesem Gerät nicht wieder. Das Plugin merkt sich das je Gerät über den Gerätespeicher (`DeviceStore`), nicht in den Plugin-Daten. Auf einem zweiten Gerät erscheint ein Hinweis einmal erneut.
7. **Zurücksetzen:** Der Befehl „Hinweise erneut zeigen“ (ohne Tastenkürzel) setzt alle Hinweise zurück. Es gibt keine Tour, auch nicht als Befehl.
8. **Ohne Daten:** Hinweise legen keine Notizen an und ändern keine; ein offener Hinweis verändert keinen laufenden Arbeitsstand.
9. **Test:** Ein e2e-Test im echten Obsidian prüft Erscheinen, Schließen, Nicht-Wiederkehren nach Neustart und Zurücksetzen, auch im Pop-out-Fenster.

## Herkunft und Bezüge

Schritt 5 des Ablaufs aus [[F-25 - Onboarding und Einführung]]. Konkretisiert Kriterium 5 von [[PBI-32 - Ohne KI selbstständig beginnen]]. Befunde zu Tutorials und Hinweisen (Kendrick 2020, Harley 2014, Laubheimer 2023), Barrierefreiheit und Nuxt UI: [[Onboarding-Research - Erststart, Einrichtung und Einführung]], Abschnitte 3 bis 5.

## Kommentare

- 22.11.2026: Der Produktverantwortliche hat entschieden: keine Tour, Hinweise je Gerät, nach dem MVP ([[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]]).
