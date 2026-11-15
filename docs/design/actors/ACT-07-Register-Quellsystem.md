---
type: Actor
kind: System
---

# Bestehendes Registersystem

**Einordnung im MVP:** Externe Datenquelle für die Bestandsübernahme.

## Ziel

Den vorhandenen Registerbestand für eine geprüfte Übernahme bereitstellen.

## Interaktion

Stellt über einen vom Nutzer bereitgestellten Export bisherige Registerangaben, Nummern, Gemeinschaftsbezüge und Quellenangaben zur Verfügung. Ein erneuter Export kann zur kontrollierten Wiederübernahme beziehungsweise zum Abgleich dienen.

## Systemgrenze und Einschränkungen

Der Austausch erfolgt über einen bewusst bereitgestellten Export, nicht über eine zugesagte direkte Integration. Google Sheets beschreibt das bestehende Pilotwerkzeug, ist aber keine Pflicht. Die Exportdatei ist ein Datenartefakt, kein Akteur. Kein bidirektionaler Live-Abgleich im MVP.

## Anforderungen

[[docs/requirements/PBI-03 - Registerimport prüfen|PBI-03 · Registerimport prüfen]], [[docs/requirements/PBI-04 - Geprüften Bestand übernehmen|PBI-04 · Geprüften Bestand übernehmen]].

Grundlage: [MVP-PRD 1.1](../../02-MVP-PRD.md) und Intake-Abgleich (historische Quelle im Git-Commit `b3a1cc2`, Pfad `docs/03-Intake-Abgleich.md`).
