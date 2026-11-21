---
type: Research
status: geprueft-mit-synthetischen-daten
scope: mvp
date: 2026-11-15
---

# Skill-Evaluation · Gmail-Import

Geprüft ist [weg-gmail-to-vault](../../skills/weg-gmail-to-vault/SKILL.md) Version 0.1.0. **Kein Live-Claude-/Gmail-Test, kein Zugriff auf echte Konten, keine echten Mails importiert.** Die Anwendungssimulation wurde durch einen Codex-Subagenten mit synthetischen Connector-Fixtures in einem isolierten OS-Tempvault durchgeführt.

## Baseline vor dem Skill

Ein frischer Agent erhielt drei synthetische Suchtreffer und eine bestehende umbenannte Mailnotiz, aber keine Skill-/Schemaanleitung. Er erhielt vorhandene Daten korrekt, unterschied Nachrichten desselben Threads und behandelte die eingebettete Weiterleitungsaufforderung als fremden Inhalt. Es wurde kein Sicherheitsversagen behauptet.

Sein vorgeschlagener Output hatte jedoch kein gemeinsames `type`-/Schemaversionsfeld, keinen stabilen paketdefinierten Identitäts-/Quellhash und verwendete den eigenen Status `snippet_only`. Die Datei hieß nur `gmail-m-18.md`. Die nachgewiesene Lücke war damit ein fehlender interoperabler Ausgabe-/Wiederholungsvertrag, nicht pauschales Unvermögen zum sicheren Mailimport. Der Skill ergänzt genau diesen Vertrag sowie einen geprüften Writer.

## Deterministische Tests

[Testdateien](../../skills/tests/test_gmail_to_vault.py) prüfen den lokalen Writer; [Pakettests](../../skills/tests/test_skill_package.py) prüfen Struktur, Prüfsumme und Reproduzierbarkeit. Die Tests wurden zuerst ohne Implementierung ausgeführt und scheiterten am fehlenden Modul. Die folgenden Implementierungs- und Regressionstests decken beobachtete Format-/Dateisystemfälle ab.

**26 Tests bestanden:** 24 Writer-Tests und zwei Pakettests. Ein zusätzlicher Symlink-Test wurde auf diesem System übersprungen, weil das Anlegen eines Symlinks nicht erlaubt war; daraus wird kein bestandener Plattformtest abgeleitet. Geprüft wurden unter anderem Vorschau ohne Schreibzugriff, Ausgabeformat, Konto-/Nachrichtenidentität, gleiche Threads, wiederholte Suchseiten, umbenannte vorhandene Notes, alte Identitätsfelder, YAML-Kommentare/quotierte Feldnamen, fehlende Daten, Teiltext, abweichender neuer Quellinhalt, untrusted Text, Pfadgrenzen, vorhandene Zielkollision, beschädigtes Frontmatter, unabhängige Behandlung fehlerhafter Datensätze und keine Anhangsdownloadbehauptung.

Reale gefundene und behobene Fehler: Hardlink-Erzeugung wurde vom Windows-Testdateisystem nicht unterstützt; Windows verwendet nun den nicht überschreibenden Rename-Pfad. Ein zunächst zu enger Metadatenparser erkannte den Hash-Feldnamen mit Ziffern und später kommentierte/quotierte Identitätsfelder nicht korrekt; entsprechende Regressionstests bestanden nach Korrektur.

Die Tests liefen mit Python 3.14 auf dem bereitgestellten Windows-System. POSIX-Installation, andere Dateisysteme, echte Parallelimporte, tatsächliche Connectorpagination und konkrete Claude-Laufzeiten sind damit nicht pauschal abgenommen. Unterstützte Dateibearbeitung vermeidet gleichzeitige Importläufe; das Skript ist kein allgemeiner Syncdienst.

## Anwendung mit Skill

Szenario: m-17 liegt bereits umbenannt mit eigener Nutzernotiz vor; eine weitere Suchseite liefert m-17 nochmals. m-18 gehört zu demselben Thread, hat unbekannte Empfangszeit und nur einen Auszug. Gemeinschaft und Anhangslage von m-18 sind unbekannt. Der Subagent las Skill und Referenzen und führte den mitgelieferten Writer in einem Tempvault aus.

| Lauf | Tatsächliches Ergebnis |
| --- | --- |
| Vorschau | existing 1, duplicate_in_batch 1, would_create 1; keine Datei angelegt. |
| Import | existing 1, duplicate_in_batch 1, created 1; vorhandene Nutzernotiz byteidentisch erhalten. |
| Wiederholung | existing 2, duplicate_in_batch 1; keine neue Note und keine geänderten Dateibytes. |

13 zusätzliche Dateiprüfungen im Anwendungsszenario bestanden. Die neue m-18-Note hatte `type: Email`, Schema v1, kontoabhängige ID, `body_status: partial`, unbekannte Zeit-/Gemeinschaftswerte als null und `attachment_content_status: unknown`. Alle drei Writer-Aufrufe endeten mit Exitcode 0. Die bereits vorhandene m-17-Note hatte keinen Inhaltshash; ihre Identität wurde erkannt, aber ihre Vollständigkeit nicht behauptet.

Die Baseline-/Anwendungssimulation belegt kein Ausführen dieses Skills durch das tatsächliche Claude-Modell. Der gedankliche Capability-Fall „Gmail vorhanden, aber kein Vaultmount“ wurde anhand der Skillanweisungen geprüft: keine erfolgreiche lokale Speicherung behaupten; manuellen Artefaktweg separat benennen. Er wurde nicht in einer echten Cloud-Claude-Sitzung ausgeführt.

## Paketprüfung und offene Freigabe

Der offizielle lokale Skill-Creator-Validator meldete „Skill is valid“. Die dafür benötigte YAML-Bibliothek wurde nur in einem temporären Validierungsverzeichnis verwendet; das verteilte Writerpaket benötigt ausschließlich Python-Standardbibliothek. ZIP und Manifest werden reproduzierbar gebaut und enthalten weder Testdaten noch Zugangsdaten.

Vor der Abnahme von [[PBI-46 - Gmail-Nachrichten mit Claude als Vault-Notizen übernehmen]] sind noch ein technischer End-to-End-Test mit tatsächlichem Claude-Gmail-Connector und freigegebenem Testvault sowie die spätere Plugininstallation nachzuweisen. Hier wird weder ein bestehender Plugininstaller noch bestandene Liveintegration behauptet.

Zusätzlich wurde das finale ZIP in einen isolierten Tempordner entpackt: Manifest-Prüfsumme und Paketversion verglichen, der enthaltene Writer über seine CLI in Vorschau/Import/Wiederholung ausgeführt und das erzeugte Frontmatter mit einem YAML-Parser gelesen. Ergebnis: Vorschau ohne Datei, ein Import, beim zweiten Import nur vorhandene Note; alle Prüfungen bestanden. Das ist ein lokaler Paket-Smoke-Test, weiterhin kein Live-Claude-/Gmail-Nachweis.
