---
type: ProductRequirementsDocument
product: WEG Manager
status: entwurf
version: "1.1"
date: 2026-11-15
---

# WEG Manager MVP PRD

**Version 1.1 · 15. November 2026 · Beirats-MVP, Konzeptentwurf zur fachlichen Prüfung**

WEG Manager ist ein lokales Obsidian-Plugin für einen Beirat gegenüber einer externen Verwaltung. Der erste Umfang unterstützt mindestens zwei getrennte Gemeinschaften, nachvollziehbare Punkte, Wochenarbeit, Nachfassen, kontrollierte Kommunikation und mobile Nutzung ohne verpflichtende KI.

## Ziele und Nutzungskontext

| Ziel | Gewünschtes Ergebnis | Nachweis |
| --- | --- | --- |
| B-G01 | Überschaubare Wochenarbeit mit klarer nächster Handlung. | Interner Gesamtfall; danach Wochenzeit einschließlich Vor-/Nachbereitung. |
| B-G02 | Offene Zusagen ohne Termin bleiben sichtbar und werden nachgefasst. | Termin-, Versand- und Nachfassfälle; tatsächliche Antworten separat beobachten. |
| B-G03 | Sachstände aus Quellen und datierten Ereignissen erklären. | Verlauf, Import und lesbare Übergabe. |
| B-G04 | Menschlich kontrollierte Kommunikation und getrennte Gemeinschaften. | Vorschau, DE/EN, tatsächlicher Versand, Ausschluss ungeeigneter Inhalte. |
| B-G05 | Selbstständige lokale und mobile Kernarbeit ohne KI. | Offline-, Mobile-, Konflikt- und Wiederherstellungsprüfung. |
| B-G06 | Öffentlich installierbares Produkt, anschließend belastbare Pilotbeobachtung. | Neuinstallation nach Veröffentlichung; dokumentierte Beobachtung. |

Ein menschlicher Bearbeiter arbeitet für WEG und Tiefgarage. Er kann zusätzlich einem externen AI-Agent direkte Dateirechte geben; dies ist keine weitere angemeldete Pluginrolle und keine MCP-Pflicht. Die konkrete Organisationsform der Tiefgarage bleibt offen; das Produkt verwendet eine neutrale Gemeinschaftsbezeichnung. Eine Kontaktrolle erzeugt keine Befugnis. Eigentümer und Verwaltung sind externe Kommunikationspartner, keine angemeldeten Nutzer. Eine Vertretung erhält eine ausgewählte lesbare Übergabe; parallele aktive Übernahme gehört noch nicht zum MVP.

## Systemgrenze

| Im vorgeschlagenen MVP | Später / nicht zugesagt |
| --- | --- |
| Mindestens zwei Gemeinschaften, Kontakte und atomare Punkte; maßgebliche Markdown-/Frontmatter-Notizen mit offenem Dateizugriff. | Mehrbenutzerrollen, Verwaltungsportal, Eigentümer-Self-Service. |
| Geprüfter Registerimport; manuelle Quellenübernahme. | Automatische vollständige Gmail-/Portal-/Postfachintegration. |
| Quellenbezogene Wochenlage, vorbereitete bearbeitbare Entscheidungstexte, eigene Aufgaben. | Verpflichtende KI, MCP-Anbindung oder unbeaufsichtigter Cloud-Wochenlauf. |
| Fristen, Wiedervorlage, Nachfassvorschläge und Lagecheck. | Eigener Pushdienst bei geschlossener App; Kalenderexport als Ausbau. |
| Menschliche Wahl und Notiz, Entwürfe je Gemeinschaft, DE/EN für Eigentümertexte. | Automatischer Versand, automatisch festgestellte Rechtsfolgen. |
| Geprüfte Sachstandsausgabe, interne Übergabe, Sicherung und Wiederherstellung. | Ausgearbeitete Quartals-/ETV-Berichte, vollständige Beschluss-Sammlung. |
| Mangel, Angebotsfrage, Rechnungsfrage oder Protokollkorrektur als Punkt mit Quelle. | Eigener RFQ-/Vergleichsprozess, Auftrag/Nachtrag, formelle Abnahme, Rechnungsrest und Zahlungsvorbereitung, Buchhaltung. |
| Vollständige Wochenarbeit und Lagecheck auf dem Referenz-Handy sowie Desktop. | Eigener Synchronisationsdienst und gleichzeitiges Schreiben auf mehreren Geräten. |
| Optionaler nativer AI-Chat über offizielle Claude-Code-Laufzeit und berechtigte Nutzer-Subscription; erster Nachweis auf Desktop. | Ungeprüfte mobile Chat-Runtime, eigener Credential-Proxy oder stiller API-Fallback. |

Der lokale Kern benötigt kein Konto, Netzwerk oder KI. Installation, gewählte externe Kommunikation und ein gegebenenfalls vom Nutzer verwendeter Dateitransport sind gesondert. Es wird nur der bekannte Eingangsstand verarbeitet. Ein Wochenpaket wird beim Einstieg aktualisiert; ein ausgeschaltetes Plugin hat keine Hintergrundprüfung ausgeführt. Ein vorhandener Beleg begründet kein vollständiges Rechnungs- oder Beschlussmodul.

## Kernreise und Ansichten

1. Beide Gemeinschaften und Ansprechpartner einrichten; Altbestand mit Vorschau prüfen und übernehmen.
2. Neue Zusage, Frage oder eigene Aufgabe mit überprüfbarem Ergebnis, Quelle und nächstem Schritt führen.
3. Wochenarbeit öffnen: kurze Lage, Fristen für 14 Tage, eigene Aufgaben, letzte Übergabe und Datenlücken sehen.
4. Bis sieben reguläre Entscheidungen insgesamt mit Quellen, Optionen, Folgen und Empfehlungsentwurf prüfen; dringender Überlauf bleibt sichtbar.
5. Wahl und Notiz bestätigen; passende Entwürfe und konkrete Folgeaufgaben erhalten.
6. Empfänger, Sprachfassungen und Anlagen prüfen, außerhalb des Plugins menschlich senden und tatsächlichen Versand erfassen.
7. Reaktionen zuordnen, laufende Fristen respektieren, Nachfassvorschläge bestätigen oder begründet aussetzen.
8. Bis drei Schwerpunkte und Kontextnotiz hinterlassen; zwischendurch im Lagecheck Dringliches erkennen.
9. Ausgewählten Sachstand beziehungsweise interne Übergabe ohne KI lesbar bereitstellen.

**Wochenarbeit** bündelt die reguläre Bearbeitung. **Register mit Punktakte** erlaubt Suche, Filter, Einzelpflege und Quellenprüfung. **Lagecheck** zeigt neue Ereignisse und Handlungsbedarf vor dem nächsten geplanten Wochenzeitpunkt. Einrichtung, Quellenablage und Ausgabe sind ergänzende Abläufe. Das sind fachliche Ansichten, kein festgelegtes Layout. Bestehende Fälle dürfen ohne erfundene Vorgeschichte aufgenommen werden.

## Funktionale Anforderungen

Alle B-FR-01 bis B-FR-16 außer dem entfallenen B-FR-15 sind MUSS im vorgeschlagenen MVP; die Nummer B-FR-15 wird nicht neu vergeben. B-FR-14 konkretisiert die ausdrücklich festgelegte offene Dateigrundlage. Die verlinkten PBIs enthalten die detaillierten Akzeptanzkriterien; die gemeinsamen [[Product Backlog.base#Business Rules]] gelten zusätzlich. Kein PBI gilt allein durch seine Existenz als abgenommen.

| ID | Fachliche Verpflichtung | Backlog / geplante Abnahme |
| --- | --- | --- |
| B-FR-01 | Gemeinschaft und Ansprechpartner eindeutig führen; Kontext bei jeder Bearbeitung und Ausgabe sichtbar. | F-01, PBI-01–02; AT-B01 |
| B-FR-02 | Die 15 Fachangaben des angebotenen Registers prüfbar zuordnen, übernehmen und erneut abgleichen; unklare Daten und Herkunft erhalten. | F-02, PBI-03–04; AT-B02 |
| B-FR-03 | Atomare Punkte erfassen, finden, aufteilen, zusammenführen und bewusst abschließen; Bewertung getrennt halten. | F-03, PBI-05–08; AT-B03 |
| B-FR-04 | Fremdtermin, gewünschte Frist, eigene Aufgabe und Wiedervorlage getrennt führen; fehlender Termin und nächster Schritt bleiben sichtbar. | F-04, PBI-09–10; AT-B04 |
| B-FR-05 | Quellen, Originale, Fassungen und datierte Ereignisse zuordnen; unbekannte Angaben und fehlende Dateien zeigen. | F-05, PBI-11–12; AT-B05 |
| B-FR-06 | Kurze aktuelle Lage, 14-Tage-Fristen, Aufgaben und maximal sieben reguläre Entscheidungen insgesamt vorbereiten; Quellenstand und Überlauf zeigen. | F-06, PBI-13–14; AT-B06 |
| B-FR-07 | Quellenbezogene Optionen, Folgen und Empfehlung mit Text vorbereiten; Wahl und Notiz erzeugen passende, wiederholbar verarbeitbare Folgearbeit. | F-07, PBI-15–17; AT-B07 |
| B-FR-08 | Nachrichten je Gemeinschaft sinnvoll bündeln, Eigentümertexte DE/EN prüfbar halten und nur tatsächlichen menschlichen Versand dokumentieren. | F-08, PBI-18–20; AT-B08 |
| B-FR-09 | Nachfassschritte anhand Versand, Frist und Reaktion vorschlagen; Pakete, Pausen und neue Termine erhalten Historie und offenen Bedarf. | F-09, PBI-21–23; AT-B09 |
| B-FR-10 | Lagecheck seit letzter Übergabe und bis nächster Wochenarbeit ermöglichen; bis drei Schwerpunkte für Wiedereinstieg erhalten. | F-10, PBI-24–25; AT-B10 |
| B-FR-11 | Inhalte einstufen, kontrolliert berichtigen/entfernen und empfängerbezogen mit Vorschau lesbar übergeben. | F-11, PBI-26–29; AT-B11 |
| B-FR-12 | Daten sichern/wiederherstellen, Konflikte behandeln und einen selbstständigen Einstieg ohne KI anbieten. | F-12, PBI-30–32; AT-B12 |
| B-FR-13 | Vollständige Wochenarbeit einschließlich Schreiben und Prüfen sowie Lagecheck mobil ermöglichen. | F-13, PBI-33; AT-B13 |
| B-FR-14 | Vorgänge direkt aus Markdown-/Frontmatter-Notizen ohne Plugin, Obsidian und MCP lesen und bearbeiten; einen freigegebenen AI-Agent auf denselben Dateien arbeiten lassen und externe Änderungen sicher berücksichtigen. | F-22, PBI-41–42; AT-B15/16 |
| B-FR-16 | Nativen AI-Chat im Plugin mit offizieller Claude-Code-Laufzeit und berechtigter Nutzer-Subscription ermöglichen; Kontext, tatsächliche Aktionen, Abrechnungsmodus und Abbruch transparent halten. Erster zu prüfender Betriebsweg Desktop; mobile Kernreise unabhängig nutzbar. | F-23, PBI-47; AT-B18 |

Die vorbereitete Wochenarbeit darf nicht auf leere Formulare reduziert werden. Vorhandene Daten müssen Kontext, Fristen und bearbeitbare Empfehlungen/Folgetexte tragen. Die konkrete regelbasierte oder manuelle Ergänzung wird im späteren Lösungsentwurf beschrieben; zusätzliche Vorbereitungszeit zählt zur Nutzenmessung. Können Inhalt und Aufwand den Anspruch nicht tragen, ist dies eine Scopeentscheidung vor Entwicklungsfreigabe, keine stille Abschwächung von B-FR-06/07.

## Fachliches Modell und Zustände

ENT-01 bis ENT-16 und [[ENT-22 - AI-Gespräch]] (nativer AI-Chat) beschreiben den MVP. Die ergänzten Entitäten [[ENT-17 - Produktfeedback]], [[ENT-18 - Angebot]], [[ENT-19 - Rechnung]] und [[ENT-20 - Zahlungseintrag]] gelten ausdrücklich nur für spätere Ausbaustufen. Die View [[Product Backlog.base#Business Rules]] zeigt die einzeln gepflegten fachlichen Regeln; deren Geltungsbereich trennt MVP und Ausbau.

Die [[Product Backlog.base#Design Foundations|Entitätsnotes]] beschreiben die folgenden Begriffe als einzelne Notes mit Angaben, Beziehungen, Regeln und offenen Modellierungsfragen. Sie konkretisieren die fachliche Bedeutung, ohne ein technisches Schema festzulegen.

| Begriff | Bedeutung und Beziehung |
| --- | --- |
| Gemeinschaft | Fachlicher Kontext; mindestens zwei nutzbar. Eine gemeinsame Übersicht kennzeichnet jede Herkunft. |
| Ansprechpartner | Kontakt mit gemeinschaftsbezogener Rolle; keine automatische Berechtigung. |
| Thema | Optionaler Zusammenhang mehrerer Punkte innerhalb einer Gemeinschaft, kein gemeinsamer Erledigtstatus. |
| Punkt | Beständige Referenz, genau eine Gemeinschaft, Art, überprüfbares Ergebnis, Verantwortlichkeit, Quellen, Bearbeitungsstand und nächster Schritt. |
| Termin | Datum, Bedeutung, Herkunft und Prüfstand; Wiedervorlage separat. Ein neuer akzeptierter Termin erhält den alten Verlauf. |
| Ereignis / Quelle | Ereignis- und Erfassungsdatum, dokumentierter Akteur, Erfasser, Art und Quelle; Original oder bloßer Link unterscheidbar. |
| Arbeitsentscheidung | Anlass und Punktbezüge derselben Gemeinschaft, Optionen, Folgen, Empfehlung, Wahl, Notiz und Zeitpunkt. |
| Entwurf / Versand | Versionierter Text mit Empfängern, Anlagen und Entscheidungsbezug; tatsächlicher Versand als gesondertes Ereignis. |
| Eigene Aufgabe | Ausführbare Handlung mit Gemeinschaft, optionalem Punktbezug, Zustand, Fälligkeit/Wiedervorlage. Ihr Abschluss erfüllt keine fremde Zusage. |
| Nachfassstand | Bekannte bisherige Schritte, Versand, geltender Termin, Vorschlag und begründete Pause; keine rechtliche Sanktion. |
| Übergabe | Zeitpunkt, bis drei Schwerpunkte, Notiz und eindeutige Gemeinschaftsbezüge; Wochenüberblick darf beide Kontexte getrennt zeigen. |
| Ausgabestand | Empfängerkontext, bewusst gewählte Inhalte und Anlagen, geprüfte Fassung und Standdatum. |

Bearbeitung: offen / ungeklärt / erledigt / hinfällig. Aufgeteilt und zusammengeführt kennzeichnen Herkunft mit Zielverweisen. Überfällig und Termin erfragen sind Prüfmerkmale, „nicht eingehalten“ ist eine menschliche Bewertung. Eigene Aufgaben unterscheiden offen / in Arbeit / wartet / erledigt / entfallen. Entscheidung, Entwurf, Versand, Antwort und Erfüllung sind verschiedene Ereignisse. Unbekannte Werte sind weder null noch erledigt.

Stabile Identitäten und Beziehungen müssen Umbenennung, Import und Wiederherstellung überstehen. Dies spezifiziert keine Programmiersprache, Klassen, Datenbank oder Dateiaufteilung. Markdown mit dokumentiertem YAML-Frontmatter ist die maßgebliche fachliche Datenquelle; normale Dateien und Originalanhänge bleiben auch ohne Obsidian zugänglich und vertragskonform bearbeitbar. Ein Index darf nur rekonstruierbare Ableitung sein. Der lokal verfügbare Dateivertrag muss Felder, IDs, Beziehungen, Zustände und zulässige Schreiboperationen erklären. Konkrete Schemas und Erkennungsmechanismen folgen in der technischen Konzeption; offene Nutzbarkeit und dokumentierte Bearbeitung sind bereits verbindlich ([[K-14 - Markdown und Frontmatter als offene Datengrundlage]]).

## Qualitätsanforderungen

Die bestehenden **B-NFR-01 bis B-NFR-14** werden im Feature [[F-21 - Nichtfunktionale Anforderungen]] unter [[E-07 - Cross Cutting Concerns]] gepflegt. Dort stehen die vollständigen Prüfziele und das Referenzprofil: Offlinearbeit/KI-Unabhängigkeit, Datenerhalt, Fachkorrektheit, Reaktionszeit, Speichern, Bedienbarkeit, Vertraulichkeit, sichere Darstellung, Plattformen, Portabilität, Laufzeit, verständliche Fehler, offener Notizvertrag und externe Agentenbearbeitung.

Alle B-NFR bleiben geplante **MVP-Releasekriterien** für die jeweils betroffenen Features und PBIs. Ihre Zuordnung zum Querschnitts-Epic ändert weder den Funktionsumfang noch ihre Geltung. Konkrete Referenzgeräte, Versionen und mobile Messziele sind weiterhin vor Entwicklungsfreigabe zu klären (O-02). Der folgende Abnahmeplan prüft die zugehörigen Qualitätsanforderungen mit.

## Geplante interne Abnahmen

| ID | Synthetischer Fall | Erwartung |
| --- | --- | --- |
| AT-B01 | WEG und Tiefgarage mit gleichem Thema und Kontakt anlegen. | Eindeutiger Kontext bei Punkt, Karte und Ausgabe; keine Vermischung. |
| AT-B02 | Register mit 15 Angaben, gleichen Nummern in zwei Gemeinschaften, unbekanntem Status und fehlendem Datum importieren; wiederholen und unterbrechen. | Vorschau, Klärungsfälle, Ursprung und stabile Zuordnung; keine stillen Dubletten. |
| AT-B03 | Sammelpunkt teilen, Dublette verbinden, einen Teil erledigen, Bewertung setzen und wieder öffnen. | Herkunft erhalten, übrige Arbeit offen, Bewertung keine Erledigung. |
| AT-B04 | Fremdtermin 30.11., Wiedervorlage 23.11., terminlose Zusage älter als 14 Tage. | Eigene Wiedervorlage ändert keine Fremdfrist; fehlender Termin und nächste Handlung bleiben sichtbar. |
| AT-B05 | Bestätigung, sachliche Antwort, neue Zusage, Teillieferung und korrigierte Quelle erfassen. | Getrennte Ereignisse und Zeitpunkte, Originalfassungen erhalten, unbekannt bleibt unbekannt. |
| AT-B06 | Wochenpaket mit neun dringenden Fällen und ungeprüfter Portalnachricht öffnen. | Maximal sieben reguläre Entscheidungen; alle neun Risiken und Datenlücke sichtbar. |
| AT-B07 | Wahl plus Notiz bestätigen, wiederholt verarbeiten, anschließend ändern. | Passende Texte/Aufgaben, keine Dubletten, alte Fassung überholt, kein Versand. |
| AT-B08 | Drei Entwürfe für beide Gemeinschaften; Eigentümertext DE/EN ändern; eine Nachricht tatsächlich senden. | Sprachprüfung erneut erforderlich; genau ein Versand mit Fassung, keine Zustellungsbehauptung. |
| AT-B09 | Versand 16.11., Antworttermin 30.11., Prüfung 23.11.; dann Pause, bloße Antwort und neuer Termin. | Kein verfrühter Stufenwechsel; Pause endet sichtbar; neuer Termin erledigt nicht den Punkt. |
| AT-B10 | Übergabe mit drei Schwerpunkten; später akutes Problem vor dem nächsten Wochenzeitpunkt. | Wiedereinstieg zeigt Übergabe und neue Dringlichkeit; Rückstand bleibt erhalten. |
| AT-B11 | Interne Bewertung, privates Original, ungeprüfte Anlage und ausgewählter Sachstand; danach kontrollierte Entfernung. | Vorschau/Ausgabe nur geeignete Auswahl; keine transitive Mitnahme; Entfernung ohne Wiederholung privater Inhalte. |
| AT-B12 | Kernreise offline, externe Dateiänderung, doppelte ID, Speichern abbrechen, sichern/wiederherstellen und Plugin deaktivieren. | Kein stiller Verlust, verständliche Fehler, Akten weiter lesbar und Beziehungen erhalten. |
| AT-B13 | Vollständige Wochenreise und Lagecheck auf Referenz-Handy mit Unterbrechung. | Lesen und Schreiben einschließlich Notiz, Entwurfsprüfung, Quellen und Übergabe möglich; Eingaben bleiben erhalten. |
| AT-B14 | Nach Veröffentlichung öffentlich in frischem Vault installieren. | Dokumentierte Version und Kernablauf ohne Entwicklerwerkzeuge nutzbar; erst danach Produktpilot. |
| AT-B15 | Synthetischen vollständigen Vorgang speichern; Plugin und Obsidian schließen. Nur Notizordner, Originale und lokalen Dateivertrag mit gewöhnlichem Editor öffnen und ändern; ohne MCP fortführen. | Kontext und Beziehungen verständlich; kein Export erforderlich; gültige externe Änderung wird beim späteren Pluginstart übernommen, ein Cache enthält keine exklusiven Fachinformationen. |
| AT-B16 | Freigegebener Agent liest und ändert dieselben Notizen einmal bei geschlossenem Plugin und einmal während offener eigener Bearbeitung; anschließend ungültiges YAML beziehungsweise neuere Schemafassung prüfen. | Zulässige Änderungen werden berücksichtigt; Konflikte, fehlerhafte Dateien und Wiederaufnahme bleiben sichtbar und ohne stilles Überschreiben; unbekannte Properties, Originale und eigene Eingaben bleiben erhalten. |
| AT-B18 | In unterstützter offizieller Desktop-Runtime Abo-Modus, native Chatrunde, Kontextwahl, Toolbestätigung, Dateischritt, Abbruch/Limit und aufbewahrten Verlauf mit synthetischen Daten prüfen; API-Konfiguration separat als Abweichung testen. | Tatsächlicher berechtigter Abo-Weg nachgewiesen, keine Tokenübernahme oder stille API-Abrechnung; Vorschlag und ausgeführte Änderung getrennt; Teilergebnisse und offene Eingaben bleiben erkennbar. Mobile Chatverfügbarkeit wird nicht ohne eigene Prüfung behauptet. |

AT-B01–13, AT-B15, AT-B16 und AT-B18 erfolgen vor Veröffentlichung mit synthetischen oder ausdrücklich freigegebenen anonymisierten Daten; AT-B17 ist mit B-FR-15 entfallen. Dabei werden die zugehörigen Qualitätskriterien mitgeprüft. Ein Fehler mit Datenverlust, unbeabsichtigter Offenlegung, falschem Frist-/Versandstatus oder blockierter Kernreise verhindert die interne Freigabe. Noch nicht festgelegte Geräte und offene Scopefragen müssen vorher konkret entschieden werden.

## Veröffentlichung und Pilot

Die Lieferfolge bleibt Entwicklung → interne Releaseabnahme → Einreichung und tatsächliche Veröffentlichung im Obsidian Community-Verzeichnis → AT-B14 → Pilot. Eine Einreichung ist keine nachgewiesene öffentliche Installierbarkeit. Marketplacevorgaben, Plugin-ID, Mindestversion, Manifest, Release-Artefakte und Lizenz-/Kostenangaben werden im späteren Releaseprozess aktuell geprüft; diese Konzeptarbeit behauptet keine erneute externe Prüfung.

Vor Veröffentlichung: B-FR und B-NFR geprüft, keine blockierenden Fehler, verständlicher Einstieg, Sicherungs-/Wiederherstellungsanleitung, Grenzen, Supportkanal und verantwortlicher Maintainer dokumentiert. Die vorhandene MIT-Lizenz ist Ausgangspunkt; Rechte an übernommenen Materialien bleiben vor Veröffentlichung gesondert zu prüfen. Rohintake wird durch diese Konzeptarbeit nicht publiziert.

Nach Veröffentlichung installiert der vorhandene Pilot öffentlich. Für zunächst fünf geeignete Normalwochen (bei fehlenden Anlässen verlängern) werden folgende Kriterien beobachtet:

| Kriterium | Messung und Grenze |
| --- | --- |
| Wochenzeit | Ziel ≤ 60 Minuten in vier von fünf Normalwochen; Erfassen, Vorbereiten, Prüfen, Senden, Nachhalten und Doppelpflege mitzählen. |
| Vergleichbarkeit | Vor Auswertung Normalbetrieb und Ausnahmen festlegen; außergewöhnliche Wochen mit Grund protokollieren, nicht still entfernen. Aktive Zeit und Wartezeit trennen. |
| Terminklarheit | Kein offener Punkt verschwindet ohne Termin/Klärungsstand und nächste eigene Handlung. Tatsächlich erhaltene Verwaltungstermine sind separate externe Wirkung. |
| Selbstständigkeit | Wochenarbeit und Lagecheck ohne regelmäßige Übernahme durch Entwickler; Hilfestellung und Übernahme getrennt erfassen. |
| Wiederverwendung | Erneute Nutzung bei tatsächlichen Verwaltungsanlässen; anlasslose Wochen sind kein Abbruch. |
| Übergabe | Bewusst einbezogene zweite Person kann Sachstand, Quellen und nächsten Schritt aus der Ausgabe erklären. |
| Vertraulichkeit | Menschlicher Versand und kontrollierte Ausgabe prüfen; keine bekannten Vorfälle ist kein Beweis perfekter Erkennung. |

Die berichteten WCS-Zahlen und die Zeiträume bis 145 Tage sind keine gemessene Pluginwirkung. Bei hoher Doppelpflege werden Eingangsübernahme und Textvorbereitung neu priorisiert; bei fehlender mobiler Nutzbarkeit die Clientlösung. Gemeinsame Bearbeitung oder Dienste folgen erst mit eigenem Scope. Produktfeedback kann zunächst außerhalb des Plugins über einen vereinbarten Kanal erfolgen; F-15 erweitert dies später.

## Offene Entscheidungen und nächster fachlicher Schritt

O-01–08 im Intake-Abgleich sind der Klärungsbestand: Scopefreigabe, Referenzgerät/Leistungsziele, anonymisierter Export, Vorbereitungsaufwand, Gemeinschaftsangaben, Vertretungsumfang, spätere Berichtsfreigabe und Releaseangaben. Diese Punkte verhindern die Konzeptableitung nicht, aber es gibt noch keine vollständige technische Entwicklungsreife.

Der Beiratskern bleibt in fünf Nutzerziel-Epics mit 13 Features und PBI-01 bis PBI-33 gegliedert. Die offene Dateischnittstelle in F-22 ergänzt PBI-41/42 und der native AI-Chat in F-23 ergänzt PBI-47; damit umfasst der geplante funktionale MVP insgesamt 36 User Stories. E-06 bewahrt spätere fachliche Optionen einschließlich Zusammenarbeit und Onlinedienst (F-20). E-07 „Cross Cutting Concerns“ bündelt Integrationen (F-18, einschließlich Google Workspace), MCP Server (F-19), die nichtfunktionalen MVP-Anforderungen (F-21) und die ausdrücklich festgelegte offene Dateigrundlage (F-22). Integrationen (F-18) und MCP bleiben später; F-21, F-22 und F-23 gehören zum geplanten MVP. Der neue Chat hat noch keinen technischen Integrationsnachweis. Der nächste Schritt ist die fachliche Prüfung dieses Entwurfs und gezieltes Refinement der offenen Punkte; keine Implementierung, Architekturfestlegung oder automatische Veröffentlichung von Issues.

## Hypothesenregister

Die prüfbaren Annahmen zu Nutzen, Alltagstauglichkeit, Scope und Geschäftsmodell sind im [[Product Backlog.base#Hypothesis|Hypothesenregister]] mit Herkunft, vorgeschlagener Prüfung und Evidenzgrenzen ausgegliedert. Die Extraktion ändert weder die hier beschriebenen Vorgaben noch den Freigabestand.

## Erster UI-Designentwurf

Die nutzerseitig festgelegte Komponentenbasis ist Nuxt UI ([[K-13 - Nuxt UI als Frontend-Komponentenbasis]]). Das reviewfähige Konzept (Designstand v2 vom 15.11.2026) liegt in acht Ansichten und acht User-Flows: Einstieg über [[UI-Design - Leitlinien und Reviewumfang]], [[00 - Sitemap]], [[FLOW-01 - Gesamtfluss des Beirats-MVP]] und [[VIEW-02 - Wochenarbeit]]. [[Konzept - Vorbereitung ohne KI]] konkretisiert O-04; ein klickbarer Prototyp liegt unter `docs/design/prototype`, das Umsetzungspaket unter [[00 - Handoff Übersicht]]. Die Bilder und der Prototyp sind Entwürfe mit synthetischen Daten, keine Implementierung oder Releaseabnahme. Funktionsumfang und MVP-Qualitätsanforderungen bleiben unverändert.

## Offene Notizen als gleichberechtigter Arbeitsweg

[[Datenkonzept - Offene Notizen und Agentenzugriff]] beschreibt den erforderlichen Dateivertrag. [[FLOW-08 - Zwischen Plugin und direkter Dateibearbeitung wechseln]] ergänzt den Ablauf neben der Pluginbedienung. „Jederzeit“ bedeutet Verfügbarkeit gespeicherter Notizen auch bei geschlossenem Plugin und erkennbare externe Änderungen bei laufender Anwendung, nicht die Behauptung konfliktfreier gleichzeitiger Schreibvorgänge oder bereits gespeicherter UI-Entwürfe. Der vom Nutzer gewählte Agent ist optional; die lokale Kernreise bleibt ohne KI nutzbar.

## Geplante Google-Integration nach dem MVP

[[K-15 - Google-Dienste für Versand und Dokumentfreigabe anbinden]] konkretisiert unter [[F-18 - Integrationen]] drei spätere Anforderungen: [[PBI-43 - Google-Konto für ausgewählte Dienste verbinden]], [[PBI-44 - Geprüfte E-Mails über Gmail versenden]] und [[PBI-45 - Ausgewählte Dokumente über Google Drive freigeben]]. Sie erhalten vorerst keine MVP-Releasezuordnung. Der heutige manuelle Versand bleibt gültig; der spätere Integrationsweg darf nach ausdrücklicher menschlicher Prüfung und Aktion Gmail beziehungsweise Drive beauftragen. Unbeaufsichtigter Agentenversand, vollständige Vault-Synchronisation und Google als verpflichtender Datenspeicher sind nicht umfasst. Eigene Pages und Flows hierfür sind noch zu gestalten.

## Nativer Chat über das Nutzerabo

[[K-17 - Nativer AI-Chat über das Nutzerabo]] ergänzt [[F-23 - Nativer AI-Chat]] und [[PBI-47 - AI-Chat über die eigene Claude-Subscription nutzen]]. Die Abonutzung ist ein ausdrückliches Produktziel, kein bereits durchgeführter Zahlungs-/Runtime-Test. [[Integrationsresearch - Nativer AI-Chat mit Claude Code]] dokumentiert die offiziellen Quellen und den vor Freigabe nötigen Nachweis. Der Chat ist zunächst als Desktop-Erweiterung konzipiert; die bisherige mobile und offline nutzbare Beirats-Kernreise bleibt ohne Chat möglich.
