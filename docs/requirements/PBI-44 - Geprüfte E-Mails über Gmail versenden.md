---
type: PBI
parent: "[[F-18 - Integrationen]]"
order: 70000
actors:
  - "[[docs/design/actors/ACT-01-Beirat]]"
  - "[[docs/design/actors/ACT-10 - Google-Dienste]]"
  - "[[docs/design/actors/ACT-02-Verwaltung]]"
  - "[[docs/design/actors/ACT-03-Eigentuemer]]"
  - "[[docs/design/actors/ACT-04-Vertretung]]"
entities:
  - "[[docs/design/entities/ENT-01 - Gemeinschaft]]"
  - "[[docs/design/entities/ENT-02 - Ansprechpartner]]"
  - "[[docs/design/entities/ENT-04 - Punkt]]"
  - "[[docs/design/entities/ENT-08 - Dokument]]"
  - "[[docs/design/entities/ENT-10 - Nachrichtenentwurf]]"
  - "[[docs/design/entities/ENT-11 - Versanddokumentation]]"
  - "[[docs/design/entities/ENT-15 - Ausgabestand]]"
business-rules:
  - "[[docs/business-rules/DF-07 - Wahl, Entwurf und Versand]]"
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-11 - Sachstand und Bewertung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-24 - Bestätigter Dienstversand und unklarer Ausgang]]"
decisions:
  - "[[docs/decisions/K-15 - Google-Dienste für Versand und Dokumentfreigabe anbinden]]"
  - "[[docs/decisions/K-14 - Markdown und Frontmatter als offene Datengrundlage]]"
hypotheses: []
pages: []
user-flows: []
---

# PBI-44 · Geprüfte E-Mails über Gmail versenden

**Planungsstand:** Konzeptentwurf · **Umfang:** Später; keine Releasezuordnung

## User Story

Als Beirat möchte ich eine geprüfte Nachricht über mein verbundenes Gmail-Konto ausdrücklich versenden können, damit ich ausgewählte Informationen und Dokumentanhänge ohne manuelles Übertragen an die vorgesehenen Empfänger sende.

## Akzeptanzkriterien

1. Vor der tatsächlichen Versandaktion sind Konto/Absender, Gemeinschaft, sämtliche Empfänger einschließlich gegebenenfalls CC/BCC, Betreff, konkrete Textfassung und alle Anlagen sichtbar und prüfbar. Die Nachricht mischt keine Gemeinschaften.
2. Für Eigentümertexte bleibt die inhaltliche DE/EN-Prüfung bestehen. Ungeprüfte beziehungsweise überholte Fassungen oder geänderte Empfänger/Anlagen benötigen erneute Prüfung; bloßes Vorhandensein zweier Texte reicht nicht.
3. Der Nutzer löst den Versand ausdrücklich aus. Entwurf, Kopieren, Hintergrundprozess oder Agentenbearbeitung lösen keine Nachricht aus. Bewusst ausgewählte Dokumente können als Anhänge übertragen werden; allein verlinkte weitere Originale werden nicht automatisch angehängt.
4. Bestätigter, fehlgeschlagener und unklarer Ausgang werden unterschieden. Bekannte Dienstreferenz, Zeitpunkt, Empfänger und tatsächlich übertragene Fassung bleiben lokal nachvollziehbar. Dienstbestätigung ist keine Zustellungs- oder Lesebestätigung.
5. Bei unklarem Ausgang nach Timeout oder Abbruch wird nicht automatisch erneut versandt. Eine konkrete Prüfung des vorhandenen Ergebnisses beziehungsweise bewusste Nutzerklärung verhindert einen stillen Doppelversand.
6. Nach Trennung oder fehlenden Rechten bleibt der Entwurf erhalten und der bisherige manuelle Kommunikationsweg verfügbar. Eine lokale Korrektur behauptet keinen Rückruf einer Nachricht.

## Herkunft und Abgrenzung

Direkte Integrationsanforderung vom 15.11.2026, festgehalten in [[K-15 - Google-Dienste für Versand und Dokumentfreigabe anbinden]]. Keine tatsächliche Verbindung, kein Versand und kein Upload wurden durch diese Konzeptarbeit ausgeführt. Die heutigen MVP-Ansichten/Flows zeigen den manuellen Weg und werden hier nicht als fertiges Integrationsdesign verlinkt.

## Refinementgrenze

Autorisierung, zulässige Kontoarten, konkrete Berechtigungen, Fehler-/Ergebnisabgleich und technische Plattformintegration vor Umsetzung klären. Die vorhandenen Fachentitäten werden wiederverwendet; zusätzliche technische Dienstmetadaten und Ergebniszustände sind noch auszugestalten.

## Fachliche Abhängigkeiten

[[PBI-43 - Google-Konto für ausgewählte Dienste verbinden]], [[PBI-28 - Empfängerbezogene Ausgabe prüfen]], [[PBI-18 - Nachrichten je Gemeinschaft bündeln]], [[PBI-19 - Eigentümertexte zweisprachig prüfen]].
