---
type: DesignSpec
id: UI-DESIGN-02
status: entwurf
scope: mvp
version: "1.0"
date: 2026-11-15
requirements:
  - "[[PBI-13 - Aktuelle Wochenlage öffnen]]"
  - "[[PBI-14 - Entscheidungsauswahl und Überlauf prüfen]]"
  - "[[PBI-15 - Eine Entscheidungsvorlage prüfen]]"
  - "[[PBI-16 - Wahl mit Kontextnotiz bestätigen]]"
  - "[[PBI-17 - Folgearbeit aus Entscheidungen vorbereiten]]"
  - "[[PBI-21 - Begründeten Eskalationsschritt prüfen]]"
business-rules:
  - "[[docs/business-rules/DF-04 - Fehlender Termin]]"
  - "[[docs/business-rules/DF-05 - Eskalationsleiter und Fristen]]"
  - "[[docs/business-rules/DF-07 - Wahl, Entwurf und Versand]]"
  - "[[docs/business-rules/DF-08 - Quellenabdeckung]]"
  - "[[docs/business-rules/DF-09 - Begrenzte Auswahl und Dringlichkeit]]"
  - "[[docs/business-rules/DF-15 - Entscheidungskarte und Beschluss]]"
decisions:
  - "[[docs/decisions/K-04 - Wochenpaket beim Einstieg aktualisieren]]"
  - "[[docs/decisions/K-05 - Sieben reguläre Entscheidungen mit sichtbarem Überlauf]]"
  - "[[docs/decisions/K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]]"
hypotheses:
  - "[[docs/hypothesis/H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]"
  - "[[docs/hypothesis/H-04 - Sieben Entscheidungen sind ein brauchbares Arbeitsbudget]]"
  - "[[docs/hypothesis/H-06 - Vorbereitete Wochenarbeit ist ohne verpflichtende KI nützlich]]"
---

# Konzept · Vorbereitung ohne KI

Beantwortet die offene Frage O-04 aus dem [[02-MVP-PRD]]: **Woher kommen in der Wochenarbeit Auswahl, Optionen, Folgen, Vorschlag und Entwurfstexte, wenn keine KI beteiligt ist?** Grundlage für [[VIEW-02 - Wochenarbeit]], [[VIEW-04 - Postausgang]] und den Prototyp unter `docs/design/prototype`.

## Grundsatz

Vorbereitung ist **regelbasiert über bereits erfasste Fakten** (Termine, Ereignisse, Versand, Nachfassstand, Quellen, Punktart). Drei Bausteine:

1. **Anlass-Regeln** wählen aus, was diese Woche entschieden werden muss, und begründen die Auswahl.
2. **Entscheidungsarten** liefern je Anlass feste, fachlich sinnvolle Optionen mit Folgen und eine nachvollziehbare Vorschlagsregel.
3. **Textbausteine** mit Platzhaltern erzeugen Entwürfe aus Wahl, Notiz und Punktdaten.

Was nicht aus Daten ableitbar ist, wird **nicht erfunden**: Der Platzhalter bleibt sichtbar markiert (z. B. `[Termin fehlt]`), die Vorlage bleibt nutzbar (PBI-15 AK 3). Jede Regel ist deterministisch, testbar und in Akten nachvollziehbar.

## 1 · Anlass-Regeln (Wochenpaket)

Beim Öffnen der Wochenarbeit (K-04) wird für jeden offenen Punkt geprüft, ob ein Anlass vorliegt. Ein Punkt erzeugt höchstens einen Anlass; mehrere Punkte desselben Themas und Empfängers dürfen zu einer Paketentscheidung zusammengefasst werden.

| ID | Anlass | Bedingung (Stichtag = Wochenarbeit) | Entscheidungsart | Dringend? |
| --- | --- | --- | --- | --- |
| A1 | Nächste Nachfassstufe fällig | Nachhalten-Antwort „Nachfassen“ in Schritt 2 **oder** Stufe 2 → 3 fällig nach DF-05 | E1 | wenn Fremdfrist vor nächster Wochenarbeit |
| A2 | Neue Unterlage mit Entscheidungsbedarf | im Eingang als „Entscheidung nötig“ markiert (Unterlage, Angebot, Protokoll) | E2 / E3 | wenn Frist in Quelle vor nächster Wochenarbeit |
| A3 | Termin fehlt zu lange | Zusage ohne Termin, älter als 14 Tage (DF-04) | E1 | nein |
| A4 | Punkt ohne nächsten Schritt | offener Punkt ohne eigene Aufgabe, Wiedervorlage oder wartende Zusage | E5 | nein |
| A5 | Akutes Problem | Punktart „Mangel“ mit Markierung „akut“ oder „drohende Kosten“ | E6 | **ja** |
| A6 | Eigentümer betroffen | Termin oder Maßnahme mit Eigentümerbezug neu bestätigt (Merkmal am Punkt) | E4 | wenn Termin < 14 Tage |
| A7 | Zurückgestellt oder vorgemerkt | in Vorwoche zurückgestellt oder im Lagecheck vorgemerkt | ursprüngliche Art | ursprünglich |

**Budget (DF-09, K-05):** Dringende Anlässe stehen immer zusätzlich. Die übrigen werden in dieser Reihenfolge bis 7 aufgefüllt: A7 (älteste zuerst) → A1 → A2 → A6 → A3 → A4. Gleichstand: frühere Fremdfrist, dann ältester Anlass. Jeder Kandidat zeigt seinen Auswahlgrund als kurzen Datenchip (z. B. „Frist 10.11. verstrichen“, „vorgemerkt 12.11.“). Nicht gewählte Kandidaten bleiben als Rückstand mit Zahl sichtbar.

## 2 · Entscheidungsarten

Jede Art hat feste Optionen. Es gibt keine künstlichen Alternativen (PBI-15 AK 2): Optionen, deren Voraussetzung fehlt, werden nicht angeboten.

### E1 · Zusage nachhalten (Termin/Leistung der Verwaltung)

| Option | Folgen | angeboten wenn |
| --- | --- | --- |
| Termin erfragen (Stufe 1) | Entwurf an Verantwortlichen, neue Prüfung = Versand + 7 T | noch keine Anfrage dokumentiert |
| Antwortfrist setzen (Stufe 2) | Entwurf mit Frist = heute + 14 T, Prüfung = Frist + 1 T | Stufe 1 versandt, keine Antwort |
| Förmlich nachfassen (Stufe 3) | Entwurf förmlich, Frist = heute + 10 T | Stufe 2 versandt, Frist verstrichen |
| Für Bericht/ETV vormerken (Stufe 4) | eigene Aufgabe „in Bericht aufnehmen“ | Stufe 3 versandt, Frist verstrichen |
| Pausieren | Pause mit Grund und Ende, Prüfung = Ende | immer |

**Vorschlag:** die nächste nach DF-05 fällige Stufe. Grundchip nennt das auslösende Datum. Kein Vorschlag, solange eine kommunizierte Frist läuft.

### E2 · Neue Unterlage einordnen (Angebot, Bericht, Rechnung als Quelle)

| Option | Folgen | angeboten wenn |
| --- | --- | --- |
| Zur Kenntnis nehmen | Ereignis „geprüft“, kein Entwurf | immer |
| Rückfrage an Verwaltung | Entwurf mit Frage-Platzhalter, Prüfung + 7 T | immer |
| Empfehlung an Verwaltung | Entwurf „Der Beirat empfiehlt …“ mit gewählter Unterlage | ≥ 1 Unterlage dieser Art am Punkt |
| Für Besprechung vormerken | eigene Aufgabe, kein Beschluss (DF-15) | immer |

**Vorschlag:** „Rückfrage“, wenn am Punkt eine erfasste Erwartung nicht erfüllt ist (z. B. Feld „erwartete Anzahl Angebote“ > vorhandene); sonst „Zur Kenntnis nehmen“. Beträge werden nur angezeigt, wenn sie bei der Erfassung eingetragen wurden; es gibt keinen Angebotsvergleich (später F-16).

### E3 · Unstimmigkeit in Protokoll oder Unterlage

Optionen: Korrektur anfordern (Entwurf, Prüfung + 14 T) · Für ETV vormerken (Aufgabe) · Hinfällig setzen (mit Grund). **Vorschlag:** Korrektur anfordern, wenn keine Anfrage dokumentiert ist.

### E4 · Eigentümer informieren

Optionen: Information DE/EN vorbereiten (Entwurf an Verteiler, beide Sprachen prüfpflichtig) · Nicht informieren (Grund) · Später (Wiedervorlage). **Vorschlag:** informieren, wenn Termin < 14 T oder Mitwirkung der Eigentümer im Punkt markiert ist.

### E5 · Punkt ohne nächsten Schritt

Optionen: Nächsten eigenen Schritt festlegen (Aufgabe mit Datum) · Verantwortung klären (Rückfrage-Entwurf) · Aufteilen · Hinfällig setzen. **Vorschlag:** keiner – der Beirat wählt; der Grundchip nennt die Dauer ohne Schritt.

### E6 · Akutes Problem

Optionen: Behebung mit Frist anfordern (Entwurf, Frist = heute + 3 T, Wert änderbar) · Selbst prüfen/Begehung (Aufgabe) · Eigentümer warnen (E4-Entwurf). **Vorschlag:** Behebung anfordern.

## 3 · Textbausteine

- Bausteine liegen als **lesbare Markdown-Notizen im Vault** (`WEG Manager/Vorlagen/…`), vom Nutzer bearbeitbar und versioniert (K-14). Das Plugin liefert einen Grundsatz in Deutsch und Englisch.
- Je Baustein: Empfängerart (Verwaltung, Eigentümer, Dienstleister), Entscheidungsart + Option, Sprache, Tonlage (sachlich / förmlich für Stufe 3).
- Platzhalter: `{anrede}`, `{empfaenger.name}`, `{gemeinschaft.name}`, `{punkt.ergebnis}`, `{zusage.datum}`, `{zusage.quelle}`, `{frist.neu}`, `{unterlage.titel}`, `{notiz}`, `{beirat.name}`. Fehlende Werte werden als `[Feld fehlt]` markiert eingesetzt und blockieren „geprüft“, bis sie ersetzt sind.
- **Bündelung (PBI-18):** Entwürfe gleicher Gemeinschaft und gleichen Empfängers werden zu einer Nachricht zusammengeführt: Anrede + je Punkt ein Absatz + Schluss. Jeder Absatz behält seinen Punkt- und Entscheidungsbezug.
- **Idempotenz (DF-07):** Ein Entwurf ist eindeutig über (Entscheidung, Option, Empfänger, Sprache). Erneutes Bestätigen aktualisiert, ändert die Wahl → alte Fassung „überholt“.

Beispiel E1/Stufe 2 an Verwaltung (DE):

```text
{anrede}
Sie hatten uns {zusage.quelle} zugesagt: {punkt.ergebnis}, bis {zusage.datum}.
Bitte nennen Sie uns bis zum {frist.neu} einen verbindlichen Termin.
{notiz}
Mit freundlichen Grüßen
{beirat.name}, Verwaltungsbeirat {gemeinschaft.name}
```

## 4 · Was der Beirat selbst einträgt

| Wann | Pflicht | optional |
| --- | --- | --- |
| Erfassen / Eingang | Gemeinschaft, Art, Quelle oder „Telefonat“ | Termin, Ergebnis, Merkmale (akut, Eigentümer betroffen, Entscheidung nötig, erwartete Anzahl) |
| Entscheiden | Wahl | Notiz (geht als `{notiz}` in den Text) |
| Senden | Prüfen je Sprache, Versanddatum | Kanal, Bemerkung |

Die Merkmale beim Erfassen sind der Hebel für gute Vorbereitung: Ohne sie greifen nur die Fristregeln A1/A3/A4.

## 5 · Messung (H-03, H-06)

Pro Wochenarbeit werden lokal protokolliert: aktive Zeit je Schritt, Anzahl übernommener vs. frei umgeschriebener Entwürfe (Textänderung > 30 % gilt als „umgeschrieben“), ersetzte `[Feld fehlt]`-Platzhalter, zurückgestellte Entscheidungen. Das liefert den Beleg, ob Vorbereitung ohne KI entlastet, ohne Inhalte zu übertragen (B-NFR-07).

## 6 · Spätere KI-Option

Eine optionale KI darf dieselben Strukturen füllen (Formulierungsvorschlag, Erkennen von Terminen im Eingang), ändert aber weder Anlass-Regeln noch Optionen und sendet nichts (K-11, DF-07). Der Kern funktioniert vollständig ohne sie.

## Offene Punkte

- Ob A6 „Eigentümer betroffen“ als Merkmal oder als Punktart modelliert wird (ENT-04).
- Defaultwert für E6-Frist (3 Tage) fachlich bestätigen.
- Ablage und Versionierung der Vorlagen im Datenvertrag ([[Datenkonzept - Offene Notizen und Agentenzugriff]]).
