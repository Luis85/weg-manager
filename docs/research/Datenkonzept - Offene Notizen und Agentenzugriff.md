---
type: DesignSpec
status: entwurf
scope: mvp
date: 2026-11-15
---

# Datenkonzept · Offene Notizen und Agentenzugriff

Verbindliche Produktgrundlage: [[K-14 - Markdown und Frontmatter als offene Datengrundlage]]. Diese Note beschreibt den erforderlichen **Dateivertrag für die später vom Plugin erzeugten Fachnotizen**. Sie ist kein implementiertes Schema und nicht mit dem Frontmatter der Konzept-/Backlog-Notes dieses Repositorys gleichzusetzen.

## Maßgeblicher Bestand

Markdown und dokumentiertes YAML-Frontmatter enthalten die gespeicherten fachlichen Daten. Jeder Vorgang hat eine verständliche Notiz. To-dos, Termine, Verlaufseinträge, Entscheidungskarten, Quellen und Dokumentbezüge sind entweder darin oder in eindeutig verknüpften Fachnotizen vollständig beschrieben. Binäre Originale bleiben separate unveränderte Dateien. Interne Indizes oder Darstellungszustände dürfen die Bedienung beschleunigen, sind aber keine exklusive Fachquelle und müssen aus dem Bestand rekonstruierbar sein.

Der Ordner muss ohne Plugin, Obsidian und MCP verfügbar sein. Kein Exportlauf ist notwendig. Bei einem normalen Dateizugriff müssen Kontext und zulässige Bearbeitung aus den Dateien selbst verständlich werden; eine gerenderte Obsidian-Ansicht ist keine Voraussetzung. Eine View darf abgeleitete Informationen darstellen, aber keine nur dort existierende fachliche Aussage verbergen.

## Erforderlicher Inhalt des mitgelieferten Notizvertrags

| Bereich | Vor Implementierungsabnahme verbindlich zu dokumentieren |
| --- | --- |
| Dateiformat und Erkennung | Zeichencodierung, Markdown-/YAML-Konvention, erkennbare Fachnotiztypen und welche Dateien fachlich maßgeblich sind. |
| Identität | Beständige IDs, Geltungsbereich, Umgang mit Altreferenzen, Aufteilen/Zusammenführen und Vermeidung doppelter IDs. |
| Felder | Namen, Bedeutung, Datentypen, erlaubte Werte, Pflicht-/Optionalität und ausdrückliche Darstellung unbekannter Werte. |
| Beziehungen und Anhänge | Auflösung von IDs/Dateireferenzen ohne Obsidian; relative beziehungsweise portable Dateibeziehungen, fehlende Ziele und unveränderte Originale. |
| Zustände und Regeln | Bearbeitungsstand, Prüfhinweis, Bewertung und tatsächlich dokumentierte Handlung getrennt; zulässige Übergänge und erforderliche Angaben. |
| Externe Schreiboperationen | Beispiele für Neuanlage, Änderung, Korrektur, Aufteilung/Zusammenführung sowie bewusste Entfernung und deren Auswirkungen auf Referenzen. |
| Versionen | Erkennbare Schemaversion, kompatible Änderungen, Verhalten bei neuerem unbekanntem Schema und nachvollziehbare Migration. |
| Erhalt | Umgang mit unbekannten Properties, freiem Notiztext, fremden Inhalten, Historie und datensparsamen Korrektur-/Löschvermerken. |
| Konflikte und Wiederaufnahme | Erkennen geänderter Ausgangsstände, Erhalt ungespeicherter Eingaben und Wiederholung ohne doppelte Fachobjekte. |
| Provenienz | Zeit des Geschehens versus Erfassungszeit, angegebener Akteur/Agent, bekannte Quelle und unbekannte Urheberschaft; keine Authentifizierung allein durch Dateitext. |

Diese Angaben werden lokal zusammen mit dem freigegebenen Notizbestand beziehungsweise einer lokal verfügbaren Format-/Regelbeschreibung bereitgestellt. Der Agent darf nicht auf verborgenes Pluginwissen, eine Online-Dokumentation oder einen MCP-Endpunkt angewiesen sein. Konkrete Dateinamen und technische Datentypdefinitionen sind noch festzulegen; ihre Offenlegung ist keine optionale spätere Erweiterung.

Wikilinks können ergänzend genutzt werden, wenn ihre Auflösung dokumentiert ist. Ein Obsidian-interner Cache oder eine nicht dokumentierte Linkauflösung darf nicht erforderlich sein, um die Beziehungen zu verstehen. Das Dateimodell muss in normalem Text zugänglich bleiben; nicht jeder externe Editor muss jede Pluginansicht reproduzieren.

## Lesen und Schreiben mit externen Werkzeugen

Der Nutzer gibt dem ausgewählten Agenten Lese- und gegebenenfalls Schreibzugriff auf den gewünschten Ordner. Der Agent liest den lokalen Dateivertrag und die benötigten Fachnotizen, prüft Gemeinschaft, Identität und aktuellen Stand und führt freigegebene, vertragskonforme Änderungen direkt an den Dateien aus. Das gilt auch bei geschlossenem Plugin oder nicht laufendem Obsidian.

Bei wieder geöffnetem oder weiter laufendem Plugin wird derselbe Bestand eingelesen. Gültige externe Änderungen werden berücksichtigt; nicht mehr gültige Prüfstände müssen erneut geprüft werden. Eine geänderte Ausgangsdatei darf nicht durch ein älteres offenes Formular überschrieben werden. Ein vorübergehend unvollständiger Schreibstand wird nicht als leere Akte übernommen. Erkennbare ungültige Dateien bleiben zur Klärung erhalten.

Der genaue Erkennungs-/Speichermechanismus, Konsistenz über mehrere Dateien und rekonstruierbare Indexierung sind technische Entwurfsfragen. Gefordert ist ihr beobachtbares Ergebnis: Erhalt, sichtbare Konflikte und korrekte Wiederaufnahme. Eine beliebige, destruktive externe Dateibearbeitung kann das Plugin nicht verhindern; unterstützte Bearbeitung setzt den dokumentierten Vertrag und angemessene Dateirechte voraus.

## Menschliche Handlungen und Vertraulichkeit

Ein Agent kann fachliche Angaben und vorbereitete Arbeit im freigegebenen Umfang ändern. Eine persönliche Bestätigung, tatsächlich versandte Nachricht oder erfolgte Zahlung wird dadurch nicht erfunden. Solche Verlaufseinträge können nur mit ihrer tatsächlich vorliegenden Grundlage dokumentiert werden; die bereits geltenden Fachregeln bleiben dieselben wie im Plugin.

Interne Klassifikation, Exportfreigabe und tatsächliche Dateirechte sind verschiedene Dinge. Ein Agent mit vollständigem Lesezugriff kann auch intern bezeichnete Daten lesen; das Plugin verspricht keine Isolation durch Labels. Die Wahl eines externen Modelldienstes und dessen Datenübertragung liegt beim Nutzer/Agentenwerkzeug. Die Anforderung baut keinen automatischen Übertragungskanal des Plugins und keinen integrierten Agentenhost.

## Geplante Abnahmefälle

1. Vollständigen synthetischen Vorgang mit Quelle, Original, Termin, Aufgabe und Verlauf im Plugin speichern. Plugin und Obsidian schließen; Kontext und Beziehungen ausschließlich mit Dateieditor und lokaler Beschreibung rekonstruieren.
2. Ohne Plugin/MCP einen neuen Vorgang und ein To-do anhand des Dateivertrags erstellen. Plugin öffnen; IDs, Beziehungen und Fachangaben korrekt übernehmen, ohne Export/Import-Rundreise.
3. Bei geöffnetem Formular extern den fachlichen Termin ändern. Das Plugin berücksichtigt den neuen Stand und erhält den eigenen Notizentwurf; eine Konfliktentscheidung überschreibt nicht unbemerkt erneut geänderte Daten.
4. Ungültiges beziehungsweise unvollständiges YAML und ein neueres unbekanntes Schema einbringen. Verständlicher Fehler, kein stilles Löschen oder Ersetzen durch leere Werte; nach Korrektur fortsetzbar.
5. Unbekannte Zusatzproperties und freie Notizabschnitte durch Plugin- und Agentenbearbeitung hindurch erhalten. Einen optionalen abgeleiteten Cache entfernen und aus den Fachnotizen rekonstruieren.
6. Extern eine Entscheidung beziehungsweise DE-Textfassung ändern. Frühere Folgetexte oder Sprachprüfungen werden nicht unbemerkt für den neuen Stand als gültig angezeigt. Ein Dateischreibvorgang setzt keinen tatsächlichen Versand.

Diese Szenarien sind Anforderungen, keine ausgeführten Tests. Der spätere Prüfnachweis benennt verwendete Werkzeuge, Schemafassung, Eingangsdateien und tatsächlich beobachtete Ergebnisse.

## Bezüge

[[F-22 - Offene Notizen und direkter Agentenzugriff]], [[PBI-41 - Vorgänge ohne Plugin und Obsidian nutzen]], [[PBI-42 - AI-Agent direkt mit den Notizen arbeiten lassen]], [[ACT-09 - AI-Agent mit direktem Dateizugriff]], [[DF-22 - Notizen als maßgeblicher Datenbestand]], [[DF-23 - Externe Bearbeitung ohne stilles Überschreiben]], [[FLOW-08 - Zwischen Plugin und direkter Dateibearbeitung wechseln]].

## Optionale Google-Übertragung

[[K-15 - Google-Dienste für Versand und Dokumentfreigabe anbinden]] ergänzt einen späteren, bewusst ausgelösten Versand-/Freigabeweg. Fachlicher Konto-/Dienstbezug, übertragene Fassung und Ergebnisse bleiben lokal nachvollziehbar; technische Passwörter und Zugangstokens werden geschützt außerhalb des offen lesbaren Fachnotizbestands behandelt. Eine Drive-Kopie wird nicht allein durch Upload zur maßgeblichen Akte. Direkter Dateizugriff eines AI-Agents ist keine Erlaubnis für unbeaufsichtigten Google-Versand oder Upload.

## Aufbewahrter nativer Chatverlauf

[[ENT-22 - AI-Gespräch]] ergänzt bei Nutzung von [[F-23 - Nativer AI-Chat]] einen aufbewahrten Gesprächsstand. Vom Plugin gespeicherte Nachrichten und relevante Aktionsbezüge folgen ebenfalls der offenen Markdown-/Frontmatter-Grundlage. Geheime Runtime-/Anmeldedaten gehören nicht in diese Notes. Ein externer Claude-Code-Sitzungsspeicher ist kein Ersatz für den nachvollziehbaren lokalen Plugin-Gesprächsinhalt. [[DF-28 - Chatantwort und ausgeführte Fachaktion unterscheiden]] trennt Antwort, Vorschlag und tatsächliche Änderung.
