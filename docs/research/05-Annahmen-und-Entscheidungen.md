---
type: Entscheidungsregister
product: WEG Manager
status: arbeitsstand
version: "1.0"
date: 2026-11-15
---

# Annahmen, Entscheidungen und offene Nachweise

**Stand: 15.11.2026.** Dieses Register trennt die vom Auftraggeber festgelegte Richtung von vorgeschlagenen Produkt-Defaults und noch ungeprüften Hypothesen. Das [MVP-PRD](../02-MVP-PRD.md) enthält die vollständigen Anforderungen und Abnahmeregeln. Das Register führt keine zusätzlichen Releasebedingungen ein.

## 1. Vom Auftraggeber festgelegte Richtung

| ID | Entscheidung beziehungsweise bekannter Kontext | Auswirkung |
|---|---|---|
| D-01 | Das erste Produkt ist ein Obsidian-Plugin. | Der MVP muss im lokalen Vault eigenständig nutzbar sein. |
| D-02 | Das Plugin wird im offiziellen Obsidian Community-Verzeichnis veröffentlicht. | Release-Artefakte, Dokumentation und eine erfolgreiche öffentliche Installation gehören zum Veröffentlichungsmeilenstein. |
| D-03 | Die Pilotvalidierung beginnt nach der Veröffentlichung. | Entwicklung und interne Qualitätssicherung kommen zuerst. Interviews oder eine Pilotstudie werden nicht vorgezogen. |
| D-04 | Ein Pilotnutzer ist bereits vorhanden und verwaltet seine eigene WEG. | Der erste Pilot arbeitet mit genau diesem Nutzer. Weitere Teilnehmer sind keine Voraussetzung. |
| D-05 | Später kann ein Online-Service Cloud und Synchronisation ergänzen; das Plugin bleibt ein Client. | Stabile Identitäten und ein erweiterbares Datenmodell werden vorgesehen. Ein Backend gehört nicht zum ersten MVP. |
| D-06 | Handwerkeranfragen und der Weg zur Zahlung sind ein erster erwarteter Mehrwert; Aufgaben, Kommunikation und Entscheidungen gehören zur Vision. | Der MVP verbindet diese Schritte in nachvollziehbaren Vorgängen und dokumentiert externe Kommunikation und Bankvorgänge. |

Die Aussage „verwaltet seine eigene WEG“ enthält keine Festlegung über Bestellung, Vertretung, Bankvollmacht oder Befugnisse. Das Produkt muss eine tatsächliche Handlungsgrundlage dokumentieren können, ohne sie aus einem Profil abzuleiten.

## 2. Vorgeschlagene Defaults der aktuellen Spezifikation

Diese Defaults machen den ersten Umfang entwickelbar. Sie sind Produktentscheidungen des Entwurfs und keine bereits gemessenen Bedürfnisse.

| ID | Default | Begründung und Grenze |
|---|---|---|
| P-01 | Eine aktive WEG je Vault, eine aktiv bearbeitende Person und ein primäres Schreibgerät. | Begrenzt Konflikt- und Rechtefragen. Mehrpersonenbearbeitung bleibt eine spätere Erweiterung. |
| P-02 | Desktop zuerst, Windows 11 als Referenzumgebung, Deutsch, EUR und Europe/Berlin. | Definiert eine überprüfbare erste Testmatrix. Andere Systeme und Mobile werden erst nach entsprechender Umsetzung und Prüfung zugesagt. |
| P-03 | Kostenloser, lokal eigenständig nutzbarer Kern ohne eigenes Konto oder Backend. | Vereinfacht Einstieg und Datenhaltung; tatsächliche Akzeptanz ist offen. |
| P-04 | E-Mail, Telefon und Banking bleiben externe Werkzeuge. | Der MVP bereitet Inhalte vor und dokumentiert tatsächliche Schritte. Versenden und Überweisen werden nicht behauptet oder ausgelöst. |
| P-05 | Ein aktiver Hauptauftrag je Vorgang; zusätzliche Gewerke über verknüpfte Vorgänge. | Hält den ersten fachlichen Zusammenhang überschaubar. |
| P-06 | Lesbare Markdown-Akten, unveränderte Originaldateien und ein wiederaufbaubarer Index. | Erleichtert Portabilität und Wiederherstellung. Die Umsetzung muss externe Bearbeitungen und Fehlerfälle ausdrücklich behandeln. |
| P-07 | Heute, Vorgänge und Vorgangsakte als drei Hauptansichten. | Übersetzt das Nutzenversprechen in Orientierung und Kontext. Allgemeine Aufgaben sind auch ohne Vorgang möglich. |
| P-08 | Hinweise im geöffneten Obsidian und beim nächsten Öffnen; optionaler statischer Kalenderexport. | Entspricht der Laufzeitgrenze des lokalen Plugins. Ein Kalenderexport ist kein automatisch synchronisierter Benachrichtigungsdienst. |
| P-09 | Ein Zahlungseintrag gehört zu genau einer Rechnung; Zuordnung zur konkreten Dokumentbasis. | Verhindert mehrdeutige Restbeträge. Sammelzahlungen werden im ersten MVP nicht auf mehrere Rechnungen verteilt. |
| P-10 | Öffentlicher Quellcode als Vertrauensentscheidung empfohlen. | Die aktuelle Obsidian-FAQ erlaubt auch getrennten privaten Quellcode mit öffentlichem Release-Repository. Die Lizenz ist noch als Projektentscheidung festzulegen. |

## 3. Hypothesen und Beobachtung nach Veröffentlichung

| ID | Ungeprüfte Hypothese | Vorgesehene Evidenz im Pilot | Mögliche Konsequenz |
|---|---|---|---|
| H-01 | Ein geführter Vorgang reduziert Such- und Nachverfolgungsarbeit. | Reale Wiederaufnahmen, Rückfragen und dazu benötigte Suchschritte beobachten. | Navigation oder Informationsstruktur anpassen. |
| H-02 | Die Vorteile überwiegen manuelle Erfassung und doppelte Pflege. | Aktive Zeit einschließlich Übernahme aus E-Mails und Bankdokumentation erfassen; geschätzte Baseline kennzeichnen. | Erfassung vereinfachen oder spätere Integrationen priorisieren. |
| H-03 | Obsidian ist für den Pilotnutzer ein tragfähiger Arbeitsplatz. | Installation und ersten realen Vorgang beobachten; notwendige Hilfe getrennt protokollieren. | Onboarding ändern oder nach dem Pilot den Client-Schwerpunkt überprüfen. |
| H-04 | Hinweise beim Öffnen und laufende Wiedervorlagen reichen aus. | Konkrete verpasste Anlässe und tatsächliche Öffnungsgewohnheiten besprechen. | Benachrichtigungen als mögliche Service-Funktion prüfen. |
| H-05 | Eine aktive Person reicht für den ersten Arbeitsablauf. | Konkrete Freigaben, Übergaben und Rückfragen verfolgen. | Rollen und gezielte Zusammenarbeit später höher priorisieren. |
| H-06 | Nachvollziehbare Zahlungsdokumentation liefert bereits Nutzen. | Prüfen, ob Betrag, Dokumentbasis, Beleglage und Zahlungsstand verständlich sind. | Darstellung oder späteren Umfang ändern; keine vorschnelle Bankintegration. |
| H-07 | Selbstständige wiederholte Nutzung ist möglich. | Freiwillige Wiederverwendung bei realen Verwaltungsanlässen und Entwicklerhilfe dokumentieren. | Bedienung verbessern oder Produktumfang neu zuschneiden. |
| H-08 | Ein späterer Online-Service kann wirtschaftlich getragen werden. | Konkreten Zusatznutzen, Entscheider, Zahler und Unterstützungsbedarf kennenlernen. | Angebot und Preis erst anhand weiterer Evidenz entwickeln. |

Die ersten sieben Hypothesen betreffen primär den konkreten Pilotkontext. Die achte erfordert später zusätzliche Marktnachweise. Ein Pilot liefert keine belastbare Konversionsrate und keinen repräsentativen Preis.

## 4. Technische und fachliche Nachweise vor dem Release

Die internen Abnahmen prüfen die im PRD festgelegten Kernabläufe, Rechenregeln, Exportgrenzen, Wiederherstellung und Performance. Insbesondere dürfen Belegupload und Zahlungsstatus nicht verwechselt, Abschläge nicht doppelt abgezogen und interne Notizen nicht unbemerkt exportiert werden. Performancewerte sind bis zur Messung Zielwerte.

Die internen Szenarien AT 01–11 und AT 13 gehen der Veröffentlichung voraus. AT 12 überprüft die Installation aus dem öffentlichen Verzeichnis nach Veröffentlichung und vor Beginn des Piloten. Alle verpflichtenden Kriterien bleiben bindend; eine Änderung verlangt eine nachvollziehbare neue PRD-Fassung. Die Pilotwirkung ist keine vorgezogene Freigabehürde.

## 5. Derzeit unbekannte Angaben

WEG-Größe und Zahl der Einheiten, formelle Rolle des Piloten, Betriebssystem, Obsidian-Erfahrung, heute verwendete Werkzeuge, Häufigkeit von Handwerkervorgängen, typische Rechnungsfälle, Bankberechtigungen und bisheriger Sicherungsablauf sind noch nicht erhoben. Diese Unbekannten werden im Pilotkontext transparent behandelt. Sie rechtfertigen weder erfundene Persona-Details noch automatische rechtliche Befugnisse.

## 6. Weiterentwicklung nach dem ersten Pilot

Die nächste Entscheidung richtet sich nach den beobachteten Problemen: Bedienung und Erfassung verbessern, wenn der Nutzen vorhanden ist und die Reibung im Detail liegt; Umfang und Client überdenken, wenn der lokale Ablauf dauerhaft zu viel Zusatzarbeit erzeugt; einen Online-Service planen, wenn konkrete Übergaben, Rechte und Benachrichtigungen den Nutzen begrenzen. Cloud ist ein möglicher nächster Produktschritt und kein automatischer Schluss aus einer erfolgreichen Installation.

### Zugehörige Begründungen

- [Markt und Geschäftsmodell](01-Markt-Zielgruppe-und-Geschaeftsmodell.md)
- [Fachliche und rechtliche Rahmenbedingungen](02-WEG-Ablaufe-und-rechtliche-Rahmenbedingungen.md)
- [Obsidian und Architektur](03-Obsidian-Architektur-und-Betrieb.md)
- [Zentrales Quellenverzeichnis](04-Quellenverzeichnis.md)
