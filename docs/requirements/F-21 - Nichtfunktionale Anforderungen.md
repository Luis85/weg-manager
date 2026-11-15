---
type: Feature
parent: "[[E-07 - Cross Cutting Concerns]]"
order: 62600
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
---

# F-21 · Nichtfunktionale Anforderungen

**Planungsstand:** Konzeptentwurf · **Umfang:** MVP; querschnittliche Qualitätsanforderungen

## Ziel und Geltung

Die Qualität des gesamten lokalen Beirats-MVP wird an einer Stelle spezifiziert und in den betroffenen Nutzerabläufen geprüft. Dieses Feature ist im Epic Cross Cutting Concerns der fachliche Ablageort für die B-NFR-01 bis B-NFR-14. B-NFR-13/14 ergänzen die festgelegte offene Dateischnittstelle; B-NFR-10 wird ausdrücklich auf Nutzung ohne Obsidian präzisiert.

Die Anforderungen gelten für alle jeweils betroffenen Features und PBIs, unabhängig von deren Eltern-Epic. Die Zuordnung zu E-07 verschiebt sie nicht in eine spätere Ausbaustufe. Integrationen und MCP Server bleiben dagegen zunächst späterer Umfang.

## Anforderungen und Prüfziele

Alle B-NFR sind geplante Releasekriterien. Konkrete Referenzgeräte und Versionen werden vor Entwicklungsfreigabe festgelegt; diese Lücke ist sichtbar und keine Freistellung von der mobilen Anforderung.

| ID | Anforderung und Prüfung |
| --- | --- |
| B-NFR-01 Offline und KI-Unabhängigkeit | AT-B01–13 funktionieren für lokale Bearbeitung bei gesperrtem Netzwerk ohne KI und eigenes Konto. Externer tatsächlicher Mailversand findet separat statt. |
| B-NFR-02 Datenerhalt | Abbruch, wiederholte Aktion, externe Änderung und Wiederherstellung verlieren keine bestätigten Daten; keine stillen Dubletten. Fremde Notizinhalte und Properties bleiben erhalten. |
| B-NFR-03 Fachkorrektheit | Die für den MVP anwendbaren DF-Regeln und Abnahmeanker bestehen; berechnete Zeitkennzahlen aus DF-14 werden erst mit PBI-36 abgenommen; Datumswechsel, unbekannte Werte, Reaktionen und Zustände bleiben korrekt getrennt. Kein Zahlungsrechenmodell im MVP. |
| B-NFR-04 Reaktionszeit | Fortgeführtes Desktop-Prüfziel: erste Übersicht in 19 von 20 Starts binnen fünf Sekunden; Filtern/Öffnen nach Initialisierung in mindestens 95 % von 30 Aktionen binnen 300 ms. |
| B-NFR-05 Speichern | Desktop: Formular ohne Dateikopie in mindestens 95 % von 30 Aktionen binnen 500 ms; lange Imports zeigen Fortschritt und Ausgang. Mobile Messziele vor Entwicklungsfreigabe ergänzen (O-02). |
| B-NFR-06 Bedienbarkeit | Kernreise per Tastatur, sichtbarer Fokus, Text zusätzlich zu Statusfarben, erreichbare Aktionen und Fehler bei 200 % Zoom; deutsche Fachsprache. Mobile Kernaktionen ohne Desktopausweichschritt. |
| B-NFR-07 Vertraulichkeit | Keine automatische externe Übertragung von Akten/Diagnosen; lokale Diagnosen standardmäßig ohne Akteninhalte, Namen und vollständige Dateipfade. Keine echten Eigentümerdaten in Testmaterial oder Repository. |
| B-NFR-08 Sichere Darstellung | Fremde Texte und erzeugte Übersichten führen keinen eingebetteten Code aus, laden keine externen Inhalte nach und offenbaren keine ungewählten lokalen Dateien. Originale bleiben unverändert, keine aktive Einbettung in externe Übersichten. |
| B-NFR-09 Plattformen | Windows 11 als Desktop-Referenz plus festgelegtes Pilot-Handy; minimale und zum Release aktuelle stabile unterstützte Obsidian-Version prüfen. Kein Desktop-only-Produktversprechen. |
| B-NFR-10 Portabilität | Jeder Vorgang bleibt direkt aus normalen Dateien ohne Plugin, ohne Obsidian und ohne vorherigen Export zugänglich und vertragskonform bearbeitbar. Originale und Beziehungen bleiben verfügbar; Sicherung in leerem Arbeitsbereich stellt sie wieder her. Export, Sicherung und interne Übergabe bleiben unterscheidbar. |
| B-NFR-11 Laufzeit | Einstieg und Wiederaufnahme aktualisieren Fristen. Keine angeblich erfolgte Hintergrundprüfung bei geschlossener App. Deaktivierung beendet eigene Laufzeitaktivität und entfernt keine Akten. |
| B-NFR-12 Verständliche Fehler | Fehler bewahren Eingaben und nennen Handlung; beschädigte Referenzen und neuere unbekannte Schemata werden nicht still überschrieben. Versionen sind für Diagnose erkennbar. |
| B-NFR-13 Offener Notizvertrag | Gespeicherte Fachinformationen liegen maßgeblich in Markdown mit dokumentiertem YAML-Frontmatter und zugeordneten Originaldateien. Lokal verfügbare Schema-/Regelbeschreibung erklärt IDs, Felder, Beziehungen, Zustände und externe Schreiboperationen. Kein nur plugininterner Index oder Obsidian-Laufzeitzustand ist exklusiver Fachbestand; optionale Caches sind rekonstruierbar. AT-B15 prüft dies ohne Plugin, Obsidian oder MCP. |
| B-NFR-14 Externe Agentenbearbeitung | Ein vom Nutzer zugelassener dateifähiger Agent kann den aktuellen Notizbestand ohne MCP lesen und vertragskonform ändern. Das Plugin berücksichtigt gültige externe Änderungen beim Start/Wiederaufnehmen und während der Nutzung; vor eigenem Schreiben wird eine veränderte Grundlage geprüft. Konflikte, ungültige oder unvollständige Dateien werden erkennbar behandelt, ohne stille Überschreibung oder Datenlöschung. AT-B16 prüft externe Änderung, Wiederaufnahme und Erhalt unbekannter Felder. |

Desktop-Referenzprofil als fortgeführter Vorschlag: Windows 11, SSD, 16 GB RAM, dokumentierte CPU und Obsidian-Version; **zwei Gemeinschaften**, insgesamt 200 Punkte, 2.000 Fachnotizen und 1.000 Originalanhänge, davon zehn mit 20 MiB. Listenaufbau liest nicht alle Originale vollständig. Ergebnisse und Messverfahren werden später dokumentiert. Mobile Hardware, Eingangsvolumen und Grenzen müssen anhand O-02 ergänzt werden. 97 berichtete Punkte sind kein technisches Limit.

Ein menschlicher Bearbeiter kann Plugin und externe Dateiwerkzeuge einschließlich AI-Agent auf demselben Bestand verwenden. Unabhängige Schreibvorgänge verlangen erkennbare Konfliktbehandlung; die bisherige Begrenzung unkoordinierter Schreibvorgänge über mehrere Geräte bleibt bestehen. Die technische Konzeption muss den tatsächlichen Gerätewechsel klären; ein neuer Syncdienst ist nicht vorgegeben. Dateimarkierungen und private Ordner ersetzen keine Zugriffsisolation gegenüber anderen Nutzern oder Plugins desselben Vaults. Es wird keine pauschale Verschlüsselung oder revisionssichere Archivierung zugesagt.

## Bezug zu User Stories und Abnahme

Dieses Feature führt Qualitätsbedingungen, keine zusätzlichen Funktionsstories mit denselben Inhalten. Bestehende PBIs behalten ihre fachlichen Eltern; sie werden nicht dupliziert oder mehrfach eingeordnet.

- Datenerhalt, Konflikte, Portabilität und verständliche Fehler: [[PBI-30 - Bestand sichern und wiederherstellen]], [[PBI-31 - Konflikte ohne Datenverlust klären]].
- Offlinearbeit, KI-Unabhängigkeit, Einstieg und Laufzeitgrenzen: [[PBI-32 - Ohne KI selbstständig beginnen]] sowie die gesamte Kernreise.
- Mobile Bedienbarkeit und Plattformen: [[PBI-33 - Wochenarbeit auf dem Handy abschließen]]; Tastaturbedienung und erreichbare Aktionen betreffen zusätzlich alle relevanten Oberflächen.
- Vertraulichkeit und sichere Darstellung: [[F-11 - Vertraulichkeit und gezielte Übergabe]] sowie Quellenübernahme, Nachrichten und Ausgaben.
- Fachkorrektheit: die anwendbaren Regeln in [[Product Backlog.base#Business Rules]] und die jeweiligen PBI-Akzeptanzkriterien.
- Reaktions- und Speicherzeiten: Messungen am hier beschriebenen Referenzbestand über die betroffenen Ansichten und Bearbeitungsschritte.

Der interne Abnahmeplan AT-B01 bis AT-B13 sowie AT-B15/16 steht im [[02-MVP-PRD]]; AT-B14 bestätigt erst die öffentliche Installierbarkeit. Die Prüfziele sind Anforderungen, keine bereits gemessenen Ergebnisse. Eigene zusätzliche PBIs werden erst angelegt, wenn ein eigenständiges Nutzerergebnis vorliegt; ein Mess- oder Technikschritt allein wird nicht künstlich zur User Story gemacht.

## Herkunft und Pflege

Aus dem Abschnitt „Qualitätsanforderungen“ des MVP-PRD 1.1 übernommen. Nutzerentscheidung vom 15.11.2026: Nichtfunktionale Anforderungen gehören in das Epic Cross Cutting Concerns. Dieses Feature ist nun die gepflegte Quelle der detaillierten B-NFR-Tabelle und des Referenzprofils; das PRD verweist darauf. Offene Angaben aus O-02 bleiben im historischen Intake-Abgleich (Git-Commit `b3a1cc2`, Pfad `docs/03-Intake-Abgleich.md`) sichtbar.

## Direkter Agentenzugriff ohne MCP

[[K-14 - Markdown und Frontmatter als offene Datengrundlage]], [[F-22 - Offene Notizen und direkter Agentenzugriff]], [[PBI-41 - Vorgänge ohne Plugin und Obsidian nutzen]] und [[PBI-42 - AI-Agent direkt mit den Notizen arbeiten lassen]] konkretisieren B-NFR-10/13/14. Der externe Agent ist optional; sein Modelldienst gehört nicht zur Offline-Systemgrenze des Plugins. Der Dateizugriff selbst benötigt weder Backend noch MCP. UI-interne Kennzeichnungen sind keine Rechteverwaltung für andere Prozesse mit Ordnerzugriff.

## Optionaler Claude-Gmail-Eingang

[[PBI-46 - Gmail-Nachrichten mit Claude als Vault-Notizen übernehmen]] ist ein bewusst gewählter externer Connectorweg. Gmail-Abfrage und Claude-Ausführung benötigen die dortigen Fähigkeiten und gegebenenfalls Netzwerk; die lokale Plugin-Kernreise und die gespeicherten Notizen bleiben davon unabhängig. AT-B17 prüft diesen Integrationsweg zusätzlich technisch vor Veröffentlichung. Die bestehenden Offline-/Datenerhaltungsanforderungen werden nicht still aufgehoben.

## Optionaler nativer AI-Chat

[[F-23 - Nativer AI-Chat]] ergänzt einen ausdrücklich gewählten Online-Assistenzweg über die offizielle Claude-Code-Laufzeit. Die Offline-/KI-Unabhängigkeit der bisherigen lokalen Kernreise bleibt bestehen. Der erste Chat-Betriebsweg wird auf Desktop untersucht; eine lokale mobile Chat-Runtime ist noch nicht spezifiziert. [[DF-27 - Abo-Nutzung ohne stillen Abrechnungswechsel]] verlangt nachvollziehbare Abrechnungstransparenz, [[DF-28 - Chatantwort und ausgeführte Fachaktion unterscheiden]] nachvollziehbare Änderungen und Abbruchzustände. Der offene technische Nachweis gehört vor Freigabe dazu; Bilder oder vorhandene CLI-Dokumentation allein sind kein Nachweis.
