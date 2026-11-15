---
type: Actor
kind: System
id: ACT-10
status: entwurf
scope: gemischt
---

# Google-Dienste

## Rolle und Interaktion

Im MVP liefert Gmail über den bereits eingerichteten Claude-Connector Such-/Lesedaten für [[PBI-46 - Gmail-Nachrichten mit Claude als Vault-Notizen übernehmen]]. Dieser begrenzte Eingang ändert das Postfach nicht und benötigt keine eigene Google-Anmeldung des Plugins.

Externer Diensteverbund für die optionale Integration: Gmail nimmt einen ausdrücklich bestätigten Versandauftrag für das ausgewählte Konto entgegen; Google Drive speichert bewusst ausgewählte Dokumentkopien beziehungsweise Ausgabestände und verwaltet deren Freigabe. Die konkrete Dienstberechtigung wird bei der Kontoverbindung festgelegt.

Der Akteur ist weder der menschliche Absender noch ein eigener AI-Agent. Die Verbindung erlaubt nur den autorisierten Funktionsumfang. Konto, Gemeinschaft, Empfänger, Inhalt und tatsächlicher Ergebnisstand müssen unterscheidbar bleiben.

## Grenzen

Kein verpflichtender Google-Zugang für den lokalen Kern und keine automatische Übertragung des gesamten Vaults. Ein Dienstauftrag ist kein Nachweis einer Zustellung oder eines tatsächlichen Lesens. Eine getrennte Verbindung nimmt bereits versandte E-Mails oder heruntergeladene Dokumentkopien nicht zurück. Bestehende beziehungsweise geerbte Drive-Rechte müssen bei der Freigabe berücksichtigt werden.

[[ACT-06-Kommunikationswerkzeug]] bleibt die generische externe Kommunikationsrolle im heutigen MVP. ACT-10 beschreibt die konkret angeforderte spätere Anbindung; es ist kein bereits implementierter Connector. Gmail, Drive und gegebenenfalls weitere Google-Dienste erhalten bei technischem Refinement klare getrennte Berechtigungs- und Fehlerpfade.

## Anforderungen und Entscheidung

[[PBI-43 - Google-Konto für ausgewählte Dienste verbinden]], [[PBI-44 - Geprüfte E-Mails über Gmail versenden]], [[PBI-45 - Ausgewählte Dokumente über Google Drive freigeben]], [[F-18 - Integrationen]], [[K-15 - Google-Dienste für Versand und Dokumentfreigabe anbinden]].

## MVP-Eingang

[[PBI-46 - Gmail-Nachrichten mit Claude als Vault-Notizen übernehmen]], [[K-16 - Gmail-Eingang im MVP über Claude Skill bereitstellen]] und [[DF-26 - Gmail-Nachrichten eindeutig und quellentreu übernehmen]] grenzen den read-only Skillweg von den späteren schreibenden Google-Integrationen ab. Ein Connector kann schreibende Tools anbieten; dieser Skill verwendet sie nicht.
