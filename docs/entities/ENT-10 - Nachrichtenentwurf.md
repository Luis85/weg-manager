---
type: Entity
id: ENT-10
status: entwurf
scope: mvp
category: bewegungsdaten
wcs: keine
date: 2026-11-22
---

# ENT-10 · Nachrichtenentwurf

## Zweck

Die prüfbare Fassung einer vorgesehenen externen Nachricht. Das WCS führt den Entwurf nicht als eigenes Objekt, sondern als Felder: `Entscheidungskarte.entwurf`, `ToDo.entwurfUrl` und `ToDo.kopiertext`. Vorbereitete Entwürfe eines Laufs sind außerdem eine Art der [[ENT-33 - Vorbereitete Aktion]].

## Felder

| Feld | Schlüssel | Typ | Pflicht | Bedeutung und Regel |
| --- | --- | --- | --- | --- |
| Technische Identität | `id` | Text | P | `message-draft-<uuid>` nach [[docs/adr/0007-vault-data-access.md\|ADR 0007]]. |
| Schema | `schema` | Text | P | `weg-manager.message-draft/v1` (vorgeschlagen). |
| Gemeinschaft | `community_id` | Text | P | Genau eine Gemeinschaft. |
| Anlass | `decision_card_id`, `matter_ids` | Text, Liste | O | Bezug zur Entscheidungskarte und ihrer Wahl und Notiz, zu den Vorgängen. |
| Empfänger | `recipient_ids` | Liste | P | Personen mit Rolle oder ein Verteiler ([[ENT-02 - Person und Rolle]]). |
| Absender | `sender` | Text | O | Absenderadresse, je Gemeinschaft vorbelegt (etwa die Beirats-Adresse). Nur eine Vorgabe für den Menschen, der sendet. |
| Text | Body | Text | P | WCS `entwurf` beziehungsweise `kopiertext`. |
| Sprache | `language` | Text | P | `de` oder `de+en`. Eigentümertexte immer `de+en`. |
| Zusammengehörige Fassung | `translation_of_id` | Text | O | Verknüpft DE- und EN-Fassung. |
| Anlagen | `attachments` | Liste | O | Bewusst ausgewählte Dokumente ([[ENT-08 - Dokument]]). |
| Fassung | `revision` | Zahl | O | Zählt geprüfte Fassungen. |
| Prüfstand | `review_state` | Text | P | Siehe Wertelisten. |
| Entwurf im Postfach | `message_ref` | Text | O | WCS `entwurfUrl`, neutral: Verweis auf einen Entwurf, den der Mensch in seinem Postfach angelegt hat. |

**Abbildung auf das WCS:** Entwurf zur Empfehlung = `Entscheidungskarte.entwurf`; Entwurf zum Senden durch den Menschen = `ToDo.entwurfUrl` oder `ToDo.kopiertext`. Ein To-do „senden“ verweist bei uns auf den Nachrichtenentwurf.

## Wertelisten

**Prüfstand (geschlossen, Vorschlag):** ungeprüft (`unreviewed`), geprüft (`reviewed`), erneut zu prüfen (`needs_review`), überholt (`superseded`).

## Beziehungen

Bündelt passende Anliegen derselben Gemeinschaft. Unterschiedliche Empfänger, Themenstränge oder Dringlichkeit können getrennte Entwürfe erfordern. Die tatsächlich versandte Fassung wird gesondert dokumentiert. Ein To-do führt den menschlichen Versand.

[[ENT-01 - Gemeinschaft]], [[ENT-02 - Person und Rolle]], [[ENT-04 - Vorgang]], [[ENT-08 - Dokument]], [[ENT-09 - Entscheidungskarte]], [[ENT-11 - Versanddokumentation]], [[ENT-12 - To-do]], [[ENT-15 - Ausgabestand]], [[ENT-33 - Vorbereitete Aktion]].

## Regeln und Lebenszyklus

- Erzeugen, Bestätigen oder Kopieren ist kein Versand ([[DF-07 - Wahl, Entwurf und Versand]]).
- Senden bleibt immer dem Menschen vorbehalten, auch wenn ein Agent den Entwurf vorbereitet ([[K-20 - WCS-Datenmodell als fachliche Grundlage]]).
- Texte und Anlagen bleiben menschlich prüfbar.
- Eigentümertexte enthalten in DE und EN denselben freigegebenen Sachstand. Eine relevante Änderung macht die andere Sprachfassung erneut prüfbedürftig.
- Eine geänderte Entscheidung macht den Entwurf prüfbedürftig.

## Datenschutz

Entwürfe enthalten nie Daten anderer Eigentümer und nie Inhalte der Bewertungsschicht ohne bewusste Prüfung ([[DF-10 - Vertraulichkeitsprüfung]], WCS NFR-2, FR-E4).

## Abweichungen vom WCS

- Neutrale Postfachreferenz statt Bindung an einen bestimmten Mail-Dienst.
- Das WCS kennt keinen eigenen Entwurf. Die Note bleibt als unsere Ergänzung eigenständig, weil sie Empfänger, Sprachfassungen, Anlagen und Prüfstand trägt.
- Eine technische Mail- oder Übersetzungsintegration ist nicht vorausgesetzt. Der Entwurf ist kein Versanddienst.

## Befund aus dem IST-Ablauf

Laut [[Research - IST-Ablauf des Pilot-Beirats (Storymap)]] ist der Schritt von der bestätigten Wahl zum Versand der größte Engpass. Der Pilot stellt heute bei jedem Entwurf den Absender von Hand auf die Beirats-Adresse um. Es entsteht je Gemeinschaft und Empfänger ein Entwurf, Eigentümer-Infos auf Deutsch und Englisch. Das stützt die Felder Absender, Empfänger und Sprache und die Bündelung je Gemeinschaft.

## Offene Punkte

- **O-ENT10-1:** Eigene Note oder Textfelder an Karte und To-do (WCS-Form)? Bei mehreren Empfängern und zwei Sprachen spricht viel für eine eigene Note.
- **O-ENT10-2:** Zusammenführung mit [[ENT-33 - Vorbereitete Aktion]] der Art „Entwurf“?

## Herkunft und Anforderungen

WCS-Data-Dictionary vom 22.11.2026 (PRD 0.2 Abschnitt 7): `Entscheidungskarte.entwurf`, `ToDo.entwurfUrl`, `ToDo.kopiertext`, FR-W10, FR-W12, NFR-1. Unser [MVP-PRD](../02-MVP-PRD.md): B-FR-07, B-FR-08, AT-B08. Regeln: [[DF-07 - Wahl, Entwurf und Versand]], [[DF-10 - Vertraulichkeitsprüfung]], [[DF-12 - Gemeinschaftstrennung]].

[[PBI-17 - Folgearbeit aus Entscheidungen vorbereiten]], [[PBI-18 - Nachrichten je Gemeinschaft bündeln]], [[PBI-19 - Eigentümertexte zweisprachig prüfen]], [[PBI-20 - Tatsächlichen Versand dokumentieren]].

[[00 - Fachliches Domänenmodell]] · [[Product Backlog.base#Design Foundations|Entitätsnotes]]
