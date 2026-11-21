---
type: Research
status: entwurf
scope: mvp
date: 2026-11-15
---

# Integrationsresearch · Nativer AI-Chat mit Claude Code

## Ergebnis und Integrationsziel

[[K-17 - Nativer AI-Chat über das Nutzerabo]] verlangt eine Chatoberfläche im Plugin mit Nutzung des berechtigten Nutzerabos. Der zu prüfende Ansatz ist eine **unveränderte offizielle Claude-Code-Laufzeit**, die der Nutzer über den offiziellen Weg anmeldet. Die Pluginoberfläche zeigt Gespräch, freigegebenen Kontext und tatsächliche Ausführungszustände; sie wird kein eigener Anmeldedienst oder Credential-Proxy.

Das ist eine Anforderungen-/Machbarkeitsrecherche vom 15.11.2026, keine implementierte oder live abgenommene Integration. Es wurden weder Claude Code installiert noch Nutzerkonten, Schlüssel, Tokens oder reale Aboanfragen verwendet.

## Verifizierte offizielle Quellen

| Quelle | Gelesener Beitrag | Einordnung für den Entwurf |
| --- | --- | --- |
| [Claude Code – Legal and compliance](https://code.claude.com/docs/en/legal-and-compliance) | Die Dokumentation behandelt Einbettung unveränderter Claude-Code-Binaries mit eigener Nutzeranmeldung und grenzt sie vom Anbieten eines fremden Claude-Logins beziehungsweise Vermitteln von Abo-Credentials ab. | Den konkreten Betriebsweg vor Freigabe prüfen. Die generelle technische Aufrufbarkeit ist keine pauschale Erlaubnis für beliebige Authentifizierungswrapper. |
| [Claude Code – Authentication](https://code.claude.com/docs/en/authentication) | Offizielle Anmeldung und verschiedene Konto-/Providerwege sind beschrieben. | Installation, Anmeldung und gewählter Account gehören der offiziellen Runtime; wir übernehmen keine geheimen Sitzungsdaten. |
| [Claude Agent SDK mit dem Claude-Plan](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan) | Update vom 07.10.2026: Bei Anmeldung mit Claude-Plan ziehen Agent SDK und `claude -p` weiterhin aus Subscription-Limits; API-Key-Verwendung mit verknüpfter Console und möglichen enthaltenen Credits ist ein anderer genannter Weg. | Abokontingent und API-Abrechnung nicht gleichsetzen. Die aktuelle Beschreibung ist kein unveränderliches Kostenversprechen für künftige Releases. |
| [Claude Code mit Pro/Max/Ultra](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-max-or-ultra-plan) | Der Artikel beschreibt die eigene Aboanmeldung und weist darauf hin, dass eine gesetzte API-Key-Konfiguration stattdessen API-Abrechnung auslösen kann. | Vor als Abo-Nutzung bezeichneter Ausführung tatsächlichen Modus klären. Keine feste Restnutzung oder kostenlose Zusatzkapazität behaupten. Team-/Enterprise-Zulässigkeit separat prüfen. |
| [Claude Code programmgesteuert ausführen](https://code.claude.com/docs/en/headless) | Dokumentierter CLI-Einstieg, strukturierte/gestreamte Ausgabe und Fortsetzung; der beschriebene Bare-Modus nutzt nicht die Subscription-Anmeldung. | Native Darstellung und Sitzungssteuerung sind technische Ansatzpunkte. Bare-Modus ist deshalb kein ungeprüfter Default für den gewünschten Abo-Chat. Berechtigungs-/Workspaceverhalten nicht einfach mit interaktiver Nutzung gleichsetzen. |

Es werden ausschließlich diese offiziellen Quellen als Grundlage verwendet, keine Forenberichte oder inoffizielle Credential-Wrapper. Die Dokumente beschreiben unterschiedliche Ebenen: Aboabrechnung, Login, Produktintegration und technische Ausführung. Vor Implementierungsfreigabe muss die gewählte Kombination für Version, Plan und Plattform nachvollziehbar zulässig und funktionsfähig sein; im Zweifel ist diese konkrete Frage mit dem Anbieter zu klären. Daraus entsteht kein pauschales Verbot der angeforderten Produktidee, aber auch kein bereits erteilter Integrationsnachweis.

## Vorgesehener Verantwortlichkeitsschnitt

| Bereich | Verantwortung / Entwurfsgrenze |
| --- | --- |
| Nativer Chat | WEG-Manager-Oberfläche für Eingabe, Verlauf, laufende Antwort, Tool-/Berechtigungszustände und Abbruch. Ein Terminal-Link allein genügt nicht. |
| Modellaufruf | Offizielle Runtime und Nutzerkonto; keine Weiterleitung extrahierter Sitzungstokens durch das Plugin. |
| Abrechnungsweg | Unterstützter Runtime-/Kontostatus; bei Unklarheit nicht als Abo-Nutzung starten. Vom Plugin kein stiller Wechsel, keine Aufladung und kein eigener Wiederverkauf von Nutzung. |
| Dateikontext | Vom Nutzer bestimmter Arbeitsbereich und Auftrag; Gemeinschaftsfilter sind nicht automatisch technisch isolierte Dateirechte. |
| Berechtigungen | Tatsächliche Runtime-Mechanismen müssen in der gewählten Betriebsart sichtbar und bedienbar bleiben. Eingabetext wird nicht zu Shellcode zusammengesetzt. |
| Lokaler Datenstand | [[F-22 - Offene Notizen und direkter Agentenzugriff]]; Änderungen lesen denselben Notizbestand, Konflikte werden erhalten. |
| Chatverlauf | Aufbewahrter Pluginverlauf als [[ENT-22 - AI-Gespräch]] in offenem Markdown-/Frontmatter-Format; keine Tokens oder privaten Diagnoseabzüge. |
| Skills und Connectoren | Nur die in dieser Laufzeit tatsächlich verfügbaren Fähigkeiten, nicht pauschal die Toolausstattung einer anderen Claude-Oberfläche. |

Der erste technische Untersuchungsweg ist Desktop. Eine lokale Claude-Code-Prozessintegration auf Obsidian Mobile wird nicht vorausgesetzt. Ein Remote-/Gatewayansatz wäre ein gesonderter Betriebsumfang und wird nicht nebenbei eingeführt. Die mobile Beiratsarbeit bleibt unabhängig von optionaler AI-Assistenz vollständig nutzbar.

## Zustände, die das Chatdesign abdecken muss

- Runtime fehlt oder ihre Version ist nicht unterstützt: verständlicher Einrichtungsweg, kein versteckter Download oder unbemerkte Änderung einer vorhandenen Installation.
- Nicht angemeldet / Sitzung abgelaufen: offizieller Anmeldeweg, Nutzereingabe erhalten.
- Abo-Modus bestätigt / anderer Modus / unbekannt: korrekt benennen, bevor der gewünschte Aufruf beginnt.
- Bereit / Antwort läuft / Toolberechtigung erforderlich: Kontext und tatsächliche Aktion sichtbar, ohne fachliche Freigaben zu erfinden.
- Limit oder Netzfehler: Eingabe und bekannte Teilergebnisse erhalten, kein stiller kostenpflichtiger Fallback.
- Abbruch: weiteren Lauf im unterstützten Umfang beenden, bereits erfolgte Änderungen nicht als rückgängig gemacht darstellen.
- Antwort versus Dateischritt: Modellvorschlag und tatsächlich ausgeführter Schritt getrennt, mit nachvollziehbarem Notizbezug.
- Wiederaufnahme: dieselbe bestätigte Sitzung/Arbeitsbasis oder klar erkennbarer neuer Gesprächskontext; keine unbemerkte Vermischung von Gemeinschaften.

## Verhältnis zum Gmail-Skill

[[PBI-46 - Gmail-Nachrichten mit Claude als Vault-Notizen übernehmen]] und das bereits erstellte Skillpaket bleiben eigenständiger MVP-Umfang. Ein nativer Chat kann diesen Skill nur nutzen, wenn die konkrete Claude-Code-Sitzung den Skill, Gmail-Lesetools und den freigegebenen Vaultzugriff tatsächlich besitzt. Claude.ai-/Desktop-Connectorverfügbarkeit wird nicht automatisch durch eine gemeinsame Subscription vererbt. Falls diese Voraussetzungen fehlen, bleibt der dokumentierte separate Claude-Workflow verfügbar; der native Chat behauptet keinen erfolgreichen Import.

Der Skill selbst bleibt read-only gegenüber Gmail. Die Chatintegration erweitert nicht seinen Auftrag auf Versand oder andere Kontoänderungen.

## Geplanter technischer Nachweis vor Freigabe

1. Offizielle unterstützte Runtime und erlaubten Betriebsweg für die geplante Distribution prüfen; keine Credential-Übernahme.
2. Native Chatantwort mit tatsächlich bestätigter Nutzer-Aboanmeldung ausführen; den Auth-/Abrechnungsnachweis ohne geheime Werte protokollieren.
3. Vorhandene API-/andere Providerkonfiguration als getrennten Modus erkennen; keine stille kostenpflichtige Anfrage unter falscher Aboanzeige.
4. Kontextwahl, Read-only-Auftrag, ausdrücklich erlaubte Dateiaktion und eine verweigerte Berechtigung prüfen.
5. Limit, Netzabbruch, Stop und Fortsetzung einschließlich bereits erfolgter Teiländerung prüfen.
6. Aufbewahrten Gesprächsstand ohne Plugin/Obsidian lesen und Dateireferenzen nachvollziehen.
7. Gmail-Skill nur bei real vorhandenen Connectorfähigkeiten ausprobieren; Abwesenheit korrekt anzeigen.

Diese Schritte sind noch **nicht ausgeführt**. Anbieterbedingungen, Pläne und Runtimeverhalten werden vor der Umsetzung erneut geprüft. Keine technische oder wirtschaftliche Garantie wird aus der Dokumentensichtung abgeleitet.

## Bezüge

[[F-23 - Nativer AI-Chat]], [[PBI-47 - AI-Chat über die eigene Claude-Subscription nutzen]], [[K-17 - Nativer AI-Chat über das Nutzerabo]], [[ACT-11 - Offizielle Claude-Code-Laufzeit]], [[DF-27 - Abo-Nutzung ohne stillen Abrechnungswechsel]], [[DF-28 - Chatantwort und ausgeführte Fachaktion unterscheiden]].
