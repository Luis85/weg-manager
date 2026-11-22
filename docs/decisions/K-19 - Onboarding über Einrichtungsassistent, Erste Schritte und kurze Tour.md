---
type: Decision
id: K-19
status: vorgeschlagen
date: 2026-11-22
source: "Auftrag des Produktverantwortlichen vom 22.11.2026; [[Onboarding-Research - Erststart, Einrichtung und Einführung]]"
---

# K-19 · Onboarding über Einrichtungsassistent, Erste Schritte und kurze Tour

## Entscheidung

Vorschlag: Ein neuer Nutzer kommt in fünf Etappen vom leeren Vault zur ersten Arbeit:

1. Plugin im Community-Verzeichnis finden, installieren und aktivieren.
2. Beim ersten Aktivieren öffnet das Plugin einmalig seine Ansicht mit dem Einrichtungsassistenten.
3. Der Assistent legt die Stammdaten an, zunächst nur die Gemeinschaften, und zwar erst nach einer Prüfseite.
4. Danach landet der Nutzer auf der Lage, dem Dashboard des Plugins. Dort führt eine Checkliste „Erste Schritte“ zum ersten Nutzen.
5. Die Lage bietet eine kurze Einführung (Tour) an. Sie ist überspringbar und jederzeit neu startbar.

Die Einzelheiten stehen in [[F-25 - Onboarding und Einführung]], [[FLOW-09 - Erststart, Einrichtung und Einführung]] und [[VIEW-09 - Einrichtung]].

## Geltung

Gilt für den ersten Start in einem Vault ohne Gemeinschaft und für jeden späteren Neustart der Einführung. Die Note ist ein Vorschlag; Releasezuordnung und die offenen Punkte unten entscheidet der Produktverantwortliche.

## Kontext und Begründung

Der Produktverantwortliche hat am 22.11.2026 den Ablauf vorgegeben: neuer Vault, Installation aus dem Community-Verzeichnis, Aktivieren, Einrichtungsassistent für die Stammdaten, Weiterleitung zum Dashboard, danach eine Einführung durch das Plugin. Der Vorschlag übernimmt diese Reihenfolge und schärft fünf Punkte anhand der [[Onboarding-Research - Erststart, Einrichtung und Einführung]]:

| Punkt | Vorschlag | Begründung |
| --- | --- | --- |
| Wann die Ansicht sich öffnet | Nur einmal, beim ersten Aktivieren durch den Nutzer (`onUserEnable`). Bei späteren Starts öffnet das Plugin nichts von selbst. | Obsidian sieht diesen Hook genau für die einmalige Einrichtung vor. Ein Plugin, das bei jedem Start eine Ansicht öffnet, stört. |
| Woran „Einrichtung nötig“ erkannt wird | Am Vault: Es gibt keine gültige Gemeinschaft. Kein eigenes Erststart-Merkmal. | Ein zweites Gerät mit Sync oder ein Vault mit von Hand oder vom Agenten angelegten Gemeinschaften soll nicht erneut in die Einrichtung geraten ([[K-14 - Markdown und Frontmatter als offene Datengrundlage]]). |
| Was der Assistent abfragt | Nur Gemeinschaften: je Gemeinschaft Name und Art; Kürzel, Farbe und Einheitenbezeichnung sind vorbelegt und änderbar. Eine zweite Gemeinschaft (etwa die Tiefgarage) ist ein Angebot. Kontakte und Registerimport werden Schritte der Checkliste, nicht des Assistenten. | Laien mit wenig Zeit (Jobkatalog J-RB1, J-EM6). Kontakte und Register gibt es im Plugin noch nicht; ein Assistent soll nur fragen, was er sofort speichern kann. |
| Wann Notizen entstehen | Erst mit „Anlegen“ auf der Prüfseite. Bis dahin entsteht keine Datei und kein Ordner. Abbrechen hinterlässt nichts. | Kein ungefragtes Schreiben in den Vault. |
| Tour oder Checkliste | Hauptweg ist die Checkliste „Erste Schritte“ auf der Lage; ihr Stand ergibt sich aus dem Vault. Die Tour hat höchstens fünf Schritte, wird angeboten statt erzwungen und blockiert nur, solange sie läuft. | Laut NN/g helfen vorgeschaltete Tutorials kaum; kontextuelle Hilfe und nützliche Leerzustände wirken besser. Der Wunsch nach einer startenden Einführung bleibt erfüllt: Das Angebot erscheint beim ersten Besuch der Lage. |

Der Vorschlag bleibt im Rahmen von [[K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]: kein Konto, keine KI, kein Netz. Er legt keine Beispielakten an ([[PBI-32 - Ohne KI selbstständig beginnen]], Kriterium 1).

## Abgrenzung und betrachtete Alternative

- **Einrichtung in drei Schritten mit Kontakten und Register** (Designstand v2, [[VIEW-07 - Einstellungen und Einrichtung]]): nicht übernommen, weil der Assistent dann Daten abfragt, die das Plugin noch nicht speichern kann, und weil der Registerimport ein eigener Prüfablauf ist ([[F-02 - Registerbestand übernehmen]]).
- **Tour mit sieben blockierenden Schritten, automatisch gestartet** (ebenda): auf ein kurzes, abbrechbares Angebot verkürzt.
- **Willkommens-Modal statt eigener Ansicht** (wie bei einigen anderen Plugins): nicht übernommen, weil der Assistent mehrere Schritte und eine Prüfseite braucht und die Plugin-Ansicht dafür schon existiert ([[PBI-55 - Navigation und App-Rahmen der Plugin-Ansicht bereitstellen]]).
- **Erststart-Merkmal in den Plugin-Daten**: nicht als Auslöser verwendet, nur für den Zustand der Tour (siehe unten).

## Auswirkungen

- Neue Route „Einrichtung“ und eine Regel, wohin das Öffnen der Ansicht führt: ohne Gemeinschaft zur Einrichtung, sonst zur Startroute ([[docs/adr/0008-navigation-and-view-state.md|ADR 0008]] gilt; die Einrichtung ist kein Platzhalter, sondern eine echte Ansicht).
- Die Weiterleitung auf die Lage setzt die Lage voraus ([[PBI-13 - Aktuelle Wochenlage öffnen]]). Bis dahin führt die Einrichtung zur Gemeinschaftsverwaltung.
- [[PBI-32 - Ohne KI selbstständig beginnen]] behält Hilfe, Offline-Betrieb, Diagnose und die Hinweise in der Wochenarbeit; Kriterien 1 und 5 werden durch [[F-25 - Onboarding und Einführung]] konkretisiert.
- [[VIEW-07 - Einstellungen und Einrichtung]], [[VIEW-01 - Lage]], [[FLOW-01 - Gesamtfluss des Beirats-MVP]] und [[FLOW-06 - Einrichten, Import und Datenerhalt]] verweisen auf den neuen Ablauf.
- Neue Begriffe im Glossar: Einrichtung (Setup), Erste Schritte (First steps), Einführung (Tour).

## Offene Punkte und Überprüfung

- O-19a: Release. Gehört das Feature zum MVP? [[K-12 - Veröffentlichen vor dem Produktpilot]] und die Abnahme AT-B14 (Installation in einem frischen Vault) sprechen dafür.
- O-19b: Wo der Zustand der Tour gespeichert wird: in den Plugin-Daten (über Sync auf allen Geräten gleich) oder je Gerät. Vorschlag: Plugin-Daten, damit die Tour auf einem zweiten Gerät nicht erneut erscheint.
- O-19c: Ob der Ablageordner im Assistenten änderbar ist. [[PBI-57 - Einstellungen schemagesteuert lesen und migrieren]] führt ihn bisher ohne Oberfläche. Vorschlag: im Assistenten nur anzeigen, ändern später.
- O-19d: Verhalten von `onUserEnable` bei erneutem Aktivieren und über Sync ist mit einem e2e-Lauf zu prüfen.
- Überprüfung im Pilot: Zeit vom Aktivieren bis zur ersten angelegten Gemeinschaft und bis zum ersten Punkt, beobachtet, nicht gemessen im Plugin ([[H-13 - Einrichtung führt in wenigen Minuten zum ersten Punkt]]).

## Verknüpfungen

[[F-25 - Onboarding und Einführung]] · [[FLOW-09 - Erststart, Einrichtung und Einführung]] · [[VIEW-09 - Einrichtung]] · [[Onboarding-Research - Erststart, Einrichtung und Einführung]] · [[PBI-32 - Ohne KI selbstständig beginnen]] · [[K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]] · [[K-12 - Veröffentlichen vor dem Produktpilot]].
