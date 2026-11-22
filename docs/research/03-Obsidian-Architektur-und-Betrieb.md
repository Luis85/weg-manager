---
type: Research
product: WEG Manager
status: research
version: "1.0"
date: 2026-11-15
---

# Obsidian, Architektur und Betrieb

> [!note] Geltung
> Plattformbefunde bleiben gültig. Aussagen zu Vorgangsakte, Zahlungsbeträgen und Kalenderexport stammen aus dem früheren Handwerker-Zuschnitt und betreffen den Ausbau [[F-17 - Rechnungen und Zahlungen führen]]. Den Dateivertrag präzisieren [[K-14 - Markdown und Frontmatter als offene Datengrundlage]] und [[Datenkonzept - Offene Notizen und Agentenzugriff]].

## Einordnung und Ergebnis

**Obsidian ist eine plausible Grundlage für einen lokalen WEG-Arbeitsplatz mit einem aktiven Bearbeiter.** Eine Vorgangsakte kann Originale, Kommunikation, Aufgaben und dokumentierte Entscheidungen zusammenhalten. Die Plattform liefert jedoch weder einen ständig laufenden Erinnerungsdienst noch die Zugriffsrechte eines Eigentümerportals. Diese Grenzen prägen das MVP und den späteren Cloud-Ausbau.

Diese Recherche wertet öffentliche Primärquellen aus; es wurden weder ein Plugin implementiert noch Plattformtests durchgeführt. **Fakten** beschreiben dokumentierte Eigenschaften. **Architekturentscheidungen** sind daraus abgeleitete Vorschläge des aktuellen PRD. **Annahmen** müssen erst in Umsetzung und Pilot geprüft werden. Verbindliche Produktanforderungen stehen im [MVP-PRD](../02-MVP-PRD.md). Stand der Recherche: 15. November 2026.

## 1. Lokale Daten als tragfähiger Kern

**Fakt:** Ein Obsidian-Vault ist ein lokaler Ordner. Notizen sind Markdown-Dateien und können auch außerhalb von Obsidian bearbeitet werden. Obsidian übernimmt externe Dateiänderungen in seine Ansicht. Der Metadaten-Cache ist eine Hilfsstruktur, die sich neu aufbauen lässt. [T01]

**Architekturentscheidung:** Fachliche Informationen gehören in lesbare Markdown-Dateien mit strukturierten Properties; Anhänge bleiben als unveränderte Originale erhalten. Ein interner Index beschleunigt die Oberfläche, darf aber keine alleinige Quelle für Rechnungen, Aufgaben oder Zahlungsdokumentation sein. Deinstallation des Plugins darf die Akte nicht entfernen.

Dateipfade sind keine dauerhaften fachlichen Identitäten. Jede Entität benötigt eine stabile ID, einen Typ und eine Schema-Version. Beziehungen referenzieren IDs; Umbenennungen und Verschiebungen dürfen sie nicht auflösen. Die Plugin-Oberfläche kann diese technischen Angaben ausblenden, während die Dateien weiterhin prüfbar bleiben. Fremde Properties und freie Notiztexte müssen bei Änderungen erhalten bleiben.

**Annahme:** Der Pilotnutzer akzeptiert Obsidian und einen lokalen Vault als täglichen Arbeitsplatz. Datenportabilität allein beweist keine Bedienbarkeit; die Beobachtung nach Veröffentlichung muss zeigen, ob der Nutzer Vorgänge ohne Entwicklerhilfe pflegt.

## 2. Bases ergänzen die Oberfläche

**Fakt:** Obsidian Bases erzeugt Ansichten auf Dateien und Properties, einschließlich Tabellen, Filtern und Sortierung. Die zugrunde liegenden Daten bleiben in Markdown; Ansichten werden unter anderem in `.base`-Dateien beschrieben. [T02]

**Architekturentscheidung:** Bases kann frei zusammenstellbare Übersichten ermöglichen. Die verbindlichen Fachregeln bleiben im Plugin: beispielsweise die Trennung zwischen Rechnung, Zahlungseintrag und Belegnachweis. Eine Tabellenformel ersetzt keine Prüfung, ob eine Abschlagszahlung bereits in einer Schlussrechnung berücksichtigt wurde.

Die Ansichten aus [[00 - Sitemap]] sollen den Arbeitsablauf unmittelbar verständlich machen. Nutzer müssen keine Queries, Templates oder Properties konfigurieren, um den ersten Vorgang anzulegen. Bases ist deshalb eine mögliche Ergänzung, keine neue Voraussetzung und kein zusätzlicher MVP-Arbeitsbereich.

## 3. Schreiben, prüfen und wiederherstellen

**Fakt:** Die Vault-API empfiehlt `Vault.process()` für Änderungen auf Grundlage des aktuellen Dateiinhalts. Sie schützt die betreffende Datei zwischen Lesen und Schreiben vor konkurrierenden Änderungen; bei vorgeschalteten asynchronen Arbeitsschritten muss der Inhalt erneut verglichen werden. Das dokumentiert keine Transaktion über mehrere Dateien. [T03]

**Architekturentscheidung:** Mehrere zusammengehörige Schreibschritte brauchen einen wiederaufnehmbaren Ablauf. Ein Abbruch darf keinen stillen Teilzustand hinterlassen. Wiederholungen dürfen keine zweite Rechnung oder Zahlung erzeugen. Vor einem Schreibzugriff werden Revision beziehungsweise Inhaltsstand geprüft; nach externen Änderungen muss die Oberfläche neu laden oder einen Konflikt erklären.

Der Datencheck erkennt doppelte IDs, fehlende Beziehungen und unbekannte zukünftige Schema-Versionen. Letztere werden lesend geöffnet, statt automatisch umgeschrieben. Migrationen benötigen eine Sicherung und einen nachvollziehbaren Rückweg. Wiederherstellung und Indexaufbau sind Release-Anforderungen, keine späteren Komfortfunktionen.

Geldbeträge werden in ganzzahligen Cent gespeichert. Ungeklärte Dokumentgrundlagen dürfen keinen verlässlichen Restbetrag erzeugen. Die Zahlung bleibt genau einer Rechnung zugeordnet; eine Sammelzahlungsaufteilung gehört nicht zum ersten MVP. Diese Regeln sind Produktentscheidungen aus dem PRD, keine Leistungen der Obsidian-Plattform.

## 4. Desktop und Erinnerungen

**Fakt:** Node.js- und Electron-APIs stehen auf mobilen Obsidian-Plattformen nicht zur Verfügung. Das Manifest kann ein Plugin mit `isDesktopOnly: true` auf Desktop beschränken. [T04] Intervalle und Ereignisbeobachter gehören zum Plugin-Lebenszyklus und sollen beim Entladen entfernt werden. [T05]

**Architekturentscheidung:** Die erste Freigabe erfolgt nur für den tatsächlich geprüften Plattformumfang; Windows 11 ist die vorgeschlagene Desktop-Referenzumgebung. Die Existenz von Obsidian auf mehreren Betriebssystemen begründet noch keine getestete Plugin-Kompatibilität. Die vollständige mobile Wochenarbeit bleibt Produktziel, folgt aber nach dem MVP ([[K-09 - Vollständige mobile Wochenarbeit unterstützen]], Stand 21.11.2026); die Grenzen von Node und Electron auf Mobilgeräten bleiben dafür ein Umsetzungsrisiko.

Fällige To-dos erscheinen beim Öffnen und während aktiver Nutzung. Hinweise dürfen nach Neustart weder verloren gehen noch unkontrolliert mehrfach erscheinen. Außerhalb laufenden Obsidian gibt das MVP kein Erinnerungsversprechen. Der vorgesehene Kalenderexport kann Termine an eine externe Kalenderanwendung übergeben; deren Benachrichtigungen liegen anschließend außerhalb der Plugin-Kontrolle.

**Annahme:** Diese Erinnerungstiefe reicht dem Pilotnutzer. Wenn er Obsidian selten öffnet, kann ein korrekt funktionierendes Dashboard trotzdem am Bedarf vorbeigehen. Das ist eine wichtige spätere Validierungsfrage, keine zusätzliche Vorbedingung der Veröffentlichung.

## 5. Vertrauen, Freigaben und Sync

**Fakt:** Obsidian kann Community-Plugins nicht zuverlässig auf einzelne Berechtigungen beschränken. Plugins übernehmen grundsätzlich die Zugriffsmöglichkeiten der Anwendung. [T06] Ein geteilter Obsidian-Sync-Vault bietet keine feingranularen Rechte; Mitwirkende erhalten weitgehend dieselben Rechte wie der Eigentümer. Gleichzeitiges Bearbeiten derselben Datei ist keine kollaborative Live-Bearbeitung. [T07]

**Architekturentscheidung:** Das MVP hat einen aktiven Bearbeiter und mindestens zwei getrennte Gemeinschaften ([[K-02 - Zwei Gemeinschaften für einen Bearbeiter]]). Ein gemeinsamer Vault wird nicht als Eigentümerportal angeboten. Interne Kommentare, Kontaktdaten und Rechnungen erfordern eine bewusst ausgewählte Weitergabe. Der vorgesehene Export enthält eine statische HTML-Übersicht und ausdrücklich ausgewählte Originaldateien; verknüpfte Dokumente werden nicht automatisch mitgenommen.

Die generierte Übersicht darf keine Skripte oder externen Ressourcen laden. Unveränderte Originaldateien können eigene aktive Inhalte enthalten; eine entsprechende Garantie für sämtliche Anlagen wäre falsch. Originale werden verlinkt und nicht als aktive Dokumentansicht eingebettet. Eine vollständige interne Sicherung bleibt eine andere Handlung als ein freigegebener Vorgangsexport.

**Fakt:** Obsidian Sync synchronisiert nur bei laufender Anwendung. Die Dokumentation warnt vor Konflikten bei paralleler Nutzung mehrerer Sync-Dienste. [T08]

**Folgerung:** Ein primäres Schreibgerät reduziert die Konfliktfläche. Dateisynchronisation ersetzt weder eine fachliche Transaktion noch eine Zugriffsprüfung. Die Fähigkeit, einen Vault technisch zu synchronisieren, ist keine Zusage für fehlerfreie gleichzeitige WEG-Bearbeitung.

## 6. Veröffentlichung und Betrieb des MVP

**Fakt:** Der aktuelle Einreichungsweg führt über `community.obsidian.md`. Er verlangt verknüpfte Obsidian- und GitHub-Konten sowie Repository und Release. Erforderlich sind README, Lizenz und Manifest; Release-Tag und Manifest-Version müssen übereinstimmen. `main.js`, `manifest.json` und gegebenenfalls `styles.css` werden als Release-Anhänge bereitgestellt. Ein eindeutiger Plugin-Identifier ist erforderlich. Automatische Prüfungsfehler müssen vor der Installation aus dem Verzeichnis behoben sein. [T09]

**Fakt:** Die Entwicklerrichtlinien verbieten Client-Telemetrie und selbstständige Installation beziehungsweise Aktualisierung des Plugins oder seiner Abhängigkeiten. Konto-, Zahlungs- und Netzwerkanforderungen müssen offengelegt werden. [T10] Die aktuelle FAQ erlaubt eine separate private Quellablage bei öffentlichem Repository für Release-Artefakte; Open Source ist daher eine Produkt- und Vertrauensentscheidung, keine pauschale Veröffentlichungspflicht. [T11]

**Architekturentscheidung:** Das lokale MVP benötigt keinen eigenen Account und keinen Backend-Dienst. Die README erklärt Offline-Betrieb, geprüften Plattformumfang, externe Bankausführung und die Grenzen der Erinnerungen. Für den Pilot werden Beobachtungen, freiwillige Rückmeldungen und bewusst angeforderte Diagnoseinformationen genutzt; automatische Client-Nutzungsanalyse wird nicht eingebaut.

Die Reihenfolge bleibt verbindlich: **Entwicklung und interne Abnahme → Veröffentlichung → saubere Installation aus dem Community-Verzeichnis → Pilot mit dem vorhandenen Nutzer.** Interne Integritäts-, Zahlungs- und Exportprüfungen müssen vor der Veröffentlichung bestanden sein. Der öffentliche Installationscheck kann erst danach erfolgen und liegt vor dem Pilot. Eine erfolgreiche Verzeichnisprüfung ersetzt die fachlichen Abnahmekriterien des PRD nicht.

## 7. Weg zum optionalen Webservice

**Architekturentscheidung:** Fachregeln, Speicherung und Oberfläche werden so getrennt, dass später ein weiterer Speicher- beziehungsweise Synchronisationsadapter möglich bleibt. Stabile IDs und versionierte Daten helfen dabei. Das MVP baut dafür weder Benutzerverwaltung noch einen ungenutzten Cloud-Unterbau.

Ein späterer Service benötigt eine eigene Entscheidung darüber, welcher Datenstand maßgeblich ist. Insbesondere dürfen abweichende Rechnungsgrundlagen, Zahlungseinträge oder Handlungsnachweise nicht durch ein stilles „letzte Änderung gewinnt“ zusammengeführt werden. Der Cloud-Ausbau muss Konflikte sichtbar machen und die fachlichen Regeln auch serverseitig durchsetzen.

Erst dort werden Rollen für Verwaltung, Eigentümer, Beirat und Dienstleister, begrenzte Freigaben sowie Hintergrundzustellung konkret. Die Serverberechtigung muss den Zugriff tatsächlich verhindern; ausgeblendete Felder im Plugin reichen nicht. Auch Datenschutzrollen, Löschung, Sicherungen und Betriebsverantwortung werden dann eigene Produktanforderungen. Obsidian bleibt ein Client, dessen lokale Kopien und Exporte bewusst verwaltet werden müssen.

## 8. Offene Nachweise

Die Recherche belegt Plattformgrenzen und Veröffentlichungsregeln. Sie belegt noch keine Performance, Datenverlustfreiheit oder Nutzerakzeptanz des geplanten Plugins. Vor Release sind Wiederanlauf, Fremdänderungen, Geldberechnung und gezielter Export praktisch zu prüfen. Nach Release zeigt der Pilot, ob die lokale Arbeitsweise, manuelle Kommunikation und externe Zahlungsausführung tatsächlich Arbeit sparen. Eine Cloud-Ausbaustufe wird erst aus beobachteten Engpässen priorisiert.

## Primärquellen

Alle Quellen am 15.11.2026 geprüft. Plattformregeln können sich ändern und sind vor Einreichung erneut abzugleichen.

| ID | Quelle | Gegenstand |
|---|---|---|
| T01 | [Obsidian: How Obsidian stores data](https://obsidian.md/help/data-storage) | Markdown, Vault, externe Änderungen und Cache |
| T02 | [Obsidian: Introduction to Bases](https://obsidian.md/help/bases) | Dateibasierte Ansichten |
| T03 | [Obsidian Developer Documentation: Vault](https://docs.obsidian.md/Plugins/Vault) | Lesen, Schreiben und `process()` |
| T04 | [Obsidian: Mobile development](https://docs.obsidian.md/Plugins/Getting%20started/Mobile%20development) | Plattformgrenzen und Manifest |
| T05 | [Obsidian: Manage plugin lifecycle](https://docs.obsidian.md/plugins/guides/lifecycle-management) | Lebensdauer von Intervallen und Listenern |
| T06 | [Obsidian: Plugin security](https://obsidian.md/help/plugin-security) | Vertrauens- und Berechtigungsgrenzen |
| T07 | [Obsidian: Collaborate on a shared vault](https://obsidian.md/help/sync/collaborate) | Gemeinsame Rechte und Konflikte |
| T08 | [Obsidian Sync: Frequently asked questions](https://obsidian.md/help/sync/faq) | Laufzeit und parallele Synchronisation |
| T09 | [Obsidian: Submit your plugin](https://docs.obsidian.md/Plugins/Releasing/Submit%20your%20plugin) | Einreichung und Release-Artefakte |
| T10 | [Obsidian: Developer policies](https://docs.obsidian.md/community-directory/developer-policies) | Telemetrie, Offenlegung und Lizenz |
| T11 | [Obsidian Community directory: FAQ](https://docs.obsidian.md/community-directory/faq) | Private Quellen und automatische Prüfung |
