---
type: PBI
parent: "[[F-01 - Gemeinschaften und Ansprechpartner]]"
order: 4000
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
  - "[[docs/design/entities/ENT-01 - Gemeinschaft]]"
  - "[[docs/design/entities/ENT-02 - Ansprechpartner]]"
  - "[[docs/design/entities/ENT-04 - Punkt]]"
  - "[[docs/design/entities/ENT-07 - Quelle]]"
  - "[[docs/design/entities/ENT-10 - Nachrichtenentwurf]]"
business-rules:
  - "[[docs/business-rules/DF-01 - Beiratsarbeit und Befugnis]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-02 - Zwei Gemeinschaften für einen Bearbeiter]]"
hypotheses:
  - "[[docs/hypothesis/H-01 - Beiratsfokus deckt den ersten Pilotbedarf]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-08 - Kontakte]]"
  - "[[docs/design/sitemap/VIEW-03 - Punkte und Punktakte]]"
  - "[[docs/design/sitemap/VIEW-07 - Einstellungen und Einrichtung]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-06 - Einrichten, Import und Datenerhalt]]"
---

# PBI-02 · Ansprechpartner zuordnen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich Kontakte mit ihrer Rolle je Gemeinschaft führen, damit ich den zuständigen Adressaten finde.

## Akzeptanzkriterien

1. Name, Rolle und benötigte Kontaktdaten sind erfassbar und einem Punkt zuordenbar.
2. Eine Kontaktänderung verändert keine historische Nachricht; eine Rolle verleiht keine Befugnis.
3. Ein nicht mehr genutzter Kontakt bleibt in vorhandenen Quellen nachvollziehbar.
4. Ein Kontakt ist eine Person oder eine Firma. Eine Person kann einer Firma zugeordnet sein; die Firma zeigt ihre Personen. Eine beim Anlegen genannte, noch unbekannte Firma wird mit angelegt.
5. Ein Kontakt kann für mehrere Gemeinschaften zuständig sein; Name und mindestens eine Zuständigkeit sind Pflicht. Ein gleichnamiger vorhandener Kontakt wird vor dem Speichern angezeigt.
6. Eigentümer werden je Gemeinschaft als Verteiler mit Anzahl, Sprachaufteilung, Quelle und Stand geführt und sind als Empfänger wählbar.
7. Die Kontaktansicht zeigt verantwortete Punkte und Nachrichten. E-Mail-Adresse und Telefonnummer lassen sich kopieren oder an die Mail- bzw. Telefon-App übergeben; das setzt keinen Versand- oder Gesprächsstatus.

## Herkunft und Regeln

Kriterien 4–7: Ergänzt aus dem Designreview und Pilot-Prototyp vom 15.11.2026 (direkte Nutzeranforderung, siehe [[Prototyp - Stand Pilot]]).

Alt FR-02; P FR-V1; US-03. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-01 - Gemeinschaftskontext wählen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.
- 22.11.2026 (Abgleich im vierten Interview): Der Eigentümer hat im zweiten Interview vom 22.11.2026 entschieden, dass ein Kontakt eine Rolle hat (O-D10 in [[09 - Offene Punkte vor Implementierung]], Nachtrag „a contact's role stays flat“ in `docs/adr/0007-vault-data-access.md`, [[ENT-02 - Ansprechpartner]]): ein Kontakt hat eine Rolle und eine Zuständigkeit für eine oder mehrere Gemeinschaften; eine abweichende Rolle in einer anderen Gemeinschaft steht in der Notiz des Kontakts, eine Rolle je Gemeinschaft kann mit einer neuen Schemaversion folgen. Diese Entscheidung ersetzt die Formulierung „mit ihrer Rolle je Gemeinschaft“ in der User Story, in der Sache: „eine Rolle, zuständig für eine oder mehrere Gemeinschaften“. Die User Story selbst bleibt unverändert stehen. Kriterium 1 („Name, Rolle“) und Kriterium 5 (Zuständigkeit für mehrere Gemeinschaften) stimmen mit der Entscheidung überein und bleiben. Die Entscheidung steht nicht in `docs/decisions/` (dort gibt es keine K-Note dazu), sondern in den drei genannten Stellen.
