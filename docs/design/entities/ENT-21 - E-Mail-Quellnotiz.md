---
type: Entity
id: ENT-21
status: entwurf
scope: mvp
---

# E-Mail-Quellnotiz

## Zweck

Eine einzelne aus Gmail übernommene Nachricht als offen lesbare Quelle im Nutzervault. Die Notiz ist eine Connector-Textkopie mit Metadaten, kein Original-EML-/MIME-Archiv und kein automatisch erzeugter Verwaltungspunkt.

## Identität und Angaben

Die Kombination aus bestätigter Postfachidentität und Gmail-Nachrichten-ID identifiziert die Quelle. Thread-ID und RFC-Message-ID sind ergänzende Referenzen, keine Ersatzidentität. Betreff und Dateiname allein identifizieren keine Nachricht. Unterschiedliche Nachrichten desselben Threads bleiben getrennt; Nachrichten mit gleicher ID in unterschiedlichen Konten ebenfalls.

Das vorliegende Skillformat `weg-manager.gmail-message/v1` verwendet `type: Email`, stabile `id`, `source: gmail`, `account_id`, `gmail_message_id`, optionale Thread-/RFC-ID, Betreff, Absender/Empfänger, bekannte Versand-/Empfangszeit, separate Importzeit, optionale Gemeinschaftszuordnung sowie Text-/Anhangsvollständigkeit. Fehlende Angaben bleiben null. `review_status: unreviewed` bedeutet fachlich ungeprüfter Eingang, keine Zugriffssperre.

## Beziehungen

Spezialisierte Quellart von [[ENT-07 - Quelle]]. Eine spätere bewusste Zuordnung kann [[ENT-04 - Punkt]] oder [[ENT-06 - Ereignis]] mit der Nachricht verbinden. Import legt solche Fachobjekte, Fristen, Bewertungen oder Freigaben nicht automatisch an. Eine Gemeinschaft wird nur bei explizit geklärter Zuordnung gesetzt, sonst bleibt sie offen.

Anhangsmetadaten sind nicht dasselbe wie [[ENT-08 - Dokument]] mit tatsächlich vorhandenem Original. Der erste Skill lädt keine Anhangsinhalte herunter und erzeugt aus einem Dateinamen keine vermeintliche lokale PDF.

## Lebenszyklus und Erhalt

Neu → ungeprüfte Quelle → gegebenenfalls bewusste fachliche Zuordnung. Erneute Abfrage erkennt bestehende Notizen auch nach Umbenennung innerhalb des zugänglichen Vaults und überschreibt keine menschlichen Ergänzungen. Abweichender neuer Quellinhalt beziehungsweise vervollständigter Text wird als Prüfbedarf gemeldet, nicht still über den vorhandenen Stand geschrieben. Unvollständige Nachrichten bleiben ausdrücklich unvollständig.

## Formatvertrag und Quellen

Der tatsächlich ausführbare Writer und sein Formatvertrag liegen im Skill: [E-Mail-Schema](../../../skills/weg-gmail-to-vault/references/email-note-schema.md). Dieses Teilformat konkretisiert die offene Notizgrundlage; andere WEG-Fachobjekte sind dadurch noch nicht vollständig technisch spezifiziert.

[[PBI-46 - Gmail-Nachrichten mit Claude als Vault-Notizen übernehmen]], [[DF-26 - Gmail-Nachrichten eindeutig und quellentreu übernehmen]], [[K-16 - Gmail-Eingang im MVP über Claude Skill bereitstellen]], [[Integrationskonzept - Gmail-Eingang mit Claude Skill]].
