---
type: Quellenverzeichnis
product: WEG Manager
status: research
version: "1.2"
date: 2026-11-15
---

# Quellenverzeichnis und Aussagegrenzen

**Recherche- und Paketstand: 15. November 2026.** Dieses Verzeichnis erschließt die externe Produktrecherche, Herkunft und Lizenz des beigefügten Skills sowie den direkten Pilotinput und dessen fachliche Einordnung. Es enthält direkte Links und erklärt, welche Aussagen die Quellen tragen. Eine Quelle kann mehreren Dokumenten dienen.

## Methode und Herkunft

Die Grundlage ist eine gezielte Auswertung von Primärquellen aus drei parallel bearbeiteten Perspektiven: Markt und Produkt, WEG-Fachlichkeit und Recht sowie Obsidian und Architektur. Die ergänzende Synthese verbindet sie mit Nutzererlebnis, Betriebsmodell und Pilotdesign. Nutzerinterviews, eigene Produkttests der Wettbewerber, Implementierungstests und Zahlungsbereitschaftsmessungen wurden nicht durchgeführt.

**Anbieterquellen** belegen öffentlich beschriebene Funktionen und veröffentlichte Preise, aber keine unabhängig überprüfte Produktwirkung. **Gesetze, Gerichtsentscheidungen und Behördeninformationen** begründen fachliche Leitplanken, aber keine automatische Rechtmäßigkeit eines konkreten Vorgangs. **Obsidian-Dokumentation** beschreibt Plattformregeln; die geplante Implementierung muss deren Einhaltung selbst nachweisen. **Produktentscheidungen** sind als solche in Vision und PRD festgehalten.


## A. Markt, Wettbewerb und Zielgruppe

Ausführliche Einordnung: [Markt, Zielgruppe und Geschäftsmodell](01-Markt-Zielgruppe-und-Geschaeftsmodell.md).

| ID | Quelle und Datum/Stand | Beitrag zur Recherche | Grenze der Aussagekraft |
|---|---|---|---|
| M01 | [VDIV – Branchenbarometer 2026](https://vdiv.de/immobilienverwaltung/branchenbarometer) | Öffentlicher Branchenüberblick zu Verwaltungsunternehmen. | Befragte Unternehmen sind keine Stichprobe von Obsidian-Nutzern oder selbstverwalteten WEGs. |
| M02 | [VDIV – Pressemitteilung, 19.08.2026](https://vdiv.de/presse/details/vdiv-branchenbarometer-2026-immobilienverwaltungen-zunehmend-ueberlastet-trennung-von-unrentablen-eigentuemergemeinschaften-unvermeidlich) | Überlastung, geplante Portfolioänderungen, Befragungszeitraum und Teilnehmerzahlen. | Selbstauskünfte und Planungen; keine belastbare Hochrechnung der Plugin-Nachfrage. |
| M03 | [casavi – Vorgangsmanagement](https://www.casavi.com/de/software/vorgangsmanagement/) | Aufgaben, Fristen, Kommunikation sowie Angebote, Aufträge und Rechnungen am Vorgang. | Herstellerbeschreibung; konkrete Paketgrenzen und Nutzbarkeit wurden nicht getestet. |
| M04 | [facilioo – CRM](https://facilioo.de/crm/) | Vorgänge, Handwerkerkoordination, Fristen und Workflows. | Anbieterangaben ohne eigenen Praxistest. |
| M05 | [iDWELL – CRM](https://www.idwell.com/de/crm) | E-Mail-Integration, Aufgaben, Dokumente und Rechnungsverarbeitung. | Funktionsbeschreibung belegt noch keine Zeitersparnis im konkreten Pilotkontext. |
| M06 | [etg24 – Für Verwaltungen](https://etg24.de/fuer-verwaltungen/) | Portal, Aufgaben, Termine, Vorgänge, Rechnungs- und Versammlungsfunktionen. | Funktionsbreite ist kein Nachweis der Eignung für die Zielperson. |
| M07 | [Matera – Selbstverwaltung](https://matera.eu/de/unser-angebot-selbstverwaltung) | Kombination aus Software und fachlicher Unterstützung für selbstverwaltete WEGs. | Leistungsumfang unterscheidet sich von einem alleinstehenden Plugin. |
| M08 | [dooyah – Funktionen](https://www.dooyah.de/features/) | Angebot von Kommunikation, Vorgängen und Verwaltungsfunktionen. | Leistungsumfang und Paketzuordnung können sich ändern. |
| M09 | [dooyah – Preise](https://www.dooyah.de/preise/) | Kostenloser Einstieg und veröffentlichter Preis für Pro je WEG. | Zeitabhängige Anbieterpreisangabe; kein Nachweis der Zahlungsbereitschaft für WEG Manager. |

**Zugriffshinweis zu VDIV:** Einzelne direkte Abrufe waren mit HTTP 403 begrenzt. Die offiziellen Veröffentlichungen waren über indexierte Fassungen zugänglich; die Pressemitteilung ließ sich beim Paketabgleich vollständig über die Recherche abrufen. Die Ergebnisse wurden als Befragungsdaten eingeordnet. Es wurde kein Kaufbericht als vollständig gelesen ausgegeben.

## B. WEG-Fachlichkeit, Datenschutz und Zahlungen

Ausführliche Einordnung: [WEG-Abläufe und rechtliche Rahmenbedingungen](02-WEG-Ablaufe-und-rechtliche-Rahmenbedingungen.md).

| ID | Quelle und Datum/Stand | Beitrag zur Recherche | Grenze der Aussagekraft |
|---|---|---|---|
| F01 | [§ 9b WEG](https://www.gesetze-im-internet.de/woeigg/__9b.html) | Vertretung der Gemeinschaft und Unterschied zur internen Aufgabenverteilung. | Ein Profil oder eine Rolle im Plugin begründet keine Vertretungsmacht. |
| F02 | [§ 27 WEG](https://www.gesetze-im-internet.de/woeigg/__27.html) | Befugnisse des Verwalters, untergeordnete Maßnahmen, Fristen und Nachteilsabwehr. | Keine allgemeingültige Eurogrenze und keine automatische Übertragung auf jeden Eigentümer. |
| F03 | [§ 29 WEG](https://www.gesetze-im-internet.de/woeigg/__29.html) | Unterstützung und Überwachung durch den Verwaltungsbeirat. | Keine pauschale Beauftragungs- oder Zahlungsbefugnis. |
| F04 | [§ 23 WEG](https://www.gesetze-im-internet.de/woeigg/__23.html) | Beschlussfassung, Textform außerhalb der Versammlung und Wirksamkeit. | Informelle Zustimmung oder ein Chat-Eintrag wird nicht automatisch zum Beschluss. |
| F05 | [§ 24 WEG](https://www.gesetze-im-internet.de/woeigg/__24.html) | Niederschrift und Beschluss-Sammlung. | Eine bearbeitbare Vorgangsnotiz ersetzt die gesetzlichen Anforderungen nicht automatisch. |
| F06 | [BGH, Urteil 27.03.2026, V ZR 7/25 – Entscheidungstext beim DNotI](https://www.dnoti.de/entscheidungen/details/?cHash=9c627f5d2e16dabccc3772038110ed4a&tx_dnotionlineplusapi_decisionsdetails%5Bcontroller%5D=Decisions&tx_dnotionlineplusapi_decisionsdetails%5Bnodeid%5D=24807ebc-15ec-4986-a3f6-76b72326c91c) | Tatsachengrundlage bei Erhaltungsmaßnahmen; keine pauschale Pflicht zu mehreren Vergleichsangeboten. | Konkreter Anwendungsbereich; keine allgemeine Freigabe jeder Vergabe. |
| F07 | [§ 632a BGB](https://www.gesetze-im-internet.de/bgb/__632a.html) | Voraussetzungen von Abschlagszahlungen. | Kein pauschaler Nachweis der Fälligkeit einer konkreten Rechnung. |
| F08 | [§ 641 BGB](https://www.gesetze-im-internet.de/bgb/__641.html) | Fälligkeit der Werkvergütung. | Vertrag, Leistung und Einzelfall bleiben zu berücksichtigen. |
| F09 | [BayLDA – 14. Tätigkeitsbericht für 2024, Abschnitt 8.3](https://www.lda.bayern.de/media/baylda_report_14.pdf) | WEG-Kommunikation, Weiterleitungen, Portale und Datenminimierung. | Einsichtsrechte rechtfertigen keine automatische allgemeine Veröffentlichung. |
| F10 | [BaFin – Merkblatt zum ZAG, Stand Juli 2024](https://bafin.de/SharedDocs/Veroeffentlichungen/DE/Merkblatt/mb_111222_zag.html) | Abgrenzung von Zahlungsdiensten und Zahlungsauslösung. | Regulatorische Einordnung hängt vom konkreten Dienst und dessen Rolle ab. |
| F11 | [BMF – FAQ zur E-Rechnung, insbesondere Frage 13](https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html) | Unversehrter strukturierter Teil und ursprüngliche Form bei einschlägiger Aufbewahrung. | Keine pauschale E-Rechnungspflicht jeder WEG und keine GoBD-Zusicherung des Plugins. |
| F12 | [BMF – Schreiben vom 15.10.2025 zur E-Rechnung](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Umsatzsteuer/Umsatzsteuer-Anwendungserlass/2025-10-15-einfuehrung-obligatorische-e-rechnung.pdf?__blob=publicationFile&v=3) | Ergänzende Primärgrundlage zum Erhalt strukturierter Originaldaten. | Das bloße Speichern einer Datei gewährleistet keine vollständige Archivkonformität. |

**Zugriffshinweis zum BGH-Urteil:** Verwendet wurde der beim Deutschen Notarinstitut veröffentlichte Entscheidungstext. Ein erfolgreicher direkter Abruf von der BGH-Website wird nicht behauptet. Die Fundstelle ist im Fachbericht entsprechend gekennzeichnet.

## C. Obsidian, Architektur und Veröffentlichung

Ausführliche Einordnung: [Obsidian, Architektur und Betrieb](03-Obsidian-Architektur-und-Betrieb.md). Die IDs entsprechen der Quellentabelle dieses Berichts.

| ID | Offizielle Quelle | Beitrag zur Recherche | Grenze beziehungsweise Konsequenz |
|---|---|---|---|
| T01 | [How Obsidian stores data](https://obsidian.md/help/data-storage) | Lokale Markdown-Dateien, Vault und externe Änderungen. | Plattformformat ersetzt keine Fachregeln oder Sicherungsstrategie. |
| T02 | [Introduction to Bases](https://obsidian.md/help/bases) | Ansichten auf Dateien und Properties. | Bases ist eine mögliche Ergänzung; geführte MVP-Abläufe bleiben im Plugin. |
| T03 | [Developer Documentation – Vault](https://docs.obsidian.md/Plugins/Vault) | Dateioperationen und `Vault.process()`. | Keine dokumentierte Transaktion über mehrere fachlich zusammengehörige Dateien. |
| T04 | [Mobile development](https://docs.obsidian.md/Plugins/Getting%20started/Mobile%20development) | Einschränkungen von Node/Electron und Desktop-Kennzeichnung. | Mobile Kompatibilität verlangt eigene Umsetzung und Prüfung. |
| T05 | [Manage plugin lifecycle](https://docs.obsidian.md/plugins/guides/lifecycle-management) | Laufzeit und Aufräumen von Intervallen und Ereignisbeobachtern. | Keine dauerhafte Tätigkeit bei geschlossener Anwendung. |
| T06 | [Plugin security](https://obsidian.md/help/plugin-security) | Vertrauens- und Berechtigungsgrenzen von Plugins. | Keine fein isolierte Ausführungsumgebung für jedes Plugin. |
| T07 | [Collaborate on a shared vault](https://obsidian.md/help/sync/collaborate) | Rechte im Shared Vault und gleichzeitige Bearbeitung. | Kein passendes Berechtigungsmodell für ein Eigentümer- und Handwerkerportal. |
| T08 | [Obsidian Sync – FAQ](https://obsidian.md/help/sync/faq) | Synchronisation bei laufender App und Risiken paralleler Sync-Dienste. | Keine Zusage konfliktfreier fachlicher Zusammenarbeit. |
| T09 | [Submit your plugin](https://docs.obsidian.md/Plugins/Releasing/Submit%20your%20plugin) | Community-Einreichung, Repository, Manifest und Release-Artefakte. | Der tatsächliche Installationsweg muss bei Veröffentlichung erneut geprüft werden. |
| T10 | [Developer policies](https://docs.obsidian.md/community-directory/developer-policies) | Telemetrieverbot, Offenlegung, Lizenz und Update-Verhalten. | Die spätere Implementierung muss die dann geltenden Regeln erfüllen. |
| T11 | [Community directory – FAQ](https://docs.obsidian.md/community-directory/faq) | Private Quellablage, Zahlungskennzeichnung und automatische Prüfung. | Open Source ist eine empfohlene Projektentscheidung, keine pauschale aktuelle Pflicht. |

Für diese Dokumente gilt der Abrufstand 15.11.2026. Die aktuelle Dokumentation hat Vorrang vor älteren Blogbeiträgen oder überholten Einreichungsanleitungen. Derzeit ist `community.obsidian.md` der beschriebene Einreichungsweg. Eine erfolgreiche Plattformprüfung ersetzt die fachliche Abnahme des MVP nicht.

## D. Interne Entscheidungsquellen

| Grundlage                                                        | Bedeutung im Paket                                                                                                               |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Auftrag des Produktverantwortlichen                              | Plugin zuerst, öffentliche Veröffentlichung vor dem Pilot, ein vorhandener Nutzer mit eigener WEG, später optionaler Webservice. |
| [Produktvision 1.0](../01-Produktvision.md)                         | Aktuelles Nutzenversprechen und Produktprinzipien.                                                                               |
| [MVP-PRD 1.0](../02-MVP-PRD.md)                                     | Verbindliche Umsetzungsgrundlage des Entwurfs und festgelegte Abnahmen.                                                          |
| [Annahmen und Entscheidungen](05-Annahmen-und-Entscheidungen.md) | Trennung von Vorgaben, Defaults und offenen Nachweisen.                                                                          |


Die Research ergänzt diese Quellen um Begründungen. Sie überschreibt weder den Nutzerauftrag noch stillschweigend die aktuelle Spezifikation.

## E. Direkter Pilotinput und ergänzende Fachquellen

| ID | Quelle | Beitrag und Grenze |
|---|---|---|
| P | Pilot-PRD Beirats-Modul, Entwurf 0.1, 15.11.2026 | Direkte Wünsche: 37 Funktionsanforderungen, acht Qualitätsanforderungen, sechs Ziele und sechs Kern-Stories. Prioritäten stammen zunächst vom Piloten; technische Lösungsvorschläge sind nicht verbindlich übernommen. |
| E | Executive Summary, 15.11.2026 | Arbeitskontext, Rollen, berichteter WCS-Betrieb und Schmerzpunkte. Register, Nachrichten und Zeitprotokolle wurden nicht mitgeliefert; berichtete Wirkungen sind nicht als Plugin-Messung zu verstehen. |
| F13 | [WEG – amtlicher Gesamttext](https://www.gesetze-im-internet.de/woeigg/BJNR001750951.html) | Ergänzender Zugriff für §§ 24 und 27 bei nicht erreichbaren Einzelseiten. Produktableitungen bleiben von der Norm selbst unterscheidbar. |
| F14 | [BfDI – Info 1 DSGVO und BDSG](https://www.bfdi.bund.de/SharedDocs/Downloads/DE/Broschueren/INFO1.pdf?__blob=publicationFile&v=27) | Artikel 16 und 17 zu Berichtigung und Löschung unter ihren Voraussetzungen; über indexierte Behördenveröffentlichung geprüft, direkter PDF-Zugriff eingeschränkt. |
| F15 | [§ 18 WEG](https://www.gesetze-im-internet.de/woeigg/__18.html) | Zuständigkeit der Gemeinschaft und Einsicht in Verwaltungsunterlagen; kein pauschaler Auftrag zum Teilen sämtlicher Unterlagen. |
| P-R | [Im Pilot-PRD benanntes Projekt](https://github.com/Luis85/weg-manager) | Referenz aus dem unverändert erhaltenen Nutzertext. Repositoryinhalt, Lizenz und Implementierungsstand wurden für diese rein fachliche Auswertung nicht untersucht oder als Vorgabe übernommen. |

Die weiteren Rechtsquellen F01–F05 und F09 dienen auch der Beiratsauswertung. Der fachliche MVP-Bauplan, die vollständige Extraktion und die Fachregeln verweisen auf die jeweilige Grundlage. Die genannten Intake-Unterlagen wurden als Eingangsquellen ausgewertet und werden hier nur nach Titel und Stand benannt. Ihre dauerhafte Verfügbarkeit im Repository wird nicht vorausgesetzt; die benötigten Ableitungen sind in den Konzeptnotes festgehalten und als Vorschlag gekennzeichnet.
