---
type: BusinessRule
id: DF-24
status: entwurf
scope: spaeter
---

# DF-24 · Bestätigter Dienstversand und unklarer Ausgang

## Regel

Kontoverbindung, Entwurfserzeugung, Kopieren oder eine Agentenänderung ist kein Versandauftrag. Der spätere Gmail-Versand benötigt eine ausdrückliche menschliche Aktion für die aktuell geprüften Absender-/Empfängerangaben, Textfassung und Anlagen. Änderungen dieser Grundlage erfordern erneute Prüfung; offene DE/EN-Prüfungen werden nicht durch Senden umgangen.

Geplant, vorbereitet, Übertragung angefordert, vom Dienst bestätigt, fehlgeschlagen und Ausgang unklar sind unterscheidbare Sachverhalte; die konkreten technischen Zustandsnamen bleiben dem Datenmodell vorbehalten. Ein positiver Dienstnachweis kann mit Zeitpunkt und verfügbarer Referenz dokumentiert werden, bestätigt aber keine Zustellung oder Antwort. Ohne eindeutiges Ergebnis darf kein Erfolg behauptet werden.

Bei Timeout oder Verbindungsabbruch nach möglicher Übergabe wird nicht blind erneut versandt. Zuerst vorhandene Referenzen beziehungsweise Dienststatus prüfen oder den Nutzer zur bewussten Klärung führen. Die Anforderung verspricht keine nicht belegte Exactly-once-Garantie einer API. Eine korrigierte lokale Versanddokumentation ruft keine externe Nachricht zurück.

## Abnahmeanker

Der Nutzer bestätigt Nachricht A; Gmail bestätigt den Auftrag. Nur A erhält den belegten Ergebnisstand, andere Entwürfe bleiben offen. Bei Nachricht B bricht die Verbindung nach Übergabe ab: Anzeige Ausgang unklar, kein automatischer zweiter Versand und kein behaupteter Empfang. Eine nach Bestätigung geänderte Anlage benötigt erneute Prüfung.

## Herkunft und Abgrenzung

[[K-15 - Google-Dienste für Versand und Dokumentfreigabe anbinden]] und [[PBI-44 - Geprüfte E-Mails über Gmail versenden]]. [[DF-07 - Wahl, Entwurf und Versand]] beschreibt den manuellen MVP-Weg; diese spätere Regel ergänzt den menschlich ausgelösten Dienstversand. Kein automatischer Agentenversand und keine Änderung der aktuellen MVP-Abnahme.
