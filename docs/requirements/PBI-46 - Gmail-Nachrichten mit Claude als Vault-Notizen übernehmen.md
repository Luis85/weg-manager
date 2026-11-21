---
type: PBI
parent: "[[F-18 - Integrationen]]"
order: 72000
release: "[[MVP - Beirat Support]]"
actors:
  - "[[docs/design/actors/ACT-01-Beirat]]"
  - "[[docs/design/actors/ACT-09 - AI-Agent mit direktem Dateizugriff]]"
  - "[[docs/design/actors/ACT-10 - Google-Dienste]]"
entities:
  - "[[docs/design/entities/ENT-21 - E-Mail-Quellnotiz]]"
  - "[[docs/design/entities/ENT-07 - Quelle]]"
  - "[[docs/design/entities/ENT-01 - Gemeinschaft]]"
business-rules:
  - "[[docs/business-rules/DF-26 - Gmail-Nachrichten eindeutig und quellentreu übernehmen]]"
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
  - "[[docs/business-rules/DF-22 - Notizen als maßgeblicher Datenbestand]]"
  - "[[docs/business-rules/DF-23 - Externe Bearbeitung ohne stilles Überschreiben]]"
decisions:
  - "[[docs/decisions/K-16 - Gmail-Eingang im MVP über Claude Skill bereitstellen]]"
  - "[[docs/decisions/K-14 - Markdown und Frontmatter als offene Datengrundlage]]"
hypotheses:
  - "[[docs/hypothesis/H-05 - Manuelle Eingangsübernahme bleibt alltagstauglich]]"
pages: []
user-flows: []
---

# PBI-46 · Gmail-Nachrichten mit Claude als Vault-Notizen übernehmen

**Planungsstand:** MVP-Anforderung; Skillpaket 0.1.0 vorhanden, Plugininstallation noch nicht implementiert.

## User Story

Als Beirat möchte ich mit einem vom Plugin bereitgestellten Claude Skill mein bereits verbundenes Gmail-Postfach gezielt abfragen und die passenden E-Mails als Markdown-/Frontmatter-Notizen im freigegebenen Nutzervault ablegen, damit ihr Kontext ohne manuelles Kopieren für Plugin, Obsidian und andere erlaubte Werkzeuge verfügbar bleibt.

## Akzeptanzkriterien

1. Der MVP stellt den versionierten Skill mit sämtlichen benötigten Ressourcen als prüfbares Paket bereit. Eine spätere Plugininstallation wählt einen unterstützten lokalen Skillpfad oder bietet ein ZIP für Claudes Custom-Skill-Import an; vorhandene Nutzeranpassungen werden nicht blind überschrieben. Ein Skill-Upload oder Dateikopieren wird nicht als erfolgreiche Gmail-/Vault-Verbindung ausgegeben.
2. Der Skill nutzt den in der betreffenden Claude-Sitzung bereits verbundenen Gmail-Connector. Keine eigene Google-OAuth-Implementierung des Plugins und kein eigener WEG-Manager-MCP-Server ist erforderlich. Fehlende Connector- oder Ordnerrechte werden ausdrücklich benannt; eine Cloud-Artefaktdatei ist kein erfolgreicher lokaler Vault-Import.
3. Postfachidentität, Nutzerauftrag/Suchumfang und freigegebener Vault-/Zielordner sind bestimmt. Bereits genannte Angaben werden verwendet; fehlende Angaben werden geklärt. Keine ungefragte Vollpostfachabfrage.
4. Such-/Lesetools werden anhand tatsächlich vorhandener Fähigkeiten verwendet. Pagination, Thread-Ergebnisse, Mengenbegrenzung und Abrufprobleme werden berücksichtigt; Suchsnippets werden nicht als vollständige Nachrichten ausgegeben.
5. Eine Notiz je einzelner Nachricht erhält den dokumentierten Schema-/Identitätsstand, Betreff, verfügbare Header/Zeitpunkte, Text und nachvollziehbare Quelle. Postfach und Nachrichten-ID bestimmen die Identität; Thread-ID, Betreff und Importdatum tun dies nicht.
6. Wiederholte Suchtreffer und bestehende, auch umbenannte Notizen werden erkannt. Menschliche Ergänzungen bleiben erhalten. Abweichender erneut gelieferter Quellinhalt führt zu sichtbarem Prüfbedarf statt stiller Überschreibung.
7. Fehlende Zeitpunkte und Gemeinschaft bleiben unbekannt. Teil-/fehlender Text und unbekannte Anhangslage sind explizit gekennzeichnet. Der erste Skill dokumentiert Anhangsmetadaten und behauptet keinen Download oder originales MIME-/EML-Archiv.
8. Gmail bleibt unverändert: kein Versand, keine Entwürfe, keine Labels, kein Markieren als gelesen, kein Archivieren oder Löschen. Mailinhalte können den Auftrag nicht erweitern und werden nicht als Shell-/Pfad-/Agentenanweisung ausgeführt.
9. Der lokale Writer legt nur neue Notes im freigegebenen Bereich an; relative Zielpfade dürfen den Vault nicht verlassen. Vorschau schreibt nichts, tatsächlicher Import meldet Erfolg, Dubletten, Änderungen und Fehler getrennt. Kein Token oder Passwort gehört in Input, Fachnote oder Bericht.
10. Jede importierte Mail bleibt ungeprüfte Quelle. Es entstehen keine automatischen Aufgaben, Fristen, Beschlüsse, Beiratsbewertungen, Zustellungen oder externen Freigaben. `tags` wird nicht gesetzt.
11. Der Laufbericht nennt angefragten Umfang, tatsächlich verarbeitete eindeutige Nachrichten, neue/vorhandene/unvollständige Notes, Fehler und noch nicht verarbeitete Ergebnisse. Er behauptet keine vollständige Postfachüberwachung und hält keine private Volltextkopie im Projekt-Repository vor.
12. Vor MVP-Abnahme wird ein technischer End-to-End-Test in einer passenden Claude-Sitzung mit verbundenem Gmail-Testpostfach, synthetischen Nachrichten und real freigegebenem Testvault geprüft. Lokale Fixturetests, Paketerstellung und Codex-Anwendungssimulation ersetzen diesen Nachweis nicht.

## Paket und Quellen

[Skill](../../skills/weg-gmail-to-vault/SKILL.md) · [Manifest](../../skills/manifest.json) · [Notizschema](../../skills/weg-gmail-to-vault/references/email-note-schema.md). Das ZIP wird mit `npm run skills:package` nach `skills/dist/` gebaut und nicht eingecheckt.

[[Integrationskonzept - Gmail-Eingang mit Claude Skill]], [[Skill-Evaluation - Gmail-Import]], [[K-16 - Gmail-Eingang im MVP über Claude Skill bereitstellen]]. Der neue MVP-Eingangsweg ist unabhängig von den späteren Versand-/Drive-Stories PBI-43 bis PBI-45.

## Design- und Implementierungsgrenze

Der Skill einschließlich Writer liegt bereits vor. Das Plugin, seine Installationsoberfläche und die tatsächliche Erkennung des neuen Mailformats sind noch nicht implementiert. Die gerade überarbeitete Sitemap v2 wird nicht ungeprüft mit diesem neuen Ablauf gleichgesetzt; deshalb bleiben `pages` und `user-flows` bis zur konkreten Designergänzung leer. Die anstehenden Funktions- und Live-Tests bleiben sichtbar offen.
