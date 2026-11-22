---
type: Page
id: VIEW-05
status: entwurf
scope: mvp
version: "2.0"
date: 2026-11-15
navigation: global · Sheet
requirements:
  - "[[PBI-01 - Gemeinschaftskontext wählen]]"
  - "[[PBI-05 - Einen Vorgang erfassen und wiederfinden]]"
  - "[[PBI-10 - Eigenes To-do nachhalten]]"
  - "[[PBI-11 - Nachricht und Original zuordnen]]"
  - "[[PBI-33 - Wochenarbeit auf dem Handy abschließen]]"
entities:
  - "[[docs/entities/ENT-01 - Gemeinschaft]]"
  - "[[docs/entities/ENT-04 - Vorgang]]"
  - "[[docs/entities/ENT-05 - Termin]]"
  - "[[docs/entities/ENT-07 - Quelle]]"
  - "[[docs/entities/ENT-12 - To-do]]"
business-rules:
  - "[[docs/business-rules/DF-04 - Fehlender Termin]]"
  - "[[docs/business-rules/DF-12 - Gemeinschaftstrennung]]"
decisions:
  - "[[docs/decisions/K-10 - Manuelle Quellenübernahme und Registerimport vorsehen]]"
mockups:
  - "[[docs/design/sitemap/assets/v2-P-M-13-Erfassen-Zusage.png]]"
---

# VIEW-05 · Erfassen (Sheet)

Die Mockups zeigen noch die Begriffe vor dem 22.11.2026 (Punkt statt Vorgang usw., [[K-20 - WCS-Datenmodell als fachliche Grundlage]]).

**Rolle:** In unter 30 Sekunden etwas festhalten, ohne die aktuelle Arbeit zu verlassen. Erreichbar über Sidebar-Button, Befehl und mobil über den schwebenden Button.

## Felder

1. **Art:** Notiz · Nachricht · Unterlage · Zusage · To-do (bestimmt die Folgefelder). **Notiz** ist ein eigener Vermerk ohne Quelle: nur Gemeinschaft, mehrzeiliger Text und Vorgang; im Verlauf als „Du notierst …“ (intern). Die Vorgangsakte hat dafür eine eigene Schaltfläche „Notiz“ neben „Reaktion“.
2. **Gemeinschaft:** Pflicht; bei Filter „Alle“ nie vorbelegt. Bis 3 Gemeinschaften als Segment, ab 4 als durchsuchbare Liste mit den Gruppen „Zuletzt“ und „Weitere“ (Komponente CommunityPicker).
3. Für **Zusage:** Wer sagt zu? (Vorschläge aus den Kontakten der Gemeinschaft; unbekannter Name → „„Name“ als Kontakt anlegen“, danach zurück ins Erfassen) · Prüfbares Ergebnis · Bis wann? oder „kein Termin genannt“ (dann Prüfvermerk „Termin fehlt“, DF-04).
4. **Zu Vorgang:** Vorschlag oder Auswahl; „Neuer Vorgang“ möglich.
5. **Quelle:** Datei/Foto anhängen (Original) oder „Telefonat“ (ohne Datei, mit Notiz).
   - „Dateien auswählen“ öffnet den Dateidialog des Systems mit Mehrfachauswahl und erlaubt auch Dateien außerhalb des Vaults (z. B. Download-Ordner). Gewählte Dateien erscheinen als Liste mit Größe und × je Datei; „Weitere Dateien“ ergänzt, gleiche Dateinamen werden nicht doppelt übernommen.
   - Wahl „In den Vault verschieben“ (Standard) oder „Kopie ablegen“.
   - Zielpfad sichtbar: `WEG Manager/Quellen/<Gemeinschaft>/<JJJJ-MM-TT> <Dateiname>`; bei Namenskonflikt Suffix ` (2)`.
   - Verschieben/Kopieren gilt für alle gewählten Dateien. Beim Speichern wird jede Datei als eigene Quelle (Original) in der Notiz des Vorgangs bzw. Eingangseintrags verlinkt.
   - Liegt die Datei schon im Vault, wird nur verlinkt.

Regel: Ohne Zuordnung landet der Eintrag im Eingang (Schritt 1 der Wochenarbeit).

![[v2-P-M-13-Erfassen-Zusage.png|180]]

## Verhalten

- Schließen ohne Speichern behält den Entwurf (Hinweis im Button-Label).
- Sheet mit Griff und Schließen-Button, nie gestapelt; längere Bearbeitung wechselt in die Vorgangsakte.
- Desktop: gleiches Formular als rechter Slideover.

## Weitere Bildschirme (Prototyp)

Stand Pilot 15.11.2026, Übersicht in [[Prototyp - Stand Pilot]].

![[v2-P-D-12-Erfassen-Notiz.png]]
![[v2-P-M-12-Erfassen-Notiz.png|180]]
![[v2-P-D-13-Erfassen-Zusage.png]]
