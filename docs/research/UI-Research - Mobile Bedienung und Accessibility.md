---
type: Research
status: entwurf
date: 2026-11-15
scope: mvp
---

# UI-Research · Mobile Bedienung und Accessibility

Recherche vom 15.11.2026 für das UI-Konzept, keine Implementierungsprüfung, Nutzerstudie oder Konformitätserklärung. Fachliche Basis: [[01-Produktvision]], [[02-MVP-PRD]], DF-01–15 und [[F-21 - Nichtfunktionale Anforderungen]]. Der Pilot-Handytyp ist noch festzulegen. Statische Mockups können Fokusdarstellung und Informationshierarchie zeigen, aber keine Tastatur-, Screenreader- oder Recoveryfunktion beweisen.

## Primärquellen und Evidenzart

Alle folgenden URLs wurden am 15.11.2026 geöffnet. Normative Grundlage ist die [W3C Recommendation WCAG 2.2](https://www.w3.org/TR/WCAG22/). Die Understanding-Seiten sind informative Erläuterungen zu den normativen Erfolgskriterien. Die Tabelle trennt diese Kriterien von unseren Produktdesignableitungen. Es wird keine allgemeine rechtliche Pflicht zur Anwendung behauptet.

| Quelle und Kriterium | Sachlicher Befund | Eigene Ableitung für WEG Manager |
| --- | --- | --- |
| [2.1.1 Keyboard, A](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) | Funktionalität per Tastaturschnittstelle ohne besondere zeitliche Tastenanforderungen; begrenzte Ausnahme für pfadabhängige Eingabe. | Keine Kernfunktion nur mit Swipe, Hover oder Drag. Fokusfolge der fachlichen Reihenfolge entsprechend spezifizieren. |
| [2.4.7 Focus Visible, AA](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) | Tastaturfokus muss in einem Bedienmodus sichtbar sein. | Fokuszustand im Komponentenreview sichtbar; vom Hover unterscheidbar. |
| [2.4.11 Focus Not Obscured Minimum, AA](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) | Fokussiertes Element darf nicht vollständig durch selbst erzeugte Inhalte verdeckt sein. | Produktziel ist vollständige Sichtbarkeit; Sticky-Leisten und Bildschirmtastatur dürfen Feld/Fehler/Aktion nicht unzugänglich machen. Vollständige Sichtbarkeit ist strenger als dieses AA-Minimum. |
| [2.5.8 Target Size Minimum, AA](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | Grundsätzlich 24 × 24 CSS-Pixel, mit definierten Ausnahmen, etwa ausreichendem Abstand. | Häufige Touchaktionen mit 44 × 44 CSS-Pixeln oder größer planen. Das ist eigenes Designziel, keine 44-Pixel-AA-Pflicht. |
| [1.4.10 Reflow, AA](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) | Vertikaler Inhalt bei 320 CSS-Pixeln ohne Informations-/Funktionsverlust und ohne zweidimensionales Scrollen; Ausnahme für wesentlich zweidimensionale Bereiche. | Mobile Karten und gestapelte Vergleichsfelder statt komprimierter Tabellen. Zusätzlich zum in F-21 genannten 200-%-Zoom die 320-CSS-Pixel-Breite prüfen. |
| [3.3.1 Error Identification, A](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html) | Automatisch erkannter Eingabefehler benennt betroffenes Element und Problem textlich. | Fehler am Feld und verständliche Zusammenfassung; Eingaben erhalten und konkrete Abhilfe anbieten, wie F-21 zusätzlich verlangt. |
| [4.1.3 Status Messages, AA](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | Statusmeldungen müssen programmatisch bestimmbar sein, damit assistive Technik sie ohne Fokuswechsel ausgeben kann. | Gespeichert, kopiert, Konflikt erkannt und Prozessausgang als gezielte Meldungen planen; keine Fokusverschiebung bei jedem Fortschrittsschritt. |
| [Obsidian: Mobile development](https://docs.obsidian.md/Plugins/Getting%20started/Mobile%20development) | Offizielle Anleitung beschreibt mobile Emulation, Inspektion echter Android-/iOS-Geräte und fehlende Node-/Electron-APIs auf Mobilgeräten. | Schmale Screenshots sind kein Funktionsnachweis. Spätere Abnahme muss tatsächliche Obsidian-App und Pilotgerät einschließen. NuxtUI-Auswahl allein belegt keine mobile Kompatibilität. |

## Fachliche Ableitungen für mobile Kernarbeit

Diese Regeln folgen aus PRD/DF/F-21 und der obigen Recherche; sie sind vorgeschlagene Produktentscheidungen, keine empirisch bestätigten Ergebnisse.

1. **Fristen zuerst:** Quellenstand und Gemeinschaft nennen, dann Handlungsbedarf vor nächster Wochenarbeit und 14-Tage-Fristen. Terminart, Datum, Herkunft und nächste Handlung je Punkt zeigen. Überfälligkeit bleibt Prüfhinweis, „Nicht eingehalten“ eine begründete menschliche Bewertung. Wiedervorlage verschiebt nicht den Fremdtermin.
2. **Sieben insgesamt:** Reguläres Wochenbudget gilt gemeinschaftsübergreifend. Auswahlgrund, Rückstand und zusätzliche dringliche Fälle bleiben erreichbar. Neun dringende Fälle dürfen trotz sieben regulärer Karten nicht verschwinden.
3. **Lücken sichtbar:** „Keine Antwort bekannt“ statt „Keine Antwort erfolgt“, wenn Eingangslage unvollständig. Ungeprüfte Portalnachricht verhindert unqualifiziertes „Nichts Dringendes“. Aktualisierung beim Öffnen ist keine behauptete Hintergrundprüfung.
4. **Mensch versendet:** Wahl, Entwurf, Kopieren, tatsächlicher Versand und Zustellung sind verschiedene Dinge. Erst ausdrücklich dokumentierter Versand mit Datum/Fassung verankert den nächsten Prüftermin. Ein Undo korrigiert gegebenenfalls den Eintrag, holt aber keine externe Nachricht zurück.
5. **DE/EN gemeinsam prüfen:** Gleicher freigegebener Inhalt, sichtbare Fassungen und Prüfstände. Nach relevanter Änderung die andere Fassung erneut prüfen. Mobil abschnittsweise nacheinander statt zwei unlesbarer Miniaturen.
6. **Empfängerbezogene Auswahl:** Gemeinschaft und konkrete Empfänger vor Inhaltsauswahl; jede Anlage ausdrücklich wählen. Einstufung als Sachinformation ersetzt keine Freigabe. Verlinkte Dateien werden nicht transitiv übernommen. Interne Vertretung bleibt lesbare ausgewählte Übergabe, kein Zugang.
7. **Konflikte und Wiederaufnahme:** Eigene offene Eingaben und aktueller Dateistand getrennt darstellen, kein blindes Überschreiben. Unbekannte Properties erhalten. Wiederholung einer unterbrochenen Aktion darf keine Dublette erzeugen. Automatischer Merge wird nicht versprochen.
8. **Recovery:** Vollständige Sicherung von Empfängerausgabe trennen. Wiederherstellung in leerem Arbeitsbereich; Teilfehler und neueres Schema verständlich anzeigen. „Abgeschlossen“ nur bei tatsächlich erfolgreichem Ausgang.

## Gestaltungs- und Prüfraster

Desktopreferenz 1440 × 1024, Mobilreferenz 390 × 844, zusätzlich 320 CSS-Pixel und 200 % Zoom. Farben, Schrift und Größen nach [[UI-Design - Leitlinien und Reviewumfang]] und [[01 - Design Tokens]]. Diese Maße sind Entwurfsparameter, keine vorweggenommene Geräteabnahme. NuxtUI-Komponentennamen in den Page Notes sind geplante Zuordnungen, keine zugesicherte API-Verfügbarkeit oder Accessibility-Konformität.

Mobile Abläufe müssen Lesen, Quellenprüfung, Wahl, Notizeingabe, Entwurfsprüfung, Vertraulichkeitsvorschau und Übergabe vollständig erlauben. Rückkehr aus Originalansicht oder externer Mail-App darf bestätigte Eingaben nicht verlieren. Lange Texte, Softkeyboard, Abbruch und Wiederaufnahme gehören zum späteren Test, nicht nur die Startansicht. Es entsteht kein neuer Push-/Syncdienst.

## Kritische Bildmissverständnisse und Reviewfälle

| Gefahr | Konkreter Reviewfall |
| --- | --- |
| Wahl erscheint als Beschluss/Auftrag | „Verwaltung erinnern“ erzeugt Folgearbeit; kein Beschluss-, Zahlungs- oder Freigabestatus. |
| Kartenbudget verschluckt Dringlichkeit | Neun dringende unabhängige Punkte bleiben mit eigener Frist auffindbar. |
| Grüner Status behauptet Vollständigkeit | Alter Registerstand plus ungeprüfte Portalnachricht zeigt Lücke statt Entwarnung. |
| Neuer Termin erledigt ganzen Punkt | Alte Zusage und Bewertung bleiben historisch, aktueller Punkt offen. |
| Entwurf startet Frist | Versand 16.11., Antworttermin 30.11.: am 23.11. keine nächste Stufe nur wegen Wochenwechsel. |
| Datumsgrenze falsch | Datum ohne Uhrzeit gilt bis Tagesende Europe/Berlin; erst Folgetag überfällig. |
| Gemeinschaften vermischt | WEG-Ausgabe enthält keine Tiefgaragenanlage trotz gleichem Verwalter. |
| Sprachchips versprechen Freigabe | Datum in DE geändert → EN erneut prüfbedürftig. |
| Intern bedeutet Zugriffsschutz | Verwendungseinstufung ohne Schloss-/Verschlüsselungsversprechen. |
| Entfernen suggeriert weltweite Löschung | Inhaltsarmer Löschvermerk und Hinweis auf gesondert zu prüfende Ausgaben/Sicherungen. |
| Recovery zeigt falschen Erfolg | Fehlendes Original/Teilfehler bleibt deutlich unvollständig; neueres Schema blockiert Schreiben. |
| Bild wird als Funktionstest gelesen | Bildbeschriftung „Statischer Reviewentwurf“; interaktive Nachweise ausdrücklich noch offen. |

Für jeden Screen: leer, laden, Fehler, fehlende Daten, ungespeicherte Eingaben, Bestätigung und Vertraulichkeit textlich spezifizieren. Im visuellen Review Kontext, Bedeutung der Statusfarben, lesbare Labels, Zielgrößen und Fokusdarstellung prüfen. Später separat Tastaturdurchlauf, Screenreaderstatus, Zoom/Reflow und echten mobilen Ablauf testen. Keine bestandenen Tests oder Konformität aus diesen Entwürfen ableiten.
