---
type: Decision
id: K-16
status: festgelegt
date: 2026-11-15
source: "Direkte Nutzerentscheidung: MVP-Gmail-Abfrage über Claude und vorhandene Connectoren; Skill erstellt Markdown-/Frontmatter-Notizen im Uservault und wird später vom Plugin bereitgestellt."
---

# K-16 · Gmail-Eingang im MVP über Claude Skill bereitstellen

## Entscheidung

Der erste MVP erhält einen einfachen Gmail-Eingangsweg über Claude und dessen bereits verfügbare Gmail-Connectoren. Ein bereitgestellter Claude Skill fragt den vom Nutzer bestimmten Umfang ab und legt einzelne E-Mails als Markdown-/Frontmatter-Quellnotizen im freigegebenen Nutzervault ab. Das Plugin benötigt dafür keine eigene Gmail-OAuth-Implementierung.

Das Skillpaket wird bereits jetzt erstellt und geprüft. Die spätere Pluginfunktion stellt eine überprüfbare Installation in einem unterstützten lokalen Skillpfad beziehungsweise die ZIP-Übergabe an Claude bereit. Ein Skill installiert weder die Gmail-Verbindung noch Dateirechte und startet nicht von sich aus eine andere Claude-Sitzung.

## Abgrenzung

Der Weg ist lesend gegenüber Gmail: keine Sendungen, Entwürfe, Labeländerungen, Markierung als gelesen, Archivierung oder Löschung. [[PBI-43 - Google-Konto für ausgewählte Dienste verbinden]], [[PBI-44 - Geprüfte E-Mails über Gmail versenden]] und [[PBI-45 - Ausgewählte Dokumente über Google Drive freigeben]] bleiben spätere direkte Integrationsfunktionen ohne MVP-Releasezuordnung.

[[F-18 - Integrationen]] ist dadurch ein Feature mit gemischtem Releaseumfang: der Claude-Skill-Eingang gehört zum MVP, die anderen benannten Integrationen zunächst nicht. Claude bleibt für diesen optionalen Arbeitsweg Voraussetzung, nicht für die lokale Kernarbeit insgesamt. [[K-14 - Markdown und Frontmatter als offene Datengrundlage]] bleibt maßgeblich.

Ein eigener WEG-Manager-MCP-Server ist nicht erforderlich. Der vorhandene Claude-Gmail-Connector kann intern MCP nutzen; das begründet keine Abhängigkeit von unserem späteren [[F-19 - MCP Server]].

## Konkreter Stand

[Skill-Quelldatei](../../skills/weg-gmail-to-vault/SKILL.md) und [Paketmanifest](../../skills/manifest.json) liegen im Repository. Das ZIP-Paket `skills/dist/weg-gmail-to-vault-0.2.0.zip` wird nicht eingecheckt, sondern mit `npm run skills:package` erzeugt; die CI baut es bei jedem Lauf und stellt es als Artefakt `claude-skills` bereit. Der Plugininstaller ist noch nicht implementiert. Ein Live-Test mit Claude und einem echten Gmail-Konto ist noch ausstehend; lokale Tests und eine synthetische Agentenanwendung sind dokumentiert.

## Bezüge

[[PBI-46 - Gmail-Nachrichten mit Claude als Vault-Notizen übernehmen]], [[ENT-21 - E-Mail-Quellnotiz]], [[DF-26 - Gmail-Nachrichten eindeutig und quellentreu übernehmen]], [[Integrationskonzept - Gmail-Eingang mit Claude Skill]], [[Skill-Evaluation - Gmail-Import]].
