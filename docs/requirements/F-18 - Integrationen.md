---
type: Feature
parent: "[[E-07 - Cross Cutting Concerns]]"
order: 63000
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

# F-18 · Integrationen

**Planungsstand:** Konzeptentwurf · **Umfang:** Späterer Ausbau

## Fähigkeit und Ergebnis

Externe Werkzeuge können gezielt mit den fachlichen Abläufen des WEG Managers verbunden werden. Gemeinsame Regeln für Gemeinschaftszuordnung, Quellenherkunft, Zugriffsfreigabe, Fehler und wiederholte Übernahme verhindern voneinander abweichende Einzellösungen.

## Geplante Integrationsbereiche

- **Google-Dienste für Versand und Verteilung:** Konto bewusst verbinden; geprüfte E-Mails einschließlich ausgewählter Dokumentanhänge über Gmail menschlich auslösen; ausgewählte Dokumente beziehungsweise Ausgaben über Google Drive bereitstellen und gezielt freigeben. Der schreibende Übertragungsweg ist ausdrücklich angefordert. Eine vollständige Workspace-Synchronisation oder automatische Nachrichtenauslösung ist damit nicht zugesagt.
- **Weitere Google-Übernahmen:** Ein Eingang aus Gmail, Drive-Unterlagen und Google-Sheets-Register bleiben zusätzliche Integrationskandidaten. Ein Gmail-Eingang über einen Claude Skill wird erst wieder aufgegriffen, wenn das Plugin steht und der Anwendungsfall besser verstanden ist.
- **Kalender:** Bewusste Übernahme ausgewählter Termine, zunächst als Momentaufnahme gemäß PBI-40.
- **Weitere Mail- oder Verwaltungsportale:** Nur bei konkret belegtem Bedarf; ein vollständiger Casavi- oder Postfachabgleich ist weiterhin nicht spezifiziert.

## User Stories

- [[PBI-43 - Google-Konto für ausgewählte Dienste verbinden]]
- [[PBI-44 - Geprüfte E-Mails über Gmail versenden]]
- [[PBI-45 - Ausgewählte Dokumente über Google Drive freigeben]]

- [[PBI-40 - Ausgewählten Termin in Kalender übernehmen|PBI-40 · Ausgewählten Termin in Kalender übernehmen]]

Die neue Nutzeranforderung konkretisiert die Verbindung, den E-Mail-Versand und die Dokumentfreigabe in PBI-43 bis PBI-45. Diese drei direkten Versand-/Freigabestories bleiben späterer Ausbau. Der manuelle Registerimport [[F-02 - Registerbestand übernehmen]], der bisherige externe Kommunikationsweg und die offene Dateibearbeitung [[F-22 - Offene Notizen und direkter Agentenzugriff]] bleiben unabhängig nutzbar.

## Abnahmehinweise für späteres Refinement

- Angebundener Dienst, Konto, freigegebener Datenumfang, Gemeinschaft und Richtung des Austauschs sind erkennbar.
- Herkunft und Verarbeitungsstand bleiben nachvollziehbar; unvollständige oder fehlgeschlagene Übernahme wird nicht als vollständiger Eingang dargestellt.
- Wiederholung erzeugt keine stillen Dubletten; Änderungen bestehender Daten sind prüfbar.
- Ungeprüfte/private Inhalte werden nicht automatisch weitergegeben. Nachrichtenerstellung, ausdrücklich ausgelöster Dienstversand, Dienstbestätigung und tatsächliche Zustellung bleiben getrennt. Drive-Upload und Rechtefreigabe werden ebenfalls bewusst geprüft.
- Nutzung ohne Anbindung bleibt im lokalen Kern möglich. Google ist als optionaler Zielanbieter benannt; Zugriffstechnik, Berechtigungen und eventuelle Synchronisationsverfahren bleiben im technischen Refinement zu klären.

## Abgrenzung und Herkunft

Der [[F-19 - MCP Server]] stellt WEG-Manager-Fähigkeiten für Clients bereit; er ist ein eigenes Feature und nicht mit einem Connector zu externen Diensten gleichzusetzen. Fachliche gemeinsame Bearbeitung und ein Dienstangebot liegen unter [[F-20 - Zusammenarbeit und Onlinedienst]].

Quellen: Nutzerpräzisierung vom 15.11.2026 (Google Workspace), Pilot FR-E1/E5 sowie bisheriger F-18-Umfang. Die Festlegung [[K-10 - Manuelle Quellenübernahme und Registerimport vorsehen]] bleibt für den ersten MVP bestehen. Diese spätere Einordnung gilt für alle Integrationen dieses Features.

## Technische Evidenz und offene Ausgestaltung

Quellenprüfung am 15.11.2026, ausschließlich offizielle Google-Dokumentation:

- Die [Gmail-Dokumentation zum Erstellen und Senden](https://developers.google.com/workspace/gmail/api/guides/sending) beschreibt sowohl direkten Versand als auch Versand eines Entwurfs. Daraus folgt die grundsätzliche technische Möglichkeit, nicht eine bereits geprüfte Obsidian-Integration oder Zustellgarantie.
- Die [Drive-Dokumentation zur Freigabe](https://developers.google.com/workspace/drive/api/guides/manage-sharing) unterscheidet Berechtigungstypen und Rollen und beschreibt Vererbung. Der Entwurf verlangt deshalb eine Prüfung des effektiven Empfängerkreises, statt einen kopierten Link mit eingeschränktem Zugriff gleichzusetzen.
- [OAuth für Desktop-Anwendungen](https://developers.google.com/identity/protocols/oauth2/native-app) und [Google-Autorisierungspraktiken](https://developers.google.com/identity/protocols/oauth2/resources/best-practices) begründen nutzerseitige Autorisierung, bedarfsgerechte Rechte und geschützte Tokenbehandlung. Die passende Lösung für Obsidian Desktop/Mobile, Konto-/Workspace-Richtlinien und eventuell nötige Appprüfung ist noch zu entwerfen.

Keine konkrete OAuth-Scope-Liste, API-Version, Transportbibliothek oder Hostingentscheidung wird hier festgeschrieben. Nachrichtengrößen, Anhangstypen, Dateigrößen, Quoten, vorhandene/geerbte Rechte, Benachrichtigungen und unklare externe Ergebnisse müssen beim späteren Refinement anhand der dann geltenden Dienstbedingungen konkretisiert werden.

## Präzisierung des menschlichen Versandwegs

Im Beirats-MVP erfolgt der Versand weiterhin im vorhandenen externen Werkzeug und wird manuell dokumentiert. Die spätere Google-Anbindung erlaubt zusätzlich eine ausdrückliche Versandaktion im Plugin, die Gmail beauftragt. Das ist keine automatische Sendung durch Hintergrundverarbeitung oder AI-Agent. Eine bestehende Vorlagenfreigabe ist nicht automatisch die Freigabe für später geänderte Inhalte.

[[K-15 - Google-Dienste für Versand und Dokumentfreigabe anbinden]], [[DF-24 - Bestätigter Dienstversand und unklarer Ausgang]] und [[DF-25 - Gezielte Dokumentfreigabe über externe Dienste]] konkretisieren diese Grenze. Die lokalen Notizen bleiben maßgeblich; technische Tokens werden nicht als offen lesbare Fachnotizen gespeichert.
