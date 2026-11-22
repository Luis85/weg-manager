---
type: PBI
parent: "[[F-25 - Onboarding und Einführung]]"
order: 91000
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
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-22 - Notizen als maßgeblicher Datenbestand]]"
decisions:
  - "[[docs/decisions/K-02 - Zwei Gemeinschaften für einen Bearbeiter]]"
  - "[[docs/decisions/K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]"
  - "[[docs/decisions/K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und kurze Tour]]"
hypotheses:
  - "[[docs/hypothesis/H-13 - Einrichtung führt in wenigen Minuten zum ersten Punkt]]"
pages:
  - "[[docs/design/sitemap/VIEW-09 - Einrichtung]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-09 - Erststart, Einrichtung und Einführung]]"
dependsOn:
  - "[[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]]"
  - "[[PBI-61 - Beim ersten Aktivieren in die Einrichtung geführt werden]]"
triage: ""
---

# PBI-62 · Gemeinschaften im Einrichtungsassistenten anlegen

**Planungsstand:** Konzeptentwurf · **Umfang:** offen, siehe [[F-25 - Onboarding und Einführung]]

## User Story

Als neuer Beirat möchte ich in wenigen Schritten meine Gemeinschaften anlegen, zum Beispiel unsere WEG und die Tiefgarage, damit das Plugin von Anfang an weiß, für wen ich arbeite, und ich nichts vermische.

## Ausgangslage

Gemeinschaften lassen sich heute in der Gemeinschaftsverwaltung anlegen ([[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]]). Jede Gemeinschaft hat Name, Kürzel, Art, Farbe und Einheitenbezeichnung; das Kürzel ist nach dem Anlegen fest. Der Assistent nutzt dieselben Regeln und Anwendungsfälle und führt nur durch sie hindurch.

## Akzeptanzkriterien

1. **Willkommen:** Der erste Schritt sagt in drei Sätzen, was das Plugin tut, dass alles als Notizen im eigenen Vault liegt und dass die Einrichtung etwa zwei Minuten dauert. Einziger Pflichtschritt danach ist die erste Gemeinschaft.
2. **Erste Gemeinschaft:** Pflicht sind Name und Art (Vorschläge „WEG“, „Tiefgarage“, freie Eingabe möglich). Kürzel, Farbe und Einheitenbezeichnung werden aus Name und Art vorbelegt und sind unter „Weitere Angaben“ änderbar. Beim Kürzel steht, dass es später nicht mehr geändert werden kann.
3. **Weitere Gemeinschaft:** Der Assistent fragt, ob der Nutzer für eine weitere Gemeinschaft Beirat ist, etwa eine Tiefgarage. „Ja“ öffnet dasselbe Formular, mit anderer Farbe vorbelegt; „Nein“ geht weiter. Mehr als zwei Gemeinschaften sind möglich.
4. **Prüfen und Anlegen:** Eine Prüfseite zeigt alle Gemeinschaften mit Kürzel, Farbe und Art und den Ablageort im Vault (`WEG Manager/Gemeinschaften/`). Jede Angabe lässt sich von dort aus ändern, ohne andere neu einzugeben. Erst „Anlegen“ schreibt die Notizen.
5. **Fehler:** Ungültige Angaben, etwa ein vergebenes Kürzel oder eine schon vorhandene gleichnamige Notiz, zeigt der Assistent am Feld mit Ursache und Ausweg, in Deutsch oder Englisch je nach Sprache von Obsidian. Schlägt das Schreiben fehl, bleiben die Eingaben erhalten und schon angelegte Gemeinschaften werden genannt.
6. **Abbrechen und Fortsetzen:** Bis „Anlegen“ entsteht keine Datei und kein Ordner. Schließt der Nutzer die Ansicht vorher, gehen die Eingaben verloren; beim nächsten Öffnen beginnt die Einrichtung erneut. Zurück ist in jedem Schritt möglich, ohne Eingaben zu verlieren.
7. **Fortschritt:** Ein Stepper zeigt Schritt und Gesamtzahl. Der Fokus springt bei jedem Schritt auf dessen Überschrift; alles ist per Tastatur bedienbar.
8. **Ohne Kontakte und Register:** Der Assistent fragt weder Kontakte noch einen Registerimport ab. Diese erscheinen danach in der Checkliste „Erste Schritte“ ([[PBI-63 - Nach der Einrichtung auf der Lage mit Ersten Schritten ankommen]]).
9. **Formulare:** Formulare nutzen TanStack Form, die Prüfungen rufen die Regeln aus dem Domänenmodell der Gemeinschaften auf.

## Herkunft und Bezüge

Schritt 3 des Ablaufs aus [[F-25 - Onboarding und Einführung]]; Gestaltung in [[VIEW-09 - Einrichtung]]. Muster „eine Frage pro Seite“ und „Antworten prüfen“: [[Onboarding-Research - Erststart, Einrichtung und Einführung]], Abschnitt 3. Dateivertrag: `docs/contracts/DV-01 - Gemeinschaft v1.md`.

## Kommentare
