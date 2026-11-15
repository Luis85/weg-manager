---
type: BusinessRule
id: DF-23
status: entwurf
scope: mvp
---

# DF-23 · Externe Bearbeitung ohne stilles Überschreiben

## Regel

Plugin und zugelassene externe Werkzeuge arbeiten auf demselben Notizbestand. Externe gültige Änderungen werden beim Erkennen beziehungsweise erneuten Einlesen berücksichtigt. Eine offene Pluginbearbeitung darf einen zwischenzeitlich geänderten Dateistand nicht blind überschreiben. Eine unvollständige Datei, ungültiges Frontmatter, doppelte ID, beschädigte Beziehung oder unbekannte neuere Schemaversion wird als Problem sichtbar, nicht still als leerer oder korrekter Fachstand behandelt.

Eigene Eingaben und vorhandene Dateiinhalte bleiben bis zur geklärten Übernahme erhalten. Unbekannte Properties und nicht betroffene Notizinhalte werden bewahrt. Abgeleitete Prüfstände werden nach relevanten Änderungen erneut geprüft; ein geänderter Text oder Termin erbt nicht still die frühere Freigabe. Wiederholung und Wiederaufnahme erzeugen keine stillen Dubletten.

Ein Agent mit direktem Schreibrecht muss den Notizvertrag beachten; das Plugin garantiert nicht die Verhinderung beliebiger fremder Dateimanipulation. Eine angegebene Quelle oder Urheberschaft ist keine Authentifizierung und ein Dateischreibvorgang keine menschliche Handlung oder Zustellung.

## Abnahmeanker

Während im Plugin eine Notiz offen ist, ändert der Agent den zugehörigen Termin in der Datei. Das Plugin zeigt den neuen Dateistand und bewahrt die eigene Notiz, statt ihn durch die alte Fassung zu ersetzen. Danach wird eine fehlerhafte YAML-Datei erkannt, ohne den Bestand automatisch zu löschen. Nach Korrektur kann die Bearbeitung ohne doppelte Fachobjekte fortgesetzt werden.

## Bezüge

[[K-14 - Markdown und Frontmatter als offene Datengrundlage]], [[PBI-42 - AI-Agent direkt mit den Notizen arbeiten lassen]], [[PBI-31 - Konflikte ohne Datenverlust klären]], [[DF-07 - Wahl, Entwurf und Versand]], [[DF-13 - Historie und kontrollierte Entfernung]], [[F-21 - Nichtfunktionale Anforderungen]].
