---
type: Entity
id: ENT-17
status: entwurf
scope: spaeter
category: bewegungsdaten
wcs: keine
date: 2026-11-22
---

# ENT-17 · Produktfeedback

## Zweck

Eine konkrete Beobachtung zur Produktnutzung mit erwarteter Wirkung und nachvollziehbarer späterer Überprüfung. Das WCS führt kein Feedbackobjekt; Feedback an den Entwickler steht dort als Freitext in `Übergabe.notiz`.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `product-feedback-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. |
| Schema | `schema` | Text | P | `weg-manager.product-feedback/v1` (vorgeschlagen). |
| Betroffener Ablauf | `flow` | Text | P | Etwa Wochenarbeit, Lagecheck, Einrichtung. |
| Beobachtung | `observation` | Text | P | Was geschah. |
| Erwartung | `expectation` | Text | P | Was erwartet wurde. |
| Auswirkung | `impact` | Text | O | Auswirkung auf die Arbeit. |
| Externer Verweis | `external_ref` | Text | O | Prüfbarer Bericht oder Issue-Link. Ersetzt nicht Beobachtung und Erwartung. |
| Produktversion | `version` | Text | O | Bezug zur Version, in der beobachtet wurde. |
| Erneute Beurteilung | `reassessment` | Text | O | Ergebnis nach einer späteren Verbesserung. |
| Herkunft | `handover_id` | Text | O | Übergabe, aus deren Notiz das Feedback stammt ([[ENT-14 - Übergabe]]). |

**Abbildung auf das WCS:** Feedback an den Entwickler = Teil von `Übergabe.notiz`.

## Beziehungen

Der berichtende Pilot ist ein Akteur, kein neuer Kontakt einer WEG allein aufgrund seines Feedbacks. Eine Beobachtung kann sich auf konkrete Fachsituationen beziehen, muss aber ohne unnötige private Akteninhalte weitergegeben werden.

[[ENT-14 - Übergabe]].

## Regeln und Lebenszyklus

- Bericht und externe Meldung bleiben getrennt: Link oder Kopiertext genügt, kein automatisches Issue ([[DF-16 - Produktfeedback und externe Meldung]]).
- Vor externer Weitergabe werden Inhalte geprüft.
- Die spätere Verbesserung und erneute Beurteilung bleiben der ursprünglichen Beobachtung zuordenbar.
- Eine Rückmeldung ist weder automatisch ein Fehlernachweis noch eine bestätigte Behebung.

## Datenschutz

Feedback verlässt den Vault. Es enthält keine Daten anderer Eigentümer, keine Bewertungen und keine Namen. Beispiele werden durch neutrale ersetzt.

## Abweichungen vom WCS

Das WCS kennt kein Feedbackobjekt. Die Note bleibt als unsere Ergänzung eigenständig, weil sie Prüfung vor Weitergabe und erneute Beurteilung trägt. Sie gehört zum späteren Ausbau und erweitert nicht den aktuellen MVP.

## Offene Punkte

- **O-ENT17-1:** Konkreter Feedbackkanal und Statusworkflow sind offen.
- **O-ENT17-2:** Bleibt Feedback im MVP Freitext in der Übergabe (WCS-Form), bis dieses Objekt gebaut wird?
- **O-ENT17-3:** Technische Speicherung und endgültiger Umfang bleiben offen.

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7): `Übergabe.notiz`, FR-W8. PBI-37; Pilot-PRD Abschnitt 10 und US-16, zusammengefasst in der Quellabdeckung; PRD 1.0 als historische Quelle (Git-Commit `b3a1cc2`, Pfad `docs/history/02-MVP-PRD-v1.0.md`). Unser [MVP-PRD](../02-MVP-PRD.md): Abschnitt Veröffentlichung und Pilot. Regel: [[DF-16 - Produktfeedback und externe Meldung]].

[[PBI-37 - Konkretes Produktfeedback nachverfolgen]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
