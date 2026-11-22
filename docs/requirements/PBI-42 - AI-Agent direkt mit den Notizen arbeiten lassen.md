---
type: PBI
parent: "[[F-22 - Offene Notizen und direkter Agentenzugriff]]"
order: 68000
release: "[[MVP - Beirat Support]]"
actors:
  - "[[docs/design/actors/ACT-01-Beirat]]"
  - "[[docs/design/actors/ACT-09 - AI-Agent mit direktem Dateizugriff]]"
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
  - "[[docs/business-rules/DF-07 - Wahl, Entwurf und Versand]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
decisions:
  - "[[docs/decisions/K-14 - Markdown und Frontmatter als offene Datengrundlage]]"
hypotheses: []
pages:
  - "[[docs/design/sitemap/VIEW-02 - Wochenarbeit]]"
  - "[[docs/design/sitemap/VIEW-03 - Vorgänge und Vorgangsakte]]"
  - "[[docs/design/sitemap/VIEW-07 - Einstellungen und Einrichtung]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-06 - Einrichten, Import und Datenerhalt]]"
  - "[[docs/design/user-flows/FLOW-08 - Zwischen Plugin und direkter Dateibearbeitung wechseln]]"
---

# PBI-42 · AI-Agent direkt mit den Notizen arbeiten lassen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Nutzer möchte ich einem AI-Agent Zugriff auf meinen Vault oder Ordner geben und ihn direkt mit den Notizen arbeiten lassen, damit er den Kontext erfassen und erlaubte Änderungen ohne Plugin- oder MCP-Abhängigkeit vornehmen kann.

## Akzeptanzkriterien

1. Ein Agent mit vom Nutzer eingeräumtem Dateizugriff kann anhand der normalen Markdown-/Frontmatter-Dateien und des lokal verfügbaren Dateivertrags Gemeinschaften, Punkte, Beziehungen, Quellen, Zustände und nächste Schritte nachvollziehen; kein MCP-Aufruf oder laufender Obsidian-Prozess ist erforderlich.
2. Im freigegebenen Umfang kann der Agent Punkte, Aufgaben, Quellenbezüge oder vorbereitete Texte anlegen beziehungsweise ändern. IDs, Referenzen und Fachregeln werden anhand des dokumentierten Schreibvertrags erhalten; unbekannte Zusatzfelder und nicht betroffene Texte bleiben bestehen.
3. Bei geöffnetem Plugin werden externe Änderungen erkannt und in betroffenen Ansichten berücksichtigt. Bei konkurrierender eigener Bearbeitung werden beide Stände beziehungsweise die eigenen Eingaben erhalten und ein Konflikt sichtbar; kein stilles last-write-wins.
4. Ungültiges oder vorübergehend unvollständiges Frontmatter, doppelte IDs, beschädigte Beziehungen und neuere unbekannte Schemata werden erkennbar behandelt. Wiederaufnahme nach Korrektur erzeugt keine Dubletten.
5. Geänderte Entscheidung, Frist oder Textfassung macht betroffene bestehende Prüfstände erneut prüfbedürftig. Agentenschreiben erzeugt keinen erfundenen menschlichen Versand, Beschluss, Zahlungsnachweis oder eine tatsächlich nicht erfolgte Bestätigung.
6. Agentenzugriff ist optional und vom Nutzer beziehungsweise der Umgebung gesteuert. Das Plugin führt dafür keine automatische externe Übertragung ein und behauptet keine Zugriffssperre durch interne UI-Labels.
7. Intern wird ein synthetischer Bestand einmal bei geschlossenem Plugin und einmal während offener Bearbeitung extern gelesen und verändert; gültige Übernahme, Konflikt, Fehler und erhaltene Originale werden nachvollziehbar geprüft. Dies ist eine geplante Abnahme, noch kein bestandener Test.

## Herkunft und Regeln

Direkte Produktvorgabe vom 15.11.2026, dokumentiert in [[K-14 - Markdown und Frontmatter als offene Datengrundlage]]. Die vorhandenen Pages werden für Hilfe, Kontext und Konfliktklärung ergänzt; der Dateizugriff selbst liegt außerhalb der Plugin-Oberfläche. Keine neue Hypothese wird aus dieser festgelegten Anforderung behauptet.

## Fachliche Abhängigkeiten

[[PBI-05 - Einen Vorgang erfassen und wiederfinden]], [[PBI-11 - Nachricht und Original zuordnen]], [[PBI-31 - Konflikte ohne Datenverlust klären]], [[Datenkonzept - Offene Notizen und Agentenzugriff]].

## Refinementgrenze

Das konkrete Schema, die Dateinamenkonvention, Erkennungs-/Schreibmechanik und Testwerkzeuge werden technisch entworfen. Ihre Dokumentation und die werkzeugunabhängige Nutzbarkeit sind verbindliche Abnahmeziele, nicht auf später verschobene Fähigkeiten.
