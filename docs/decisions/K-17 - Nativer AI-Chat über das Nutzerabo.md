---
type: Decision
id: K-17
status: festgelegt
date: 2026-11-15
source: "Direkte Nutzeranforderung: native Claude-Code-Integration mit AI-Chat über die Nutzer-Subscription."
---

# K-17 · Nativer AI-Chat über das Nutzerabo

## Produktentscheidung

Das Plugin soll einen nativen AI-Chat anbieten, der die offizielle Claude-Code-Laufzeit unter dem eigenen berechtigten Claude-Abonnement des Nutzers verwendet. Ein eigenes Plugin-Tokenkontingent oder ein automatisch verwendeter API-Key ist nicht der angeforderte Abrechnungsweg. Der Chat ist ein optionaler Assistenzweg; die lokale Kernarbeit bleibt ohne KI und ohne Claude-Anmeldung nutzbar.

Der zusätzliche Chat wird als geplante MVP-Anforderung unter [[F-23 - Nativer AI-Chat]] aufgenommen. Als erster zu untersuchender Betriebsweg ist Desktop vorgesehen. Eine gleichwertige lokale Ausführung auf Obsidian Mobile wird nicht behauptet; ein mobiler Chatweg bleibt zu klären und darf nicht still einen neuen gehosteten Dienst voraussetzen. Die bestehende vollständige mobile Beirats-Kernreise bleibt davon unberührt.

## Integrationsrichtung und offene Freigabe

Bevorzugt wird eine unveränderte offizielle Claude-Code-Laufzeit, bei der der Nutzer selbst den offiziellen Anmeldeweg verwendet. Das Plugin bietet keinen nachgebauten Claude-Login und übernimmt keine Sitzungstokens. Die konkrete Einbettung, Auth-/Abrechnungsfeststellung, Plattformbedingungen und zulässige Distribution müssen vor Umsetzung geprüft werden; die Produktentscheidung allein ist kein Machbarkeits- oder Zulässigkeitsnachweis. Quellen und Abgrenzung: [[Integrationsresearch - Nativer AI-Chat mit Claude Code]].

Die Abo-Anforderung bedeutet keine unbegrenzte Nutzung. Laufzeitseitige Limits, fehlende Berechtigung und unbekannter Abrechnungsmodus werden sichtbar. Es erfolgt kein stiller Wechsel auf API-Abrechnung, fremde Cloudkonten oder einen anderen kostenpflichtigen Weg. Vom Nutzer bereits außerhalb des Plugins gewählte Zusatzverbrauchsoptionen werden nicht als grundsätzlich kostenfrei ausgegeben.

## Daten und andere Integrationen

Der Chat arbeitet mit einem bewusst freigegebenen Vault-/Gemeinschaftskontext und denselben offenen Notizen gemäß [[K-14 - Markdown und Frontmatter als offene Datengrundlage]]. Zugangsdaten bleiben außerhalb dieser Fachnotizen. Claude-Modellverarbeitung ist nicht mit ausschließlich lokaler Berechnung gleichzusetzen.

Gleiche Claude-Anmeldung garantiert nicht, dass Connectoren aus einer anderen Claude-Oberfläche in dieser Laufzeit verfügbar sind. Der Gmail-Skill [[PBI-46 - Gmail-Nachrichten mit Claude als Vault-Notizen übernehmen]] bleibt ein separater optionaler Ablauf mit eigener Capability-Prüfung. Ein WEG-Manager-MCP-Server ist für den Dateikontext nicht erforderlich.

## Bezüge

[[PBI-47 - AI-Chat über die eigene Claude-Subscription nutzen]], [[ACT-11 - Offizielle Claude-Code-Laufzeit]], [[ENT-22 - AI-Gespräch]], [[DF-27 - Abo-Nutzung ohne stillen Abrechnungswechsel]], [[DF-28 - Chatantwort und ausgeführte Fachaktion unterscheiden]], [[Integrationsresearch - Nativer AI-Chat mit Claude Code]].
