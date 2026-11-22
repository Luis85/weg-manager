---
type: PBI
parent: "[[F-22 - Offene Notizen und direkter Agentenzugriff]]"
order: 67000
release: "[[MVP - Beirat Support]]"
actors:
  - "[[docs/design/actors/ACT-01-Beirat]]"
entities:
  - "[[docs/entities/ENT-01 - Gemeinschaft]]"
  - "[[docs/entities/ENT-02 - Person und Rolle]]"
  - "[[docs/entities/ENT-03 - Thema]]"
  - "[[docs/entities/ENT-04 - Vorgang]]"
  - "[[docs/entities/ENT-05 - Termin]]"
  - "[[docs/entities/ENT-06 - Verlaufseintrag]]"
  - "[[docs/entities/ENT-07 - Quelle]]"
  - "[[docs/entities/ENT-08 - Dokument]]"
  - "[[docs/entities/ENT-09 - Entscheidungskarte]]"
  - "[[docs/entities/ENT-10 - Nachrichtenentwurf]]"
  - "[[docs/entities/ENT-11 - Versanddokumentation]]"
  - "[[docs/entities/ENT-12 - To-do]]"
  - "[[docs/entities/ENT-13 - Eskalation]]"
  - "[[docs/entities/ENT-14 - Übergabe]]"
  - "[[docs/entities/ENT-15 - Ausgabestand]]"
  - "[[docs/entities/ENT-16 - Beiratsbewertung]]"
business-rules:
  - "[[docs/business-rules/DF-22 - Notizen als maßgeblicher Datenbestand]]"
  - "[[docs/business-rules/DF-23 - Externe Bearbeitung ohne stilles Überschreiben]]"
decisions:
  - "[[docs/decisions/K-14 - Markdown und Frontmatter als offene Datengrundlage]]"
hypotheses: []
pages:
  - "[[docs/design/sitemap/VIEW-03 - Vorgänge und Vorgangsakte]]"
  - "[[docs/design/sitemap/VIEW-07 - Einstellungen und Einrichtung]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-06 - Einrichten, Import und Datenerhalt]]"
  - "[[docs/design/user-flows/FLOW-08 - Zwischen Plugin und direkter Dateibearbeitung wechseln]]"
---

# PBI-41 · Vorgänge ohne Plugin und Obsidian nutzen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Nutzer möchte ich meine Vorgänge direkt aus den gespeicherten Notizen ohne Plugin und ohne Obsidian lesen und bearbeiten können, damit meine Arbeit unabhängig von einer bestimmten Anwendung verfügbar bleibt.

## Akzeptanzkriterien

1. Jeder gespeicherte Vorgang beziehungsweise Punkt ist als verständliche Markdown-Notiz mit YAML-Frontmatter verfügbar. Ergebnis, Gemeinschaft, Zustand, nächste Handlung und zugehörige Quellen sind ohne App-Kontext nachvollziehbar.
2. Erforderliche fachliche Daten und Beziehungen stehen in normalen Dateien. Eine nur interne Datenbank, ein Index oder ein Obsidian-spezifischer Laufzeitzustand ist keine exklusive fachliche Quelle.
3. Der Ordner ist ohne vorherigen Export zugänglich. Geschlossenes Plugin, geschlossenes oder nicht installiertes Obsidian und fehlender MCP Server verhindern Lesen oder vertragskonforme Bearbeitung mit einem gewöhnlichen Dateieditor nicht.
4. Originalanhänge bleiben als Dateien vorhanden. Referenzen lassen sich anhand dokumentierter IDs und Dateibeziehungen ohne Obsidian auflösen; reine dynamische Views enthalten keine ausschließlich dort vorhandenen Fachinformationen.
5. Ein mitgelieferter, lokal lesbarer Dateivertrag erklärt Felder, Beziehungen, Zustände und zulässige Änderungen mit Beispielen. Unbekannte Werte und Entwürfe bleiben als solche erkennbar.
6. Nach einer gültigen externen Änderung liest das Plugin den Bestand erneut ein; ein rekonstruierbarer Cache darf keine alte Fassung zum maßgeblichen Stand machen. Eigene ungespeicherte Eingaben bleiben gesondert geschützt.

## Herkunft und Regeln

Direkte Produktvorgabe vom 15.11.2026, dokumentiert in [[K-14 - Markdown und Frontmatter als offene Datengrundlage]]. Die vorhandenen Pages werden für Hilfe, Kontext und Konfliktklärung ergänzt; der Dateizugriff selbst liegt außerhalb der Plugin-Oberfläche. Keine neue Hypothese wird aus dieser festgelegten Anforderung behauptet.

## Fachliche Abhängigkeiten

[[PBI-05 - Einen Vorgang erfassen und wiederfinden]], [[PBI-11 - Nachricht und Original zuordnen]], [[PBI-31 - Konflikte ohne Datenverlust klären]], [[Datenkonzept - Offene Notizen und Agentenzugriff]].

## Refinementgrenze

Das konkrete Schema, die Dateinamenkonvention, Erkennungs-/Schreibmechanik und Testwerkzeuge werden technisch entworfen. Ihre Dokumentation und die werkzeugunabhängige Nutzbarkeit sind verbindliche Abnahmeziele, nicht auf später verschobene Fähigkeiten.
