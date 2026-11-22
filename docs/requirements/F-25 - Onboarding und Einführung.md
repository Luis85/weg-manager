---
type: Feature
parent: "[[E-05 - Im Alltag unabhängig arbeitsfähig bleiben]]"
order: 88000
release: "[[MVP - Beirat Support]]"
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

# F-25 · Onboarding und Einführung

**Planungsstand:** Angelegt am 22.11.2026 auf Wunsch des Produktverantwortlichen; Konzeptentwurf · **Umfang:** MVP für Einrichtung und Ankunft auf der Lage (PBI-61, PBI-62, PBI-63, PBI-65); Verzeichniseintrag und Hinweise im Kontext (PBI-60, PBI-64) nach dem MVP ([[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]], O-19a)

## Fähigkeit und Ergebnis

Ein Beirat, der das Plugin zum ersten Mal installiert, kommt ohne Vorwissen, ohne Konto und ohne KI in wenigen Minuten von einem leeren Vault zu seiner ersten echten Arbeit. Er findet das Plugin im Community-Verzeichnis, legt in einem kurzen Assistenten seine Gemeinschaften an, landet auf der Lage und erfährt dort, was als Nächstes zu tun ist. Statt einer Tour erklärt sich jeder Bereich beim ersten Benutzen mit einem einzelnen Hinweis, der nichts blockiert.

## Ablauf

1. Neuen Vault anlegen und das Plugin im Community-Verzeichnis finden, installieren und aktivieren.
2. Beim ersten Aktivieren öffnet sich die Plugin-Ansicht einmalig mit der Einrichtung.
3. Im Einrichtungsassistenten die Gemeinschaften erfassen (je Name und Art) und auf einer Prüfseite anlegen.
4. Auf der Lage ankommen; die Karte „Erste Schritte“ und die Leerzustände zeigen die nächsten Schritte.
5. Beim ersten Benutzen eines Bereichs einen kurzen Hinweis am Element sehen und schließen.

Der vollständige Ablauf mit Abbrüchen und Sonderfällen steht in [[FLOW-09 - Erststart, Einrichtung und Einführung]], die Ansicht in [[VIEW-09 - Einrichtung]].

## User Stories

- [[PBI-60 - Plugin im Community-Verzeichnis finden und installieren]]
- [[PBI-61 - Beim ersten Aktivieren in die Einrichtung geführt werden]]
- [[PBI-62 - Gemeinschaften im Einrichtungsassistenten anlegen]]
- [[PBI-63 - Nach der Einrichtung auf der Lage mit Ersten Schritten ankommen]]
- [[PBI-64 - Beim ersten Benutzen eines Bereichs einen Hinweis erhalten]]
- [[PBI-65 - Kürzel einer Gemeinschaft nachträglich ändern]] (unter [[F-01 - Gemeinschaften und Ansprechpartner]], Voraussetzung für den Assistenten)

## Abnahme und Abgrenzung

- Gilt als erreicht, wenn eine Person ohne Vorwissen in einem frischen Vault mit dem veröffentlichten Plugin bis zur Lage kommt und ihre erste Gemeinschaft angelegt hat, ohne Doku außerhalb des Plugins zu lesen (Abnahme AT-B14 im [[02-MVP-PRD]]).
- Kein Konto, keine KI, kein Netzwerk außer für die Installation selbst ([[K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]).
- Keine Beispielakten, keine Telemetrie. Ob das Onboarding wirkt, zeigt die Beobachtung im Pilot ([[H-13 - Einrichtung führt in wenigen Minuten zum ersten Punkt]]).
- Kontakte und Registerimport sind nicht Teil des Assistenten. Sie erscheinen als Punkte der Checkliste, sobald es sie gibt ([[F-01 - Gemeinschaften und Ansprechpartner]], [[F-02 - Registerbestand übernehmen]]).
- Keine Tour, auch nicht als Befehl (K-19).
- Mobile Einrichtung und Hinweise folgen nach dem MVP ([[K-09 - Vollständige mobile Wochenarbeit unterstützen]]).
- Hilfe, Diagnose und die Hinweise in der Wochenarbeit bleiben in [[PBI-32 - Ohne KI selbstständig beginnen]]. Dieses Feature konkretisiert dessen Kriterien 1 und 5.

## Herkunft

Auftrag des Produktverantwortlichen vom 22.11.2026 mit dem oben übernommenen Ablauf. Grundlagen: [[Onboarding-Research - Erststart, Einrichtung und Einführung]] und der Designstand v2 in [[VIEW-07 - Einstellungen und Einrichtung]]. Die Abwägungen stehen in [[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]].
