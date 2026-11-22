---
type: BusinessRule
id: DF-06
status: entwurf
scope: mvp
---

# DF-06 · Reaktion und Pause

Empfangsbestätigung, sachliche Antwort, neuer akzeptierter Termin, Teillieferung und Erfüllung sind verschiedene Verlaufseinträge. Neuer Termin beendet aktuelles Terminnachfragen, nicht den Vorgang. Pause hat Grund und Ende; danach erneute Prüfung, keine automatische Mehrfachhochsetzung.

**Abnahmeanker:** Wir kümmern uns ohne Datum ist kein verbindlicher Termin. Späterer Termin erhält Historie; seine Überschreitung erzeugt erneut Prüfbedarf.

**PBIs:** [[PBI-08 - Bearbeitungsstand bewusst ändern]], [[PBI-12 - Verlauf nachvollziehen]], [[PBI-22 - Eskalationen begrenzen oder aussetzen]], [[PBI-23 - Reaktion richtig einordnen]]

## Herkunft und Pflege

Unverändert extrahiert aus der bisherigen Fachregelsammlung des Beirats-MVP (DF-01 bis DF-15). Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`) dokumentiert den Pilotbezug. [[Product Backlog.base#Business Rules]]. Dieser Einzeltext ist künftig die gepflegte Quelle.
