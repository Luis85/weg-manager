---
type: ProductRequirementsDocument
product: WEG Manager
status: open
version: "1.0"
date: 2026-11-15
---

# WEG Manager MVP PRD

**Version 1.0 · Stand 15. November 2026 · Spezifikation für den ersten veröffentlichten MVP**

WEG Manager ist ein lokales Obsidian Plugin für eine Person, die die operative Verwaltung ihrer eigenen Wohnungseigentümergemeinschaft übernimmt. Der MVP verbindet Handwerkeranfragen, Angebote, Entscheidungsnachweise, Aufgaben, Aufträge sowie Rechnungs- und Zahlungsdokumentation in einer nachvollziehbaren Vorgangsakte.

**Lieferfolge:** Entwicklung → interne technische und fachliche Releaseprüfung → Veröffentlichung im Obsidian Community-Verzeichnis → Pilot mit dem vorhandenen Nutzer → Auswertung und Folgeversion.

**Zugehörige Produktvision:** [WEG Manager Produktvision](01-Produktvision.md).

## Ziel und Verbindlichkeit

Das erste Release soll einen typischen Handwerkervorgang von der Bedarfserfassung bis zur dokumentierten Zahlung vollständig begleiten. Der Nutzer erkennt jederzeit nächste Aktion, offene Rückmeldung und fehlende Unterlage.

| Kennung | Produktziel |
| --- | --- |
| G-01 | Offene Arbeit und notwendige nächste Schritte zuverlässig sichtbar halten. |
| G-02 | Anfragen, Angebote und Entscheidungsgrundlagen verständlich verbinden. |
| G-03 | Auftrag, Leistung, Rechnungen und erfasste Zahlungen nachvollziehbar dokumentieren. |
| G-04 | Lokale Akten, Originale und eine bewusste Übergabe erhalten. |
| G-05 | Einen eigenständig installierbaren MVP veröffentlichen und anschließend im Alltag validieren. |

**MUSS** bezeichnet eine Anforderung für die Releaseabnahme. Alle Anforderungen FR-01 bis FR-19 gehören zum ersten MVP. **Später** bezeichnet ausdrücklich ausgeschlossenen Umfang. Technische Umsetzungsvorschläge sind als solche gekennzeichnet und ersetzen keine fachliche Anforderung.

Ein fehlender Pilotnachweis ist kein Hindernis für die vorgesehene Erstveröffentlichung. Fehler, die Datenverlust, falsche Zahlungsberechnungen, unbeabsichtigte Offenlegung oder einen nicht nutzbaren Kernablauf verursachen, sind dagegen vor Veröffentlichung zu beheben.

## Festgelegte Richtung und Arbeitsannahmen

| Kennung | Festlegung | Herkunft |
| --- | --- | --- |
| D-01 | Der MVP wird als Obsidian Plugin entwickelt und im offiziellen Community-Verzeichnis veröffentlicht. | Nutzerentscheidung. |
| D-02 | Die Pilotvalidierung beginnt nach der Veröffentlichung. | Nutzerentscheidung. |
| D-03 | Ein Pilotnutzer, der seine eigene WEG verwaltet, ist bereits vorhanden. | Nutzerangabe. |
| D-04 | Ein späterer Onlinedienst kann Cloud und Synchronisation bereitstellen; das Plugin bleibt Client. | Nutzerentscheidung. |
| A-01 | Eine aktive WEG je Vault und eine bearbeitende Person. | Umfangsvorschlag. |
| A-02 | Deutsche Oberfläche, EUR und lokale Termininterpretation in Europe/Berlin. | Umfangsvorschlag. |
| A-03 | Desktop zuerst; Windows 11 ist die verbindliche Referenzplattform. | Umfangsvorschlag; Gerät des Piloten noch nicht angegeben. |
| A-04 | Lokaler Kern kostenlos und ohne eigenes Konto oder erforderlichen Backendzugriff. | Produktvorschlag. |
| A-05 | Versand erfolgt im vorhandenen Kommunikationswerkzeug, Überweisung im bestehenden Banking. | Umfangsvorschlag. |
| A-06 | Ein aktiver Hauptauftrag pro Vorgang; mehrere Gewerke können als verknüpfte Vorgänge geführt werden. | Umfangsvorschlag. |

Die tatsächlichen Befugnisse der Person werden nicht aus „eigene WEG“ abgeleitet. Das Produkt kann ungeklärte Grundlagen erfassen, ohne eine Verwalterbestellung oder Vollmacht zu behaupten.

Diese Arbeitsannahmen ermöglichen die Umsetzung ohne vorgeschaltete Marktstudie. Notwendige technische Angaben wie Referenzgerät und unterstützte Obsidian-Version werden während der Umsetzung beziehungsweise Releaseprüfung konkretisiert. Erkenntnisse nach der Veröffentlichung können den Folgeumfang ändern.

## Zielnutzer und Nutzungskontext

Der Hauptnutzer organisiert anfallende Arbeit für seine eigene WEG. Er übernimmt die Koordination, hält Rückmeldungen fest und nutzt bereits E-Mail, Telefon, Dokumente und Banking. Ob er formell Verwalter, bevollmächtigt oder anderweitig tätig ist, bleibt eine gesonderte fachliche Frage.

Andere Eigentümer, ein gegebenenfalls vorhandener Beirat und Handwerker sind zunächst externe Beteiligte. Ihre Kontaktdaten, Beiträge und Zuständigkeiten können dokumentiert werden. Sie besitzen im MVP keinen eigenen Zugang.

Die drei wesentlichen Jobs sind:

1. Bei einem offenen Thema schnell erkennen, welche Handlung jetzt erforderlich ist.

2. Einen Handwerkerfall mit seinen Unterlagen und Entscheidungen nachvollziehbar weiterführen.

3. Den Stand und ausgewählte Unterlagen so übergeben, dass eine andere Person den Fall versteht.

Neben Handwerkerfällen müssen allgemeine WEG-Aufgaben ohne eigenen Vorgang möglich sein, beispielsweise eine Unterlage besorgen oder einen Rückruf erledigen. Der Nutzer muss dafür keinen künstlichen Handwerkerfall anlegen.

## Systemgrenze und Umfang

| Im veröffentlichten MVP | In späteren Ausbaustufen |
| --- | --- |
| Eine WEG, Kontakte, Vorgänge und allgemeine Aufgaben. | Portfolio mit mehreren WEGs in einer Oberfläche. |
| Angebotsanfragen, Angebotsvergleich und Rückmeldungen. | Handwerkermarktplatz oder automatische Lieferantensuche. |
| Diskussion, Empfehlung, Handlungsgrundlage und Beschlussnachweis. | Elektronische Abstimmungen und vollständige gesetzliche Beschluss-Sammlung. |
| Ein Hauptauftrag je Fall, dokumentierte Ausführung, einfache Mängelaufgaben. | Umfassende Bauprojektsteuerung und Anlagenverwaltung. |
| Rechnungsprüfung, Zahlungsvorbereitung und manuelle Zahlungseinträge. | Vollbuchhaltung, Hausgeld, Wirtschaftsplan, Jahresabrechnung und Bankabgleich. |
| Lokale Hinweise, Heute-Ansicht und einmaliger Kalenderexport. | Hintergrundbenachrichtigungen bei geschlossener App. |
| Kommunikationsentwürfe und manuelle Zuordnung relevanter Inhalte. | Postfachsynchronisation, Versanddienst, Chat und Teilnehmerkonten. |
| Selektiver Austausch und vollständige Datensicherung. | Gemeinsame Bearbeitung, Rollen und Cloud-Synchronisation. |
| Geführte feste Abläufe und editierbare Texte. | KI, frei konfigurierbarer Workflowdesigner und automatisierte Rechtsbewertung. |

Die Kernreise funktioniert nach Installation ohne Netzwerk. Das Plugin baut keine Verbindung zu einem eigenen Dienst auf, um Fälle zu bearbeiten. Vom Nutzer gewählte externe Werkzeuge und Obsidian selbst sind außerhalb dieser Systemgrenze.

## Durchgehende Nutzerreise

| Schritt | Handlung des Nutzers | Ergebnis im Produkt |
| --- | --- | --- |
| 1 | WEG einrichten und einen Reparaturbedarf aufnehmen. | Vorgang mit nächster Aktion. |
| 2 | Leistungsumfang, Anlagen und Ansprechpartner auswählen. | Anfrageentwurf mit festgehaltenem Leistungsstand. |
| 3 | Versand im vorhandenen E-Mail-Werkzeug vornehmen und dokumentieren. | Anfragestatus je Empfänger und Wiedervorlage. |
| 4 | Angebote und Rückmeldungen zuordnen. | Vergleich mit erkennbaren Unterschieden und offenen Angaben. |
| 5 | Empfehlung und Grundlage des Handelns erfassen. | Nachvollziehbare Entscheidungsvorlage beziehungsweise vorhandener Nachweis. |
| 6 | Tatsächliche Beauftragung, Bestätigung und Termin dokumentieren. | Auftrag mit zugeordnetem Umfang und Angebotsfassung. |
| 7 | Ausführung, Prüfung und etwaige Mängel festhalten. | Sichtbare offene Punkte. |
| 8 | Rechnung prüfen und Zahlungsdaten bereitstellen. | Nachvollziehbarer Prüfstand und Zahlungsvorbereitung. |
| 9 | Zahlung im Banking ausführen und anschließend erfassen. | Manueller Zahlungsstand mit getrenntem Belegstatus. |
| 10 | Offene Punkte prüfen und Akte übergeben oder abschließen. | Dokumentierter Abschluss oder begründete weitere Bearbeitung. |

Die Nutzerreise ist kein zwingend linearer Assistent. Bereits vorhandene Angebote, Aufträge und Rechnungen können nachträglich aufgenommen werden. Dringende Maßnahmen und Voraus- oder Abschlagszahlungen verlangen keine erfundenen vorherigen Schritte.

## Ansichten und Bedienung

| Ansicht | Primäres Ziel | Pflichtinhalte |
| --- | --- | --- |
| Heute | Die nächste relevante Handlung auswählen. | Überfällige und heute fällige Aufgaben, fällige Wiedervorlagen, ausstehende Antworten, Rechnungsprüfungen und fehlende nächste Aktionen. |
| Vorgänge | Einen Fall finden und den Stand verstehen. | Suche, Filter, Thema, Zustand, nächste Aktion, Wiedervorlage und Blockade. |
| Vorgangsakte | Einen Fall bearbeiten. | Übersicht, Angebote, Entscheidung und Auftrag, Rechnungen und Zahlungen, Kommunikation und Dokumente. |

WEG-Daten, Kontakte, Hilfen und Einstellungen sind ergänzende Bereiche. Eine separate umfangreiche Rechnungsanwendung und ein Kanban-Board gehören nicht zum ersten Release.

Die Oberfläche muss deutsche Fachbegriffe verwenden, beispielsweise „Angebotsanfrage“, „Wiedervorlage“, „Zahlungsbeleg“ und „Handlungsgrundlage“. Sie muss ohne manuelle YAML-Bearbeitung und ohne zusätzliche Community Plugins funktionieren. Formulare zeigen fehlende Angaben am betroffenen Feld und bewahren Eingaben bei Fehlern.

Der Vorgangskopf zeigt Thema, Zustand, nächste Aktion und den Grund einer Blockade. Status wird durch Text verständlich; Farbe ist ergänzend. Kosteninformationen nennen ihre genaue Bedeutung. Es gibt keine unbereinigte Gesamtsumme über alternative Angebote oder Abschlags- und Schlussrechnungen.

## Funktionale Anforderungen

### FR 01 WEG einrichten

**Anforderung:** Das Plugin muss einen lokalen Arbeitsbereich für genau eine aktive WEG im Vault einrichten beziehungsweise einen vorhandenen passenden Datenbestand öffnen können.

**Akzeptanzkriterien:**

- Nach Angabe von WEG-Bezeichnung und verantwortlicher Kontaktperson kann ein Vorgang angelegt werden; Anschrift ist ergänzbar.

- Der Nutzer wählt einen Arbeitsordner innerhalb des Vaults. Vorhandene fremde Dateien werden nicht überschrieben.

- Eine zweite WEG wird im gleichen Vault nicht unbemerkt angelegt. Die Oberfläche erklärt den MVP-Umfang.

- Alle fachlichen Datensätze erhalten einen WEG-Bezug. Eine vollständige Eigentümer- oder Einheitenliste ist nicht erforderlich.

- Ein vorhandener Datenbestand bleibt nach erneutem Öffnen nutzbar.

### FR 02 Kontakte pflegen

**Anforderung:** Das Plugin muss benötigte Personen und Firmen mit ihren Kontaktdaten verwalten und in Vorgängen wiederverwenden können.

**Akzeptanzkriterien:**

- Name und Typ Person/Firma genügen zum Anlegen; E-Mail, Telefon und Notizen sind optional.

- Ein Kontakt kann an mehreren Vorgängen beteiligt sein.

- Archivierung entfernt den Kontakt aus der Standardauswahl, erhält jedoch vorhandene Beziehungen.

- Das Ändern eines Kontaktnamens verändert gespeicherte Originaldokumente und vergangene Kommunikationsinhalte nicht.

- Eine Kontaktrolle verleiht keine technische Zugriffsberechtigung oder rechtliche Befugnis.

### FR 03 Vorgänge führen

**Anforderung:** Das Plugin muss Fälle mit Beschreibung, Zustand, Zuständigkeit, nächster Aktion, Dokumenten und optional verknüpften Vorgängen führen.

**Akzeptanzkriterien:**

- Zustände sind Entwurf, Aktiv, Wartend, Abgeschlossen und Abgebrochen.

- Jeder aktive oder wartende Fall hat eine nächste offene Aufgabe oder einen dokumentierten Wartegrund mit Wiedervorlage. Fehlt beides, erscheint er in „Nächsten Schritt festlegen“.

- Der Nutzer kann einen bestehenden Fall nachträglich erfassen, abbrechen und mit Begründung wieder öffnen.

- Ein Abschluss zeigt offene Aufgaben, Mängel und ungeklärte Rechnungen. Er erledigt oder bezahlt diese nicht automatisch.

- Verbleibende Punkte bleiben sichtbar, bis sie gelöst, als entfallen begründet oder einem fortgeführten Fall zugeordnet wurden.

### FR 04 Aufgaben und Warten organisieren

**Anforderung:** Das Plugin muss Aufgaben sowohl direkt an der WEG als auch innerhalb eines Vorgangs führen.

**Akzeptanzkriterien:**

- Aufgaben besitzen Titel, Status und WEG-Bezug; Vorgang, verantwortlicher Kontakt, Fälligkeit und Wiedervorlage sind ergänzbar.

- Zustände sind Offen, In Arbeit, Wartet, Erledigt und Entfallen. „Wartet“ enthält einen Wartegrund und eine Wiedervorlage.

- Der erwartete Beitrag einer anderen Person ist von der eigenen Nachfassaufgabe unterscheidbar.

- Verschieben einer Wiedervorlage ändert keine fachliche Fälligkeit.

- Erledigen einer Aufgabe verändert weder Auftrags-, Abnahme- noch Zahlungsdaten.

- Eine entfallene Aufgabe erhält einen Grund und bleibt in der Historie nachvollziehbar.

### FR 05 Arbeitsübersicht bereitstellen

**Anforderung:** Das Plugin muss offene Arbeit in Heute und einer suchbaren Vorgangsliste zusammenführen.

**Akzeptanzkriterien:**

- Überfällig, heute fällig, Wiedervorlage fällig, Antworten ausstehend und Rechnungen zu prüfen sind unterscheidbar.

- Jeder Eintrag führt zum betroffenen Fall beziehungsweise zur allgemeinen Aufgabe.

- Bei einem Fall ohne nächsten Schritt ist eine direkte Ergänzung möglich.

- Suche und Filter unterstützen mindestens Thema, Zustand und beteiligten Kontakt.

- Offene finanzielle Beträge erscheinen pro Rechnung; es gibt keine globale unbereinigte offene Summe.

- Leere Ansichten erklären den nächsten möglichen Schritt, ohne Beispieldaten anzulegen.

### FR 06 Angebotsanfragen vorbereiten

**Anforderung:** Das Plugin muss Anfragen aus Leistungsbeschreibung, Ansprechpartner, Frist und ausgewählten Anlagen erstellen.

**Akzeptanzkriterien:**

- Der Nutzer erhält einen kopierbaren Nachrichtentext und eine Liste der vorgesehenen Anlagen.

- Eine Anfrage speichert die Fassung der Leistungsbeschreibung. Änderungen erzeugen eine neue Fassung.

- Pro Empfänger werden Entwurf, Versand dokumentiert, Rückmeldung erfasst und Absage unterscheidbar festgehalten.

- Ein erzeugter Text setzt keinen Versandstatus. Dokumentierter Versand benötigt Datum und eine ausdrückliche Nutzeraktion.

- Aus dokumentiertem Versand kann eine sichtbare Wiedervorlage entstehen. Wiederholen derselben Aktion erzeugt keine doppelte Aufgabe.

- Das Plugin versendet selbst keine E-Mail und behauptet keine Zustellung.

### FR 07 Angebote erfassen und vergleichen

**Anforderung:** Das Plugin muss eingegangene Angebote einschließlich ihrer Herkunft und Fassung zuordnen und vergleichen.

**Akzeptanzkriterien:**

- Anbieter und Quelle sind erforderlich; Originaldatei oder dokumentierte mündliche beziehungsweise textliche Auskunft sind unterscheidbar.

- Betrag in EUR, Leistungsumfang, Termin, Ausschlüsse und Angebotsbindung sind erfassbar. Fehlende Werte erscheinen als unbekannt.

- Ein Angebot kann ohne im Plugin erstellte Anfrage erfasst werden.

- Bezieht es sich auf eine ältere Leistungsbeschreibung, ist dies im Vergleich sichtbar.

- Null, ein oder mehrere Angebote bleiben bearbeitbar. Es gibt keine pauschale Mindestzahl und keine automatische Anbieterwahl.

- Die Auswahl erhält eine Begründung; alternative Angebote werden nicht addiert. Eine spätere Angebotsfassung ersetzt frühere Originale nicht unbemerkt.

### FR 08 Kommunikation dokumentieren

**Anforderung:** Das Plugin muss relevante Gesprächsnotizen, Nachrichten und Dokumente chronologisch mit einem Vorgang verbinden.

**Akzeptanzkriterien:**

- Ereignisdatum, Erfassungsdatum, Kanal, Beteiligte und Quelle können unterschieden werden.

- Eingefügter Text und angehängte Originaldatei bleiben nachvollziehbar zugeordnet.

- Interne Notiz und für eine spätere Weitergabe vorgesehene Zusammenfassung sind unterscheidbar.

- Eine erfasste Aussage wird der Quelle zugeschrieben; das Produkt behauptet keine authentifizierte Anmeldung der genannten Person.

- Ein neuer Kommunikationseintrag kann eine Aufgabe erzeugen, aber keinen Beschluss oder Zahlungsstatus.

### FR 09 Entscheidungen und Handlungsgrundlagen erfassen

**Anforderung:** Das Plugin muss Diskussion, Empfehlung und Grundlagen des Handelns getrennt dokumentieren.

**Akzeptanzkriterien:**

- Kategorien sind Position, Empfehlung, dokumentierte Beiratsprüfung, Handlungsgrundlage und Beschlussnachweis.

- Eine Handlungsgrundlage enthält Art, Beschreibung, Datum und vorhandene Quelle. „Noch ungeklärt“ ist ein sichtbarer Bearbeitungsstand.

- Ein Beschlussnachweis enthält Art, Wortlaut, Datum, Quelle und eine gegebenenfalls vorhandene Referenz zur maßgeblichen Beschluss-Sammlung.

- Fehlende Nachweise werden angezeigt und können eine Klärungsaufgabe erzeugen. Bereits erfolgte tatsächliche Handlungen bleiben erfassbar.

- Eine fremde Freigabe erscheint als „Freigabe dokumentiert laut …“ mit Quelle und Erfassendem.

- Das Produkt berechnet keine rechtliche Wirksamkeit. Eine Anfechtung ist ein eigener Vermerk und setzt nicht automatisch „unwirksam“.

### FR 10 Auftrag und Änderungen verfolgen

**Anforderung:** Das Plugin muss einen aktiven Hauptauftrag je Vorgang mit Anbieter, Umfang, Angebotsfassung und vorhandener Handlungsgrundlage verbinden.

**Akzeptanzkriterien:**

- Auftragsentwurf, tatsächlicher Versand und erhaltene Bestätigung sind getrennte Angaben.

- Eine Beauftragung ohne vorheriges Angebot kann mit Begründung dokumentiert werden, etwa bei einer dringenden Maßnahme.

- Ein Auftrag mit ungeklärter Grundlage bleibt als Nachweislücke sichtbar; das Produkt erzeugt keinen Rechtsfreigabestatus.

- Nachträge und Umfangsänderungen werden gesondert mit Datum, Begründung und Grundlage erfasst.

- Ein geänderter Umfang erbt nicht unbemerkt einen Freigabevermerk für die vorige Fassung.

- Ein abgebrochener Auftrag bleibt erhalten. Ein Ersatzauftrag kann anschließend aktiv werden; mehrere gleichzeitig aktive Hauptaufträge benötigen getrennte verknüpfte Vorgänge.

### FR 11 Ausführung und Mängel dokumentieren

**Anforderung:** Das Plugin muss Termin, Ausführungsmeldung, Prüfung und offene Mängel eines Auftrags festhalten.

**Akzeptanzkriterien:**

- Ausführung gemeldet und Prüfung offen sind getrennte Angaben.

- Mängel werden als zugeordnete Aufgaben mit Beschreibung, Fotos und gewünschter Nacharbeit geführt.

- Eine erfolgte Abnahmeerklärung wird mit Person, Datum, Umfang und vorhandener Quelle dokumentiert.

- Ein allgemeiner Erledigt-Knopf erklärt keine Abnahme und löst keine Zahlung aus.

- Dokumentierte Abschlags- oder Vorauszahlungen sind auch vor einer Schlussabnahme möglich.

### FR 12 Rechnungen zuordnen und prüfen

**Anforderung:** Das Plugin muss mehrere Rechnungen eines Vorgangs mit Original, Lieferant, Rechnungsnummer, Datum, Fälligkeit und eindeutigem Zahlbetrag führen.

**Akzeptanzkriterien:**

- Einzel-, Abschlags- und Schlussrechnung sind unterscheidbar.

- Bruttogesamtbetrag des Dokuments und „laut Rechnung noch zu zahlender Betrag zum Dokumentstand“ sind getrennte Felder. Bei einer einfachen Rechnung können sie gleich sein.

- Prüfstand, Klärungsbedarf und Freigabevermerk sind vom abgeleiteten Zahlungsstand getrennt.

- Dubletten werden mindestens über WEG, Lieferant und Rechnungsnummer erkannt und mit nachvollziehbarer Nutzerentscheidung geklärt.

- Widersprüchliche Angaben, Gutschriften, Erstattungen oder komplexe Verrechnungen lassen sich mit Original und Klärungsaufgabe erfassen.

- Eine Schlussrechnung kann auf Abschläge verweisen; deren bereits berücksichtigte Zahlungen werden nicht nochmals abgezogen.

- Es gibt keine addierte Rechnungssumme über Abschlags- und Schlussbelege. Die Regeln im Abschnitt Zahlungsmodell sind verbindlich.

### FR 13 Zahlung vorbereiten

**Anforderung:** Das Plugin muss geprüfte Überweisungsdaten zur Nutzung im vorhandenen Banking bereitstellen.

**Akzeptanzkriterien:**

- Empfänger, IBAN, Betrag und Verwendungszweck sind vor dem Kopieren sichtbar.

- Vor Bereitstellung bestätigt der Nutzer die Prüfung der aktuell angezeigten Daten. Änderungen von Betrag, Empfänger, IBAN oder Dokumentbasis heben diese Bestätigung für den neuen Stand auf; dies ist keine zusätzliche rechtliche Freigabe.

- IBAN wird syntaktisch und anhand ihrer Prüfziffer geprüft. Dies bestätigt keine Kontoinhaberschaft.

- Betrag oder Empfängeränderungen seit dem dokumentierten Prüf- beziehungsweise Freigabestand werden hervorgehoben.

- Bei ungeklärter Betragsbasis oder Verrechnung wird keine verlässlich berechnete Zahlungsvorlage angeboten.

- Das Kopieren setzt weder „veranlasst“ noch „als erfolgt gemeldet“.

- Das Plugin speichert keine Bankzugangsdaten und löst keine Überweisung aus.

- Eine tatsächlich außerhalb des Plugins erfolgte Zahlung darf unabhängig davon nachträglich dokumentiert werden; fehlende Grundlagen bleiben sichtbar.

### FR 14 Zahlungen und Korrekturen erfassen

**Anforderung:** Das Plugin muss Zahlungseinträge mit Bezug zu genau einer Rechnung, Betrag, Status, Datum, Referenz und getrenntem Belegstatus führen.

**Akzeptanzkriterien:**

- Zustände sind Vorbereitet, Als veranlasst gemeldet, Als erfolgt gemeldet und Erfassung storniert.

- Das Stornieren korrigiert ausschließlich die lokale Erfassung und erklärt keine Rücknahme der Banküberweisung. Eine tatsächliche Rückzahlung oder Rückbuchung wird als Klärungsfall dokumentiert.

- Nur nicht stornierte, als erfolgt gemeldete Zahlungen, die nicht bereits in der Dokumentbasis enthalten sind, reduzieren den dokumentierten offenen Betrag.

- Mehrere Teilzahlungen sind möglich. Zahlungseinträge verlangen einen positiven Centbetrag in EUR; Erstattungen sind Klärungsfälle. Datum ist für „als erfolgt gemeldet“ erforderlich.

- Beleg hinzufügen oder entfernen ändert den Zahlungsstatus nicht.

- Ein fehlender Beleg wird gezeigt, macht eine ausdrücklich gemeldete Zahlung jedoch nicht automatisch ungeschehen.

- Korrekturen und Stornierungen behalten den Bezug zum bisherigen Eintrag.

- Mögliche doppelte Erfassung wird anhand Rechnung, Betrag, Datum und Referenz angezeigt.

- Eine Überzahlung bleibt als negativer Rest beziehungsweise Überzahlung sichtbar und wird nicht still auf null gekürzt.

### FR 15 Hinweise und Kalenderexport anbieten

**Anforderung:** Das Plugin muss fällige Arbeit beim Öffnen und während der Nutzung anzeigen sowie ausgewählte Termine als Kalenderdatei exportieren.

**Akzeptanzkriterien:**

- Beim Start und Wiederaufnehmen wird neu berechnet, was während der Abwesenheit fällig wurde.

- Hinweise können gesammelt geschlossen beziehungsweise zeitlich verschoben werden, ohne die Fälligkeit zu verändern.

- Das Produkt behauptet keine Benachrichtigung, während es nicht lief.

- Vor einem ICS-Export ist sichtbar, dass es sich um eine Momentaufnahme ohne automatische Aktualisierung handelt.

- Der Nutzer wählt, ob Fälligkeit oder Wiedervorlage exportiert wird.

- Standardmäßig werden nur Titel, Zeitpunkt und eine knappe gewählte Beschreibung exportiert; interne Notizen, Bankdaten und lokale Dateipfade fehlen.

- Kalendertage und Uhrzeiten werden einschließlich Zeitzone und Sommerzeit korrekt behandelt.

### FR 16 Vorgang gezielt exportieren

**Anforderung:** Das Plugin muss einen ausgewählten Vorgang als druckbare Übersicht mit bewusst ausgewählten Originalanlagen ausgeben.

**Akzeptanzkriterien:**

- Erstes Austauschformat ist ein ZIP mit statischer HTML-Übersicht und den ausgewählten Anlagen; ein zusätzlicher eigener PDF-Generator ist nicht erforderlich.

- Vor Erstellung sieht der Nutzer die enthaltenen Abschnitte und Dateiliste.

- Interne Notizen sind standardmäßig ausgeschlossen. Nicht ausgewählte, nur verlinkte Dokumente werden nicht transitiv mitgenommen.

- Die Übersicht benennt bei Zahlungen und fremden Freigaben den manuellen Dokumentationsstand.

- Die erzeugte HTML-Übersicht und die Vorschau enthalten keine aktiven Skripte oder extern nachgeladenen Inhalte. Originalanhänge bleiben unverändert und werden als Dateilinks angeboten, ohne aktive Einbettung. Die Übersicht enthält keine Verweise, die fremde lokale Dateien offenlegen.

- Der Nutzer kann zusätzlich eine vollständige interne Akte exportieren; deren größerer Umfang wird ausdrücklich angezeigt.

- Die eigentliche Weitergabe erfolgt außerhalb des Plugins.

### FR 17 Originale und Beziehungen erhalten

**Anforderung:** Das Plugin muss Originalanhänge unverändert ablegen und fachliche Beziehungen unabhängig von Dateinamen erhalten.

**Akzeptanzkriterien:**

- PDF, Bilder, strukturierte Rechnungsdateien, Nachrichten und gängige Office-Dateien können als Originale gespeichert werden; eine Vorschau ist nicht für jedes Format erforderlich.

- Neue Fassungen erhalten eine neue Dokumentzuordnung. Der bisherige Beleg wird nicht unbemerkt ersetzt.

- Umbenennen und Verschieben innerhalb des verwalteten Bereichs erhält Beziehungen oder erzeugt einen verständlichen Reparaturhinweis.

- Eine referenzierte fehlende Datei erscheint als fehlend, statt still aus der Ansicht zu verschwinden.

- Unbekannte zusätzliche Properties und nicht vom Plugin verwaltete Notizinhalte bleiben bei Bearbeitung erhalten.

- Vom Plugin erzeugte Vorschauen und Übersichten stellen fremde Inhalte dar, ohne darin eingebetteten Code auszuführen. Dies ist keine Aussage über das Verhalten unveränderter Originalanhänge in externen Anzeigeprogrammen.

### FR 18 Daten prüfen und wiederherstellen

**Anforderung:** Das Plugin muss erkennbare Datenfehler melden und eine vollständige Sicherung des verwalteten Datenbestands ermöglichen.

**Akzeptanzkriterien:**

- Doppelte IDs, ungültige Werte, fehlende Beziehungen und nicht unterstützte Schemaversionen werden sichtbar.

- Fehlerhafte Datensätze werden nicht automatisch gelöscht oder still als korrekt behandelt.

- Eine Datensicherung enthält Fachnotizen, Originalanhänge und Schemaangaben; sie ist von einem selektiven externen Export unterscheidbar.

- Die dokumentierte Wiederherstellung in einem leeren Arbeitsordner und der Neuaufbau des Index funktionieren.

- Wird eine Datei extern geändert, während ein Formular offen ist, werden beide Stände erhalten beziehungsweise vergleichbar gemacht; es erfolgt kein blindes Überschreiben.

- Ein unterbrochener mehrteiliger Schritt lässt sich ohne doppelte Aufträge, Aufgaben oder Zahlungen fortsetzen.

- Künftige Schemamigrationen benötigen vorher eine wiederherstellbare Sicherung. Eine neuere unbekannte Schemaversion wird nicht schreibend geöffnet.

### FR 19 Einführung und Hilfe bereitstellen

**Anforderung:** Das Plugin muss einen verständlichen Einstieg, lokale Hilfe und einen kontrollierten Diagnoseweg anbieten.

**Akzeptanzkriterien:**

- Die Einführung führt von WEG-Daten zum ersten Vorgang und erklärt den nächsten Schritt.

- Sie benennt lokalen Betrieb, externes Banking, vorhandene Versandwege und die Laufzeitgrenze der Erinnerungen.

- Es werden keine fiktiven real wirkenden Akten automatisch im Arbeitsbestand angelegt.

- Hilfe enthält einen durchgehenden synthetischen Beispielfall und eine Anleitung für Sicherung und Wiederherstellung.

- Diagnosen sind lokal und enthalten standardmäßig Versionen, Fehlercodes und technische Angaben, keine Inhalte aus Akten.

- Der Nutzer kann einen bereinigten Diagnosebericht bewusst kopieren; automatischer Telemetrieversand fehlt.

- Deaktivierung oder Deinstallation des Plugins entfernt keine Fachnotizen oder Originalbelege.

## Geschäftsregeln

| Kennung | Verbindliche Regel |
| --- | --- |
| BR-01 | WEG-Zugehörigkeit und fachliche Identitäten bleiben bei Dateiumbenennung erhalten. Kontakte und ein eingetragener Verantwortlicher erzeugen keine rechtliche Befugnis. |
| BR-02 | Eine interne Aufgabe, eine externe Aussage und eine dokumentierte rechtsgeschäftliche Erklärung sind unterscheidbar. Kein allgemeiner Erledigt-Knopf erklärt Auftrag, Abnahme oder Zahlung. |
| BR-03 | Ein Anfrageentwurf wird erst durch dokumentierten tatsächlichen Versand zum versendeten Vorgang. Zustellung wird nicht daraus abgeleitet. |
| BR-04 | Es gibt keine allgemeine Drei-Angebote-Sperre, keine feste gesetzliche Eurofreigabegrenze und keine automatische Anbieterwahl. Grundlage und Auswahlbegründung werden dokumentiert. |
| BR-05 | Eine Auswahl bezieht sich auf einen bestimmten Leistungs- und Angebotsstand. Nachträge und spätere Fassungen erhalten einen eigenen Bezug zur Handlungsgrundlage. |
| BR-06 | Meinung, Empfehlung, Beiratsprüfung, Beschlussnachweis und Handlungsgrundlage bleiben verschieden. Eine fremde Zustimmung ist im Einzelbearbeitermodell eine dokumentierte Quelle. |
| BR-07 | Der MVP führt vorgangsbezogene Beschlussnachweise, keine vollständige gesetzliche Beschluss-Sammlung und keine elektronische Abstimmung. |
| BR-08 | Eine fachliche Fälligkeit ist von Wiedervorlage und Antwortfrist getrennt. Eine Erinnerung verschieben verändert keine vertragliche oder fachliche Frist. |
| BR-09 | Zahlungsvorbereitung, gemeldete Veranlassung, gemeldete Ausführung und Belegstatus bleiben unabhängig. Nur der definierte Zahlungsstand wirkt auf die Berechnung. |
| BR-10 | Rechnungsbasis und berücksichtigte Zahlungen müssen eindeutig sein. Bei Unklarheit wird „Zuordnung prüfen“ angezeigt, keine scheinbar verlässliche Restforderung. |
| BR-11 | Abschlags- und Schlussbelege werden nicht zu einer gemeinsamen Bruttorechnungssumme addiert. Bereits in der Schlussrechnung berücksichtigte Zahlungen werden nicht doppelt abgezogen. |
| BR-12 | Nachvollziehbare Korrekturen erhalten ihren Bezug zum alten Stand. Ein abgelöster oder stornierter Beleg wird nicht als bezahlt umgedeutet. |
| BR-13 | Dringliche Beauftragung, Mängel, bestrittene Rechnungen sowie Voraus- und Teilzahlungen bleiben bearbeitbar. Eine Schlussabnahme ist keine universelle technische Voraussetzung jeder Zahlung. |
| BR-14 | Ein Vorgangsabschluss verändert keine offenen Unterdatensätze automatisch. Nicht erledigte Punkte behalten eine sichtbare weitere Behandlung. |
| BR-15 | Interne Notizen bleiben im externen Export standardmäßig ausgeschlossen. Eine Datensicherung und ein Export für andere Personen sind verschiedene Aktionen. |

Die fachliche Modellierung berücksichtigt insbesondere [§ 9b WEG](https://www.gesetze-im-internet.de/woeigg/__9b.html) und [§ 27 WEG](https://www.gesetze-im-internet.de/woeigg/__27.html) zur Stellung des Verwalters sowie [§ 23](https://www.gesetze-im-internet.de/woeigg/__23.html) und [§ 24 WEG](https://www.gesetze-im-internet.de/woeigg/__24.html) zu Beschlüssen und Dokumentation. Diese Vorschriften werden nicht als automatische Gültigkeitsprüfung implementiert.

Der BGH hat am 27.03.2026 in V ZR 7/25 eine pauschale Pflicht zu mehreren Vergleichsangeboten für Erhaltungsmaßnahmen verneint; die Tatsachengrundlage hängt vom konkreten Fall ab. BR-04 unterstützt deshalb Dokumentation und begründete Auswahl. [Urteilstext beim DNotI](https://www.dnoti.de/entscheidungen/details/?cHash=9c627f5d2e16dabccc3772038110ed4a&tx_dnotionlineplusapi_decisionsdetails%5Bcontroller%5D=Decisions&tx_dnotionlineplusapi_decisionsdetails%5Bnodeid%5D=24807ebc-15ec-4986-a3f6-76b72326c91c)

## Zahlungsmodell

Der MVP dokumentiert die Zahlbeträge einzelner Rechnungsdokumente. Er ist keine Finanzbuchhaltung und führt keinen automatischen Kontenabgleich durch.

### Basis und Berechnung

Je Rechnung werden folgende Angaben getrennt gespeichert:

| Größe | Bedeutung |
| --- | --- |
| Dokumentgesamtbetrag | Bruttogesamtbetrag der Rechnung; kann bei einer Schlussrechnung die gesamte Leistung umfassen. |
| Zahlbetrag zum Dokumentstand | Laut vorliegender Rechnung noch zu zahlender Betrag nach dort bereits ausgewiesenen Anrechnungen. |
| Dokumentbasis | Dokumentfassung, Datum und Erläuterung zu bereits berücksichtigten Abschlägen oder Zahlungen. |
| Zusätzliche Zahlungen | Auf diese Rechnung bezogene, als erfolgt gemeldete und nicht stornierte Zahlungen, die in der Basis noch nicht enthalten sind. |
| Dokumentierter Rest | Zahlbetrag zum Dokumentstand abzüglich zusätzlicher Zahlungen. |

Beträge werden in ganzen Centwerten in EUR gespeichert. Der dokumentierte Rest kann negativ sein; dann wird eine Überzahlung angezeigt. Die Anzeige trägt den Hinweis „laut manueller Erfassung“.

Jeder Zahlungseintrag gehört genau einer Rechnung. Seine Beziehung zusätzlich, bereits in der Basis enthalten oder ungeklärt bezieht sich ausschließlich auf diese Rechnung und eine konkrete Version ihrer Dokumentbasis. Die Anrechnung eines Abschlags in einer Schlussrechnung wird als Referenz an der Schlussrechnung gespeichert; sie erzeugt keinen neuen Zahlungseintrag und verändert die Zuordnung an der ursprünglichen Abschlagsrechnung nicht. Wird eine Dokumentbasis geändert, müssen die betroffenen bestehenden Zuordnungen erneut geprüft werden. Bis zur Klärung gibt es keinen berechneten Rest und keine berechnete Zahlungsvorlage.

Rechnungsprüfung und Freigabevermerk sind eigene Dimensionen. Wird die maßgebliche Dokument- oder Betragsbasis geändert, wird der frühere Prüf- beziehungsweise Freigabevermerk als auf den alten Stand bezogen angezeigt.

### Abschlagsbeispiel als Abnahmeregel

Eine Abschlagsrechnung beträgt 100 Euro. Die Zahlung von 100 Euro wurde als erfolgt erfasst. Später kommt eine Schlussrechnung über eine Gesamtleistung von 500 Euro, die den Abschlag von 100 Euro bereits abzieht und noch 400 Euro verlangt.

Erwartetes Verhalten:

1. Die Schlussrechnung beginnt mit 400 Euro dokumentiertem Rest.

2. Die frühere Zahlung wird nicht erneut abgezogen.

3. Eine zusätzliche Zahlung von 150 Euro auf die Schlussrechnung führt zu 250 Euro dokumentiertem Rest.

4. Das Produkt zeigt keine addierte Bruttorechnungssumme von 600 Euro.

5. Der Verweis auf den Abschlag ändert dessen gespeicherten Zahlungsstatus nicht.

### Klärungsfälle

Gutschriften, Erstattungen, Sammelzahlungen, widersprüchliche Abschlagsstände und komplexe Verrechnungen werden mit ihren Originalen und einer Klärungsaufgabe dokumentiert. Die automatische Verrechnung dieser Fälle gehört nicht zum MVP.

Für die im MVP unterstützten Einzelzahlungen ist eine berechnete Zahlungsvorlage erst wieder möglich, wenn ein bereinigter Beleg oder eine eindeutige belegte Zuordnung vorliegt. Eine freie Betragsänderung ohne dokumentierte Grundlage genügt nicht.

Eine durch einen neuen Beleg abgelöste Forderung wird mit dem Nachfolger verknüpft und aus der gewöhnlichen Zahlungsvorbereitung genommen. Historische Zahlungen bleiben erhalten. „Abgelöst“ bedeutet nicht „bezahlt“. Offene widersprüchliche Abschlagsstände bleiben als Klärungsbedarf sichtbar.

Eine Sammelüberweisung darf nicht als voller Betrag bei mehreren Rechnungen erfasst werden. Auch die manuelle Aufteilung einer Sammelüberweisung auf mehrere Rechnungen gehört nicht zum ersten MVP. Ihr Beleg und die betroffenen Rechnungen werden als Klärungsfall dokumentiert; bis zu einer später unterstützten eindeutigen Behandlung wird kein verlässlich zugeordneter Zahlungsbetrag daraus abgeleitet.

## Fachliches Datenmodell

Die folgenden Objekte und Beziehungen bilden die fachliche Grundlage. Die konkrete Aufteilung von Dateien und UI-Komponenten wird in der technischen Spezifikation festgelegt.

| Objekt | Kardinalität und wesentliche Inhalte |
| --- | --- |
| WEG | Genau eine aktive WEG je Vault; Bezeichnung, Anschrift, verantwortlicher Kontakt. |
| Kontakt | Gehört zur WEG; kann an beliebig vielen Vorgängen beteiligt sein. Person oder Firma, Kontaktdaten, Archivkennzeichen. |
| Vorgang | Gehört genau einer WEG; Thema, Beschreibung, Zustand, nächste Aufgabe, Wartegrund und verknüpfte Vorgänge. |
| Aufgabe | Gehört genau einer WEG; optional genau einem Vorgang. Handlung, Status, Zuständigkeit, Fälligkeit, Wiedervorlage und optional Mangelbezug. |
| Leistungsbeschreibung | Gehört zum Vorgang; versionierter Inhalt und gewählte Anlagen. |
| Anfrage | Gehört zum Vorgang; genau ein Empfänger und eine Fassung der Leistungsbeschreibung. |
| Angebot | Gehört zum Vorgang und zu einem Anbieter; optional eine Anfrage. Fassungen, Kerndaten und Original beziehungsweise dokumentierte Quelle. |
| Handlungsnachweis | Gehört zum Vorgang; Kategorie, Inhalt, Datum, Quelle und gegebenenfalls Bezug zu Auftrag oder Rechnung. |
| Auftrag | Gehört zum Vorgang; höchstens einer aktiv, frühere bleiben erhalten. Anbieter, Umfang, optionale Angebotsfassung, Nachweise, Termin und Ausführungsdaten. |
| Rechnung | Gehört zum Vorgang und optional einem Auftrag; Lieferant, Nummer, versionierte Dokumentbasis, Beträge, Prüfung, Freigabevermerk und optionale Vorgänger beziehungsweise Anrechnungsreferenzen auf Abschläge. |
| Zahlungseintrag | Gehört genau einer Rechnung; Betrag, Status, Datum, Referenz, Zuordnung zur konkreten Basisversion dieser Rechnung und unabhängiger Belegstatus. |
| Kommunikation | Gehört zum Vorgang; Ereignisdatum, Erfassung, Kanal, Beteiligte, Inhalt und Quelle. |
| Dokument | Gehört zur WEG; Originaldatei mit stabiler Identität und optional mehreren fachlichen Referenzen. |

Alle Fachobjekte erhalten stabile IDs, WEG-Bezug, Schemaversion, Revision sowie Erstellungs- und Änderungszeit. Ein dokumentierter Akteur und der tatsächlich erfassende Nutzer bleiben unterscheidbar. Eine lokale Historie macht Änderungen nachvollziehbar, wird jedoch nicht als manipulationssicher ausgegeben.

Datumsfristen sind Kalendertage. Erinnerungszeitpunkte enthalten Uhrzeit und Zeitzone. Fehlende Werte sind unbekannt und werden nicht still als null Euro, erledigt oder nicht erforderlich behandelt.

Referenzen dürfen nicht auf den sichtbaren Dateinamen als Identität angewiesen sein. Manuelle Umbenennungen und zusätzliche Properties werden berücksichtigt. Bei widersprüchlichen Dateien hat der Schutz vorhandener Daten Vorrang vor einer automatischen Reparatur.

## Technische Leitplanken

**Umsetzungsvorschlag:** Ein TypeScript-Fachkern enthält Entitäten, Zustandsregeln und Berechnungen. Ein Obsidian-Adapter übernimmt Dateien, Ansichten und Laufzeitressourcen. Ein Export-Adapter erzeugt Austausch- und Sicherungsdateien. Für den MVP wird kein Backend aufgebaut.

Fachliche Daten sollen in lesbaren Markdown-Dateien mit flachen Properties und separaten Originalanhängen liegen. Ein optionaler Index wird ausschließlich daraus rekonstruiert. Ein exklusiv proprietärer Datenspeicher darf nicht der einzige Zugang zu den Akten sein. Obsidian dokumentiert lokale Markdown-Dateien und entsprechende dateibasierte Ansichten in Bases; das Plugin darf Bases unterstützen, muss aber ohne zusätzliche Abhängigkeit bedienbar bleiben. [Datenhaltung](https://obsidian.md/help/data-storage), [Bases](https://obsidian.md/help/bases)

Dateiänderungen müssen vorhandene Inhalte und zwischenzeitliche Änderungen beachten. Lokale Schreibmechanismen lösen keine Transaktion über mehrere Dateien oder Geräte. Für mehrteilige Aktionen sind wiederholbare Schritte und erkennbare Zwischenstände erforderlich.

Der Pilotumfang umfasst einen aktiven Bearbeiter und ein primäres Schreibgerät. Allgemeiner Vault-Sync ist keine zugesagte Mehrbenutzerfunktion. Insbesondere Shared Vaults bieten laut Obsidian keine feinen Rollenrechte. [Obsidian Zusammenarbeit](https://obsidian.md/help/sync/collaborate)

Für spätere Cloudfähigkeit genügen im MVP stabile IDs, Schemaversionen, explizite Beziehungen und getrennte Fachlogik. Ein vorsorglich gebauter Syncdienst, ein verteiltes Sperrsystem oder eine universelle Workflowplattform gehören nicht zum ersten Release.

Später veröffentlichte gemeinsame Daten benötigen serverseitige Identitäten, Rechte und Konfliktregeln. Der Server wird dann für diese Daten verbindlich; lokale Akten sind Kopien oder Entwürfe. Ein Zugriffsentzug beendet künftigen Serverzugriff, ruft bereits vorhandene Exporte jedoch nicht zuverlässig zurück.

## Nichtfunktionale Anforderungen

Alle folgenden Punkte sind Releaseanforderungen. Leistungswerte sind festgelegte Prüfziele, noch keine Messergebnisse.

| Kennung | Anforderung und Prüfkriterium |
| --- | --- |
| NFR-01 Offline | Die gesamte Kernreise einschließlich Dokumentimport, lokaler Hinweise, Zahlungserfassung und Export funktioniert bei gesperrtem Netzwerk. Installation und bewusst verwendete externe Werkzeuge sind ausgenommen. |
| NFR-02 Datenerhalt | Abbruch-, Konflikt- und Wiederherstellungstests hinterlassen keine ungeklärten Datenverluste. Wiederholen einer unterbrochenen Aktion erzeugt keine doppelten fachlichen Einträge. |
| NFR-03 Rechenkorrektheit | Geldberechnungen verwenden ganze Centwerte; die Beispiele des Zahlungsmodells sowie Teilzahlung, Storno, Überzahlung und ungeklärte Zuordnung ergeben die festgelegten Anzeigen. |
| NFR-04 Reaktionszeit | Unter dem Referenzprofil ist die erste Arbeitsübersicht in 19 von 20 Starts innerhalb von fünf Sekunden verfügbar; Filtern und Öffnen nach Initialisierung dauern in mindestens 95 Prozent von 30 Aktionen höchstens 300 Millisekunden. |
| NFR-05 Speichern | Ein Formular ohne Dateikopie wird in mindestens 95 Prozent von 30 Aktionen innerhalb von 500 Millisekunden gespeichert. Bei längerem Dateiimport sind Fortschritt, Erfolg oder Fehler sichtbar. |
| NFR-06 Bedienbarkeit | Die Kernreise ist per Tastatur bedienbar, der Fokus sichtbar, Status zusätzlich als Text erkennbar. Bei 200 Prozent Zoom bleiben Aktionen und Fehlermeldungen erreichbar. |
| NFR-07 Datenschutz | Der lokale Kern benötigt kein eigenes Konto und keine clientseitige Telemetrie. Diagnoseausgaben enthalten standardmäßig keine Akteninhalte, Namen, IBAN oder vollständigen Dateipfade. |
| NFR-08 Sichere Darstellung | Importierte Texte und erzeugtes HTML führen keinen fremden Code aus. Nicht ausgewählte Anlagen und interne Notizen werden im externen Export nicht mitgenommen. |
| NFR-09 Kompatibilität | Windows 11 und die festgelegte minimale sowie die bei Freigabe aktuelle stabile Obsidian-Version bestehen die Kernprüfung. Das Manifest kennzeichnet Desktopbetrieb; weitere Plattformen werden nur im getesteten Umfang zugesagt. |
| NFR-10 Datenportabilität | Fachnotizen und Originale sind nach Plugin-Deaktivierung lesbar. Ein Sicherungsexport lässt sich in einem leeren Arbeitsordner mit funktionsfähigen Beziehungen wieder öffnen. |
| NFR-11 Laufzeit | Timer und Ereignisregistrierungen werden beim Deaktivieren beendet. Start und Wiederaufnahme ermitteln fällige Arbeit neu; nicht ausgeführte Benachrichtigungen werden nicht als erfolgt protokolliert. |
| NFR-12 Wartbarkeit | Schemaversion und Pluginversion sind erkennbar. Unbekannte neuere Datenschemata werden nicht überschrieben. Fehler nennen eine verständliche Handlung und bewahren Eingaben. |

**Referenzprofil:** Windows 11, SSD, 16 GB RAM, dokumentierte CPU und Obsidian-Version; ein synthetischer Vault mit einer WEG, 200 Vorgängen, insgesamt 2.000 Fachnotizen und 1.000 Originalanhängen. Mindestens zehn Anhänge haben 20 MiB. Die Liste liest für ihren Aufbau nicht alle Originaldateien vollständig ein. Messverfahren und Ergebnisse werden im Releaseprotokoll festgehalten.

Die aktuellen Obsidian Developer Policies untersagen clientseitige Telemetrie und verlangen die Offenlegung bestimmter Konto-, Netzwerk- und Zahlungsabhängigkeiten. Ein bewusst exportierter lokaler Diagnosebericht ist der vorgesehene Supportweg. [Quelle: Developer Policies](https://docs.obsidian.md/community-directory/developer-policies)

Die Anwendung macht keine pauschale Aussage über Verschlüsselung oder Revisionssicherheit lokaler Dateien. Die Rolle weiterer Plugins und der Geräteschutz liegen außerhalb ihrer eigenen Zugriffskontrolle. [Obsidian Plugin Security](https://obsidian.md/help/plugin-security)

## Abnahmeszenarien

AT-01 bis AT-11 und AT-13 werden vor Veröffentlichung intern mit synthetischen Daten durchgeführt. Sie erfordern keinen vorgeschalteten Marktpilot. AT-12 bestätigt anschließend die öffentliche Installierbarkeit und schließt den Veröffentlichungsmeilenstein vor Beginn des Piloten ab.

| Kennung | Szenario | Erwartung |
| --- | --- | --- |
| AT-01 | WEG in frischem Vault einrichten, ersten Vorgang anlegen und Plugin neu starten. | Daten bleiben vorhanden; nächster Schritt ist sichtbar; fremde Dateien bleiben unberührt. |
| AT-02 | Allgemeine WEG-Aufgabe und wartenden Handwerkerfall anlegen; Wiedervorlage verschieben. | Beide erscheinen passend in Heute. Die fachliche Fälligkeit bleibt unverändert. |
| AT-03 | Anfrage an zwei Firmen, eine Absage, ein Angebot; später Leistungsbeschreibung ändern. | Versandstatus bleibt manuell; ein Angebot genügt zur weiteren Bearbeitung; unterschiedliche Fassungen sind erkennbar. |
| AT-04 | Meinung, Beiratsprüfung und Beschlussnachweis erfassen; dringenden Auftrag ohne vorheriges Angebot dokumentieren. | Kategorien bleiben getrennt, keine Gültigkeitsbehauptung; Begründung und Nachweislücken sind sichtbar. |
| AT-05 | Rechnung über 300 Euro; Teilzahlung von 120 Euro vorbereiten, Beleg hochladen, Veranlassung melden und erst danach die Ausführung erfassen. | Bis zur erfassten Ausführung bleiben 300 Euro offen; danach 180 Euro. Belegupload allein ändert nichts. |
| AT-06 | 120 Euro aus AT-05 stornieren, eine korrigierte Zahlung von 150 Euro und danach weitere 200 Euro als erfolgt erfassen. | Nach Storno 300 Euro Rest, nach Korrektur 150 Euro Rest, danach 50 Euro Überzahlung. Der alte Eintrag bleibt nachvollziehbar und zählt nicht mit. |
| AT-07 | Abschlags- und Schlussrechnung gemäß Beispiel 100 Euro, 500 Euro und 400 Euro erfassen; 150 Euro zusätzlich zahlen. | Schlussrechnung zeigt 250 Euro Rest; kein doppelter Abzug und keine Bruttosumme von 600 Euro. |
| AT-08 | App über eine Fälligkeit hinweg schließen, wieder öffnen und einen Kalendertermin exportieren. | Überfälligkeit wird erkannt; kein fiktiver Versand; Export erklärt die fehlende automatische Aktualisierung. |
| AT-09 | Externen Export mit interner Notiz, ausgewählten und nicht ausgewählten Anhängen erstellen. | Nur ausgewählte Inhalte erscheinen; die erzeugte Übersicht lädt nichts extern nach und legt keine weiteren Dateien offen. Originalanlagen bleiben unverändert als Dateilinks enthalten. |
| AT-10 | Datei während offener Bearbeitung extern ändern, ID duplizieren, Beziehung beschädigen und Speichern unterbrechen. | Konflikte sind sichtbar; Eingaben und Originale bleiben erhalten; Wiederholen erzeugt keine Dubletten. |
| AT-11 | Vollständige Sicherung in einem neuen leeren Arbeitsordner wiederherstellen und Plugin deaktivieren. | Beziehungen und Originale funktionieren; Akten bleiben ohne Plugin lesbar. |
| AT-12 | Nach Veröffentlichung aus dem öffentlichen Verzeichnis in einem frischen Vault installieren. | Beschriebene Installation, Version und Grundablauf funktionieren ohne Entwicklerwerkzeuge. |
| AT-13 | Eine Sammelüberweisung über 300 Euro mit Bezug auf Rechnungen A und B dokumentieren. | Der Beleg kann als Klärungsdokument zugeordnet werden. Er setzt weder A noch B auf bezahlt und reduziert deren Rest nicht automatisch; die nicht unterstützte Verteilung bleibt erkennbar. |

Für AT-03 bis AT-11 werden zusätzlich Tastaturbedienung, Dark- und Light-Mode sowie die Offlineanforderung geprüft. Der Releasebericht hält tatsächliche Ergebnisse und bekannte Einschränkungen fest.

## Veröffentlichungskriterien

Die erste Zielversion kann 0.1.0 sein; die konkrete Versionsnummer wird im Releaseprozess festgelegt. Eine Einreichung ist noch keine Veröffentlichung.

### Interne Freigabe

- FR-01 bis FR-19 und die Geschäftsregeln sind umgesetzt und anhand der zugeordneten Szenarien geprüft.

- NFR-Prüfungen sind dokumentiert und die geltenden MUSS-Anforderungen erfüllt. Soll ein Prüfziel vor Veröffentlichung geändert werden, wird die Änderung mit Begründung im PRD dokumentiert; ein bekannter Fehler allein setzt das Kriterium nicht außer Kraft.

- Keine offenen Fehler mit Datenverlust, falscher Zahlungsberechnung oder unbeabsichtigter Offenlegung.

- Keine offenen Fehler, die eine Kernreise ohne praktikablen dokumentierten Weg blockieren.

- README, Einstieg, Sicherung, Wiederherstellung, Umfang und bekannte Einschränkungen sind nachvollziehbar.

- Der synthetische Ablauf funktioniert ohne Zugriff auf private Pilotdaten.

- Ein verantwortlicher Maintainer und ein Support- beziehungsweise Fehlerkanal sind benannt.

### Einreichung und öffentliche Verfügbarkeit

Die aktuelle Obsidian-Dokumentation verlangt die passende Repository- und Releasegrundlage. Für WEG Manager werden Name beziehungsweise eindeutige Plugin-ID, README, Lizenz, Manifest, Mindestversion und Release-Artefakte vorbereitet. Versions-Tag und Manifest passen zusammen. Das Plugin wird über das Community-Verzeichnis eingereicht; beanstandete Fehler werden behoben. Anschließend wird die Installation über das Verzeichnis geprüft. [Quelle: Obsidian Einreichung](https://docs.obsidian.md/Plugins/Releasing/Submit%20your%20plugin)

Als Nachweis der Veröffentlichung werden öffentliche Verzeichnisadresse, freigegebene Version und Datum der erfolgreichen Neuinstallation erfasst. Der Pilot startet nach diesem Meilenstein. Prüfzeiten des Verzeichnisses werden nicht als zugesagter Termin behandelt.

Das Produkt wird mit den zutreffenden Kosten- und Dienstangaben gelistet. Für den vorgesehenen vollständig kostenlosen lokalen MVP passt „Free“; ein späterer kostenpflichtiger Dienst erfordert eine entsprechende Aktualisierung. Die Quellcodelizenz wird vor Einreichung festgelegt; öffentlich einsehbarer Quellcode ist empfohlen. [Obsidian Community FAQ](https://docs.obsidian.md/community-directory/faq)

## Pilotplan nach Veröffentlichung

Der vorhandene Nutzer installiert die veröffentlichte Version über das Community-Verzeichnis. Ziel ist, Gebrauchstauglichkeit, Nutzen und zusätzlichen Pflegeaufwand in seiner eigenen WEG zu verstehen.

| Phase | Vorgehen | Ergebnis |
| --- | --- | --- |
| Einstieg | Installation aus dem Verzeichnis und höchstens etwa 20 Minuten begleitete Einführung. | Erster selbstständig angelegter realer Vorgang mit nächster Aktion. |
| Ausgangslage | Nach Veröffentlichung einen vergangenen Fall rekonstruieren und vorhandene Arbeitsmittel festhalten. | Vergleichsbasis; erinnerte Zeitangaben werden als Schätzung markiert. |
| Alltag | Vier bis sechs Wochen aktuelle Fälle und tatsächliche Verwaltungsanlässe begleiten. | Beobachtungen zu Erfassung, Suche, Nachfassen, Zahlung und Übergabe. |
| Rückmeldung | Kurze regelmäßige Gespräche oder ein bewusst geführtes lokales Ereignisprotokoll. | Konkrete Fehler und Verbesserungsbedarfe mit Fallbezug. |
| Auswertung | Nutzen und Aufwand gegenüberstellen, Blockaden priorisieren und nächste Version festlegen. | Nachvollziehbare Produktentscheidungen. |

Bei wenigen oder lang laufenden Fällen wird die Beobachtung verlängert. Ein nachgespielter Altfall kann die Bedienung prüfen; ein realer Abschluss bleibt unbeobachtet, solange er nicht tatsächlich stattgefunden hat.

### Messgrößen und Lernfragen

| Kennung | Kriterium | Auswertung mit einem Pilotnutzer |
| --- | --- | --- |
| P-01 | Einstieg | Kann der Nutzer nach der Einführung einen echten Vorgang mit nächster Aktion selbstständig anlegen? Richtwert: höchstens 20 Minuten Einführung. |
| P-02 | Orientierung | Findet er in drei wiederholten Prüfungen jeweils innerhalb einer Minute den nächsten Schritt und die ausstehende Rückmeldung? |
| P-03 | Selbstständige Bearbeitung | Kann er neue Antworten, Angebote, Rechnungen und Zahlungen passend zuordnen, ohne dass der Entwickler die Bedienung übernimmt? |
| P-04 | Aufwand | Wie verändern sich aktive Erfassungs-, Such- und Nachfasszeit einschließlich zusätzlicher Pflege? 20 Prozent weniger Aufwand ist ein Lernziel bei ausreichend vergleichbaren Aufgaben, keine Releasebedingung. |
| P-05 | Wiederverwendung | Nutzt er das Produkt bei späteren tatsächlichen Verwaltungsanlässen erneut? Wochen ohne Anlass zählen nicht als Abbruch. |
| P-06 | Übergabe | Kann eine zweite, vom Nutzer bewusst einbezogene Person Sachstand, Grundlage und nächste Aktion aus dem Export korrekt wiedergeben? |
| P-07 | Zuverlässigkeit | Treten Datenverluste, widersprüchliche Beträge, verpasste sichtbare Wiedervorlagen oder unbeabsichtigte Exporte auf? |

Aktive Arbeitszeit wird von Wartezeit auf Dritte getrennt. Direkte Messungen, Schätzungen und qualitative Einschätzungen werden gekennzeichnet. Ohne ausreichend vergleichbare Beobachtungen wird kein belastbarer Prozentwert behauptet.

Es werden keine fünf Nutzer oder eine vorgelagerte Interviewserie als Voraussetzung verlangt. Die Ergebnisse dieses Piloten liefern konkrete Hinweise für diesen Einsatzfall, keinen statistischen Nachweis einer breiten Marktnachfrage.

### Entscheidungen nach dem Pilot

- Bei verständlichem Ablauf und erkennbarem Nutzen werden Fehler und die wichtigsten Reibungspunkte in der Folgeversion bearbeitet.

- Bei zu hoher Doppelpflege werden Erfassung und Übernahme vereinfacht, bevor zusätzliche Funktionsbereiche entstehen.

- Wenn direkte Zahlungsauslösung den wesentlichen Nutzen bestimmt, wird die Bankintegration neu priorisiert.

- Wenn gemeinsame Onlinearbeit Voraussetzung ist, wird ein eng begrenzter Webdienst früher geplant.

- Wenn Obsidian nicht regelmäßig als Arbeitsplatz akzeptiert wird, wird die Clientstrategie überprüft.

Private Akten werden nicht automatisch an den Hersteller übertragen. Feedback nutzt vom Nutzer gewählte, möglichst anonymisierte Beispiele und bewusst bereitgestellte Diagnoseinformationen.

## Umsetzung und Abhängigkeiten

| Inkrement | Lieferumfang | Abschlussbedingung |
| --- | --- | --- |
| I-01 Grundlage | WEG, Kontakte, Datenidentitäten, Vorgänge, Aufgaben und Heute. | Erster Fall und allgemeine Aufgabe funktionieren offline; erneutes Öffnen erhält Daten. |
| I-02 Anfrage und Entscheidung | Leistungsfassungen, Anfragen, Angebote, Kommunikation und Handlungsnachweise. | Ein typischer Fall gelangt nachvollziehbar zur Beauftragungsgrundlage. |
| I-03 Auftrag und Zahlung | Auftrag, Nachträge, Ausführung, Rechnungen, Zahlungsvorbereitung und manuelle Zahlungen. | Der synthetische Gesamtfall einschließlich Abschlagsbeispiel funktioniert. |
| I-04 Releasequalität | Exporte, Kalender, Konflikte, Sicherung, Wiederherstellung, Hilfen und Qualitätsprüfungen. | Die interne Releaseprüfung ist bestanden. |
| I-05 Veröffentlichung | Einreichung, Korrekturen und Installation aus dem Community-Verzeichnis. | Die Version ist öffentlich installierbar. |
| I-06 Pilot und Folgeversion | Vorhandenen Nutzer begleiten, Beobachtungen auswerten und priorisierte Verbesserungen liefern. | Nachvollziehbare Entscheidungen über die nächste Version. |

Datenerhalt und sichere Ausgabe werden in jedem Inkrement berücksichtigt; I-04 schließt die Prüfung ab. Der Plan enthält keine vorgeschaltete Pilot- oder Marktforschungsfreigabe.

Ein belastbarer Aufwand wird anhand dieser Anforderungen und der technischen Umsetzung geschätzt. Die Zahl von Anforderungen ist kein Terminversprechen; insbesondere Veröffentlichungstermine hängen zusätzlich vom Verzeichnisprozess ab.

## Rückverfolgbarkeit und Risiken

| Ziel | Anforderungen | Wesentliche Abnahmen | Beobachtung nach Veröffentlichung |
| --- | --- | --- | --- |
| G-01 Überblick | FR-03 bis FR-05, FR-15 | AT-01, AT-02, AT-08 | P-02 und P-05 |
| G-02 Anfragen und Entscheidungen | FR-06 bis FR-10 | AT-03 und AT-04 | P-03 und P-04 |
| G-03 Auftrag bis Zahlung | FR-10 bis FR-14 | AT-04 bis AT-07, AT-13 | P-03 und P-07 |
| G-04 Akten und Übergabe | FR-08, FR-16 bis FR-19 | AT-09 bis AT-11 | P-06 und P-07 |
| G-05 Veröffentlichung und Lernen | FR-19, Veröffentlichungskriterien | AT-12 | P-01 bis P-07 |

| Risiko | Behandlung im PRD |
| --- | --- |
| Zusätzliche Pflege neben E-Mail und Banking | Kurze Erfassung, wiederverwendbare Daten und explizite Aufwandsbeobachtung im Pilot. |
| Tatsächliche Rolle oder Befugnis unklar | Fallbezogene Handlungsnachweise; keine aus dem Nutzerprofil abgeleitete Vollmacht. |
| Fehlende Hintergrundausführung | Lokale Laufzeitgrenze, Nachholen beim Start und bewusst gewählter Kalenderexport. |
| Abschläge werden doppelt gezählt | Getrennte Dokumentbasis und zusätzliche Zahlungen; keine unbereinigten Gesamtsummen. |
| Änderbare Dateien und Konflikte | Stabile IDs, Revisionen, Konflikthinweise, Datensicherung und wiederholbare Schritte. |
| Zu breiter erster Umfang | Ein WEG-Arbeitsbereich, ein Bearbeiter, ein Hauptauftrag je Fall und feste Ausschlüsse. |
| Marketplaceprüfung dauert oder beanstandet Details | Veröffentlichung als eigener Meilenstein; Pilot startet nach nachgewiesener Installierbarkeit. |
| Ein Pilot wird als Marktbeweis missverstanden | Ergebnisse auf konkrete Nutzung begrenzen; spätere wirtschaftliche Validierung getrennt behandeln. |

Die noch fehlenden operativen Angaben sind das tatsächliche Pilotgerät, die vorhandenen E-Mail- und Banking-Werkzeuge, die konkrete Rolle der Person und der gewählte Supportkanal. Das PRD arbeitet bis zur Präzisierung mit den genannten Defaults; es fordert keine neue Zustimmung zur bereits festgelegten Lieferfolge.

## Quellen und fachliche Grenzen

Die Quellen begründen konkrete Produktgrenzen. Die funktionalen Anforderungen und Qualitätsziele sind Gestaltungsentscheidungen dieses PRD.

- [Obsidian Community Einreichung](https://docs.obsidian.md/Plugins/Releasing/Submit%20your%20plugin): Veröffentlichung, Release-Artefakte und Installierbarkeit.

- [Obsidian Developer Policies](https://docs.obsidian.md/community-directory/developer-policies): Telemetrie und Offenlegung.

- [Obsidian Community FAQ](https://docs.obsidian.md/community-directory/faq): Kostenkategorien und Quellcodeoptionen.

- [Obsidian Datenhaltung](https://obsidian.md/help/data-storage) und [Bases](https://obsidian.md/help/bases): lokale Dateien und Eigenschaften.

- [Obsidian Plugin Lifecycle](https://docs.obsidian.md/plugins/guides/lifecycle-management) und [Sync FAQ](https://obsidian.md/help/sync/faq): Laufzeit- und Synchronisationsgrenzen.

- [Obsidian Shared Vaults](https://obsidian.md/help/sync/collaborate) und [Plugin Security](https://obsidian.md/help/plugin-security): Grenzen von Rollen und Zugriffsisolation.

- [§ 9b WEG](https://www.gesetze-im-internet.de/woeigg/__9b.html), [§ 27 WEG](https://www.gesetze-im-internet.de/woeigg/__27.html), [§ 23 WEG](https://www.gesetze-im-internet.de/woeigg/__23.html) und [§ 24 WEG](https://www.gesetze-im-internet.de/woeigg/__24.html): Vertretung, Befugnisse und Beschlussdokumentation.

- [BGH V ZR 7/25 beim DNotI](https://www.dnoti.de/entscheidungen/details/?cHash=9c627f5d2e16dabccc3772038110ed4a&tx_dnotionlineplusapi_decisionsdetails%5Bcontroller%5D=Decisions&tx_dnotionlineplusapi_decisionsdetails%5Bnodeid%5D=24807ebc-15ec-4986-a3f6-76b72326c91c): keine pauschale Pflicht zu mehreren Vergleichsangeboten bei Erhaltungsmaßnahmen.

- [BaFin zum ZAG](https://bafin.de/SharedDocs/Veroeffentlichungen/DE/Merkblatt/mb_111222_zag.html): mögliche aufsichtsrechtliche Anforderungen einer späteren Zahlungsauslösung.

- [BMF E-Rechnung, Frage 13](https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html): Erhalt strukturierter Rechnungsoriginale.

- [BayLDA Tätigkeitsbericht 2024, Abschnitt 8.3](https://www.lda.bayern.de/media/baylda_report_14.pdf): Datenminimierung bei WEG-Kommunikation und Portalen.

Das Plugin unterstützt Dokumentation und Organisation. Es behauptet keine allgemeine rechtliche Wirksamkeit eines Beschlusses, keine automatische Bankbestätigung, keine vollständige WEG-Finanzbuchhaltung und keine manipulationssichere Archivierung.

