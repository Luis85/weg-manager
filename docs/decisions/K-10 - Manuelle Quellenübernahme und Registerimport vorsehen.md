---
type: Decision
id: K-10
status: im-entwurf
date: 2026-11-15
source: "Intake-Abgleich im Git-Commit b3a1cc2, docs/03-Intake-Abgleich.md"
---

# K-10 · Manuelle Quellenübernahme und Registerimport vorsehen

## Entscheidung

Quellen manuell übernehmen, Registerimport anbieten, keine Pflicht zu Gmail, Claude, MCP oder Casavi.

## Geltung

**Stand der Ausgangsquelle:** Produktdefault; Doppelpflege im Pilot messen. Die Note extrahiert den vorhandenen Konzeptstand und erteilt keine Entwicklungsfreigabe.

## Kontext und Begründung

Der bestehende WCS-Ablauf verwendet bestimmte Dienste. Der fachliche Bedarf ist verlässliche Übernahme mit wenig Doppelpflege, nicht die Bindung an diese Anbieter.

**Herkunft:** Trennung fachlicher Bedarf / bestehende WCS-Technik.

## Abgrenzung und betrachtete Alternative

Eine Pflichtintegration von Gmail, Claude, MCP oder Casavi wird nicht übernommen. Konkrete spätere Integrationen benötigen eigenen Scope.

## Auswirkungen

Vorhandenes Register wird prüfbar importiert; relevante Nachrichten und Originale werden bewusst zugeordnet. Bekannte Quellenlücken dürfen nicht als vollständiger Eingang gelten.

## Offene Punkte und Überprüfung

O-03: Anonymisierten Export beschaffen. O-04: Aufwand manueller Eingangsübernahme im Konzeptreview prüfen und später vollständig messen.

## Verknüpfungen

[[F-02 - Registerbestand übernehmen]], [[F-05 - Quellen und Verlauf zuordnen]], [[F-18 - Integrationen]].

[Produktvision](../01-Produktvision.md) · [MVP-PRD](../02-MVP-PRD.md) · Intake-Abgleich (historische Quelle im Git-Commit `b3a1cc2`, Pfad `docs/03-Intake-Abgleich.md`) · [[Product Backlog.base#Business Rules]].

## Ergänzung durch den Claude-Skill-Eingang

Die neuere Festlegung [[K-16 - Gmail-Eingang im MVP über Claude Skill bereitstellen]] ergänzt im MVP einen optionalen Gmail-Leseweg über den bereits vorhandenen Claude-Connector. Manuelle Erfassung und KI-unabhängige Kernarbeit bleiben erhalten; keine eigene native Google-OAuth-Integration oder automatische Postfachsynchronisation des Plugins wird vorausgesetzt.
