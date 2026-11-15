---
type: Productvision
product: WEG Manager
status: open
version: "1.0"
date: 2026-11-15
---

# WEG Manager Produktvision

**Version 1.0 · Stand 15. November 2026 · Produktgrundlage für das erste MVP**

WEG Manager beginnt als kostenloses Obsidian Plugin für eine Person, die die operative Verwaltung ihrer eigenen Wohnungseigentümergemeinschaft übernimmt. Das Produkt verbindet Handwerkervorgänge, Kommunikation, Entscheidungsgrundlagen, Aufgaben sowie Rechnungs- und Zahlungsdokumentation.

Die festgelegte Reihenfolge lautet: **MVP entwickeln → intern auf Releasefähigkeit prüfen → im Obsidian Community-Verzeichnis veröffentlichen → mit dem vorhandenen Pilotnutzer validieren → aus den Erkenntnissen die nächste Version entwickeln.** Die Pilotphase beginnt nach der Veröffentlichung.


## Vision

> WEG Manager gibt Menschen, die ihre eigene Wohnungseigentümergemeinschaft organisieren, einen verlässlichen Überblick über die Arbeit am gemeinsamen Eigentum. Von der ersten Handwerkeranfrage bis zur dokumentierten Zahlung bleiben Aufgaben, Unterlagen und Entscheidungen verständlich verbunden. Die Verwaltung behält ihre Daten unter eigener Kontrolle und kann die Zusammenarbeit mit den Beteiligten schrittweise erweitern.

Langfristig soll WEG Manager einen persönlichen Arbeitsplatz mit einem optionalen Onlinedienst verbinden. Das Plugin bleibt als eigenständig nutzbarer Client bestehen. Ein späterer Browserzugang erleichtert Eigentümern, Beirat und Handwerkern die Mitwirkung; der Dienst ergänzt Rechte, Synchronisation und Hintergrundbenachrichtigungen.

## Zielgruppe und Ausgangsproblem

Der erste Nutzer übernimmt die Verwaltung seiner eigenen WEG. Er ist bereits als Pilot verfügbar und wird nach Veröffentlichung mit dem fertigen MVP arbeiten. Die formelle Verwalterbestellung und konkrete Befugnisse sind damit nicht vorausgesetzt; das Produkt dokumentiert die jeweilige Handlungsgrundlage.

Die zentrale Problemhypothese ist eine über E-Mail, Telefon, Dateien und persönliche Erinnerungen verteilte Bearbeitung. Wiederkehrend muss der Nutzer rekonstruieren, welche Antwort noch fehlt, welches Angebot maßgeblich ist, worauf eine Entscheidung beruht und ob eine Rechnung bereits bearbeitet wurde.

Sein wichtigster Arbeitsauftrag an das Produkt lautet:

> Wenn an unserer WEG etwas erledigt werden muss, möchte ich den nächsten notwendigen Schritt erkennen, die passenden Unterlagen finden und offene Rückmeldungen verfolgen können.

| Beteiligter | Erwarteter Nutzen |
| --- | --- |
| Operativ verantwortliche Person | Überblick, klare nächste Schritte und weniger Such- und Nachfassarbeit. |
| Weitere Eigentümer und gegebenenfalls Beirat | Verständliche Sachstände und nachvollziehbare Entscheidungsunterlagen. |
| Handwerker | Eindeutige Anfragen, Leistungsbeschreibungen und Ansprechpartner. |
| Person für Buchhaltung oder Zahlungsprüfung | Zugeordnete Originalbelege und verständlicher Bearbeitungsstand. |

Im MVP bedient eine Person das Plugin. Andere Beteiligte erhalten ausgewählte Informationen über vorhandene Kommunikationswege. Eine neue Benutzerverwaltung ist dafür nicht erforderlich.

## Nutzenversprechen

**WEG Manager zeigt bei jedem offenen Vorgang, was als Nächstes ansteht, auf wen gewartet wird und welche Grundlage noch fehlt.**

Der erste Nutzen entsteht aus einem zusammenhängenden Handwerkerprozess:

- Einen Bedarf mit Beschreibung und Fotos aufnehmen.

- Eine Angebotsanfrage mit konsistentem Leistungsumfang vorbereiten.

- Rückmeldungen und Angebote vergleichen.

- Positionen, Empfehlung und Handlungsgrundlage dokumentieren.

- Auftrag, Ausführung und offene Mängel verfolgen.

- Rechnung prüfen, Zahlung im bestehenden Banking vorbereiten und das Ergebnis erfassen.

- Den Vorgang mit seinen Unterlagen verständlich übergeben.

Erwartete Entlastung und regelmäßige Nutzung werden im Pilot geprüft. Eine Zeitersparnis oder breite Marktnachfrage wird vor dieser Beobachtung nicht vorausgesetzt.

## Produktprinzipien

| Prinzip | Gestaltung des Produkts |
| --- | --- |
| Der Vorgang verbindet die Informationen | Aufgaben, Angebote, Kommunikation und Rechnungen behalten ihren Zusammenhang. |
| Offene Arbeit bleibt sichtbar | Jeder aktive Fall hat eine nächste Aktion oder einen dokumentierten Grund für das Warten. |
| Dokumentation bleibt präzise | Diskussion, Beschlussnachweis, Auftrag, Leistung und Zahlung sind unterscheidbar. |
| Der Alltag bleibt einfach | Drei Hauptansichten und verständliche deutsche Begriffe genügen für den Einstieg. |
| Daten bleiben nutzbar | Lokale lesbare Akten, unveränderte Originale und Export gehören zum Kern. |
| Teilen geschieht bewusst | Interne Notizen und externe Unterlagen werden vor der Weitergabe ausgewählt. |
| Grenzen sind an der passenden Stelle erkennbar | Lokale Hinweise, manuelle Zahlungsangaben und dokumentierte fremde Zustimmungen werden zutreffend bezeichnet. |

Die Oberfläche verwendet Formulare und klare Aktionen. Markdown und Properties sind die Datenbasis; ihre manuelle Bearbeitung ist keine Voraussetzung für die Nutzung.

## Erstes Produktangebot

Der MVP umfasst eine aktive WEG je Vault und einen Bearbeiter. Er funktioniert lokal ohne eigenes Konto oder erforderlichen Onlinedienst. Die Bedienung richtet sich zunächst an Desktopnutzer; Windows ist die Referenzplattform für die Releaseprüfung.

Die drei Hauptansichten sind **Heute**, **Vorgänge** und **Vorgangsakte**. WEG-Daten, Kontakte und Einstellungen ergänzen diese Ansichten.

Zahlungsvorbereitung und manuelle Zahlungsverfolgung sind enthalten. Die eigentliche Überweisung findet im vorhandenen Banking statt. Kommunikation verwendet zunächst vorhandene E-Mail- und Telefonkanäle. Lokale Erinnerungen werden durch einen bewusst ausgelösten Kalenderexport ergänzt.

Vollständige WEG-Buchhaltung, elektronische Abstimmungen, ein Eigentümerportal, automatische Postfachintegration, Bankabgleich, KI-Funktionen und ein frei konfigurierbarer Workflowdesigner folgen gegebenenfalls nach dem MVP. Ihr Nutzen wird gegen die Erfahrungen aus der veröffentlichten Version abgewogen.

Die Beschränkung auf eine WEG, Desktop und externe Kommunikations- und Zahlungswege ist der Umsetzungsvorschlag für den ersten Release. Diese Annahmen können durch die spätere Nutzung überprüft werden.

## Veröffentlichung und Pilot

Die Veröffentlichung ist ein eigener Meilenstein: Der MVP muss über das Obsidian Community-Verzeichnis in einem frischen Vault installierbar sein. Die aktuelle Obsidian-Dokumentation unterscheidet Einreichung und tatsächliche Installierbarkeit nach abgeschlossener Prüfung. [Quelle: Obsidian Einreichung](https://docs.obsidian.md/Plugins/Releasing/Submit%20your%20plugin)

Vor der Veröffentlichung werden Kernabläufe, Datenerhalt, Berechnungen und Exporte mit synthetischen Fällen intern geprüft. Das ist die Qualitätsprüfung des Produkts. Die anschließende Pilotphase untersucht seine Gebrauchstauglichkeit und seinen Nutzen im Alltag.

| Phase | Ergebnis |
| --- | --- |
| Entwicklung und interne Prüfung | Ein vollständiger, verständlicher und technisch geprüfter MVP. |
| Veröffentlichung | Die Version ist im Community-Verzeichnis auffindbar und installierbar. |
| Pilot mit vorhandenem Nutzer | Echte Nutzungserfahrungen, beobachtete Hürden und konkrete Verbesserungsbedarfe. |
| Folgeversion | Priorisierte Verbesserungen aus der Nutzung. |
| Späterer Onlinedienst | Gemeinsam bearbeitbare Vorgänge, passende Zugänge und Hintergrunddienste. |

Für den Pilot sind zunächst vier bis sechs Wochen vorgesehen. Die Dauer wird bei wenigen oder lang laufenden Handwerkerfällen anhand der tatsächlich beobachtbaren Ereignisse angepasst. Ein einzelner Pilot kann konkrete Probleme und Nutzen sichtbar machen; seine Ergebnisse sind kein Nachweis für den gesamten Markt.

## Erfolg und Weiterentwicklung

Das erste Produkt ist erfolgreich, wenn der Pilotnutzer echte Vorgänge selbstständig führen kann, den nächsten Schritt schnell findet und den Nutzen höher bewertet als die zusätzliche Pflege. Eine zweite Person sollte einen bewusst geteilten Export verstehen können.

Wiederverwendung wird an tatsächlichen Verwaltungsanlässen gemessen. Eine Woche ohne anstehende Arbeit ist kein Nutzungsabbruch. Aktive Verwaltungszeit wird von der Wartezeit auf Handwerker oder Eigentümer getrennt.

Der Onlinedienst wird entwickelt, wenn die beobachteten Bedürfnisse gemeinsame Arbeit, gezielte Zugänge oder verlässliche Hintergrundbenachrichtigungen rechtfertigen. Das kostenlose Plugin soll weiterhin sinnvolle lokale Arbeit sowie den Zugang zu den eigenen Akten ermöglichen.

Als Geschäftsmodell ist ein kostenpflichtiger optionaler Dienst vorgesehen. Ein konkreter Tarif wird erst anhand eines bestimmten Leistungsumfangs und beobachteter Nachfrage festgelegt. Kostenlose Plugininstallationen und wirtschaftliche Tragfähigkeit des Dienstes bleiben unterschiedliche Erfolgskriterien.

## Verbindliche Entscheidungen und Annahmen

| Gegenstand | Stand |
| --- | --- |
| Produktname WEG Manager | Vom Nutzer vorgegeben; Verfügbarkeit der Plugin-ID wird vor Einreichung geprüft. |
| MVP als Obsidian Plugin | Vom Nutzer vorgegeben. |
| Veröffentlichung vor Pilotvalidierung | Vom Nutzer vorgegeben. |
| Vorhandener Pilot verwaltet seine eigene WEG | Vom Nutzer angegeben. |
| Optionaler Onlinedienst mit Plugin als Client | Vom Nutzer als spätere Ausbaustufe vorgegeben. |
| Eine aktive WEG, ein Bearbeiter, Desktop, deutsche Oberfläche und EUR | Umfangsvorschlag für den ersten Release. |
| Banking und Versand außerhalb des Plugins | Umfangsvorschlag, dessen Nutzen im Pilot überprüft wird. |
| Lokaler Kern kostenlos | Empfohlenes Einstiegsmodell. |

Das zugehörige MVP-PRD konkretisiert diese Produktvision durch Funktionsanforderungen, Geschäftsregeln, Datenmodell, Abnahmeszenarien, Veröffentlichungskriterien und den anschließenden Pilotplan.

