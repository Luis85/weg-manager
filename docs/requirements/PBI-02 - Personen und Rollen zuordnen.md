---
type: PBI
parent: "[[F-01 - Gemeinschaften, Personen und Rollen]]"
order: 4000
actors:
  - "[[ACT-01-Beirat]]"
release: "[[MVP - Beirat Support]]"
status: ""
started: 2026-11-23
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
- 22.11.2026 (Abgleich im vierten Interview): Der Eigentümer hat im zweiten Interview vom 22.11.2026 entschieden, dass ein Kontakt eine Rolle hat (O-D10 in [[09 - Offene Punkte vor Implementierung]], Nachtrag „a contact's role stays flat“ in `docs/adr/0007-vault-data-access.md`, [[ENT-02 - Person und Rolle]]): ein Kontakt hat eine Rolle und eine Zuständigkeit für eine oder mehrere Gemeinschaften; eine abweichende Rolle in einer anderen Gemeinschaft steht in der Notiz des Kontakts, eine Rolle je Gemeinschaft kann mit einer neuen Schemaversion folgen. Diese Entscheidung ersetzt die Formulierung „mit ihrer Rolle je Gemeinschaft“ in der User Story, in der Sache: „eine Rolle, zuständig für eine oder mehrere Gemeinschaften“. Die User Story selbst bleibt unverändert stehen. Kriterium 1 („Name, Rolle“) und Kriterium 5 (Zuständigkeit für mehrere Gemeinschaften) stimmen mit der Entscheidung überein und bleiben. Die Entscheidung steht nicht in `docs/decisions/` (dort gibt es keine K-Note dazu), sondern in den drei genannten Stellen. **Später am selben Tag abgelöst:** Nach der Übernahme des WCS-Datenmodells hat der Eigentümer eine Rolle je Gemeinschaft entschieden (O-D10, Nachtrag „a role per community, as coded list entries“ in ADR 0007); Kriterium 5 und der folgende Kommentar setzen das um.
- 23.11.2026: Entscheidungen des Produktverantwortlichen und Umsetzungsfreigabe für einen ersten Schnitt.
  - **Freigabe (Kern-Schnitt):** ein neues Modul `contacts`. Personen und Firmen werden als Notizen angelegt, aufgelistet, bearbeitet und als nicht mehr verwendet gekennzeichnet (`inactive`). Felder: Name, Art (Person oder Firma), Firma, Rollen je Gemeinschaft (`roles`), E-Mail, Telefon, Sprache und `private`. Eine Eigentümerrolle setzt `private`; eine fehlende Markierung ist ein Problem. Damit sind die Kriterien 4, 5, 8 und 10 erfüllt. Bezüge zu Vorgängen und Nachrichten (Kriterien 1, 3 und 7), der Verteiler (Kriterium 6) und der Schutz in Ausgaben (Kriterium 9) folgen mit Vorgängen und Postausgang.
  - **Firma (Kriterium 4):** Eine Firma ist eine eigene Kontaktnotiz mit der Art „Firma“. Eine Person verweist mit `organization_id` auf deren `id`, wie `community_id` auf die Gemeinschaft. Eine beim Speichern genannte, noch unbekannte Firma wird mit angelegt.
  - **Eigentümer (Kriterien 6 und 8):** Im ersten Schnitt sind Eigentümer einzelne Personen mit `private: true`. Der Verteiler bekommt mit dem Postausgang eine eigene Entität.
  - **Vor der Umsetzung:** ein Dateivertrag `docs/contracts/DV-02 - Kontakt v1.md` und die Begriffe in `GLOSSARY.md`.
- 23.11.2026 (Interview): weitere Entscheidungen des Produktverantwortlichen zum ersten Schnitt.
  - **Rollen:** die geschlossene WCS-Liste aus [[ENT-02 - Person und Rolle]]: Beirat (`board`), Vertretung (`deputy`), Eigentümer (`owner`), Verwaltung (`manager`), Beirat andere Gemeinschaft (`other_board`), Dritte (`third_party`), Agent (`agent`).
  - **Notiztyp und Ordner:** `schema: weg-manager.contact/v1`, `id` `contact-<uuid>`, Ordner `<Wurzelordner>/Kontakte/`. Person und Firma sind derselbe Notiztyp mit der Art `kind`.
  - **Nicht mehr verwendet:** Kennzeichnen statt löschen. Es gibt kein Löschen; ein Kontakt mit `inactive: true` bleibt in der Liste und ist hinter dem Filter „Nicht mehr verwendete zeigen“ ausgeblendet.
  - **Ort:** eine eigene Route „Kontakte“ in der Navigation, wie in Sitemap und Prototyp, nicht in den Einstellungen.
- 23.11.2026 (Umsetzung des ersten Schnitts): Modul `contacts` in allen Schichten, Dateivertrag [[DV-02 - Kontakt v1]], eigene Route „Kontakte“ in der Navigation. Erfüllt sind die Kriterien 4 (Person oder Firma, Person einer Firma zugeordnet, die Firma zeigt ihre Personen, eine neue Firma wird beim Speichern mit angelegt), 5 (je Gemeinschaft eine Rolle, Name und mindestens eine Rolle Pflicht, gleichnamiger Kontakt vor dem Speichern angezeigt), 8 (Eigentümerrolle setzt `private: true` und hält es) und 10 (fehlende Markierung als Problem mit Ausweg). Teilweise: Kriterium 1 (Name, Rolle, Kontaktdaten erfassbar; die Zuordnung zu einem Vorgang folgt mit den Vorgängen) und 3 (ein nicht mehr verwendeter Kontakt bleibt erhalten, `inactive`; der Nachweis in Quellen folgt mit Vorgängen und Nachrichten). Offen: Kriterien 2, 6, 7 und 9, die Nachrichten, Postausgang und Vorgänge brauchen. Kriterium 10 behandelt eine Notiz ohne Markierung schon wie eine private, weil das Plugin noch nichts ausgibt; der Schutz in Ausgaben selbst ist Teil von Kriterium 9. Tests: `tests/unit/domain/contacts/`, `tests/unit/application/contacts/`, `tests/dom/presentation/contacts/screen.test.ts`, `tests/e2e/specs/contacts.e2e.ts`. `npm run verify` mit Exit 0, e2e 27 von 27 Specs grün.

