---
type: Productvision
product: WEG Manager
status: entwurf
version: "1.1"
date: 2026-11-15
---

# WEG Manager Produktvision

**Version 1.1 · 15. November 2026 · Konzeptentwurf nach Pilotinput**

> WEG Manager hilft Menschen, die Verantwortung für gemeinschaftliches Eigentum tragen, offene Anliegen mit Quelle, Zuständigkeit und nächstem Schritt verlässlich zu verfolgen. Der erste Einstieg gibt Beiräten einen überschaubaren Wochenarbeitsplatz gegenüber ihrer Verwaltung: Zusagen bleiben sichtbar, Entscheidungen nachvollziehbar und Kommunikation unter menschlicher Kontrolle.

## Zielgruppe und Problem

Der erste Pilot ist Verwaltungsbeirat gegenüber einer externen Verwaltung und betreut eine WEG sowie eine angeschlossene Tiefgaragengemeinschaft. Er benötigt keine vollständige eigene Beschaffungs- und Zahlungsverwaltung. Sein Problem sind verstreute Zusagen, fehlende Termine, unklare Antworten und Unterlagen, die sich nicht ungeprüft weitergeben lassen.

Sein Arbeitsauftrag lautet: **Wenn ich meine Wochenarbeit beginne oder zwischendurch nachsehe, möchte ich erkennen, was seit meiner letzten Bearbeitung passiert ist, welche Entscheidung ansteht und was nicht warten kann.**

Der Pilot berichtet von 97 Punkten im bestehenden WCS. Das ist Nutzungskontext, keine Produktgrenze und kein Validierungsnachweis für WEG Manager. Eine Stunde pro Woche bleibt ein zu prüfendes Nutzenziel einschließlich Vor- und Nachbereitung.

| Beteiligter | Nutzen im ersten Einstieg |
| --- | --- |
| Beirat als einziger Bearbeiter | Quellenbezogene Übersicht, begründete nächste Schritte, weniger Such- und Nachfassarbeit. |
| Verwaltung | Verständliche, je Gemeinschaft gebündelte und menschlich geprüfte Rückfragen. |
| Eigentümer | Bewusst ausgewählter Sachstand auf Deutsch und Englisch. |
| Vertretung / Nachfolger | Lesbare Übergabe mit Quellen und offenen Punkten; noch kein eigener paralleler Bearbeitungszugang. |

## Nutzenversprechen und Kernreise

**WEG Manager macht offene Zusagen, notwendige Entscheidungen und den nächsten eigenen Schritt in einer überschaubaren Wochenarbeit sichtbar.**

1. Gemeinschaften getrennt einrichten und vorhandene Registerpunkte übernehmen.
2. Nachrichten, Unterlagen und einzelne erledigbare Punkte mit Quelle erfassen.
3. Eine aktuelle Wochenlage mit Fristen, begrenzter Entscheidungsauswahl und sichtbaren Datenlücken prüfen.
4. Eigene Entscheidungen mit Notiz festhalten und passende Entwürfe und Aufgaben vorbereiten.
5. Nachrichten bewusst außerhalb des Plugins senden und den tatsächlichen Versand dokumentieren.
6. Ausstehende Reaktionen fristgerecht nachverfolgen, Dringliches im Lagecheck erkennen und die nächste Woche vorbereiten.
7. Ausgewählte Sachstände und Quellen verständlich übergeben.

Ein Thema kann mehrere Punkte bündeln. Die Einheit für Nachverfolgung und Abschluss ist der einzelne Punkt, beispielsweise „Verwaltung nennt Ausführungstermin“. Ein vorhandenes Angebot, eine Rechnung oder ein Beschlussprotokoll kann dessen Quelle sein, ohne ein eigenes Fachmodul zu verlangen.

## Produktprinzipien

| Prinzip | Konsequenz |
| --- | --- |
| Der Punkt verbindet Arbeit und Nachweis | Ein überprüfbares Ergebnis, Verantwortlichkeit, Quelle und nächster Schritt je Punkt. |
| Fakten, Bewertungen und Handlungen bleiben unterscheidbar | Überfälligkeit ist ein Hinweis; „nicht eingehalten“ ein bewusstes Beiratsurteil. Entscheidung, Entwurf und Versand sind getrennt. |
| Begrenzte Aufmerksamkeit braucht vollständige Warnsignale | Höchstens sieben reguläre Entscheidungen insgesamt; dringender Überlauf und übriger Rückstand bleiben sichtbar. |
| Gemeinschaften bleiben getrennt | Kontext ist bei Bearbeitung, Entscheidung und Ausgabe eindeutig; WEG und Tiefgarage werden nicht vermischt. |
| Weitergabe wird geprüft | Interne Bewertungen, ungeprüfte Unterlagen und private Angaben gelangen nicht still in externe Ausgaben. |
| Notizen bleiben unabhängig nutzbar | Markdown und dokumentiertes Frontmatter sind der maßgebliche Bestand: ohne Plugin, Obsidian oder MCP lesbar und bearbeitbar; Originalerhalt, Sicherung und Wiederherstellung gehören dazu. |
| Nutzung erfolgt auch unterwegs | Wochenarbeit und Lagecheck sind vollständig mobil bedienbar, nicht nur lesbar. |
| Entlastung wird ehrlich gemessen | Manuelle Erfassung und Doppelpflege zählen zur Wochenzeit; unbekannte Eingänge bleiben als Lücken erkennbar. |

## Erstes Produktangebot und Grenzen

Der erste MVP ist ein kostenloser lokaler Obsidian-Client für einen Bearbeiter und mindestens zwei getrennte Gemeinschaften. Hauptabläufe sind **Wochenarbeit**, **Punkteregister mit Detailakte** und **Lagecheck**. Kontaktpflege, Quellenablage und Übergabe ergänzen sie. Die Nutzung erfordert keine manuelle Markdown-Bearbeitung. Die normale Pluginbedienung bleibt geführt; zugleich sind die gespeicherten Vorgänge unmittelbar als Markdown-/Frontmatter-Notizen im Ordner verfügbar. Der Nutzer kann einem externen AI-Agent Zugriff geben, damit dieser Kontext und Beziehungen versteht und erlaubte Änderungen direkt an denselben Notizen vornimmt. Dafür sind weder ein laufendes Plugin noch Obsidian oder MCP erforderlich. Externe und eigene Änderungen müssen ohne stille Überschreibung zusammengeführt beziehungsweise zur Klärung gestellt werden. [[K-14 - Markdown und Frontmatter als offene Datengrundlage]] hält diese Produktvorgabe fest.

Enthalten sind Registerübernahme, Quellen und Verlauf, Termine, Arbeitsentscheidungen, vorbereitete bearbeitbare Texte, Nachfassvorschläge, mobile Kernarbeit und kontrollierte Ausgabe. Der Kern bleibt ohne verpflichtende KI nutzbar. Zusätzlich ist ein nativer AI-Chat über die offizielle Claude-Code-Laufzeit und das berechtigte eigene Nutzerabo vorgesehen. Er ist optionaler Assistenzweg, zunächst auf Desktop zu prüfen; die mobile lokale Kernarbeit bleibt unabhängig. [[K-17 - Nativer AI-Chat über das Nutzerabo]] trennt dieses Produktziel vom noch offenen Integrations- und Abrechnungsnachweis. Bestehende Mail- und Telefonwege bleiben bestehen. Es wird weder automatischer Versand noch eine vollständige Überwachung aller Postfächer oder Portale zugesagt.

Vollständige Angebotsvergleiche, Auftrags-/Nachtragsführung, formelle Abnahme, Rechnungsrestberechnung und Zahlungsvorbereitung werden gegenüber Version 1.0 auf später verschoben. Gleiches gilt für Buchhaltung, elektronische Abstimmung, eine vollständige Beschluss-Sammlung, Portale, Mehrpersonenbearbeitung, eigene Hintergrunddienste und bestimmte Mail-/KI-Integrationen. Eine Frage zu einem dieser Themen bleibt bereits als Punkt bearbeitbar.

Diese Schwerpunktsetzung ist der aus dem Intake abgeleitete **Scopevorschlag**. Intake-Abgleich (historische Quelle im Git-Commit `b3a1cc2`, Pfad `docs/03-Intake-Abgleich.md`) dokumentiert Änderungen, Alternativen und offene Entscheidungen; der bisherige Umfang bleibt als historische Vision (historische Quelle im Git-Commit `b3a1cc2`, Pfad `docs/history/01-Produktvision-v1.0.md`) nachvollziehbar.

## Veröffentlichung, Pilot und Erfolg

Die festgelegte Reihenfolge bleibt: **Entwicklung → interne fachliche und technische Releaseprüfung → Veröffentlichung im Obsidian Community-Verzeichnis → öffentliche Neuinstallation prüfen → Pilot → Folgeversion.** Die vorliegende Arbeit bleibt vollständig in der Konzeptphase. Das bestehende WCS ist fachlicher Input, kein vorgezogener Pilot unseres Plugins.

Vor Veröffentlichung werden Trennung, Import, Fristen, Entscheidungen, sichere Ausgabe, mobile Bedienung und Datenerhalt intern mit synthetischen beziehungsweise freigegebenen anonymisierten Fällen geprüft. Erst danach wird die tatsächliche Gebrauchstauglichkeit beobachtet.

Pilotziel sind höchstens 60 Minuten gesamte aktive Arbeit in vier von fünf geeigneten Normalwochen. Vorbereitung, Prüfen, Versand, Nachhalten und Doppelpflege zählen mit. Außergewöhnliche Wochen werden begründet dokumentiert. Bei zu wenigen Anlässen wird keine Zielerreichung behauptet. Zusätzlich zählen selbstständige Wiederaufnahme, verständliche nächste Schritte, erneute Nutzung und verständliche Übergabe. Das Produkt kann rechtzeitiges Nachfassen ermöglichen, aber keinen Antworttermin der Verwaltung erzwingen.

## Langfristige Richtung

Beirat, selbstverwaltende Eigentümer und operative Verwaltung bleiben langfristige Zielgruppen. Der erste MVP bildet dafür einen klaren Einstieg. Ein optionaler späterer Onlinedienst kann gemeinsame Arbeit, gezielte Zugänge und Hintergrundbenachrichtigungen ergänzen; das Plugin bleibt eigenständig nutzbar und möglicher Client. Ein kostenpflichtiger Zusatzdienst ist eine Geschäftsmodellhypothese, kein festgelegter Tarif.

Die nächste Erweiterung folgt beobachtetem Nutzen und Aufwand. Der Handwerker- und Zahlungsprozess wird nicht vergessen, aber auch nicht vorsorglich parallel gebaut. [MVP-PRD](02-MVP-PRD.md) und [[Product Backlog.base#Backlog|Backlog-Notes]] konkretisieren diese Vision. Freigabe des Beiratsfokus, Pilotgerät und tatsächliche Übergabebedürfnisse bleiben im Konzeptreview zu klären.

## Hypothesenregister

Die prüfbaren Annahmen zu Nutzen, Alltagstauglichkeit, Scope und Geschäftsmodell sind im [[Product Backlog.base#Hypothesis|Hypothesenregister]] mit Herkunft, vorgeschlagener Prüfung und Evidenzgrenzen ausgegliedert. Die Extraktion ändert weder die hier beschriebenen Vorgaben noch den Freigabestand.
