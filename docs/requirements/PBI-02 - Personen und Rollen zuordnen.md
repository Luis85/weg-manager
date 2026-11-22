---
type: PBI
parent: "[[F-01 - Gemeinschaften, Personen und Rollen]]"
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
  - "[[docs/entities/ENT-01 - Gemeinschaft]]"
  - "[[docs/entities/ENT-02 - Person und Rolle]]"
  - "[[docs/entities/ENT-04 - Vorgang]]"
  - "[[docs/entities/ENT-07 - Quelle]]"
  - "[[docs/entities/ENT-10 - Nachrichtenentwurf]]"
business-rules:
  - "[[docs/business-rules/DF-01 - Beiratsarbeit und Befugnis]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-02 - Zwei Gemeinschaften für einen Bearbeiter]]"
  - "[[docs/decisions/K-20 - WCS-Datenmodell als fachliche Grundlage]]"
hypotheses:
  - "[[docs/hypothesis/H-01 - Beiratsfokus deckt den ersten Pilotbedarf]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
pages:
  - "[[docs/design/sitemap/VIEW-08 - Kontakte]]"
  - "[[docs/design/sitemap/VIEW-03 - Vorgänge und Vorgangsakte]]"
  - "[[docs/design/sitemap/VIEW-07 - Einstellungen und Einrichtung]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-06 - Einrichten, Import und Datenerhalt]]"
---

# PBI-02 · Personen und Rollen zuordnen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich Kontakte mit ihrer Rolle je Gemeinschaft führen, damit ich den zuständigen Adressaten finde.

## Akzeptanzkriterien

1. Name, Rolle und benötigte Kontaktdaten sind erfassbar und einem Vorgang zuordenbar.
2. Eine Kontaktänderung verändert keine historische Nachricht; eine Rolle verleiht keine Befugnis.
3. Ein nicht mehr genutzter Kontakt bleibt in vorhandenen Quellen nachvollziehbar.
4. Ein Kontakt ist eine Person oder eine Firma. Eine Person kann einer Firma zugeordnet sein; die Firma zeigt ihre Personen. Eine beim Anlegen genannte, noch unbekannte Firma wird mit angelegt.
5. Ein Kontakt hat je Gemeinschaft eine Rolle, etwa Beirat in der WEG und Eigentümer in der Tiefgarage; Name und mindestens eine Rolle in einer Gemeinschaft sind Pflicht. Ein gleichnamiger vorhandener Kontakt wird vor dem Speichern angezeigt.
6. Eigentümer werden je Gemeinschaft als Verteiler mit Anzahl, Sprachaufteilung, Quelle und Stand geführt und sind als Empfänger wählbar.
7. Die Kontaktansicht zeigt verantwortete Vorgänge und Nachrichten. E-Mail-Adresse und Telefonnummer lassen sich kopieren oder an die Mail- bzw. Telefon-App übergeben; das setzt keinen Versand- oder Gesprächsstatus.
8. **Private Personen:** Eigentümer und andere Privatpersonen werden wie alle Personen im gemeinsamen Ordner geführt und tragen die Markierung `private: true`. Das Formular setzt sie automatisch, sobald eine Rolle „Eigentümer“ gewählt wird; der Mensch kann sie für weitere Privatpersonen setzen, aber bei einer Eigentümerrolle nicht entfernen.
9. **Schutz:** Aus privaten Notizen übernimmt das Plugin nie Inhalte in Entwürfe, Entscheidungskarten, Berichte, Ausgaben oder Freigaben; ein Agent erhält sie nicht als Kontext. Als Empfänger erscheint eine private Person nur, wenn der Mensch sie ausdrücklich wählt.
10. **Fehlende Markierung als Problem:** Eine Personennotiz mit Rolle „Eigentümer“ ohne `private: true`, etwa von Hand oder über Sync angelegt, erscheint als Problem mit Ursache und Ausweg („Markierung privat setzen“). Bis sie geklärt ist, behandelt das Plugin die Notiz wie eine private und übernimmt nichts daraus in Ausgaben.

## Herkunft und Regeln

Kriterien 4–7: Ergänzt aus dem Designreview und Pilot-Prototyp vom 15.11.2026 (direkte Nutzeranforderung, siehe [[Prototyp - Stand Pilot]]).

Alt FR-02; P FR-V1; US-03. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-01 - Gemeinschaftskontext wählen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Kommentare

- 22.11.2026: Kriterien 5, 8, 9 und 10 nach den Entscheidungen zum WCS-Datenmodell: alle Personen als Notiz, Rolle je Gemeinschaft, Privatpersonen mit Markierung `private: true` und eine fehlende Markierung als Problem ([[ENT-02 - Person und Rolle]], [[00 - Fachliches Domänenmodell]], O-DM-4).
