---
type: PBI
parent: "[[F-18 - Integrationen]]"
order: 71000
actors:
  - "[[docs/design/actors/ACT-01-Beirat]]"
  - "[[docs/design/actors/ACT-10 - Google-Dienste]]"
  - "[[docs/design/actors/ACT-02-Verwaltung]]"
  - "[[docs/design/actors/ACT-03-Eigentuemer]]"
  - "[[docs/design/actors/ACT-04-Vertretung]]"
entities:
  - "[[docs/entities/ENT-01 - Gemeinschaft]]"
  - "[[docs/entities/ENT-02 - Person und Rolle]]"
  - "[[docs/entities/ENT-06 - Verlaufseintrag]]"
  - "[[docs/entities/ENT-07 - Quelle]]"
  - "[[docs/entities/ENT-08 - Dokument]]"
  - "[[docs/entities/ENT-15 - Ausgabestand]]"
business-rules:
  - "[[docs/business-rules/DF-10 - Vertraulichkeitsprüfung]]"
  - "[[docs/business-rules/DF-11 - Sachstand und Bewertung]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-13 - Historie und kontrollierte Entfernung]]"
  - "[[docs/business-rules/DF-22 - Notizen als maßgeblicher Datenbestand]]"
  - "[[docs/business-rules/DF-25 - Gezielte Dokumentfreigabe über externe Dienste]]"
decisions:
  - "[[docs/decisions/K-15 - Google-Dienste für Versand und Dokumentfreigabe anbinden]]"
  - "[[docs/decisions/K-14 - Markdown und Frontmatter als offene Datengrundlage]]"
hypotheses: []
pages: []
user-flows: []
---

# PBI-45 · Ausgewählte Dokumente über Google Drive freigeben

**Planungsstand:** Konzeptentwurf · **Umfang:** Später; keine Releasezuordnung

## User Story

Als Beirat möchte ich ausgewählte Dokumente oder einen geprüften Sachstand über Google Drive für benannte Empfänger bereitstellen, damit ich Informationen kontrolliert verteilen kann und den tatsächlich freigegebenen Stand nachvollziehe.

## Akzeptanzkriterien

1. Vor Upload und Freigabe prüft der Nutzer Gemeinschaft, Konto, Ziel, konkrete Dokumente beziehungsweise Ausgabefassung, Empfänger und vorgesehenes Recht. Private/ungeprüfte Originale und nur indirekt verlinkte Dateien werden nicht vorausgewählt.
2. Bereits der Upload wird als externe Übertragung behandelt. Kein gesamter Vault, keine laufende Vollsynchronisation und keine automatische Übertragung neu gefundener Dateien entstehen aus der Verbindung.
3. Öffentliche Links oder organisationsweite Freigaben sind keine Voreinstellung. Bestehende beziehungsweise geerbte Rechte des Ziels werden berücksichtigt; bei nicht prüfbarem oder weitergehendem Zugriff erfolgt keine irreführende Bestätigung eines eingeschränkten Empfängerkreises.
4. Upload, Zugriffsvergabe, Linkbereitstellung und eine beabsichtigte Benachrichtigung werden getrennt dargestellt. Ein Link allein belegt kein Zugriffsrecht. Für E-Mail-Begleitnachrichten gilt die geprüfte menschliche Versandaktion.
5. Ergebnis und Teilergebnisse bleiben sichtbar: etwa hochgeladen, aber Freigabe fehlgeschlagen. Bei unklarem Ausgang wird vor Wiederholung geprüft, statt still weitere Kopien oder Berechtigungen anzulegen.
6. Externe Dateireferenz, übertragene Fassung und bekannter Empfänger-/Rechtestand sind in den lokalen Fachnotizen nachvollziehbar. Lokale Originale und Kontext bleiben ohne Google verfügbar.
7. Das Trennen der Verbindung wird nicht als Entzug bestehender Empfängerrechte oder Rückholung bereits verteilter Kopien ausgegeben. Ein erforderlicher Rechteentzug ist eine separate bewusst zu prüfende Handlung.

## Herkunft und Abgrenzung

Direkte Integrationsanforderung vom 15.11.2026, festgehalten in [[K-15 - Google-Dienste für Versand und Dokumentfreigabe anbinden]]. Keine tatsächliche Verbindung, kein Versand und kein Upload wurden durch diese Konzeptarbeit ausgeführt. Die heutigen MVP-Ansichten/Flows zeigen den manuellen Weg und werden hier nicht als fertiges Integrationsdesign verlinkt.

## Refinementgrenze

Autorisierung, zulässige Kontoarten, konkrete Berechtigungen, Fehler-/Ergebnisabgleich und technische Plattformintegration vor Umsetzung klären. Die vorhandenen Fachentitäten werden wiederverwendet; zusätzliche technische Dienstmetadaten und Ergebniszustände sind noch auszugestalten.

## Fachliche Abhängigkeiten

[[PBI-43 - Google-Konto für ausgewählte Dienste verbinden]], [[PBI-28 - Empfängerbezogene Ausgabe prüfen]], [[PBI-29 - Sachstand lesbar übergeben]].
