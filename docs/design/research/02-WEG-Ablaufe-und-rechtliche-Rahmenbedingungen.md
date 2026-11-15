---
type: Research
product: WEG Manager
status: research
version: "1.0"
date: 2026-11-15
---

# WEG-Abläufe und rechtliche Rahmenbedingungen

**Recherche- und Quellenstand: 15. November 2026.** Dieses Dokument übersetzt fachliche Quellen in Produktentscheidungen für den MVP. Rechtliche Aussagen und daraus abgeleitete Gestaltungsvorschläge sind zu unterscheiden. Es ersetzt keine individuelle Rechtsberatung und begründet keine pauschale Zusicherung von Rechtskonformität.

Die verbindliche Reihenfolge lautet: **MVP entwickeln → interne technische und fachliche Qualitätssicherung → Veröffentlichung im Obsidian Community-Verzeichnis → Validierung mit dem einen bereits vorhandenen Pilotnutzer.** Er verwaltet seine eigene WEG; eine förmliche Bestellung zum Verwalter oder bestimmte Vertretungsmacht ist damit noch nicht nachgewiesen. Vorabinterviews oder zusätzliche Pilotkunden sind keine Veröffentlichungsvoraussetzung.

## 1. Fachlicher Ablauf: vom Anliegen bis zur Nachverfolgung

Der folgende Ablauf ist ein Produktmodell für typische Erhaltungsmaßnahmen. Dringlichkeit, Vertragsgestaltung und vorhandene Beschlüsse können Abweichungen erforderlich machen. Der MVP muss tatsächliche Ereignisse dokumentierbar halten, auch wenn Unterlagen fehlen.

| Schritt | Benötigte Information | Unterstützung im MVP |
|---|---|---|
| Anliegen aufnehmen | Objektbezug, Schaden, Meldender, Zeitpunkt, Dringlichkeit | Vorgangsakte, Fotos, nächste Aufgabe |
| Zuständigkeit klären | Gemeinschaftsbezug, handelnde Person, Befugnis, Fristen | Entscheidungsgrundlage und offene Klärung dokumentieren |
| Angebote anfragen | Vergleichbarer Leistungsumfang, Zugang, gewünschter Termin | Anfrageentwurf, angefragte Betriebe, Nachfassen |
| Angebote beurteilen | Preis, enthaltene Leistungen, Ausschlüsse, Termine | Strukturierter Vergleich und Auswahlbegründung |
| Entscheidung festhalten | Beteiligte, Gegenstand, Ergebnis, Nachweis | Meinung, Prüfung, Freigabe und Beschluss unterscheiden |
| Beauftragen | Auftraggeber, Umfang, Konditionen, Versand, Bestätigung | Auftrag mit konkreter Angebotsversion verknüpfen |
| Ausführung verfolgen | Termin, Fortschritt, Änderungen, Mängel | Aufgaben und Kommunikation am Vorgang |
| Rechnung bearbeiten | Original, Rechnungsbasis, Prüfung, Zahlungsdaten | Rechnung prüfen, Zahlung extern vorbereiten |
| Zahlung und Abschluss dokumentieren | Tatsächliche Zahlung, Nachweis, Restarbeiten | Getrennte Statusfelder, Wiedervorlage, Abschlussübersicht |

Durchgängig braucht der Manager eine Antwort auf drei Fragen: Was fehlt? Wer muss handeln? Wann fasse ich nach? Das begründet die Ansichten **Heute**, **Vorgänge** und **Vorgangsakte**. Allgemeine WEG-Aufgaben dürfen auch ohne Handwerkervorgang bestehen.

## 2. Beteiligte und tatsächliche Handlungskompetenz

Nach [§ 9b WEG](https://www.gesetze-im-internet.de/woeigg/__9b.html) vertritt grundsätzlich der Verwalter die Gemeinschaft; ohne Verwalter erfolgt die Vertretung gemeinschaftlich durch die Eigentümer. Interne Befugnis und Vertretung gegenüber Dritten sind unterschiedliche Fragen. Eine Softwarefreigabe beantwortet keine davon automatisch.

[§ 27 WEG](https://www.gesetze-im-internet.de/woeigg/__27.html) erlaubt dem Verwalter bestimmte Maßnahmen von untergeordneter Bedeutung ohne erhebliche Verpflichtungen sowie erforderliche Maßnahmen zur Fristwahrung oder Nachteilsabwehr. Eigentümer können diese Befugnisse durch Beschluss verändern. Daraus folgt keine allgemeingültige Eurogrenze für Aufträge.

Der Verwaltungsbeirat unterstützt und überwacht nach [§ 29 WEG](https://www.gesetze-im-internet.de/woeigg/__29.html) den Verwalter. Seine Beteiligung ist keine automatische umfassende Auftragsfreigabe. Ein Eigentümer, Beiratsmitglied, Verwalter, Hausmeister oder Handwerker erhält deshalb im Datenmodell zunächst eine beschreibende Rolle. Die Handlungsgrundlage wird zusätzlich für den jeweiligen Vorgang festgehalten.

**Produktregel:** Handelnde Person, behauptete beziehungsweise dokumentierte Befugnis, Bezugsdokument und tatsächlich erfolgte Handlung getrennt speichern. Bei ungeklärter Kompetenz eine Klärungsaufgabe anzeigen. Notfälle lassen sich mit Dringlichkeit, Begründung und späterer Dokumentationsaufgabe erfassen; das Plugin erteilt dabei keine rechtliche Erlaubnis.

## 3. Diskussion, Freigabe und Beschluss

Ein Kommentar wie „für mich passt das“ kann eine Meinung sein. Er ist weder automatisch ein Beschluss noch ein Auftrag. [§ 23 WEG](https://www.gesetze-im-internet.de/woeigg/__23.html) unterscheidet die Beschlussfassung in der Versammlung und außerhalb einer Versammlung. Für Letztere ist grundsätzlich die Zustimmung aller Eigentümer in Textform erforderlich; für einen einzelnen Gegenstand kann eine Mehrheitsentscheidung ermöglicht werden. Diese Ausnahme trägt keinen allgemeinen Abstimmungsmodus für beliebige zukünftige Vorgänge.

[§ 24 WEG](https://www.gesetze-im-internet.de/woeigg/__24.html) enthält Anforderungen an Niederschrift und Beschluss-Sammlung. Eine frei bearbeitbare Vorgangsnotiz erfüllt diese Anforderungen nicht automatisch.

Für den MVP folgt daraus:

- **Meinung:** Person, Datum, Inhalt und Quelle einer Äußerung.
- **Prüfung/Freigabe:** Wer hat welchen Umfang auf welcher Grundlage geprüft oder freigegeben?
- **Beschlussnachweis:** Gegenstand, Wortlaut beziehungsweise Originalverweis, Datum und Bezug zur maßgeblichen Beschluss-Sammlung.
- **Beauftragung:** Gesondert dokumentieren, was tatsächlich an welchen Betrieb übermittelt wurde.

Der MVP enthält keine vollständige gesetzliche Beschluss-Sammlung, kein rechtliches Abstimmungssystem und kein Badge „rechtsgültig“. Eine Anfechtung ist als Information zu dokumentieren; sie macht einen Beschluss nicht schon automatisch unwirksam. Änderungen des Leistungsumfangs übernehmen eine frühere Freigabe nicht stillschweigend. Ein erledigtes To-do begründet weder Beauftragung noch Abnahme.

## 4. Angebote: ausreichende Grundlage statt starrer Anzahl

Der [BGH entschied am 27. März 2026, V ZR 7/25](https://www.dnoti.de/entscheidungen/details/?cHash=9c627f5d2e16dabccc3772038110ed4a&tx_dnotionlineplusapi_decisionsdetails%5Bcontroller%5D=Decisions&tx_dnotionlineplusapi_decisionsdetails%5Bnodeid%5D=24807ebc-15ec-4986-a3f6-76b72326c91c), dass bei Erhaltungsmaßnahmen am Gemeinschaftseigentum keine allgemeine Pflicht besteht, ab einer bestimmten Bagatellgrenze Vergleichsangebote einzuholen. Entscheidend ist eine ausreichende Tatsachengrundlage im konkreten Fall. Das Urteil begründet weder einen Freibrief für beliebige Preise noch eine allgemeine Regel für jede andere Vergabesituation.

**Produktableitung:** Keine Sperre „mindestens drei Angebote“. Stattdessen Anfrageversuche, Absagen, ausbleibende Antworten, Leistungsunterschiede und Auswahlgründe erfassen. Vergleichskriterien bleiben Preis, Umfang, Eignung, Termin und bekannte Risiken. Die Wahl des günstigsten Angebots wird nicht automatisch vorausgesetzt. Ein einzelnes Angebot kann dokumentiert werden; die Begründung bleibt sichtbar. Quelle ist hier der beim DNotI veröffentlichte Entscheidungstext, keine direkt abgerufene BGH-Webseite.

## 5. Ausführung, Rechnung und Zahlung

Abnahme, Rechnungsprüfung und Zahlung sind getrennte Ereignisse. [§ 641 BGB](https://www.gesetze-im-internet.de/bgb/__641.html) regelt die Fälligkeit der Werkvergütung; zugleich ermöglicht [§ 632a BGB](https://www.gesetze-im-internet.de/bgb/__632a.html) unter Voraussetzungen Abschlagszahlungen. Deshalb wäre eine allgemeine Sperre sämtlicher Zahlungen bis zur Schlussabnahme fachlich falsch. Der MVP dokumentiert Rechnungstyp, vertragliche Grundlage, Prüfung und offene Mängel, ohne die individuelle Fälligkeit abschließend zu beurteilen.

### Drei voneinander unabhängige Informationen

1. **Prüfung/Freigabe:** Rechnung sachlich geprüft und gegebenenfalls Freigabe dokumentiert.
2. **Zahlungserfassung:** Vorbereitet, Als veranlasst gemeldet, Als erfolgt gemeldet oder Erfassung storniert.
3. **Nachweis:** Datei vorhanden oder nicht vorhanden.

Ein hochgeladener Kontoauszug setzt keinen Zahlungsstatus und reduziert keinen Restbetrag. Ein fehlender Beleg löscht umgekehrt keine ausdrücklich gemeldete Zahlung. **„Erfassung storniert“ korrigiert die lokale Aufzeichnung; es nimmt keine Banküberweisung zurück.** Tatsächliche Zahlungen bleiben auch bei unvollständigen Freigabeunterlagen dokumentierbar; die Lücke wird ausgewiesen.

### Rechnungsbasis ohne doppelte Anrechnung

Dokumentbruttosumme und laut konkretem Dokument noch zu zahlender Betrag sind getrennte Werte. Jede Zahlung gehört genau einer Rechnung. Ihre Behandlung als **zusätzlich**, **bereits enthalten** oder **ungeklärt** bezieht sich auf diese Rechnung und deren konkrete Basisversion.

Beispiel: Ein Abschlag von 100 Euro wurde bezahlt. Die Schlussrechnung nennt 500 Euro Gesamtleistung und zieht den Abschlag bereits ab: Rechnungsbasis 400 Euro. Weitere 150 Euro wurden danach bezahlt; offen bleiben 250 Euro. Weder werden 100 und 500 Euro zu vermeintlichen Gesamtkosten addiert noch die ersten 100 Euro erneut abgezogen. Der Bezug zum Abschlag auf der Schlussrechnung verschiebt dessen ursprüngliche Zahlung nicht auf diese Rechnung.

Der Restbetrag entspricht der Rechnungsbasis abzüglich zusätzlich anzurechnender, als erfolgt gemeldeter Zahlungen, deren Erfassung nicht storniert ist. Ändert sich die Rechnungsbasis, müssen betroffene Zuordnungen erneut geprüft werden. Bis dahin erscheinen kein verlässlicher Restbetrag und keine darauf beruhende Zahlungsvorlage. Überzahlungen bleiben als negative Restbeträge erkennbar.

**Sammelzahlungen, Gutschriften, Erstattungen und komplexe Verrechnungen sind Klärungsfälle.** Original und betroffene Rechnungen werden dokumentiert; eine manuelle Aufteilung von Sammelzahlungen gehört ausdrücklich nicht zum ersten MVP.

### Extern bezahlen

Nach dem [BaFin-Merkblatt zum ZAG](https://bafin.de/SharedDocs/Veroeffentlichungen/DE/Merkblatt/mb_111222_zag.html) kann bereits das Auslösen eines Zahlungsauftrags bei einem anderen Zahlungsdienstleister reguliert sein, auch ohne Besitz der Gelder. Maßgeblich ist das konkrete Geschäftsmodell.

Der MVP bereitet Angaben vor; Autorisierung und Ausführung erfolgen im bestehenden Onlinebanking. Bankzugangsdaten werden nicht gespeichert. Eine spätere Integration benötigt eine gesonderte Prüfung der Rollen und gegebenenfalls einen geeigneten regulierten Partner.

## 6. Kommunikation, Datenschutz und Originaldokumente

Das [BayLDA, Tätigkeitsbericht 2024, Abschnitt 8.3](https://www.lda.bayern.de/media/baylda_report_14.pdf), erläutert die Anwendbarkeit des Datenschutzrechts innerhalb von WEGs. E-Mail-Weiterleitungen und Portalveröffentlichungen benötigen eine passende Rechtsgrundlage; die Weitergabe eines ganzen Schreibens kann über das erforderliche Maß hinausgehen. Einsichtsrechte rechtfertigen nicht automatisch die allgemeine Veröffentlichung sämtlicher Unterlagen. Die Offenlegung von E-Mail-Adressen ist gesondert zu betrachten.

**Produktableitung:** Interne Notizen und externe Zusammenfassung trennen. Exporte enthalten nur ausdrücklich ausgewählte Informationen und Originaldateien. Keine automatische Weiterleitung, kein voreingestellter offener E-Mail-Verteiler, keine Freigabe des ganzen Vaults. Ein späterer Webservice benötigt konkrete Rollen, Zugriffsrechte und Datenschutzverantwortlichkeiten; lokale Speicherung allein ist kein pauschaler Datenschutzbeleg.

Das [BMF-Schreiben zur E-Rechnung vom 15. Oktober 2025](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Umsatzsteuer/Umsatzsteuer-Anwendungserlass/2025-10-15-einfuehrung-obligatorische-e-rechnung.pdf?__blob=publicationFile&v=3) verlangt für einschlägige Aufbewahrungsfälle zumindest den unversehrten strukturierten Teil in ursprünglicher Form. Daraus wird keine universelle E-Rechnungspflicht jeder WEG abgeleitet.

Der MVP erhält empfangene XML-, PDF- und hybride Originaldateien unverändert. Extrahierte Werte und Ansichten ergänzen das Original. Ein erzeugtes PDF ersetzt keine Original-XML. Aussagen wie „revisionssicher“ oder „GoBD-konform“ sind durch diese Funktion allein nicht gedeckt.

## 7. Konsequenzen für Qualitätssicherung und Pilot

Vor Veröffentlichung prüfen synthetische Fälle insbesondere ungeklärte Vertretung, Notfallbeauftragung, ein einziges Angebot, geänderten Leistungsumfang, angefochtene Beschlüsse, Abschlagsrechnung, Doppelanrechnung, fehlenden Zahlungsbeleg, Erfassungsstorno und Sammelzahlung. Exporttests kontrollieren, ob interne Notizen ausgeschlossen bleiben und ausgewählte Originale erhalten bleiben.

Nach Veröffentlichung untersucht der vorhandene Pilotnutzer anhand echter Vorgänge, ob er offene Schritte schneller erkennt und Entscheidungen zuverlässiger wiederfindet. Seine formale Rolle, tatsächlichen Arbeitsweisen und Sonderfälle werden dabei erhoben. Ein einzelner Pilot liefert konkrete Gebrauchserkenntnisse, aber keinen Nachweis allgemeiner Marktnachfrage oder rechtlicher Vollständigkeit.

## Quellenübersicht

Alle Quellen wurden für den Stand 15.11.2026 herangezogen. Gesetze und Behördeninformationen sind Primärquellen; beim BGH wird der Entscheidungstext über das DNotI zugänglich gemacht.

| Quelle | Relevanz |
|---|---|
| [§ 9b WEG](https://www.gesetze-im-internet.de/woeigg/__9b.html) | Vertretung der Gemeinschaft |
| [§ 27 WEG](https://www.gesetze-im-internet.de/woeigg/__27.html) | Befugnisse und Dringlichkeit |
| [§ 23 WEG](https://www.gesetze-im-internet.de/woeigg/__23.html) | Beschlussfassung und Wirksamkeit |
| [§ 24 WEG](https://www.gesetze-im-internet.de/woeigg/__24.html) | Niederschrift und Beschluss-Sammlung |
| [§ 29 WEG](https://www.gesetze-im-internet.de/woeigg/__29.html) | Verwaltungsbeirat |
| [BGH V ZR 7/25, 27.03.2026, DNotI](https://www.dnoti.de/entscheidungen/details/?cHash=9c627f5d2e16dabccc3772038110ed4a&tx_dnotionlineplusapi_decisionsdetails%5Bcontroller%5D=Decisions&tx_dnotionlineplusapi_decisionsdetails%5Bnodeid%5D=24807ebc-15ec-4986-a3f6-76b72326c91c) | Tatsachengrundlage und Vergleichsangebote |
| [§ 632a BGB](https://www.gesetze-im-internet.de/bgb/__632a.html), [§ 641 BGB](https://www.gesetze-im-internet.de/bgb/__641.html) | Abschläge und Werkvergütung |
| [BayLDA, 14. Tätigkeitsbericht, Abschnitt 8.3](https://www.lda.bayern.de/media/baylda_report_14.pdf) | Kommunikation und Offenlegung |
| [BaFin, ZAG-Merkblatt, Stand Juli 2024](https://bafin.de/SharedDocs/Veroeffentlichungen/DE/Merkblatt/mb_111222_zag.html) | Zahlungsauslösung und technische Dienste |
| [BMF, E-Rechnung, Schreiben 15.10.2025](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Umsatzsteuer/Umsatzsteuer-Anwendungserlass/2025-10-15-einfuehrung-obligatorische-e-rechnung.pdf?__blob=publicationFile&v=3) | Strukturierte Originaldaten aufbewahren |
