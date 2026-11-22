---
type: PBI
parent: "[[F-12 - Daten erhalten und selbstständig starten]]"
order: 49000
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
  - "[[docs/business-rules/DF-01 - Beiratsarbeit und Befugnis]]"
  - "[[docs/business-rules/DF-02 - Bearbeitung, Terminprüfung und Bewertung]]"
  - "[[docs/business-rules/DF-03 - Terminbedeutung]]"
  - "[[docs/business-rules/DF-04 - Fehlender Termin]]"
  - "[[docs/business-rules/DF-05 - Eskalationsleiter und Fristen]]"
  - "[[docs/business-rules/DF-06 - Reaktion und Pause]]"
  - "[[docs/business-rules/DF-07 - Wahl, Entwurf und Versand]]"
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
  - "[[docs/business-rules/DF-09 - Begrenzte Auswahl und Dringlichkeit]]"
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-11 - Sachstand und Bewertung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
  - "[[docs/business-rules/DF-14 - Kennzahlen]]"
  - "[[docs/business-rules/DF-15 - Entscheidungskarte und Beschluss]]"
decisions:
  - "[[docs/decisions/K-01 - Beirat als erster Produkteinstieg]]"
  - "[[docs/decisions/K-04 - Wochenpaket beim Einstieg aktualisieren]]"
  - "[[docs/decisions/K-10 - Manuelle Quellenübernahme und Registerimport vorsehen]]"
  - "[[docs/decisions/K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]"
hypotheses:
  - "[[docs/hypothesis/H-06 - Vorbereitete Wochenarbeit ist ohne verpflichtende KI nützlich]]"
  - "[[docs/hypothesis/H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
  - "[[docs/hypothesis/H-11 - Der Nutzen führt zu erneuter Verwendung]]"
pages:
  - "[[docs/design/sitemap/VIEW-07 - Einstellungen und Einrichtung]]"
user-flows:
  - "[[docs/design/user-flows/FLOW-01 - Gesamtfluss des Beirats-MVP]]"
  - "[[docs/design/user-flows/FLOW-06 - Einrichten, Import und Datenerhalt]]"
---

# PBI-32 · Ohne KI selbstständig beginnen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP

## User Story

Als Beirat möchte ich mit verständlicher Hilfe ohne KI meinen ersten Wochenablauf durchführen, damit ich unabhängig arbeitsfähig werde.

## Akzeptanzkriterien

1. Einführung führt von Gemeinschaft und optionalem Registerimport zum ersten Vorgang und nächsten Schritt; keine echten Daten imitierenden Beispielakten werden automatisch angelegt.
2. Lokale Hilfe erklärt Kernreise, externen Versand, Datenlücken, Sicherung und Wiederherstellung.
3. Gesamter lokaler Ablauf funktioniert ohne Netzwerk, eigenes Konto und KI; externe Mailzustellung ist gesondert.
4. Diagnosebericht ist lokal prüfbar und standardmäßig ohne Akteninhalte; es wird nichts automatisch übertragen.
5. Beim ersten Start stellt eine Einführungstour die Hauptbereiche vor. Sie ist überspringbar, startet danach nicht erneut von selbst und ist unter Einstellungen › Hilfe neu startbar. Sie legt keine Beispielakten an.
6. Beim ersten Durchlauf der Wochenarbeit zeigt jeder Schritt einen kurzen Hinweis. Er lässt sich einzeln oder für alle Schritte ausblenden und unter Einstellungen › Hilfe wieder einschalten.

## Herkunft und Regeln

Kriterien 5–6: Ergänzt aus dem Designreview und Pilot-Prototyp vom 15.11.2026 (direkte Nutzeranforderung, siehe [[Prototyp - Stand Pilot]]).

Alt FR-19; P NFR-3/4/8; US-15. Quellkürzel: 01-Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`). Regeln: [[Product Backlog.base#Business Rules]].

## Fachliche Abhängigkeiten

[[PBI-13 - Aktuelle Wochenlage öffnen]], [[PBI-17 - Folgearbeit aus Entscheidungen vorbereiten]], [[PBI-29 - Sachstand lesbar übergeben]], [[PBI-30 - Bestand sichern und wiederherstellen]]

## Refinementgrenze

Fachlich prüfbarer Entwurf. Aufwand, technische Lösung und Umsetzungsfreigabe sind offen. Anwendbare Qualitätsanforderungen und offene Entscheidungen im [[02-MVP-PRD]] gehören zur Abnahme.

## Kommentare

- 22.11.2026: Kriterium 1 (Einführung zum ersten Vorgang) und Kriterium 5 (Einführungstour) werden durch [[F-25 - Onboarding und Einführung]] konkretisiert, vor allem [[PBI-75 - Gemeinschaften im Einrichtungsassistenten anlegen]], [[PBI-76 - Nach der Einrichtung auf der Lage mit Ersten Schritten ankommen]] und [[PBI-77 - Beim ersten Benutzen eines Bereichs einen Hinweis erhalten]]. Hilfe, Offline-Betrieb, Diagnose und die Hinweise in der Wochenarbeit bleiben hier. Siehe [[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]].
- 22.11.2026: Kriterium 5 wird ohne Tour erfüllt. Statt einer Einführungstour erklären einzelne Hinweise beim ersten Benutzen die Bereiche; „Hinweise erneut zeigen“ ersetzt den Neustart der Tour ([[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]]).
