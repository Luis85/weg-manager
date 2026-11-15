---
type: BusinessRule
id: DF-07
status: entwurf
scope: mvp
---

# DF-07 · Wahl, Entwurf und Versand

Bestätigte Wahl mit Notiz bereitet Folgearbeit vor, versendet aber nichts. Versand wird durch ausdrückliche menschliche Dokumentation mit Datum und Fassung erfasst. Kopieren ist kein Versand, Versand keine Zustellung. Geänderte Entscheidungen machen frühere Entwürfe überholt; Wiederholung erzeugt keine Dubletten. DE/EN müssen denselben freigegebenen Inhalt enthalten.

**Abnahmeanker:** Fünf Entscheidungen, drei Entwürfe, eine tatsächlich versandte Nachricht: genau ein Versand, zwei offene Entwürfe. Datumsänderung macht die zweite Sprachfassung prüfbedürftig.

**PBIs:** [[PBI-16 - Wahl mit Kontextnotiz bestätigen]], [[PBI-17 - Folgearbeit aus Entscheidungen vorbereiten]], [[PBI-18 - Nachrichten je Gemeinschaft bündeln]], [[PBI-19 - Eigentümertexte zweisprachig prüfen]], [[PBI-20 - Tatsächlichen Versand dokumentieren]]

## Herkunft und Pflege

Unverändert extrahiert aus der bisherigen Fachregelsammlung des Beirats-MVP (DF-01 bis DF-15). Quellabdeckung (historische Quelle: Git-Commit `b3a1cc2`, `docs/requirements/01-Quellabdeckung.md`) dokumentiert den Pilotbezug. [[Product Backlog.base#Business Rules]]. Dieser Einzeltext ist künftig die gepflegte Quelle.

## Späterer Dienstversand

Die manuelle Erfassung oben beschreibt den ersten MVP-Weg. [[DF-24 - Bestätigter Dienstversand und unklarer Ausgang]] ergänzt für [[PBI-44 - Geprüfte E-Mails über Gmail versenden]] die ausdrücklich ausgelöste Sendung und deren Dienstnachweis. Wahl, Entwurf, Kopieren, Versand und Zustellung bleiben weiterhin verschieden; ein AI-Agent erhält dadurch keine autonome Sendefreigabe.
