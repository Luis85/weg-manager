---
type: Feature
parent: "[[E-05 - Im Alltag unabhängig arbeitsfähig bleiben]]"
order: 88000
release: ""
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

**Planungsstand:** Angelegt am 22.11.2026 auf Wunsch des Produktverantwortlichen; Konzeptentwurf · **Umfang:** offen, Release-Vorschlag MVP (siehe [[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und kurze Tour]], O-19a)

## Fähigkeit und Ergebnis

Ein Beirat, der das Plugin zum ersten Mal installiert, kommt ohne Vorwissen, ohne Konto und ohne KI in wenigen Minuten von einem leeren Vault zu seiner ersten echten Arbeit. Er findet das Plugin im Community-Verzeichnis, legt in einem kurzen Assistenten seine Gemeinschaften an, landet auf der Lage und erfährt dort, was als Nächstes zu tun ist. Eine kurze Einführung zeigt die Hauptbereiche; er kann sie überspringen und jederzeit neu starten.

## Ablauf

1. Neuen Vault anlegen und das Plugin im Community-Verzeichnis finden, installieren und aktivieren.
2. Beim ersten Aktivieren öffnet sich die Plugin-Ansicht einmalig mit der Einrichtung.
3. Im Einrichtungsassistenten die Gemeinschaften anlegen und auf einer Prüfseite bestätigen.
4. Auf der Lage ankommen; die Checkliste „Erste Schritte“ zeigt die nächsten Schritte.
5. Die Einführung starten oder überspringen.

Der vollständige Ablauf mit Abbrüchen und Sonderfällen steht in [[FLOW-09 - Erststart, Einrichtung und Einführung]], die Ansicht in [[VIEW-09 - Einrichtung]].

## User Stories

- [[PBI-60 - Plugin im Community-Verzeichnis finden und installieren]]
- [[PBI-61 - Beim ersten Aktivieren in die Einrichtung geführt werden]]
- [[PBI-62 - Gemeinschaften im Einrichtungsassistenten anlegen]]
- [[PBI-63 - Nach der Einrichtung auf der Lage mit Ersten Schritten ankommen]]
- [[PBI-64 - Kurze Einführung durch das Plugin erhalten]]

## Abnahme und Abgrenzung

- Gilt als erreicht, wenn eine Person ohne Vorwissen in einem frischen Vault mit dem veröffentlichten Plugin bis zur Lage kommt und ihre erste Gemeinschaft angelegt hat, ohne Doku außerhalb des Plugins zu lesen (Abnahme AT-B14 im [[02-MVP-PRD]]).
- Kein Konto, keine KI, kein Netzwerk außer für die Installation selbst ([[K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]).
- Keine Beispielakten, keine Telemetrie. Ob das Onboarding wirkt, zeigt die Beobachtung im Pilot ([[H-13 - Einrichtung führt in wenigen Minuten zum ersten Punkt]]).
- Kontakte und Registerimport sind nicht Teil des Assistenten. Sie erscheinen als Punkte der Checkliste, sobald es sie gibt ([[F-01 - Gemeinschaften und Ansprechpartner]], [[F-02 - Registerbestand übernehmen]]).
- Mobile Einrichtung und Tour folgen nach dem MVP ([[K-09 - Vollständige mobile Wochenarbeit unterstützen]]).
- Hilfe, Diagnose und die Hinweise in der Wochenarbeit bleiben in [[PBI-32 - Ohne KI selbstständig beginnen]]. Dieses Feature konkretisiert dessen Kriterien 1 und 5.

## Herkunft

Auftrag des Produktverantwortlichen vom 22.11.2026 mit dem oben übernommenen Ablauf. Grundlagen: [[Onboarding-Research - Erststart, Einrichtung und Einführung]] und der Designstand v2 in [[VIEW-07 - Einstellungen und Einrichtung]]. Die Abwägungen stehen in [[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und kurze Tour]].
