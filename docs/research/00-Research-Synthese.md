---
type: ResearchSynthese
product: WEG Manager
status: research
version: "1.0"
date: 2026-11-15
---

# Research-Synthese – Konsequenzen für Produkt und MVP

**Stand: 15.11.2026.** Die Recherche unterstützt einen eng geführten lokalen Arbeitsplatz für eine Person, die ihre eigene WEG organisiert. Der Kern ist ein nachvollziehbarer Handwerkervorgang mit einem erkennbaren nächsten Schritt. Ob der Aufwand für Obsidian und die manuelle Dokumentation durch diesen Nutzen aufgewogen wird, kann erst der Pilot nach Veröffentlichung zeigen.

Die verbindliche Spezifikation steht im [MVP-PRD](../02-MVP-PRD.md), das Nutzenversprechen in der [Produktvision](../01-Produktvision.md). Die folgenden Schlussfolgerungen erklären diese Richtung und markieren die offenen Nachweise.

## 1. Was die Recherche belegt

| Perspektive | Beobachtung mit Quelle | Konsequenz für das Produkt |
|---|---|---|
| Markt | Anbieter wie [casavi](https://www.casavi.com/de/software/vorgangsmanagement/), [facilioo](https://facilioo.de/crm/) und [etg24](https://etg24.de/fuer-verwaltungen/) verbinden bereits Vorgänge, Aufgaben, Kommunikation und Dokumente. | Eine Funktionsliste allein trägt die Positionierung nicht. Der konkrete Arbeitsaufwand des Piloten ist entscheidend. |
| Kleine WEGs | [Matera](https://matera.eu/de/unser-angebot-selbstverwaltung) adressiert Selbstverwaltung mit Software und Unterstützung; [dooyah](https://www.dooyah.de/preise/) bietet einen kostenlosen Einstieg und kostenpflichtige Erweiterungen. | Geringer Preis und Selbstverwaltung sind keine unbesetzte Marktnische. Die gewünschte Tiefe fachlicher Unterstützung bleibt offen. |
| Arbeitsbelastung | Das [VDIV-Branchenbarometer 2026](https://vdiv.de/immobilienverwaltung/branchenbarometer) beschreibt Belastung in befragten Verwaltungsunternehmen. | Organisationshilfe ist ein plausibles Problemfeld. Daraus folgt keine belastbare Marktgröße für ein Obsidian-Plugin. |
| Fachliche Rollen | [§ 9b WEG](https://www.gesetze-im-internet.de/woeigg/__9b.html), [§ 27 WEG](https://www.gesetze-im-internet.de/woeigg/__27.html) und [§ 29 WEG](https://www.gesetze-im-internet.de/woeigg/__29.html) betreffen unterschiedliche Rollen und Befugnisse. | Verantwortlichkeit in einer Aufgabe, Beiratsprüfung, Beschluss und rechtliche Handlungskompetenz brauchen getrennte Bedeutungen. |
| Angebotsprozess | Der [BGH, V ZR 7/25](https://www.dnoti.de/entscheidungen/details/?cHash=9c627f5d2e16dabccc3772038110ed4a&tx_dnotionlineplusapi_decisionsdetails%5Bcontroller%5D=Decisions&tx_dnotionlineplusapi_decisionsdetails%5Bnodeid%5D=24807ebc-15ec-4986-a3f6-76b72326c91c), formuliert für Erhaltungsmaßnahmen keine pauschale Pflicht zu mehreren Vergleichsangeboten. | Das Plugin darf keinen universellen Drei-Angebote-Zwang einbauen. Auswahlgrundlage und Belege bleiben nachvollziehbar. |
| Datenschutz | Der [BayLDA-Bericht 2024, Abschnitt 8.3](https://www.lda.bayern.de/media/baylda_report_14.pdf), behandelt die Grenzen vollständiger Weiterleitungen und Veröffentlichungen in Eigentümerportalen. | Externe Informationen werden bewusst ausgewählt; interne Notizen bleiben beim Export standardmäßig ausgeschlossen. |
| Datenkontrolle | Obsidian hält [lokale Markdown-Dateien](https://obsidian.md/help/data-storage); [Bases](https://obsidian.md/help/bases) kann Ansichten auf Dateieigenschaften bilden. | Lesbare Akten und Originale können dauerhaft nutzbar bleiben. Geführte Abläufe und Geschäftsregeln brauchen weiterhin das Plugin. |
| Zusammenarbeit | [Shared Vaults](https://obsidian.md/help/sync/collaborate) bieten keine passende feine Rechtevergabe für Eigentümer und Handwerker. | Ein späterer Online-Service benötigt ein eigenes Berechtigungs- und Freigabemodell. |
| Laufzeit | Obsidian-[Plugin-Lifecycle](https://docs.obsidian.md/plugins/guides/lifecycle-management) und [Sync-FAQ](https://obsidian.md/help/sync/faq) begrenzen die Tätigkeit auf die laufende Anwendung. | Hinweise beim Öffnen und im laufenden Betrieb sind realistisch. Dauerhafte Hintergrundüberwachung gehört nicht zum lokalen MVP. |
| Distribution | Die aktuelle [Einreichungsdokumentation](https://docs.obsidian.md/Plugins/Releasing/Submit%20your%20plugin) beschreibt das Community-Verzeichnis; die [Developer Policies](https://docs.obsidian.md/community-directory/developer-policies) untersagen Client-Telemetrie. | Veröffentlichung hat eigene technische Kriterien. Der Pilot arbeitet mit Beobachtung und bewusst bereitgestellten Informationen. |

Die Quellen belegen Rahmenbedingungen und angebotene Funktionen. Die rechte Spalte enthält unsere daraus abgeleiteten Produktentscheidungen.

## 2. Zentrale Nutzungsannahme

Der Nutzer soll eine unterbrochene Verwaltungsaufgabe wieder aufnehmen können, ohne den gesamten Verlauf in E-Mails und Ordnern neu zusammensetzen zu müssen. Dazu verbindet eine Vorgangsakte Anlass, Beteiligte, offene Rückfragen, Unterlagen, nächste Aktion und Zahlungsdokumentation. Diese Nutzungsannahme wurde noch nicht durch Beobachtung bestätigt.

Die drei Hauptansichten aus dem PRD erfüllen unterschiedliche Aufgaben: **Heute** beantwortet die Frage nach dem nächsten Handlungsbedarf, **Vorgänge** gibt den Überblick, und die **Vorgangsakte** liefert Kontext und Belege. Allgemeine WEG-Aufgaben können ohne Handwerkervorgang existieren. Eine Person, die nur eine Wiedervorlage braucht, soll dafür keinen künstlichen Beschaffungsprozess anlegen müssen.

## 3. Konsequenzen für das Nutzererlebnis

| Arbeitssituation | Vorgesehene Antwort des MVP | Beobachtung im späteren Pilot |
|---|---|---|
| Rückkehr nach mehreren Tagen | Fällige Aufgaben, Wartestatus und Wiedervorlagen sichtbar machen. | Kann der Nutzer bei drei realen Wiederaufnahmen den nächsten Schritt jeweils innerhalb einer Minute erklären? |
| Rückfrage eines Handwerkers | Kommunikation, Angebot und aktuelle Entscheidungsgrundlage am Vorgang auffinden. | Reicht die Akte ohne zusätzliche Rekonstruktion aus E-Mails aus? |
| Unvollständiger Vorgang | Ungeklärte Punkte ausdrücklich darstellen und weitere Dokumentation zulassen. | Werden Unsicherheiten verständlich oder entsteht ein als störend empfundener Formularzwang? |
| Rechnung und Abschlag | Dokumentbasis, Zahlungszustand und Beleglage getrennt anzeigen. | Kann der Nutzer nachvollziehen, warum ein Restbetrag berechnet oder als ungeklärt angezeigt wird? |
| Weitergabe an Eigentümer | Vorschau mit bewusst ausgewählten Unterlagen, interne Notizen standardmäßig ausnehmen. | Versteht der Nutzer vor dem Export, welche Informationen tatsächlich weitergegeben werden? |

Diese Situationen sind Entwurfs- und Beobachtungsfragen. Es liegen keine gemessenen Erfolgsquoten vor. Bedienbarkeit muss außerdem in internen Abnahmeszenarien geprüft werden, bevor die Veröffentlichung erfolgt.

## 4. Umfang, der den ersten Nutzen prüfbar macht

Der erste MVP verbindet Angebotsanfrage, Angebotsvergleich, dokumentierte Entscheidungsgrundlage, Auftrag, Ausführung, Rechnung und manuell erfasste Zahlung. Er unterstützt reale Abweichungen wie Notfälle, fehlende Angebote und Abschläge. Eine starre lineare Abfolge würde solche Fälle verfälschen.

Die bewussten Grenzen halten die fachlichen Behauptungen nachvollziehbar: Kommunikation und Banking erfolgen über vorhandene Werkzeuge. Ein Nachrichtenentwurf gilt erst nach manueller Bestätigung als tatsächlich versandt. Eine als erfolgt gemeldete Zahlung bleibt eine manuelle Dokumentation. Upload, Belegnachweis und Zahlung haben getrennte Zustände. Eine vollständige Buchhaltung, automatisierte Beschlussfassung und Sammelzahlungsaufteilung gehören nicht zum ersten MVP. Die konkrete Ausgestaltung einschließlich Ausnahmefällen steht in FR 06–16 und im Zahlungsmodell des PRD.

Diese Auswahl ist eine Produktentscheidung. Wenn im Pilot gerade die ausgelagerten Schritte ständig doppelte Arbeit erzeugen, ist das ein Signal für eine Änderung des nächsten Umfangs.

## 5. Veröffentlichung, Betrieb und Geschäftsmodell

Die Veröffentlichung soll den Pilot mit einer regulär installierbaren Version ermöglichen. Interne Abnahmen gehen der Veröffentlichung voraus; die Installation aus dem öffentlichen Verzeichnis wird anschließend in einem frischen Vault geprüft. Erst danach beginnt die gemeinsame Validierung mit dem vorhandenen Nutzer. Hinweise auf unerledigte Aufgaben bei geschlossenem Obsidian und Unterstützung beim Einstieg sind mögliche Nutzungsrisiken, keine zusätzlichen Vorbedingungen für den Release.

Der kostenlose lokale Kern ist der vorgeschlagene Einstieg. Ein später kostenpflichtiger Dienst braucht einen erkennbaren gemeinsamen Arbeitsablauf: gezielte Freigaben, Rollen, abgestimmte Änderungen und Benachrichtigungen unabhängig von der geöffneten App. Zahlungsbereitschaft, Preis und wirtschaftlich tragbarer Supportaufwand sind unbewiesen. Der [Marktbericht](01-Markt-Zielgruppe-und-Geschaeftsmodell.md) erläutert diese Hypothesen.

## 6. Was der Pilot nach Veröffentlichung klären soll

Der Pilot untersucht zunächst vier bis sechs Wochen lang echte Anlässe; bei zu wenigen Ereignissen wird die Beobachtungszeit verlängert. Nach einem kurzen begleiteten Einstieg legt der Nutzer einen realen Vorgang selbst an. Retrospektive Angaben zum bisherigen Aufwand werden als Schätzungen markiert. Aktive Verwaltungszeit einschließlich doppelter Eingaben wird von Wartezeit auf Handwerker oder Eigentümer getrennt.

Ein freiwillig erneut genutzter Vorgang ist aussagekräftiger als erzwungene tägliche Aktivität. Wochen ohne Verwaltungsanlass zählen nicht automatisch als Abwanderung. Ein Zeitgewinn von 20 Prozent ist im PRD ein exploratives Ziel bei vergleichbarer Datenbasis; er ist weder eine zugesagte Wirkung noch eine statistisch belastbare Marktkennzahl. Der Pilot muss keinen erfundenen End-to-End-Abschluss produzieren, wenn in diesem Zeitraum keine reale Schlussrechnung anfällt.

Die wesentlichen Entscheidungen danach lauten: Trägt der lokale Arbeitsablauf? Ist die Bedienung ohne regelmäßige Entwicklerhilfe möglich? Wie viel Doppelpflege entsteht? Genügen die lokalen Erinnerungen? Welche konkrete Übergabe erfordert Zusammenarbeit? Die [Annahmenübersicht](05-Annahmen-und-Entscheidungen.md) ordnet die Antworten den Produktentscheidungen zu.

## 7. Nachweisgrenzen

Nicht belegt sind bislang tatsächliche Zeitersparnis, dauerhafte Nutzung, Obsidian-Akzeptanz, Zahlungsbereitschaft und technische Zielwerte der noch zu entwickelnden Software. Auch ein erfolgreiches n=1-Pilotprojekt belegt zunächst die Passung für diesen konkreten Arbeitskontext. Die Recherche trägt eine begründete erste Produktentscheidung; die Nutzung nach Veröffentlichung entscheidet über ihre Fortsetzung.
