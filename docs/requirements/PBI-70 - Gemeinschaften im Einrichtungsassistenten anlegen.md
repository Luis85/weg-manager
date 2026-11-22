---
type: PBI
parent: "[[F-25 - Onboarding und Einführung]]"
order: 99000
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-05-Obsidian]]"
release: "[[MVP - Beirat Support]]"
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
  - "[[docs/entities/ENT-01 - Gemeinschaft]]"
business-rules:
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-22 - Notizen als maßgeblicher Datenbestand]]"
decisions:
  - "[[docs/decisions/K-02 - Zwei Gemeinschaften für einen Bearbeiter]]"
  - "[[docs/decisions/K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]"
  - "[[docs/decisions/K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]]"
hypotheses:
  - "[[docs/hypothesis/H-13 - Einrichtung führt in wenigen Minuten zum ersten Vorgang]]"
pages:
  - "[[docs/design/sitemap/VIEW-09 - Einrichtung]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-09 - Erststart, Einrichtung und Einführung]]"
dependsOn:
  - "[[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]]"
  - "[[PBI-69 - Beim ersten Aktivieren in die Einrichtung geführt werden]]"
  - "[[PBI-73 - Kürzel einer Gemeinschaft nachträglich ändern]]"
triage: ""
---

# PBI-70 · Gemeinschaften im Einrichtungsassistenten anlegen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP, siehe [[F-25 - Onboarding und Einführung]]

## User Story

Als neuer Beirat möchte ich in zwei kurzen Schritten meine Gemeinschaften anlegen, zum Beispiel unsere WEG und die Tiefgarage, damit das Plugin von Anfang an weiß, für wen ich arbeite, und ich nichts vermische.

## Ausgangslage

Gemeinschaften lassen sich heute in der Gemeinschaftsverwaltung anlegen ([[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]]). Jede Gemeinschaft hat Name, Kürzel, Art, Farbe und Einheitenbezeichnung. Das Kürzel ist heute nach dem Anlegen fest und wird mit [[PBI-73 - Kürzel einer Gemeinschaft nachträglich ändern]] änderbar. Der Assistent nutzt dieselben Regeln und Anwendungsfälle und führt nur durch sie hindurch.

## Akzeptanzkriterien

1. **Kein Willkommensschritt:** Der Assistent beginnt mit der Frage „Für welche Gemeinschaft bist du Beirat?“. Darüber steht ein Satz: Das Plugin hilft, die Beiratsarbeit Woche für Woche im Griff zu behalten, alles liegt als Notizen im eigenen Vault, ohne Konto und ohne KI.
2. **Erste Gemeinschaft:** Pflicht sind nur Name und Art (Vorschläge „WEG“, „Tiefgarage“, freie Eingabe möglich). Der Assistent zeigt keine Farbpalette und kein Kürzelfeld. Kürzel und Einheitenbezeichnung belegt er aus Name und Art vor, die Farbe vergibt er als erste freie Farbe der Palette.
3. **Weitere Gemeinschaften:** Unter dem Formular stehen die schon erfassten Gemeinschaften als Liste und der Link „Weitere Gemeinschaft hinzufügen“, mit dem Beispiel Tiefgarage. Er öffnet dasselbe Formular; eine erfasste Gemeinschaft lässt sich aus der Liste bearbeiten oder entfernen. Mehr als zwei Gemeinschaften sind möglich.
4. **Knöpfe:** Die Hauptaktion heißt „Prüfen“ und danach „Gemeinschaft anlegen“ beziehungsweise „n Gemeinschaften anlegen“. Kein Knopf heißt nur „Weiter“.
5. **Prüfen und Anlegen:** Die Prüfseite zeigt je Gemeinschaft Farbpunkt, Kürzel, Name, Art und Einheitenbezeichnung mit „Ändern“, dazu den Ablageort im Vault (`WEG Manager/Gemeinschaften/`) nur als Anzeige. „Ändern“ führt zum Formular dieser Gemeinschaft, in dem dann auch Kürzel, Farbe und Einheitenbezeichnung stehen, und danach zurück zur Prüfseite. Erst „Gemeinschaften anlegen“ schreibt die Notizen.
6. **Fehler:** Ungültige Angaben, etwa ein vergebenes Kürzel oder eine schon vorhandene gleichnamige Notiz, zeigt der Assistent am Feld mit Ursache und Ausweg, in Deutsch oder Englisch je nach Sprache von Obsidian. Ein Fehler in einer vorbelegten Angabe öffnet dort das Formular mit dem betroffenen Feld. Schlägt das Schreiben fehl, bleiben die Eingaben erhalten und schon angelegte Gemeinschaften werden genannt.
7. **Abbrechen und Fortsetzen:** Bis zum Anlegen entsteht keine Datei und kein Ordner, und nichts landet in den Plugin-Daten. Schließt der Nutzer die Ansicht vorher, behält das Plugin die Eingaben im Arbeitsspeicher; beim nächsten Öffnen geht es dort weiter. Nach einem Neustart von Obsidian beginnt die Einrichtung leer. Zurück ist in jedem Schritt möglich, ohne Eingaben zu verlieren.
8. **Fortschritt:** Ein Stepper zeigt zwei Schritte, „Gemeinschaften“ und „Prüfen“. Der Fokus springt bei jedem Schritt auf dessen Überschrift; alles ist per Tastatur bedienbar.
9. **Ohne Kontakte und Register:** Der Assistent fragt weder Kontakte noch einen Registerimport ab. Diese erscheinen danach in der Karte „Erste Schritte“ ([[PBI-71 - Nach der Einrichtung auf der Lage mit Ersten Schritten ankommen]]).
10. **Formulare:** Formulare nutzen TanStack Form, die Prüfungen rufen die Regeln aus dem Domänenmodell der Gemeinschaften auf.

## Herkunft und Bezüge

Schritt 3 des Ablaufs aus [[F-25 - Onboarding und Einführung]]; Gestaltung in [[VIEW-09 - Einrichtung]]. Muster „Add another“ und „Antworten prüfen“, Assistenten nach NN/g: [[Onboarding-Research - Erststart, Einrichtung und Einführung]], Abschnitt 3. Dateivertrag: `docs/contracts/DV-01 - Gemeinschaft v1.md`.

## Kommentare
