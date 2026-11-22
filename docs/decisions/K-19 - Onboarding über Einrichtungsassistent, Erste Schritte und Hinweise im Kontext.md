---
type: Decision
id: K-19
status: festgelegt
date: 2026-11-22
source: "Auftrag und Entscheidungen des Produktverantwortlichen vom 22.11.2026; [[Onboarding-Research - Erststart, Einrichtung und Einführung]]"
---

# K-19 · Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext

## Entscheidung

Ein neuer Nutzer kommt in fünf Etappen vom leeren Vault zur ersten Arbeit:

1. Plugin im Community-Verzeichnis finden, installieren und aktivieren.
2. Beim ersten Aktivieren öffnet das Plugin einmalig seine Ansicht mit dem Einrichtungsassistenten.
3. Der Assistent fragt nur die Gemeinschaften ab, in zwei Schritten: Gemeinschaften erfassen, dann prüfen und anlegen. Erst „Gemeinschaften anlegen“ schreibt Notizen.
4. Danach landet der Nutzer auf der Lage, dem Dashboard des Plugins. Die Karte „Erste Schritte“ und erklärende Leerzustände führen zur ersten echten Arbeit.
5. Statt einer Tour erscheint beim ersten Benutzen eines Bereichs ein einzelner Hinweis am betroffenen Element. Er blockiert nichts und lässt sich schließen.

Die Einzelheiten stehen in [[F-25 - Onboarding und Einführung]], [[FLOW-09 - Erststart, Einrichtung und Einführung]] und [[VIEW-09 - Einrichtung]].

## Geltung

Gilt für den ersten Start in einem Vault ohne Gemeinschaft und für die ersten Besuche der Bereiche des Plugins. Verzeichniseintrag, Assistent und die Lage mit „Erste Schritte“ gehören zum MVP, die Hinweise im Kontext folgen danach (siehe O-19a).

## Kontext und Begründung

Der Produktverantwortliche hat am 22.11.2026 den Ablauf vorgegeben: neuer Vault, Installation aus dem Community-Verzeichnis, Aktivieren, Einrichtungsassistent für die Stammdaten, Weiterleitung zum Dashboard, danach eine Einführung durch das Plugin. Der erste Entwurf übernahm das mit einer angebotenen Tour in fünf Schritten. Ein Abgleich mit den Befunden der Nielsen Norman Group hat ihn am selben Tag geschärft ([[Onboarding-Research - Erststart, Einrichtung und Einführung]], Abschnitt 3):

| Punkt | Festlegung | Begründung |
| --- | --- | --- |
| Wann die Ansicht sich öffnet | Nur einmal, beim ersten Aktivieren durch den Nutzer (`onUserEnable`). Bei späteren Starts öffnet das Plugin nichts von selbst. | Obsidian sieht diesen Hook für die einmalige Einrichtung vor. Ein Plugin, das bei jedem Start eine Ansicht öffnet, stört. |
| Woran „Einrichtung nötig“ erkannt wird | Am Vault: Es gibt keine gültige Gemeinschaft. Kein eigenes Erststart-Merkmal. | Ein zweites Gerät mit Sync oder ein Vault mit von Hand angelegten Gemeinschaften soll nicht erneut in die Einrichtung geraten ([[K-14 - Markdown und Frontmatter als offene Datengrundlage]]). |
| Kein Willkommensschritt | Der Assistent beginnt mit der ersten Frage; ein Satz zum Nutzen steht darüber. | Onboarding lohnt sich nur, wo das Produkt Angaben braucht. Ein Willkommensbildschirm fragt nichts ab (Kendrick 2020). |
| Was der Assistent abfragt | Je Gemeinschaft nur Name und Art. Kürzel und Einheitenbezeichnung sind vorbelegt und auf der Prüfseite änderbar. Die Farbe vergibt das Plugin selbst; der Assistent zeigt keine Palette. Weitere Gemeinschaften kommen über „Weitere Gemeinschaft hinzufügen“ in einer Liste dazu. | Laien mit wenig Zeit (Jobkatalog J-RB1, J-EM6). Nur fragen, was nötig ist. Optische Anpassung gehört nicht ins Onboarding (Kendrick 2020). Seltene Angaben auf eine zweite Ebene (Nielsen 2006). Hinzufügen statt Ja/Nein-Frage nach dem GOV.UK-Muster „Add another“. |
| Kürzel | Nachträglich änderbar ([[PBI-73 - Kürzel einer Gemeinschaft nachträglich ändern]]). Der Assistent warnt nicht mehr vor einer endgültigen Wahl. | Ein Neuling soll beim ersten Kontakt nichts Unumkehrbares entscheiden. Verweise auf Gemeinschaften laufen über die stabile `id`, nicht über das Kürzel ([[docs/adr/0007-vault-data-access.md|ADR 0007]]). |
| Knöpfe | Nennen die Aktion: „Weitere Gemeinschaft hinzufügen“, „Prüfen“, „2 Gemeinschaften anlegen“. | Budiu 2017: Beschriftung mit der echten nächsten Aktion. |
| Wann Notizen entstehen | Erst mit „Gemeinschaften anlegen“ auf der Prüfseite. Bis dahin entsteht keine Datei und kein Ordner. | Kein ungefragtes Schreiben in den Vault. |
| Abbrechen und Fortsetzen | Schließt der Nutzer die Einrichtung vorher, bleiben die Eingaben im Arbeitsspeicher, bis Obsidian neu startet. Nichts landet im Vault oder in den Plugin-Daten. | Budiu 2017: mittendrin aufhören und weitermachen können, ohne neuen dauerhaften Zustand. |
| Ankunft auf der Lage | Karte „Erste Schritte“ mit höchstens vier echten Aufgaben, „Ersten Punkt erfassen“ hervorgehoben; ihr Stand ergibt sich aus dem Vault. Leerzustände sagen, was los ist, wie sich der Bereich füllt, und bieten die Aktion an. | Lernen durch Tun, später wieder aufrufbar (Laubheimer 2023). Drei Aufgaben eines Leerzustands (Kaplan 2021). |
| Tour oder Hinweise | Keine Tour. Beim ersten Benutzen eines Bereichs erscheint ein einzelner Hinweis am betroffenen Element, nichtmodal und schließbar. Der Befehl „Hinweise erneut zeigen“ setzt sie zurück. | Vorgeschaltete Tutorials verbesserten den Erfolg nicht (91 % mit, 94 % ohne) und ließen Aufgaben schwerer wirken (Kendrick 2020). Hinweise einzeln, im richtigen Moment, am Element (Harley 2014); Hilfe holen statt aufdrängen (Laubheimer 2023). |

Die Festlegung bleibt im Rahmen von [[K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]: kein Konto, keine KI, kein Netz. Sie legt keine Beispielakten an ([[PBI-32 - Ohne KI selbstständig beginnen]], Kriterium 1).

## Abgrenzung und betrachtete Alternativen

- **Einrichtung in drei Schritten mit Kontakten und Register** (Designstand v2, [[VIEW-07 - Einstellungen und Einrichtung]]): nicht übernommen. Der Assistent würde Daten abfragen, die das Plugin noch nicht speichern kann, und der Registerimport ist ein eigener Prüfablauf ([[F-02 - Registerbestand übernehmen]]).
- **Tour mit sieben blockierenden Schritten, automatisch gestartet** (ebenda): verworfen.
- **Kurze Tour in fünf Schritten, beim ersten Besuch der Lage angeboten** (erster Entwurf vom 22.11.2026): verworfen. Das Angebot ist Hilfe ohne Bezug zur laufenden Aufgabe, die Kette von Hinweisen widerspricht Harley 2014.
- **Willkommensschritt im Assistenten** (erster Entwurf): verworfen, siehe oben.
- **Willkommens-Modal statt eigener Ansicht**: nicht übernommen. Der Assistent braucht eine Prüfseite, und die Plugin-Ansicht existiert schon ([[PBI-55 - Navigation und App-Rahmen der Plugin-Ansicht bereitstellen]]).
- **Erststart-Merkmal in den Plugin-Daten als Auslöser**: nicht verwendet.

## Auswirkungen

- Neue Route „Einrichtung“ und eine Regel, wohin das Öffnen der Ansicht führt: ohne Gemeinschaft zur Einrichtung, sonst zur Startroute ([[docs/adr/0008-navigation-and-view-state.md|ADR 0008]]; die Einrichtung ist eine echte Ansicht, kein Platzhalter).
- Die Weiterleitung auf die Lage setzt die Lage voraus ([[PBI-13 - Aktuelle Wochenlage öffnen]]). Bis dahin führt die Einrichtung zur Gemeinschaftsverwaltung.
- Das Kürzel wird änderbar. Das revidiert die Festlegung in [[PBI-01 - Gemeinschaftskontext wählen]] vom 21.11.2026 und braucht [[PBI-73 - Kürzel einer Gemeinschaft nachträglich ändern]].
- Gesehene Hinweise und eine ausgeblendete Karte „Erste Schritte“ merkt sich das Plugin je Gerät, nicht in den Plugin-Daten.
- [[PBI-32 - Ohne KI selbstständig beginnen]] behält Hilfe, Offline-Betrieb, Diagnose und die Hinweise in der Wochenarbeit; seine Kriterien 1 und 5 werden durch [[F-25 - Onboarding und Einführung]] konkretisiert.
- Neue Begriffe im Glossar: Einrichtung (Setup), Erste Schritte (First steps), Hinweis (Hint).

## Entschiedene Punkte

Der Produktverantwortliche hat am 22.11.2026 entschieden:

- **O-19a Release:** Verzeichniseintrag, Einrichtung und Ankunft auf der Lage gehören zum MVP ([[PBI-68 - Plugin im Community-Verzeichnis finden und installieren]], [[PBI-69 - Beim ersten Aktivieren in die Einrichtung geführt werden]], [[PBI-70 - Gemeinschaften im Einrichtungsassistenten anlegen]], [[PBI-71 - Nach der Einrichtung auf der Lage mit Ersten Schritten ankommen]], dazu [[PBI-73 - Kürzel einer Gemeinschaft nachträglich ändern]]). Hinweise im Kontext ([[PBI-72 - Beim ersten Benutzen eines Bereichs einen Hinweis erhalten]]) folgen nach dem MVP. Der Verzeichniseintrag gehört ins MVP, weil die Veröffentlichung Voraussetzung für den Pilot ist ([[K-12 - Veröffentlichen vor dem Produktpilot]], AT-B14).
- **O-19b Speicherort:** je Gerät. Auf einem zweiten Gerät erscheinen Hinweise einmal erneut; das ist harmlos, weil sie nicht blockieren, und vermeidet Sync-Konflikte in den Plugin-Daten.
- **O-19c Ablageordner:** im Assistenten nur angezeigt. Ändern lässt er sich später in den Plugin-Einstellungen von Obsidian, als technische Einstellung an einem Ort ([[PBI-49 - Eine Einstellung hat genau einen Bearbeitungsort]]).
- **Tour:** keine, auch nicht als Befehl. Es bleiben „Hinweise erneut zeigen“ und die Hilfe.
- **Kürzel:** änderbar.
- **Abbruch:** Eingaben bleiben bis zum Neustart von Obsidian erhalten.

## Offene Punkte und Überprüfung

- O-19d: Das Verhalten von `onUserEnable` bei erneutem Aktivieren und über Sync ist mit einem e2e-Lauf zu prüfen.
- Überprüfung im Pilot und in einem kleinen Usability-Test mit etwa fünf Personen, die laut denken: Zeit vom Aktivieren bis zur ersten angelegten Gemeinschaft und bis zum ersten Punkt, beobachtet, nicht gemessen im Plugin ([[H-13 - Einrichtung führt in wenigen Minuten zum ersten Punkt]]).

## Verknüpfungen

[[F-25 - Onboarding und Einführung]] · [[FLOW-09 - Erststart, Einrichtung und Einführung]] · [[VIEW-09 - Einrichtung]] · [[Onboarding-Research - Erststart, Einrichtung und Einführung]] · [[PBI-32 - Ohne KI selbstständig beginnen]] · [[K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]] · [[K-12 - Veröffentlichen vor dem Produktpilot]].
