---
type: PBI
parent: "[[F-01 - Gemeinschaften und Ansprechpartner]]"
order: 102000
actors:
  - "[[ACT-01-Beirat]]"
release: "[[MVP - Beirat Support]]"
status: ""
started: ""
finished: ""
horizon: ""
start: ""
due: ""
risk: ""
priority: ""
assignee: ""
iteration: ""
entities:
  - "[[docs/design/entities/ENT-01 - Gemeinschaft]]"
business-rules:
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
  - "[[docs/business-rules/DF-22 - Notizen als maßgeblicher Datenbestand]]"
decisions:
  - "[[docs/decisions/K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]]"
hypotheses:
  - "[[docs/hypothesis/H-13 - Einrichtung führt in wenigen Minuten zum ersten Punkt]]"
pages:
  - "[[docs/design/sitemap/VIEW-07 - Einstellungen und Einrichtung]]"
  - "[[docs/design/sitemap/VIEW-09 - Einrichtung]]"
user-flows: []
dependsOn:
  - "[[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]]"
triage: ""
---

# PBI-73 · Kürzel einer Gemeinschaft nachträglich ändern

**Planungsstand:** Entscheidung des Produktverantwortlichen vom 22.11.2026 · **Umfang:** MVP

## User Story

Als Beirat möchte ich das Kürzel einer Gemeinschaft später ändern können, damit ich es bei der Einrichtung nicht endgültig festlegen muss und ein unpassendes Kürzel korrigieren kann.

## Ausgangslage

Seit [[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]] ist das Kürzel nach dem Anlegen fest; das Formular zeigt es schreibgeschützt. Grund war, dass das Kürzel als unterscheidbare Referenz dient. Verweise zwischen Notizen laufen aber über die stabile `id` ([[docs/adr/0007-vault-data-access.md|ADR 0007]]), nicht über das Kürzel. Der Produktverantwortliche hat am 22.11.2026 entschieden, dass das Kürzel änderbar wird, damit ein Neuling im Einrichtungsassistenten nichts Unumkehrbares entscheidet ([[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]]).

## Akzeptanzkriterien

1. Im Formular einer bestehenden Gemeinschaft ist das Kürzel bearbeitbar, mit denselben Regeln wie beim Anlegen: 2 bis 5 Zeichen aus A–Z und Ziffern, gespeichert in Großbuchstaben, unter den Gemeinschaften eindeutig.
2. Nach dem Speichern zeigen alle offenen Ansichten das neue Kürzel, auch Gemeinschaftswechsel und Badges. Die Auswahl der Gemeinschaft bleibt erhalten, weil sie an der `id` hängt.
3. Andere Notizen werden nicht umgeschrieben. Notizen, die auf die Gemeinschaft verweisen, tun das über `community_id`; ein geändertes Kürzel bricht keinen Verweis.
4. Der Hinweis „Kann später nicht geändert werden“ entfällt in Formular und Einrichtung.
5. Ein vergebenes Kürzel zeigt den Fehler `short-code.duplicate` am Feld mit Ursache und Ausweg, in beiden Katalogen.
6. Eine extern geänderte Gemeinschaft wird wie bei den übrigen Feldern je Feld zusammengeführt (Kriterium 8 von [[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]]).

## Herkunft und Bezüge

Revidiert die Festlegung „nach dem Anlegen nicht änderbar“ aus den Kommentaren von [[PBI-01 - Gemeinschaftskontext wählen]] (21.11.2026) und Kriterium 3 von [[PBI-56 - Gemeinschaften als Notizen anlegen, bearbeiten und wechseln]]. Voraussetzung für [[PBI-70 - Gemeinschaften im Einrichtungsassistenten anlegen]]. Dateivertrag: `docs/contracts/DV-01 - Gemeinschaft v1.md`.

## Kommentare
