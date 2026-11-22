---
type: BusinessRule
id: DF-05
status: entwurf
scope: mvp
---

# DF-05 · Eskalationsleiter und Fristen

Wochenprüfung schlägt vor, sie vollzieht keine Eskalation. Maßgeblich ist ein dokumentierter tatsächlicher Schritt und der kommunizierte Termin. Interner Default: Kalendertage; Datum ohne Uhrzeit bis Tagesende Europe/Berlin, überfällig ab Folgetag. Terminanfrage ohne genannte Antwortfrist wird beim nächsten Wochencheck nach mindestens sieben Kalendertagen seit Versand erneut geprüft. Weitere Vorschlagstermine können 14 Tage (Stufe 2) bzw. zehn Tage (Stufe 3) betragen; der Mensch bestätigt das tatsächlich genannte Datum. Das sind Arbeitsdefaults, keine gesetzlichen Fristen oder Zugangsnachweise. Stufen: Termin erfragen → Antworttermin vorschlagen → förmlich nachfassen → für Bericht/ETV vormerken. Einstieg berücksichtigt vorhandene Historie.

**Abnahmeanker:** Versand 16.11. mit Termin 30.11.: am 23.11. keine nächste Stufe allein wegen Wochenwechsel; nach Tagesende 30.11. bei geprüft ausbleibender Antwort neuer Vorschlag. Ein Entwurf startet keinen Zeitanker.

**PBIs:** [[PBI-20 - Tatsächlichen Versand dokumentieren]], [[PBI-21 - Begründeten Eskalationsschritt prüfen]], [[PBI-22 - Eskalationen begrenzen oder aussetzen]]

## Herkunft und Pflege

Unverändert extrahiert aus der bisherigen Fachregelsammlung des Beirats-MVP (DF-01 bis DF-15). Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`) dokumentiert den Pilotbezug. [[Product Backlog.base#Business Rules]]. Dieser Einzeltext ist künftig die gepflegte Quelle.
