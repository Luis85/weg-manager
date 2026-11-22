---
type: Entity
id: ENT-15
status: entwurf
scope: mvp
category: bewegungsdaten
wcs: keine
date: 2026-11-22
---

# ENT-15 · Ausgabestand

## Zweck

Die geprüfte Zusammenstellung der für einen bestimmten Empfängerkontext ausgewählten Sachinformationen und Anlagen. Das WCS führt keinen Ausgabestand. Es kennt Berichte als Ziel der Eskalationsstufe 4 und die Regel, dass Bewertungen und Eigentümerdaten nie in Berichte gelangen.

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `output-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. |
| Schema | `schema` | Text | P | `weg-manager.output/v1` (vorgeschlagen). |
| Empfängerkontext | `recipient_ids` | Liste | P | Für wen die Ausgabe ist, etwa Vertretung oder Verwaltung ([[ENT-02 - Person und Rolle]]). |
| Gemeinschaft | `community_id` | Text | P | Genau eine Gemeinschaft. |
| Standdatum | `as_of` | Datum | P | Stand der Inhalte. |
| Zweck | `purpose` | Text | P | Externe Sachstandsausgabe oder interne Vertretungsübergabe. |
| Ausgewählte Inhalte | `matter_ids` | Liste | P | Bewusst ausgewählte Vorgänge und Abschnitte. |
| Anlagen | `attachments` | Liste | O | Bewusst ausgewählte Dokumente und Quellen. |
| Fehlende Bestandteile | – | Liste | A | Verlinkte, aber nicht ausgewählte oder nicht geprüfte Teile. Berechnet. |
| Geprüfte Fassung | `reviewed` | Checkbox | P | Vorschau und Ausgabe beziehen sich auf denselben geprüften Stand. |

**Abbildung auf das WCS:** Kein eigenes Feld. Inhalte stammen aus Vorgang (`zusage`, `status`, `naechsterSchritt`), Verlauf und Ablage. Die Vormerkungen der Eskalationsstufe 4 und spätere Stellungnahmen ([[ENT-34 - Prüfvorgang]]) sind mögliche Inhalte.

## Wertelisten

**Zweck (geschlossen, Vorschlag):** Sachstandsausgabe (`status_report`), Vertretungsübergabe (`deputy_handover`).

## Beziehungen

Verbindet die bewusst ausgewählten Inhalte für einen Empfänger. Interne Vertretungsübergabe ist eine mögliche Verwendung. Später können Quartalsüberblick, Versammlungsvorlage und Stellungnahme denselben Mechanismus nutzen.

[[ENT-01 - Gemeinschaft]], [[ENT-02 - Person und Rolle]], [[ENT-04 - Vorgang]], [[ENT-07 - Quelle]], [[ENT-08 - Dokument]], [[ENT-10 - Nachrichtenentwurf]], [[ENT-13 - Eskalation]], [[ENT-14 - Übergabe]], [[ENT-16 - Beiratsbewertung]], [[ENT-34 - Prüfvorgang]].

## Regeln und Lebenszyklus

- Interne Bewertungen und ungeprüfte Unterlagen werden nicht automatisch übernommen ([[DF-11 - Sachstand und Bewertung]]).
- Nur verlinkte, nicht ausgewählte Anlagen fehlen bewusst; keine transitive Mitnahme ([[DF-10 - Vertraulichkeitsprüfung]]).
- Die Ausgabe bleibt ohne Plugin oder KI lesbar.
- Vollständige Datensicherung ist ein anderer Ablauf.
- Ein erzeugter Ausgabestand ist keine dokumentierte tatsächliche Weitergabe und keine Benutzerberechtigung.

## Datenschutz

Die Ausgabe enthält nie Daten anderer Eigentümer und nie Inhalte der Bewertungsschicht ohne bewusste Prüfung. Eine Vertretung darf Bewertungen sehen; die Verwaltung nicht (WCS FR-ROL1).

## Abweichungen vom WCS

Das WCS kennt keinen Ausgabestand. Die Note bleibt als unsere Ergänzung eigenständig, weil sie die Auswahl- und Prüfregeln für jede Weitergabe trägt.

## Offene Punkte

- **O-ENT15-1:** Genaues Dateiformat und Speicherung der Auswahl sind offen.
- **O-ENT15-2:** Darf eine Vertretungsübergabe Inhalte der Bewertungsschicht enthalten, weil die Vertretung sie sehen darf? Vorschlag: ja, nach bewusster Auswahl.
- **O-ENT15-3:** Nutzen spätere Berichte (Quartal, ETV, Stellungnahme) dieses Objekt oder ein eigenes?

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7): Datenschutzregel, Bewertungsschicht FR-ROL1, NFR-2, FR-E4, Eskalationsstufe 4. Unser [MVP-PRD](../02-MVP-PRD.md): B-FR-11, AT-B11. Regeln: [[DF-10 - Vertraulichkeitsprüfung]], [[DF-11 - Sachstand und Bewertung]], [[DF-12 - Gemeinschaftstrennung]]. Entscheidungen: [[K-07 - Sachstand gezielt teilen und Bewertungen intern halten]], [[K-08 - Vertretung zunächst durch lesbare Übergabe unterstützen]].

[[PBI-28 - Empfängerbezogene Ausgabe prüfen]], [[PBI-29 - Sachstand lesbar übergeben]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
