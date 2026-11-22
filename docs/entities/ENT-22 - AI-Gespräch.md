---
type: Entity
id: ENT-22
status: entwurf
scope: mvp
---

# AI-Gespräch

## Zweck und fachliche Angaben

Ein Gespräch im nativen Chat verbindet Nutzerauftrag, Antworten und nachvollziehbare Bearbeitung mit dem freigegebenen Arbeitskontext. Wesentlich sind eine stabile lokale Referenz, sichtbare Laufzeit-/Sitzungsreferenz ohne Geheimnisse, Gemeinschaft beziehungsweise ausdrücklich übergreifender Kontext, ausgewählte Notizbezüge, Nachrichtenrollen und Zeitpunkte, Ausführungsstand und tatsächliche Dateiaktionen.

## Beziehungen und Zustände

Der Kontext verweist auf passende [[ENT-01 - Gemeinschaft]], [[ENT-04 - Vorgang]], [[ENT-07 - Quelle]] oder andere freigegebene Fachnotizen. Das Gespräch selbst ist keine [[ENT-09 - Entscheidungskarte]] und keine [[ENT-11 - Versanddokumentation]]. Eine gespeicherte Antwort ersetzt keinen tatsächlichen Handlungsnachweis.

Bereit, laufend, wartet auf Berechtigung/Bestätigung, abgeschlossen, abgebrochen und fehlgeschlagen müssen unterscheidbar sein; endgültige Schema-/Feldnamen bleiben offen. Ausführungsnachweise nennen betroffene Dateien und bekannten Ausgang. Unvollständige Antwort oder bereits erfolgte Änderung vor einem Abbruch darf nicht als vollständig rückgängig gemacht erscheinen.

## Persistenz und Grenze

Wenn das Plugin Gespräche aufbewahrt, liegen der nachvollziehbare Gesprächsinhalt und relevante Aktionsbezüge als Markdown mit dokumentiertem Frontmatter vor. Ein nur in der Laufzeit vorhandener undokumentierter Verlauf ist keine exklusive Quelle des Plugin-Gesprächs. Technische externe Runtime-Historie kann existieren, wird aber nicht als Ersatz für den offenen lokalen Fachstand ausgegeben.

Tokens, Passwörter und API-Schlüssel gehören nicht in Gesprächsnotizen. Kontextdaten und Antworten können vertraulich sein; sie werden nicht automatisch in Empfängerexporte aufgenommen. Dateinamen, Speicherung, Wiederaufnahme und Löschregeln sind vor Umsetzung auszuarbeiten. Die Note beschreibt ein Konzept, kein bereits implementiertes Chatschema.

## Bezüge

[[PBI-47 - AI-Chat über die eigene Claude-Subscription nutzen]], [[DF-27 - Abo-Nutzung ohne stillen Abrechnungswechsel]], [[DF-28 - Chatantwort und ausgeführte Fachaktion unterscheiden]], [[K-14 - Markdown und Frontmatter als offene Datengrundlage]].
