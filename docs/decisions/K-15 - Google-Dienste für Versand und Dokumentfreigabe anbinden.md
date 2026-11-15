---
type: Decision
id: K-15
status: festgelegt
date: 2026-11-15
source: "Direkte Nutzeranforderung: Verbindung zu Google-Diensten für Dokumentverteilung und E-Mail-Versand ermöglichen."
---

# K-15 · Google-Dienste für Versand und Dokumentfreigabe anbinden

## Entscheidung

Unter [[F-18 - Integrationen]] wird eine optionale Google-Anbindung vorgesehen: ein ausgewähltes Konto verbinden, geprüfte E-Mails über Gmail versenden und ausgewählte Dokumente beziehungsweise Ausgaben über Google Drive bereitstellen und gezielt freigeben. Ein Dokument kann außerdem als bewusst gewählter E-Mail-Anhang versandt werden.

## Geltung und Grenze

Die Fähigkeit ist angefordert. Ein neuer Releasezeitpunkt wurde nicht festgelegt; die bisherige Einordnung von F-18 als späterer Ausbau bleibt bestehen. Es erfolgt keine automatische Zuordnung zum ersten MVP. Die heutigen MVP-Pages und der dortige manuelle externe Versand bleiben für diesen Release gültig.

Im späteren Integrationsablauf kann der Nutzer den tatsächlichen Versand aus dem Plugin ausdrücklich auslösen. Das ist von Entwurfserzeugung, Kopieren und unbeaufsichtigtem beziehungsweise agentisch eigenständig ausgelöstem Versand zu unterscheiden. Nur die vom Menschen geprüfte Fassung samt Empfängern und Anlagen wird übertragen. Für Drive gilt dieselbe bewusste Prüfung vor Upload und Freigabe.

[[K-14 - Markdown und Frontmatter als offene Datengrundlage]] bleibt bestehen: lokale Fachnotizen sind maßgeblich, Google ist kein zwingender Ersatzdatenspeicher. MCP ist keine Voraussetzung. Zugangstokens sind technische Geheimnisse und werden nicht im offen für Agenten lesbaren Fachnotizbestand abgelegt; Konto-/Dienstbezug und fachliche Ergebnisse bleiben nachvollziehbar.

## Folgeanforderungen

[[PBI-43 - Google-Konto für ausgewählte Dienste verbinden]], [[PBI-44 - Geprüfte E-Mails über Gmail versenden]], [[PBI-45 - Ausgewählte Dokumente über Google Drive freigeben]], [[ACT-10 - Google-Dienste]], [[DF-24 - Bestätigter Dienstversand und unklarer Ausgang]], [[DF-25 - Gezielte Dokumentfreigabe über externe Dienste]].

## Noch zu konkretisieren

Unterstützte Kontoarten und Workspace-Richtlinien, Autorisierung je Desktop/Mobile, minimale Dienstberechtigungen, sichere Tokenablage, technische Grenzen von Anhängen/Dateien, Freigaberechte und Behandlung unklarer externer Ergebnisse. Eine vollständige Postfach-/Drive-/Sheets-Synchronisation wird nicht aus dem Versandwunsch abgeleitet.
