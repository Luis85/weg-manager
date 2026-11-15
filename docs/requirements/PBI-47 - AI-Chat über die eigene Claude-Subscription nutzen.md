---
type: PBI
parent: "[[F-23 - Nativer AI-Chat]]"
order: 74000
release: "[[MVP - Beirat Support]]"
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-11 - Offizielle Claude-Code-Laufzeit]]"
entities:
  - "[[docs/design/entities/ENT-01 - Gemeinschaft]]"
  - "[[docs/design/entities/ENT-02 - Ansprechpartner]]"
  - "[[docs/design/entities/ENT-03 - Thema]]"
  - "[[docs/design/entities/ENT-04 - Punkt]]"
  - "[[docs/design/entities/ENT-05 - Termin]]"
  - "[[docs/design/entities/ENT-06 - Ereignis]]"
  - "[[docs/design/entities/ENT-07 - Quelle]]"
  - "[[docs/design/entities/ENT-08 - Dokument]]"
  - "[[docs/design/entities/ENT-09 - Arbeitsentscheidung]]"
  - "[[docs/design/entities/ENT-10 - Nachrichtenentwurf]]"
  - "[[docs/design/entities/ENT-11 - Versanddokumentation]]"
  - "[[docs/design/entities/ENT-12 - Eigene Aufgabe]]"
  - "[[docs/design/entities/ENT-13 - Nachfassstand]]"
  - "[[docs/design/entities/ENT-14 - Wochenübergabe]]"
  - "[[docs/design/entities/ENT-15 - Ausgabestand]]"
  - "[[docs/design/entities/ENT-16 - Beiratsbewertung]]"
  - "[[docs/design/entities/ENT-21 - E-Mail-Quellnotiz]]"
  - "[[docs/design/entities/ENT-22 - AI-Gespräch]]"
business-rules:
  - "[[docs/business-rules/DF-01 - Beiratsarbeit und Befugnis]]"
  - "[[docs/business-rules/DF-07 - Wahl, Entwurf und Versand]]"
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-11 - Sachstand und Bewertung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
  - "[[docs/business-rules/DF-15 - Arbeitsentscheidung und Beschluss]]"
  - "[[docs/business-rules/DF-22 - Notizen als maßgeblicher Datenbestand]]"
  - "[[docs/business-rules/DF-23 - Externe Bearbeitung ohne stilles Überschreiben]]"
  - "[[docs/business-rules/DF-27 - Abo-Nutzung ohne stillen Abrechnungswechsel]]"
  - "[[docs/business-rules/DF-28 - Chatantwort und ausgeführte Fachaktion unterscheiden]]"
decisions:
  - "[[K-17 - Nativer AI-Chat über das Nutzerabo]]"
  - "[[K-14 - Markdown und Frontmatter als offene Datengrundlage]]"
hypotheses:
  - "[[H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]"
  - "[[H-11 - Der Nutzen führt zu erneuter Verwendung]]"
pages: []
user-flows: []
---

# PBI-47 · AI-Chat über die eigene Claude-Subscription nutzen

**Planungsstand:** MVP-Anforderung; technische/policybezogene Prüfung offen · **Erster Betriebsweg:** Desktop

## User Story

Als Nutzer möchte ich direkt im Plugin einen AI-Chat mit der offiziellen Claude-Code-Laufzeit über mein eigenes berechtigtes Claude-Abo führen, damit ich meinen freigegebenen Vaultkontext nutzen und Assistenzaufträge erteilen kann, ohne dafür einen separaten API-Abrechnungsweg einrichten zu müssen.

## Akzeptanzkriterien

1. Das Plugin bietet eine native Chatansicht mit Eingabe, verständlichem Gesprächsverlauf, laufender Antwortdarstellung, erkennbarer Tätigkeit und Abbruch. Nur das Öffnen eines externen Terminals oder einer Website erfüllt diese Anforderung nicht.
2. Der Nutzer authentifiziert sich über den offiziellen Claude-Code-Weg; das Plugin baut keinen Claude-Login nach, liest keine Sitzungstokens aus und speichert keine Zugangsdaten in Vault-/Gesprächsnotizen. Die offizielle Runtime wird unverändert verwendet.
3. Der tatsächliche Auth-/Abrechnungsmodus ist vor einem als Abo-Nutzung bezeichneten Auftrag anhand unterstützter Mechanismen geklärt. Ein vorhandener API-Key oder anderer Provider wird nicht still als Abo-Modus verwendet. Nicht feststellbarer Modus wird als unbekannt angezeigt und zuerst geklärt; Werte und Restkontingente werden nicht erfunden.
4. Fehlende/ungeeignete Laufzeit, fehlende Anmeldung, abgelaufene Sitzung, Netzfehler, Nutzungslimit und Abbruch sind verständliche Zustände. Eingaben bleiben erhalten. Kein automatischer Wechsel auf kostenpflichtige API-Nutzung oder Aufladung; keine Zusage unbegrenzter Nutzung.
5. Vor Kontextübergabe sind Arbeitsordner und gegebenenfalls Gemeinschaft/Notizauswahl erkennbar. Die Oberfläche verspricht keine engere Dateirechte-Isolation, als Runtime/Umgebung tatsächlich durchsetzen. Modellverarbeitung außerhalb des Geräts wird nicht als ausschließlich lokale Berechnung bezeichnet.
6. Antworten benennen verwendete Notizbezüge soweit verfügbar und unterscheiden belegte Angaben, Unsicherheit und Vorschläge. Ein Text „erledigt“ ändert weder Fachstatus noch Versand-/Zahlungsstand automatisch.
7. Ausgeführte Dateiaktionen entsprechen dem Nutzerauftrag und den tatsächlichen Runtime-Berechtigungen. Erforderliche Tool-/Schreibbestätigungen bleiben sichtbar und bedienbar; eine Integration darf sie nicht pauschal übergehen, nur um den Chat reibungsloser erscheinen zu lassen.
8. Nach Änderungen liest das Plugin denselben Markdown-/Frontmatter-Bestand neu ein und schützt offene konkurrierende Eingaben. Bei Abbruch bleiben bereits ausgeführte Schritte nachvollziehbar; kein automatisches Rollback oder Nachrichtenrückruf wird behauptet.
9. Aufbewahrter Plugin-Gesprächsinhalt und relevante Aktionsbezüge bleiben offen als Markdown mit dokumentiertem Frontmatter lesbar. Runtime-Sitzungsreferenzen enthalten keine Authgeheimnisse; eine nur externe undokumentierte Historie ersetzt nicht den lokalen Plugin-Gesprächsstand.
10. Skills/Connectoren werden nach tatsächlich vorhandenen Fähigkeiten geprüft. Dieselbe Claude-Anmeldung allein garantiert keinen Gmail-Connector in Claude Code. Der Gmail-Skill bleibt nur bei erfüllten Voraussetzungen nutzbar und unverändert auf lesenden Import begrenzt.
11. Der erste nachzuweisende Chatbetrieb ist Desktop. Ein mobiler Chatweg ist offen; die vollständige mobile Beirats-Kernreise muss weiterhin ohne Chat nutzbar sein. Ohne eigene mobile Spezifikation wird keine plattformübergreifende Chatabnahme behauptet.
12. Vor Freigabe werden Integration, Auth-/Abrechnungsweg und Berechtigungsdialoge mit einer unterstützten offiziellen Runtime tatsächlich geprüft. Native Chat-UI, Streaming/Fortsetzung, Kontext, Limit, Abbruch, Dateiänderung und offener Gesprächsstand erhalten nachvollziehbare Tests. Kein Bestandteil davon wurde durch diese Anforderungsnote bereits implementiert oder live abgenommen.

## Herkunft und Bezüge

Direkte Nutzeranforderung, festgehalten in [[K-17 - Nativer AI-Chat über das Nutzerabo]]. Offizielle Quellen und Integrationsgrenzen in [[Integrationsresearch - Nativer AI-Chat mit Claude Code]]. Abhängigkeiten: [[PBI-41 - Vorgänge ohne Plugin und Obsidian nutzen]], [[PBI-42 - AI-Agent direkt mit den Notizen arbeiten lassen]], [[PBI-31 - Konflikte ohne Datenverlust klären]].

`pages` und `user-flows` bleiben bis zum konkreten Entwurf der nativen Chatansicht leer. Die bestehende externe Agentennutzung ist kein bereits fertiges Chatdesign. Diese Story ändert nicht die Abnahme der vorhandenen Gmail-Skill-Dateien.
