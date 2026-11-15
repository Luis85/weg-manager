---
type: BusinessRule
id: DF-27
status: entwurf
scope: mvp
---

# DF-27 · Abo-Nutzung ohne stillen Abrechnungswechsel

## Regel

Der angeforderte Chatmodus nutzt das berechtigte Nutzerabo über einen unterstützten offiziellen Claude-Code-Weg. API-Key, Console-Guthaben oder ein anderer Provider sind nicht still gleichbedeutend mit diesem Modus. Kann der tatsächlich verwendete Abrechnungsweg nicht festgestellt werden, zeigt das Plugin die Unsicherheit und klärt sie, bevor es einen als Abo-Nutzung bezeichneten Auftrag startet.

Bei Limit, fehlender Anmeldung oder fehlender Berechtigung bleibt der Nutzerauftrag erhalten. Das Plugin lädt keine zusätzlichen Kontingente und wechselt nicht automatisch auf API-Abrechnung. Es gibt keine garantierte unbegrenzte oder kostenfreie Nutzung; vom Nutzer beim Anbieter gewählte Zusatzoptionen bleiben dessen tatsächlicher Kontokonfiguration zugeordnet. Unbekannte Verbrauchswerte werden nicht erfunden.

Offizielle Anmeldung und Runtime-Geheimnisse werden nicht in ein eigenes Plugin-Login oder in Fachnotizen kopiert. Die Integration ändert keine vorhandenen Anmeldeoptionen der offiziellen Laufzeit. Das Plugin muss seinen konkreten Abo-Betriebsweg vor Freigabe nachweisen, nicht nur das Vorhandensein eines bezahlten Kontos.

## Abnahmeanker

Ein Nutzer hat ein Claude-Abo, die ausgewählte Laufzeit verwendet jedoch eine API-Konfiguration. Die Oberfläche zeigt dies und startet nicht still einen als Abo-Nutzung beworbenen kostenpflichtigen API-Auftrag. Bei erreichtem Abolimit bleibt die Eingabe erhalten; kein automatischer Abrechnungswechsel.

## Bezüge

[[PBI-47 - AI-Chat über die eigene Claude-Subscription nutzen]], [[K-17 - Nativer AI-Chat über das Nutzerabo]], [[Integrationsresearch - Nativer AI-Chat mit Claude Code]]. Diese Produktregel ist keine Zusage aktueller oder künftiger Anbieterpreise und keine bereits bestandene Integration.
