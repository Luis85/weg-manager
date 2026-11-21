---
type: Feature
parent: "[[E-07 - Cross Cutting Concerns]]"
order: 73000
release: "[[MVP - Beirat Support]]"
---

# F-23 · Nativer AI-Chat

**Planungsstand:** Anforderung aufgenommen; Integrationsweg zu prüfen · **Umfang:** Geplanter MVP-Zusatz, erster Betriebsweg Desktop

## Fähigkeit und Ergebnis

Nutzer führen einen Chat direkt im Plugin, lassen freigegebenen Vaultkontext einbeziehen und können nachvollziehbare Assistenzaufträge erteilen. Die Ausführung soll über die offizielle Claude-Code-Laufzeit mit dem eigenen berechtigten Claude-Abo erfolgen. Ein externer Terminalstart allein erfüllt die native Chatoberfläche nicht.

## User Story

[[PBI-47 - AI-Chat über die eigene Claude-Subscription nutzen]]

## Abgrenzung und offene Voraussetzungen

Die lokale Beirats-Kernreise bleibt ohne Chat, Anmeldung und KI nutzbar. Mobile Kernarbeit wird nicht von einer dort ungeklärten Chat-Runtime abhängig gemacht. Mobile Chatbereitstellung, unterstützte Desktop-/Runtimeversion, Auth-/Abrechnungsfeststellung und Einbettung der Berechtigungsabfragen sind vor Umsetzung zu klären.

[[F-22 - Offene Notizen und direkter Agentenzugriff]] liefert den offenen Dateikontext; [[F-19 - MCP Server]] ist dafür keine Voraussetzung. Keine automatische Übernahme von Connectorzugängen aus einer anderen Claude-Oberfläche.

Es wird keine eigene Abo-Anmeldung, Credential-Weiterleitung oder garantierte unbegrenzte Nutzung entworfen. API-basierte Eigenentwicklung wäre ein anderer Abrechnungsweg und ersetzt die ausdrücklich gewünschte Abo-Nutzung nicht stillschweigend. Der dokumentierte offizielle Integrationsweg und dessen konkrete Zulässigkeit/Funktion müssen vor Freigabe geprüft sein.

## Grundlagen

[[K-17 - Nativer AI-Chat über das Nutzerabo]], [[ACT-11 - Offizielle Claude-Code-Laufzeit]], [[ENT-22 - AI-Gespräch]], [[DF-27 - Abo-Nutzung ohne stillen Abrechnungswechsel]], [[DF-28 - Chatantwort und ausgeführte Fachaktion unterscheiden]], [[Integrationsresearch - Nativer AI-Chat mit Claude Code]]. Noch keine Implementierung, installierte Runtime oder Live-Abrechnungsprüfung.
