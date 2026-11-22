---
type: BusinessRule
id: DF-14
status: entwurf
scope: gemischt
---

# DF-14 · Kennzahlen

Anfrage bis definierte Antwort, Zusage bis Erfüllung und Angebot bis Beschluss sind verschiedene Zeiträume. Einheit, das Paar der Verlaufseinträge und Quelle nennen; fehlende Werte bleiben unbekannt, offene Vorgänge werden nicht als abgeschlossene Fälle gemittelt. Verlaufseinträge im MVP, vertiefte Auswertung später.

**MVP-Abnahmeanker:** Anfrage 01.11., Bestätigung 02.11. und sachliche Antwort 05.11. bleiben getrennte datierte Verlaufseinträge; fehlende Datumswerte bleiben unbekannt. Eine berechnete Auswertung wird im MVP nicht verlangt.

**Späterer Abnahmeanker für PBI-36:** Dieselben Verlaufseinträge ergeben einen Tag bis Bestätigung und vier Tage bis Antwort. 145 Tage Angebot bis Beschluss wird als Durchlaufzeit ausgewiesen.

**PBIs:** [[PBI-12 - Verlauf nachvollziehen]], [[PBI-36 - Abgegrenzte Zeiträume auswerten]]

**Änderung vom 22.11.2026:** Die Antwortzeit gehört ins MVP, wie im WCS. Gemeint sind die Tage von der Anfrage bis zur Antwort und von der Zusage bis zur Erledigung. Sie wird aus den Verlaufseinträgen berechnet, nicht gespeichert, und nur in der Bewertungsschicht angezeigt ([[ENT-16 - Beiratsbewertung]], [[00 - Fachliches Domänenmodell]]). Die übrigen Zeiträume, etwa vom Angebot bis zum Beschluss, bleiben bei [[PBI-36 - Abgegrenzte Zeiträume auswerten]].

## Herkunft und Pflege

Unverändert extrahiert aus der bisherigen Fachregelsammlung des Beirats-MVP (DF-01 bis DF-15). Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`) dokumentiert den Pilotbezug. [[Product Backlog.base#Business Rules]]. Dieser Einzeltext ist künftig die gepflegte Quelle.
