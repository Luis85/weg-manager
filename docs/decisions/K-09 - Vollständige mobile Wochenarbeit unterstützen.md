---
type: Decision
id: K-09
status: teilweise-festgelegt
date: 2026-11-15
source: "Intake-Abgleich im Git-Commit b3a1cc2, docs/03-Intake-Abgleich.md"
---

# K-09 · Vollständige mobile Wochenarbeit unterstützen

## Entscheidung

Vollständige mobile Wochenreise und Lagecheck.

## Geltung

**Stand der Ausgangsquelle:** In 1.1 übernommen; Gerät offen. Die Note extrahiert den vorhandenen Konzeptstand und erteilt keine Entwicklungsfreigabe.

## Kontext und Begründung

Der Pilot fordert Wochenarbeit und Lagecheck auf dem Handy. Eine reine Desktopabnahme oder mobile Leseliste deckt dies nicht.

**Herkunft:** P NFR-5; Desktop-only widerspricht Pilotbedarf.

## Abgrenzung und betrachtete Alternative

Die bisherige Desktop-only-Grenze wird im Entwurf aufgehoben; mobile Schreib- und Prüfschritte gehören zur Kernreise.

## Auswirkungen

Lage, Quellen, Entscheidung, Notiz, Entwurfsprüfung und Übergabe müssen auf dem Referenz-Handy funktionieren; Unterbrechungen dürfen keine bestätigten Eingaben verlieren.

## Offene Punkte und Überprüfung

O-02: Referenzgerät, Betriebssystem, Versionen, Gerätewechsel und mobile Leistungsziele vor Entwicklungsfreigabe klären.

## Verknüpfungen

[[F-13 - Mobile Wochenarbeit]].

[Produktvision](../01-Produktvision.md) · [MVP-PRD](../02-MVP-PRD.md) · Intake-Abgleich (historische Quelle im Git-Commit `b3a1cc2`, Pfad `docs/03-Intake-Abgleich.md`) · [[Product Backlog.base#Business Rules]].

## Stand 21.11.2026: Mobile folgt nach dem MVP

Entscheidung des Produktverantwortlichen aus dem Interview vom 21.11.2026: Mobile gehört nicht mehr zum MVP-Umfang. Die vollständige mobile Wochenarbeit bleibt Produktziel und folgt nach dem MVP.

- [[PBI-33 - Wochenarbeit auf dem Handy abschließen]] ist aus dem MVP genommen (keine Releasezuordnung, Umfang „Später“).
- Für den MVP ist kein Referenz-Handy nötig. O-02 entfällt für den MVP in seinem mobilen Teil; Obsidian-Version und Desktop-Messziele bleiben.
- Das Plugin bleibt bis dahin `isDesktopOnly: true`.
- Offen bleibt, wann und mit welchem Referenzgerät der mobile Ausbau beginnt. Die Aussagen oben zur Kernreise auf dem Referenz-Handy gelten erst für diesen Ausbau.
