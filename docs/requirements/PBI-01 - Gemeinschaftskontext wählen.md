---
type: PBI
parent: "[[F-01 - Gemeinschaften, Personen und Rollen]]"
order: 3000
actors:
  - "[[ACT-01-Beirat]]"
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
  - "[[docs/entities/ENT-04 - Vorgang]]"
  - "[[docs/entities/ENT-09 - Entscheidungskarte]]"
  - "[[docs/entities/ENT-10 - Nachrichtenentwurf]]"
business-rules:
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-02 - Zwei Gemeinschaften für einen Bearbeiter]]"
hypotheses:
  - "[[docs/hypothesis/H-01 - Beiratsfokus deckt den ersten Pilotbedarf]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-01 - Lage]]"
  - "[[docs/design/sitemap/VIEW-05 - Erfassen]]"
  - "[[docs/design/sitemap/VIEW-07 - Einstellungen und Einrichtung]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-04 - Schnell erfassen und Eingang sichten]]"
  - "[[docs/design/user-flows/FLOW-06 - Einrichten, Import und Datenerhalt]]"
---

# PBI-01 · Gemeinschaftskontext wählen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich zwischen WEG und Tiefgarage wechseln und Punkte eindeutig zuordnen, damit ich keine Sachverhalte vermische.

## Akzeptanzkriterien

1. Mindestens zwei Gemeinschaften sind nutzbar; vor Bearbeitung und Ausgabe ist der Kontext sichtbar.
2. Gleich benannte Punkte beider Gemeinschaften bleiben verschieden; Querverweise führen keine Daten zusammen.
3. Jeder Punkt, jede Karte und jeder Entwurf gehört genau einer Gemeinschaft.
4. Jede Gemeinschaft hat Name, eindeutiges Kürzel und unterscheidbare Farbe; die Art stammt aus einer editierbaren Liste mit eigener Einheitenbezeichnung (z. B. Einheiten, Stellplätze). Aus der Art werden weder Rechtsform noch Befugnisse abgeleitet.

## Herkunft und Regeln

Kriterium 4: Ergänzt aus dem Designreview und Pilot-Prototyp vom 15.11.2026 (direkte Nutzeranforderung, siehe [[Prototyp - Stand Pilot]]).

P FR-ROL3; US-01; DF-12. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

Keine vorausgehende Story; Gemeinschaftskontext ist der Einstieg.

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Business Rules

[[DF-12 - Gemeinschaftstrennung]].

## Kommentare

- 21.11.2026: Entscheidungen des Produktverantwortlichen und Umsetzungsfreigabe für einen ersten Schnitt.
  - **Freigabe:** Gemeinschaft ist die erste Entität, die durch den Vault-Weg geht (Durchstich). Der Schnitt umfasst Anlegen, Auflisten, Bearbeiten und Löschen (Löschen legt die Notiz in Obsidians Papierkorb) mit Name, Kürzel, Farbe, Art und Einheitenbezeichnung sowie den sichtbaren Gemeinschaftswechsel. Das erfüllt Kriterium 1 und 4. Kontakte, Punkte, Anschrift, Sprachen der Eigentümer und der Einrichtungsassistent bleiben draußen. Kriterien 2 und 3 brauchen Punkte; PBI-01 bleibt offen.
  - **Kürzel (Kriterium 4):** 2 bis 5 Zeichen, A–Z und Ziffern, gespeichert in Großbuchstaben, unter den Gemeinschaften eindeutig, nach dem Anlegen nicht änderbar. Ein außerhalb des Plugins entstandenes Duplikat erscheint als Problem.
  - **Art und Einheitenbezeichnung (Kriterium 4):** einfache Textfelder der Gemeinschaftsnotiz. Das Formular schlägt die eingebauten Paare (WEG mit Einheiten, Tiefgarage mit Stellplätzen) und bereits verwendete Paare vor. Die Farbe ist der Name einer Farbe aus der geprüften Palette; eine bereits vergebene Farbe ist gesperrt. Der Dateiname der Notiz ist der Name der Gemeinschaft, bei Kollision mit Zusatz ` (2)`.
  - **Umsetzung:** [[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]].
- 21.11.2026: Der freigegebene Schnitt ist mit [[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]] ausgeliefert: Kriterium 4 und der sichtbare Kontext aus Kriterium 1. Die Kriterien 2 und 3 bleiben offen, bis es Punkte gibt.
- 22.11.2026: Der Produktverantwortliche revidiert die Festlegung zum Kürzel: Es wird nach dem Anlegen änderbar, damit niemand in der Einrichtung etwas Unumkehrbares entscheidet. Umsetzung: [[PBI-73 - Kürzel einer Gemeinschaft nachträglich ändern]]; Begründung: [[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]].
