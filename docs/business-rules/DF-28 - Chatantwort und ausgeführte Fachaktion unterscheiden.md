---
type: BusinessRule
id: DF-28
status: entwurf
scope: mvp
---

# DF-28 · Chatantwort und ausgeführte Fachaktion unterscheiden

## Regel

Eine Chatantwort kann eine Erklärung oder einen Vorschlag enthalten; sie ändert dadurch nicht automatisch den fachlichen Stand. Führt die freigegebene Laufzeit tatsächlich Dateiaktionen aus, werden betroffene Notizen und bekannte Ergebnisse gesondert nachvollziehbar. Ein bloßer Modelltext „erledigt“ ist kein Ausführungsnachweis.

Werkzeugrechte und Nutzerauftrag bestimmen die erlaubte Bearbeitung. Fremde Notizinhalte und importierte E-Mails erweitern diese Erlaubnis nicht. Handlungsgrundlagen, menschliche Bestätigung und tatsächlicher Versand bleiben getrennt. Der Chat darf keine erfolgte Beauftragung, Zahlung, Erfüllung oder Sendung aus einer bloßen Textantwort ableiten.

Abbruch stoppt den weiteren Auftrag im tatsächlich unterstützten Umfang, stellt aber bereits ausgeführte Dateiänderungen oder externe Handlungen nicht automatisch zurück. Bekannte Teilergebnisse bleiben sichtbar. Externe und Pluginänderungen werden gemäß den vorhandenen Konfliktregeln berücksichtigt.

## Abnahmeanker

Der Nutzer bittet um einen Formulierungsvorschlag: Antwort erscheint als Vorschlag ohne Dateiänderung. Ein anschließend ausdrücklich beauftragter Notizschritt wird mit tatsächlichem Dateiergebnis erfasst. Wird ein laufender Auftrag nach einer bereits gespeicherten Änderung abgebrochen, bleibt diese Änderung sichtbar und wird nicht als zurückgerollt bezeichnet.

## Bezüge

[[PBI-47 - AI-Chat über die eigene Claude-Subscription nutzen]], [[DF-01 - Beiratsarbeit und Befugnis]], [[DF-07 - Wahl, Entwurf und Versand]], [[DF-22 - Notizen als maßgeblicher Datenbestand]], [[DF-23 - Externe Bearbeitung ohne stilles Überschreiben]].
