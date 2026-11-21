---
type: Actor
kind: System
id: ACT-11
status: entwurf
scope: mvp
---

# Offizielle Claude-Code-Laufzeit

## Rolle

Die vom Nutzer verwendete offizielle Claude-Code-Laufzeit ist der technische Ausführungspartner des geplanten nativen AI-Chats. Sie verarbeitet Chat-Aufträge und freigegebenen Dateikontext mit ihren tatsächlichen Authentifizierungs-, Tool- und Berechtigungsmechanismen. Die Integration soll die berechtigte Nutzer-Subscription verwenden, nicht vom Plugin vermittelte Zugangsdaten.

## Interaktion

Das Plugin übergibt einen bewusst gewählten Arbeitsbereich und Auftrag über eine unterstützte Schnittstelle, stellt Antworten und tatsächliche Ausführungsereignisse dar und ermöglicht Abbruch beziehungsweise Fortsetzung. Anmeldung erfolgt über den offiziellen Weg. Ein fehlender Client, eine fehlende Sitzung, ein anderer Abrechnungsmodus oder ein Nutzungslimit sind erkennbare Zustände.

## Abgrenzung

[[ACT-09 - AI-Agent mit direktem Dateizugriff]] beschreibt die allgemeine Agentenrolle. ACT-11 konkretisiert die ausgewählte Laufzeit; die Integration ist noch nicht implementiert. Der Nutzer bleibt Auftraggeber, und ein Chattext ist nicht automatisch eine ausgeführte Fachaktion.

Ein sichtbarer Gemeinschaftsfilter ersetzt keine tatsächlich durchgesetzte Dateiberechtigung. Das Plugin darf den Umfang der verfügbaren Werkzeuge nicht als enger behaupten, als ihn Laufzeit und Betriebssystem erlauben. Bereits vorhandene CLI-Authentifizierungsoptionen werden nicht verändert oder entfernt. Kontozugriff und Abo-/API-Abrechnung müssen vor Nutzung des angeforderten Modus geklärt sein.

Connectoren und Skills einer anderen Claude-Umgebung stehen nicht allein durch dieselbe Anmeldung automatisch zur Verfügung.

## Bezüge

[[F-23 - Nativer AI-Chat]], [[PBI-47 - AI-Chat über die eigene Claude-Subscription nutzen]], [[K-17 - Nativer AI-Chat über das Nutzerabo]], [[Integrationsresearch - Nativer AI-Chat mit Claude Code]].
