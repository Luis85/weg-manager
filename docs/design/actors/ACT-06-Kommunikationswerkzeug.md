---
type: Actor
kind: System
---

# Externes Kommunikationswerkzeug

**Einordnung im MVP:** Externes Werkzeug ohne verpflichtende Integration.

## Ziel

Vom Menschen geprüfte Nachrichten über bestehende Kanäle senden und Antworten empfangen.

## Interaktion

Der Beirat übernimmt vorbereitete Texte und ausgewählte Anlagen in sein vorhandenes E-Mail-Werkzeug. Dieses übermittelt Nachrichten nach menschlicher Versandhandlung und nimmt Antworten entgegen. Relevante Inhalte und tatsächlicher Versand werden durch den Beirat im WEG Manager dokumentiert.

## Systemgrenze und Einschränkungen

Kein automatischer Versand oder vollständiger Postfachabgleich durch das Plugin. Eine API-Verbindung ist nicht vorausgesetzt. Gmail ist ein Beispiel aus dem Pilotbetrieb, keine Produktabhängigkeit. Telefonate werden als Gesprächsnotizen erfasst und benötigen keinen eigenen Systemakteur.

## Anforderungen

[[docs/requirements/PBI-11 - Nachricht und Original zuordnen|PBI-11 · Nachricht und Original zuordnen]], [[docs/requirements/PBI-18 - Nachrichten je Gemeinschaft bündeln|PBI-18 · Nachrichten je Gemeinschaft bündeln]], [[docs/requirements/PBI-19 - Eigentümertexte zweisprachig prüfen|PBI-19 · Eigentümertexte zweisprachig prüfen]], [[docs/requirements/PBI-20 - Tatsächlichen Versand dokumentieren|PBI-20 · Tatsächlichen Versand dokumentieren]], [[docs/requirements/PBI-24 - Zwischendurch Dringlichkeit prüfen|PBI-24 · Zwischendurch Dringlichkeit prüfen]].

Grundlage: [MVP-PRD 1.1](../../02-MVP-PRD.md) und Intake-Abgleich (historische Quelle im Git-Commit `b3a1cc2`, Pfad `docs/03-Intake-Abgleich.md`).

## Spätere konkrete Google-Anbindung

[[ACT-10 - Google-Dienste]] beschreibt den zusätzlich angeforderten Integrationsweg über Gmail und Drive. [[PBI-44 - Geprüfte E-Mails über Gmail versenden]] erlaubt dort einen ausdrücklich menschlich ausgelösten Dienstversand. Der oben beschriebene manuelle externe Weg bleibt für den ersten MVP gültig und unabhängig von der Verbindung verfügbar.
