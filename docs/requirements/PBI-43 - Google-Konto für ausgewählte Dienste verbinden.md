---
type: PBI
parent: "[[F-18 - Integrationen]]"
order: 69000
actors:
  - "[[docs/design/actors/ACT-01-Beirat]]"
  - "[[docs/design/actors/ACT-10 - Google-Dienste]]"
entities: []
business-rules:
  - "[[docs/business-rules/DF-24 - Bestätigter Dienstversand und unklarer Ausgang]]"
  - "[[docs/business-rules/DF-25 - Gezielte Dokumentfreigabe über externe Dienste]]"
decisions:
  - "[[docs/decisions/K-15 - Google-Dienste für Versand und Dokumentfreigabe anbinden]]"
  - "[[docs/decisions/K-14 - Markdown und Frontmatter als offene Datengrundlage]]"
hypotheses: []
pages: []
user-flows: []
---

# PBI-43 · Google-Konto für ausgewählte Dienste verbinden

**Planungsstand:** Konzeptentwurf · **Umfang:** Später; keine Releasezuordnung

## User Story

Als Nutzer möchte ich ein Google-Konto für gezielt ausgewählte Dienste verbinden und wieder trennen können, damit ich Versand und Dokumentfreigabe bewusst freischalte, ohne meinen lokalen Arbeitsbestand davon abhängig zu machen.

## Akzeptanzkriterien

1. Konto und ausgewählte Funktionen wie Gmail-Versand und Drive-Dokumentfreigabe sind sichtbar. Der Nutzer autorisiert die benötigten Dienste; nicht freigegebene Funktionen bleiben erkennbar nicht verfügbar.
2. Eine Verbindung veranlasst weder Versand noch Upload und erteilt einem AI-Agent keine eigenständige Freigabe für diese Aktionen.
3. Gemeinschafts-/Absenderkontext und Kontowahl sind eindeutig. Ein Kontowechsel verlangt erneute Prüfung einer bereits vorbereiteten externen Aktion; bisherige erfolgreiche Handlungen werden nicht auf das neue Konto umgedeutet.
4. Abgebrochene Anmeldung, verweigerte Rechte, abgelaufene oder widerrufene Verbindung und nicht verfügbare Workspace-Funktionen werden verständlich behandelt. Lokale Notizen bleiben lesbar und bearbeitbar.
5. Trennen beendet die Nutzung dieser Verbindung für neue Dienstaktionen und behandelt lokale technische Zugriffsgeheimnisse entsprechend; bereits erteilte Dokumentrechte und erfolgte Sendungen werden dadurch nicht als zurückgenommen ausgegeben.
6. Passwörter und Zugangstokens gehören nicht in Fachnotizen, Diagnoseausgaben, Screenshots oder das Repository. Konto-/Dienstmetadaten sind von Geheimnissen getrennt; konkrete sichere Ablage und Autorisierung je Plattform bleiben technisch zu bestimmen.

## Herkunft und Abgrenzung

Direkte Integrationsanforderung vom 15.11.2026, festgehalten in [[K-15 - Google-Dienste für Versand und Dokumentfreigabe anbinden]]. Keine tatsächliche Verbindung, kein Versand und kein Upload wurden durch diese Konzeptarbeit ausgeführt. Die heutigen MVP-Ansichten/Flows zeigen den manuellen Weg und werden hier nicht als fertiges Integrationsdesign verlinkt.

## Refinementgrenze

Autorisierung, zulässige Kontoarten, konkrete Berechtigungen, Fehler-/Ergebnisabgleich und technische Plattformintegration vor Umsetzung klären. Die Dienstverbindung ist technische Konfiguration, noch keine der vorhandenen Fachentitäten. Bei Bedarf eine eigene Konfigurationsbeschreibung ergänzen; keine Tokens als Fachentität behandeln.
