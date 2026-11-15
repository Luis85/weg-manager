# Laufzeit und spätere Plugin-Installation

## Tatsächliche Voraussetzungen

Der Skill ist ein portables Agent-Skills-Paket, kein Gmail-Connector und kein Plugin. Die verwendete Claude-Sitzung muss gleichzeitig Zugang zum bereits eingerichteten Gmail-Connector, zum ausdrücklich freigegebenen Zielordner und zu Python 3.10 oder neuer haben. Ein Skill-Upload richtet weder Connector noch Dateifreigabe ein.

Ein Claude-Chat oder eine Cloud-Laufzeit mit ausschließlich eigenen Artefakten kann nicht allein durch ein Skill-Paket in einen beliebigen lokalen Obsidian-Vault schreiben. Prüfe den tatsächlichen Mount-/Ordnerzugriff. Fehlt er, ist ein angebotener Download ausdrücklich ein manueller Übergabeweg, kein abgeschlossener direkter Vault-Import.

## Installationsziele

- **Claude Code mit zugänglichem Projekt-/Vault-Ordner:** Den gesamten Ordner `weg-gmail-to-vault` nach `<ausgewählter-projektordner>/.claude/skills/weg-gmail-to-vault/` kopieren. Gmail-Lesetools müssen in dieser Sitzung separat vorhanden sein; dieselbe Verbindung aus einer anderen Claude-Oberfläche wird nicht ungeprüft vorausgesetzt.
- **Claude mit Custom-Skill-Upload:** ZIP mit genau einem obersten Ordner `weg-gmail-to-vault/` und darin `SKILL.md`, `references/` und `scripts/` bereitstellen. Der Nutzer installiert/aktiviert es über die verfügbaren Skill-Funktionen. Der Client muss zusätzlich echten Zugriff auf den Zielordner haben.
- **Späteres WEG-Manager-Plugin:** Paket in den vom Nutzer gewählten, tatsächlich unterstützten lokalen Skill-Pfad installieren oder das ZIP zur Claude-Installation bereitstellen. Keine Annahme einer universellen Claude-Installations-API. Vorhandene Installation und Nutzeränderungen vergleichen; nicht blind ersetzen. Die Kontoverbindung bleibt in Claude, nicht im Plugin.

Es wird kein eigener WEG-Manager-MCP-Server benötigt. Der vorhandene Claude-Gmail-Connector kann intern MCP verwenden; dessen Transport ist nicht mit einer Pflicht zur Entwicklung unseres MCP-Features gleichzusetzen.

## Unterstützte Version und Updategrenze

Skillversion 0.1.0, E-Mail-Schema `weg-manager.gmail-message/v1`. Ein Paketupdate migriert keine vorhandenen Mailnotizen. Die spätere Plugininstallation prüft Version/Integrität und legt Installation, bewusste Aktualisierung oder Abbruch offen. Geheimnisse und konkrete Konten gehören nicht in das Paket.

## Verifizierte öffentliche Grundlagen

Geprüft am 15.11.2026; Oberflächen, Berechtigungen und Pläne können sich ändern. Der tatsächliche Funktionsumfang dieser Sitzung hat Vorrang vor angenommenen Toolnamen.

- [Claude Google Workspace connectors](https://support.claude.com/en/articles/10166901-use-google-workspace-connectors): Suchen/Lesen, daneben auch schreibende Gmail-Aktionen; dieser Skill verwendet ausschließlich die Lesewege. Die Hilfe nennt Anhangsmetadaten, nicht Anhangsinhalte.
- [Custom skills erstellen](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills): Skillordner und ZIP-Verteilung.
- [Claude Code Skills](https://code.claude.com/docs/en/skills): projektbezogene `.claude/skills/`-Installation.
- [Claude Cowork](https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork): verfügbare Dateiarbeit hängt von der verwendeten Laufzeit und deren Freigaben ab; nicht jede Sitzung schreibt automatisch in einen lokalen Vault.
