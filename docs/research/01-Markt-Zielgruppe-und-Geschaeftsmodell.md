---
type: Research
product: WEG Manager
status: research
version: "1.0"
date: 2026-11-15
---

# Markt, Zielgruppe und Geschäftsmodell

**Quellenstand: 15. November 2026.** Dieses Dokument begründet die Positionierung von WEG Manager und benennt die Annahmen, die der erste Pilot nach Veröffentlichung prüfen soll. Produktumfang und Abnahmekriterien stehen im MVP-PRD.

## 1. Kernaussage und Evidenzstatus

WEG Manager hat eine plausible Einstiegschance als persönlicher Arbeitsplatz für die Person, die ihre eigene Wohnungseigentümergemeinschaft operativ organisiert. Der aussichtsreiche Ausgangspunkt ist der konkrete Handwerkervorgang: Angebote anfragen, Rückmeldungen verfolgen, eine Entscheidungsgrundlage dokumentieren, Ausführung koordinieren und Rechnung sowie Zahlungsstand nachvollziehen. Ob diese Konzentration ausreichend Mehrwert schafft, ist offen.

Die untersuchten Anbieter decken wesentliche Teile dieses Ablaufs bereits ab. Ein Wettbewerbsvorteil entsteht deshalb voraussichtlich durch die Passung zum Arbeitsalltag und den geringeren Organisationsaufwand. Lokale Dateien und Obsidian sind dafür eine Produktentscheidung und eine überprüfbare Nutzenhypothese.

| Evidenz | Was tatsächlich vorliegt | Zulässige Schlussfolgerung |
|---|---|---|
| Nutzerkontext | Der Auftraggeber kennt einen Pilotnutzer, der seine eigene WEG verwaltet. | Ein konkreter Zugang zur späteren Erprobung besteht. |
| Marktquellen | Öffentliche Funktions- und Angebotsseiten von sechs Anbietern. | Die genannten Funktionen werden angeboten; Nutzbarkeit und Qualität wurden nicht getestet. |
| Branchenkontext | Veröffentlichte Ergebnisse des VDIV-Branchenbarometers 2026. | Befragte Verwaltungsunternehmen berichten Belastung und selektive Mandatsannahme. |
| Produktannahmen | Fokus, Bedienkonzept, Geschäftsmodell und Pilotziele. | Diese Entscheidungen müssen im Gebrauch überprüft werden. |

Es wurden für dieses Dokument keine Interviews, Produkttests oder Zahlungsbereitschaftsmessungen durchgeführt. Die Recherche ist eine gezielte Auswertung von Primärquellen, keine vollständige Marktübersicht. Anbieterangaben zu Zeitersparnis, Rechtssicherheit und Kundenerfolg gelten nicht als unabhängig nachgewiesene Wirkung.

## 2. Branchenbedarf richtig einordnen

Der VDIV berichtet für seine Onlinebefragung vom 4. März bis 11. Mai 2026 insgesamt 1.078 teilnehmende Unternehmen; 476 beantworteten die komplette Abfrage. Laut veröffentlichter Zusammenfassung bezeichnen sich 62,1 % der befragten Verwaltungen als überlastet. 31,0 % planen, kleinere Objekte abzugeben. Diese Ergebnisse beschreiben Antworten und Absichten der teilnehmenden Unternehmen. [VDIV-Pressemitteilung](https://vdiv.de/presse/details/vdiv-branchenbarometer-2026-immobilienverwaltungen-zunehmend-ueberlastet-trennung-von-unrentablen-eigentuemergemeinschaften-unvermeidlich)

Daraus lässt sich als Hypothese ableiten, dass Unterstützung bei eigenständiger Organisation für manche WEGs relevanter werden könnte. Die Befragung bestimmt jedoch weder die Zahl potenzieller Plugin-Kunden noch deren Technikaffinität oder Zahlungsbereitschaft. Sie untersucht Verwaltungsunternehmen, während der erste WEG-Manager-Pilot eine einzelne Person in ihrer eigenen Gemeinschaft betrifft. Eine Hochrechnung des erreichbaren Marktes aus diesen Prozentwerten wäre nicht belastbar. Der öffentliche VDIV-Überblick dient als zusätzlicher Kontext. [Branchenbarometer 2026](https://vdiv.de/immobilienverwaltung/branchenbarometer)

## 3. Wettbewerbsvergleich

Die Tabelle beschreibt öffentlich angebotene Funktionen. Paketgrenzen und Einsatzqualität wurden nicht praktisch geprüft; eine nicht erwähnte Funktion ist kein Nachweis ihres Fehlens.

| Anbieter und direkte Quelle | Relevante angebotene Funktionen | Konsequenz für WEG Manager |
|---|---|---|
| [casavi – Vorgangsmanagement](https://www.casavi.com/de/software/vorgangsmanagement/) | Zuständigkeit, Frist, Status, Wiedervorlage; Kommunikation und Dokumente am Vorgang; Angebotsanfragen, Aufträge und eingehende Rechnungen. | Der durchgehende Handwerkerprozess allein ist kein Alleinstellungsmerkmal. |
| [facilioo – CRM](https://facilioo.de/crm/) | Vorgangs- und Aufgabensteuerung, Handwerkerkoordination, automatische Fristen, Workflows, Dokumentenmanagement und Integrationen. | Branchenbezogene Abläufe und Erinnerungen sind bereits etablierte Angebotsbestandteile. |
| [iDWELL – CRM](https://www.idwell.com/de/crm) | Gemeinsames E-Mail-Postfach, Übernahme von E-Mails in Geschäftsfälle, Aufgaben, Vorlagen, fallbezogene Dokumente und automatisierte Rechnungsverarbeitung. | Manuelle Übernahme aus E-Mails muss sich im MVP durch geringen Pflegeaufwand rechtfertigen. |
| [etg24 – Für Verwaltungen](https://etg24.de/fuer-verwaltungen/) | Vorgänge, Aufgaben, Termine, Eigentümerportal, Dokumente, Rechnungsverarbeitung, Belegprüfung und Versammlungsfunktionen. | Kommunikation, Akten und Entscheidungen sind im Wettbewerbsumfeld bereits verbunden. |
| [Matera – Selbstverwaltung](https://matera.eu/de/unser-angebot-selbstverwaltung) | Onlineportal für selbstverwaltete WEGs, Finanzübersicht und Bankkonto sowie Unterstützung durch Fachleute. | Der Bedarf kann fachliche Hilfe umfassen, die ein Plugin allein nicht erfüllt. |
| [dooyah house – Preise und Leistungsumfang](https://www.dooyah.de/preise/) | Kostenloses Konto unter anderem mit Vorgängen, Checklisten, Fristen, Zuständigkeiten, Nachrichten und Eigentümerportal; Pro erweitert Finanzen und Automatisierung. | Auch die selbstverwaltete WEG hat günstige Alternativen mit breitem Umfang. |

dooyah nennt für Pro **14,90 € inklusive Umsatzsteuer pro WEG und Monat bis 30 Einheiten**. Das ist eine zeitabhängige Anbieterpreisangabe, kein vergleichbarer Preis für jedes Konkurrenzprodukt und kein Beleg für Zahlungsbereitschaft gegenüber WEG Manager. Zusammen mit den kostenlosen Funktionen schwächt sie die Annahme, günstige Software für kleine WEGs fehle grundsätzlich. [Preisquelle](https://www.dooyah.de/preise/)

Weitere praktisch relevante Alternativen sind die vorhandenen E-Mails, Ordner, Tabellen und Kalender des Piloten. Wie sie tatsächlich genutzt werden, ist unbekannt. Das neue Werkzeug muss die tägliche Arbeit gegenüber diesem vorhandenen Ablauf erleichtern; eine längere Funktionsliste reicht dafür nicht.

## 4. Zielperson und Obsidian-Hürde

**Primäre Zielperson:** eine Person, die ihre eigene WEG operativ organisiert und dabei Handwerker, Unterlagen, Rückfragen und offene Aufgaben zusammenhalten muss. Aus dem bekannten Nutzerkontext folgen weder eine formelle Verwalterbestellung noch bestimmte Vertretungs- oder Zahlungsbefugnisse. WEG-Größe, Arbeitsvolumen, heutige Werkzeuge und Obsidian-Erfahrung sind offen.

Eigentümer, Beirat, Dienstleister und gegebenenfalls eine externe Verwaltung sind Beteiligte an den Vorgängen. Im MVP arbeitet eine Person mit einer aktiven WEG je Vault. Andere Beteiligte erhalten weiterhin normale Nachrichten und Dokumente über bestehende Kanäle. Damit benötigt die erste Nutzung keinen gleichzeitigen Umstieg der gesamten Gemeinschaft.

Obsidian speichert Notizen als lokale Markdown-Dateien, die auch andere Editoren lesen und bearbeiten können. Dies unterstützt die gewünschte Datenkontrolle und Übertragbarkeit. [Obsidian-Datenspeicherung](https://obsidian.md/help/data-storage)

Der Einstieg verlangt jedoch Installation, Verständnis eines Vaults und die Aktivierung des Plugins. Ob dieser zusätzliche Schritt akzeptabel ist, bleibt eine zentrale Produktfrage. Die Oberfläche sollte deshalb fachliche Begriffe wie „Vorgang“, „Angebot“ und „Nächster Schritt“ verwenden. Zum Nutzenversprechen gehört ein verständlicher Umgang mit Sicherung und Wiederherstellung. Lokale Speicherung allein beantwortet diese Betriebsfragen nicht.

## 5. Differenzierung als prüfbare Hypothese

Der vorgeschlagene Schwerpunkt lautet: **„Ich erkenne, was für meine WEG als Nächstes zu tun ist, und finde den Zusammenhang samt Belegen wieder.“** Drei Produktentscheidungen sollen diesen Nutzen ermöglichen:

1. **Ein zusammenhängender Vorgang:** Anfrage, Angebote, Entscheidungsgrundlage, Auftrag, Ausführung und Rechnung bleiben verknüpft. Die Zahlung wird nach externer Ausführung manuell dokumentiert.
2. **Ein verständlicher nächster Schritt:** „Heute“ zeigt fällige Aufgaben und Wiedervorlagen. Wartende Vorgänge erhalten einen nachvollziehbaren Anlass zur Nachverfolgung.
3. **Nutzbare lokale Unterlagen:** Originalanhänge und lesbare Akten erleichtern Nachschlagen, Übergabe und Export.

Das sind zu prüfende Vorteile, keine belegte Einzigartigkeit. Zu viele Pflichtfelder oder doppelte Datenpflege könnten sie aufheben. Auch die Erinnerungsgrenze ist produktrelevant: Ohne Hintergrunddienst kann der MVP bei geschlossenem Obsidian keine dauerhafte Überwachung versprechen. Der Pilot soll zeigen, ob Hinweise beim nächsten Öffnen und ein optionaler statischer Kalenderexport im Alltag ausreichen.

## 6. Geschäftsmodellhypothesen

Für den MVP ist ein eigenständig nutzbarer, kostenloser lokaler Kern vorgesehen. Dadurch lässt sich die tatsächliche Nutzung des veröffentlichten Plugins beobachten. Ein späterer Online-Service kann kostenpflichtige Zusammenarbeit, rollenbezogene Freigaben und Cloud-Funktionen ergänzen; Obsidian bleibt ein möglicher Client.

| Hypothese | Begründung | Später zu überprüfende Frage |
|---|---|---|
| Abonnement pro WEG | Die Gemeinschaft ist eine verständliche wirtschaftliche Einheit. | Wer entscheidet, wer zahlt und welche wiederkehrende Leistung rechtfertigt den Preis? |
| Teilnahme für Eigentümer und Handwerker ohne zusätzliche Einzellizenz | Beteiligung sollte keine zusätzliche Kaufentscheidung je Kontakt verlangen. | Verbessert dies die Zusammenarbeit ausreichend, um die Betriebskosten zu tragen? |
| Bezahlt wird für gemeinsamen Arbeitsablauf und verlässlichen Service | Ein Cloud-Angebot braucht einen erkennbaren Nutzen über Dateisynchronisation hinaus. | Sind Rollen, gemeinsame Bearbeitung und Benachrichtigungen tatsächlich entscheidend? |

Noch wird kein WEG-Manager-Preis festgelegt. Kostenloses Interesse oder positive Rückmeldungen sind kein Zahlungsnachweis. Wirtschaftlich relevant werden später Supportaufwand pro aktiver WEG, Hosting- und Betriebskosten sowie die tatsächlich benötigte Unterstützung. Wenn Nutzer vor allem Beratung erwarten, muss deren Aufwand als eigener Leistungsbestandteil bewertet werden.

## 7. Veröffentlichung und Lernen mit einem Piloten

Die verbindliche Reihenfolge lautet: **MVP entwickeln → intern prüfen → im Obsidian-Community-Verzeichnis veröffentlichen → Pilot mit dem bereits vorhandenen Nutzer → nächste Produktentscheidung.** Die hier vorgesehene Validierung beginnt nach Veröffentlichung. Zusätzliche Interviews oder mehrere Pilotnutzer sind keine vorgezogene Voraussetzung.

Für die anschließende Pilotphase von zunächst vier bis sechs Wochen zählen reale Arbeitsanlässe. Ein langsamer Handwerkervorgang kann eine Verlängerung erfordern; eine Woche ohne WEG-Aufgaben ist kein Beleg gegen den Nutzen.

| Lernfrage bei n = 1 | Beobachtung im Pilot | Bedeutung |
|---|---|---|
| Gelingt der Einstieg? | Installation, erster Vorgang und notwendige Hilfestellungen protokollieren. | Trennt Obsidian-Hürden von Problemen der Fachoberfläche. |
| Ist der nächste Schritt verständlich? | Bei realen Vorgängen nächste Aktion, Zuständigkeit und Termin auffinden lassen. | Prüft die zentrale Orientierungshilfe. |
| Entsteht weniger Organisationsarbeit? | Pflegezeit und doppelte Eingaben bei vergleichbaren Arbeitsanlässen festhalten. | Zeigt mögliche Entlastung oder Zusatzaufwand. |
| Hilft die Akte bei Rückfragen? | Einen Angebotsunterschied oder Rechnungsbeleg aus dem Vorgang erklären lassen. | Prüft Nachvollziehbarkeit statt bloßer Vollständigkeit. |
| Tragen die Erinnerungen? | Verpasste Wiedervorlagen und Öffnungsgewohnheiten besprechen. | Klärt, ob das lokale Modell ausreicht. |
| Wo entsteht Bedarf an Zusammenarbeit? | Konkrete Übergaben und Rückfragen dokumentieren. | Liefert Anhaltspunkte für einen späteren Service. |

Eine Fortsetzung ist plausibel, wenn der Pilot wiederholt echte Vorgänge damit führt und der Nutzen den Pflegeaufwand erkennbar übersteigt. Anhaltende Doppelpflege, dauerhafte Hilfe beim Einstieg oder ein unverzichtbarer Mehrpersonenprozess wären Gründe zur Änderung des Konzepts. Ein einzelner Pilot liefert tiefe Fallkenntnis, aber keine repräsentative Marktvalidierung, belastbare Konversionsrate oder verallgemeinerbare Zahlungsbereitschaft.

## Quellenverzeichnis

Alle Links wurden für den Quellenstand **15.11.2026** geprüft. VDIV-Ergebnisse wurden zusätzlich über die indexierten offiziellen Veröffentlichungen verifiziert. Anbieterinformationen sind Selbstauskünfte; Preise und Pakete können sich ändern.

| Quelle | Direkter Link | Aussagebeitrag |
|---|---|---|
| VDIV, Pressemitteilung vom 19.08.2026 | [vdiv.de – Branchenbarometer 2026](https://vdiv.de/presse/details/vdiv-branchenbarometer-2026-immobilienverwaltungen-zunehmend-ueberlastet-trennung-von-unrentablen-eigentuemergemeinschaften-unvermeidlich) | Befragungszeitraum, Teilnehmerzahlen, Überlastung und geplante Abgabe kleiner Objekte. |
| VDIV, Branchenüberblick | [vdiv.de – Branchenbarometer](https://vdiv.de/immobilienverwaltung/branchenbarometer) | Öffentliche Zusammenfassung der Ergebnisse und Bezugsrahmen. |
| casavi | [casavi.com – Vorgangsmanagement](https://www.casavi.com/de/software/vorgangsmanagement/) | Vorgangsakte, Fristen, Kommunikation, Angebots- und Auftragsprozess. |
| facilioo | [facilioo.de – CRM](https://facilioo.de/crm/) | Aufgaben, Handwerkerkoordination, Fristen und Workflows. |
| iDWELL | [idwell.com – CRM](https://www.idwell.com/de/crm) | E-Mail-Integration, Aufgaben, Dokumente und Rechnungsverarbeitung. |
| etg24 | [etg24.de – Für Verwaltungen](https://etg24.de/fuer-verwaltungen/) | Portal, Vorgänge, Termine, Rechnungen und Versammlungsfunktionen. |
| Matera | [matera.eu – Selbstverwaltung](https://matera.eu/de/unser-angebot-selbstverwaltung) | Kombination aus Plattform und fachlicher Unterstützung. |
| dooyah house | [dooyah.de – Preise](https://www.dooyah.de/preise/) | Kostenloser Funktionsumfang, Pro-Leistungen und Preis je WEG. |
| Obsidian Help | [obsidian.md – Data storage](https://obsidian.md/help/data-storage) | Lokale Markdown-Dateien und Bearbeitung mit anderen Werkzeugen. |
