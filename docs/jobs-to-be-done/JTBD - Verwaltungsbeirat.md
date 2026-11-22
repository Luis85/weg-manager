---
type: JobsToBeDone
id: JTBD-01
status: entwurf
version: "0.3"
scope: ""
date: 2026-11-21
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-02-Verwaltung]]"
  - "[[ACT-03-Eigentuemer]]"
  - "[[ACT-04-Vertretung]]"
hypotheses:
  - "[[H-01 - Beiratsfokus deckt den ersten Pilotbedarf]]"
  - "[[H-02 - Einzelne Vorgänge machen den Arbeitsstand verständlich]]"
  - "[[H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]"
  - "[[H-04 - Sieben Entscheidungen sind ein brauchbares Arbeitsbudget]]"
  - "[[H-09 - Eine ausgewählte Übergabe ist ohne Hintergrundwissen verständlich]]"
  - "[[H-10 - Lesbare Übergabe genügt dem ersten Vertretungsbedarf]]"
decisions:
  - "[[K-01 - Beirat als erster Produkteinstieg]]"
  - "[[K-02 - Zwei Gemeinschaften für einen Bearbeiter]]"
  - "[[K-03 - Einzeln erledigbarer Vorgang als Kerneinheit]]"
  - "[[K-05 - Sieben reguläre Entscheidungen mit sichtbarem Überlauf]]"
  - "[[K-06 - Eskalation an Versand und Fristen ausrichten]]"
  - "[[K-07 - Sachstand gezielt teilen und Bewertungen intern halten]]"
  - "[[K-08 - Vertretung zunächst durch lesbare Übergabe unterstützen]]"
business-rules:
  - "[[DF-01 - Beiratsarbeit und Befugnis]]"
  - "[[DF-10 - Vertraulichkeitsprüfung]]"
  - "[[DF-11 - Sachstand und Bewertung]]"
  - "[[DF-12 - Gemeinschaftstrennung]]"
  - "[[DF-15 - Entscheidungskarte und Beschluss]]"
research:
  - "[[JTBD-Research - Grundlagen und Methodik Verwaltungsbeirat]]"
  - "[[Interviewleitfaden - Beirats-Interviews]]"
---

# JTBD · Verwaltungsbeirat

**Zweck:** Ausgangslage für die User Research. Jeder Job steht als Titel und als Satz nach der Schablone „Als <Rolle> muss ich …, um …“. Der Katalog ist lösungs- und technologieneutral. Er beschreibt, was ein ehrenamtlicher Verwaltungsbeirat erreichen muss, und nennt kein Werkzeug, keinen Ablauf und keine Funktion.

**Herkunft:** Diese Note überführt die Fassung „JTBD Verwaltungsbeirat v0.2“ vom 21.11.2026 in eine einheitliche Form. Die Fassung beruht auf rund vier Wochen Echtbetrieb in einer Wohnungseigentümergemeinschaft mit Tiefgaragengemeinschaft und auf dem Austausch mit Beiräten aus der Nachbarschaft. Das Ausgangsdokument liegt nicht im Repository. Inhalte sind abstrahiert, ohne Namen, Beträge oder echte Dokumente.

**Evidenzgrenze:** Alle Jobs stammen aus einem Pilot. Keiner ist durch Interviews mit weiteren Beiräten bestätigt. Rechtliche und methodische Einordnung, Quellen und Forschungsfragen stehen in [[JTBD-Research - Grundlagen und Methodik Verwaltungsbeirat]], der Leitfaden für die Interviews in [[Interviewleitfaden - Beirats-Interviews]].

## Lesehilfe

Jeder Job hat dieselben Bestandteile:

- **Kennung und Titel.** Alle Kennungen beginnen mit `J-`, damit sie sich nicht mit anderen Kennungen im Repository mischen (etwa Epics E-xx oder den Anlässen A1–A7 in [[Konzept - Vorbereitung ohne KI]]). Die Kennung ist stabil und wird nicht neu vergeben. Der Titel darf sich schärfen.
- **Job-Satz.** Rolle, Situation, Verb und Objekt, danach das „um …“ als nächsthöheres Ziel. Das „muss“ ist die vorgegebene Schablone. Ob es eine Rechtspflicht ist, zeigt die Verbindlichkeit.
- **Ergebnis.** Wie der Beirat Erfolg misst, als prüfbare Aussage („Minimiere …“). Diese Sätze sind die späteren Fragen für Interviews und Befragung.
- **Verbindlichkeit.** Eine erste fachliche Einstufung, rechtlich noch zu prüfen:
  - *Pflicht*: ergibt sich unmittelbar aus Gesetz (WEG, DSGVO).
  - *Sorgfalt*: nötig, um eine gesetzliche Aufgabe sorgfältig zu erfüllen oder Haftung zu vermeiden.
  - *Anliegen*: ein Ziel des Beirats über die Pflicht hinaus.
- **Status.**
  - *beobachtet*: im Pilot aufgetreten. Datierte Vorfälle werden bei der Auswertung nachgetragen.
  - *Vorschlag*: im Betrieb noch nicht bestätigt, in der Fassung v0.2 mit „(V)“ markiert.
  - *Kandidat*: in der Research als mögliche Lücke erkannt, nicht aus dem Pilot.
  - Nach den Interviews kommen *bestätigt*, *priorisiert* und *verworfen* hinzu. Das vollständige Statusmodell mit Mindestbelegen steht in [[JTBD-Research - Grundlagen und Methodik Verwaltungsbeirat]], Abschnitt 3.4.

**Begriffe:** Ein *offener Vorgang* ist eine einzelne Sache, die erledigt werden muss, im Sinne von [[K-03 - Einzeln erledigbarer Vorgang als Kerneinheit]]. Ein *Beschluss* ist eine Entscheidung der Gemeinschaft, eine *Entscheidung des Beirats* seine eigene Abwägung ([[DF-15 - Entscheidungskarte und Beschluss]]). *Stand* meint den Bearbeitungsstand; die geprüfte Ausgabe an Dritte heißt im Produkt Sachstand.

## Job-Ausführender

Ein ehrenamtlicher Verwaltungsbeirat, oft allein oder zu wenigen, teils für mehrere formal getrennte Gemeinschaften (Wohnhaus, Tiefgarage). Er ist Laie mit begrenzter Zeit und hat keine Ausführungsbefugnis: Er beauftragt nichts und zahlt nichts. Gesetzlich muss er aber den Verwalter unterstützen und überwachen; Wirtschaftsplan und Jahresabrechnung soll er prüfen (§ 29 Abs. 2 WEG). Sein Gegenüber ist eine professionelle Verwaltung mit Informationsvorsprung. Eine kleinere Gemeinschaft wie die Tiefgarage hat dieselben Jobs in kleinerem Umfang.

Gemeint ist im Folgenden immer diese Rolle, wenn der Satz mit „Als Verwaltungsbeirat“ beginnt.

## Hauptjob

### J-0 · Gemeinsames Eigentum ordentlich verwalten lassen

> Als Verwaltungsbeirat muss ich dafür sorgen, dass das gemeinsame Eigentum ordentlich, wirtschaftlich und nachvollziehbar verwaltet wird, um die Interessen aller Eigentümer zu wahren, ohne dass das Ehrenamt zum Zweitberuf wird.

Woran der Beirat den Hauptjob misst:

| Kennung | Erfolgsmaß |
| --- | --- |
| J-M1 | Gutes Verhältnis zur Verwaltung. |
| J-M2 | Kein Rückstand an offenen Vorgängen. |
| J-M3 | Klare Verantwortlichkeit für jeden Vorgang. |
| J-M4 | Wirksame Kontrolle: Probleme werden zügig und mit wenig Aufwand gelöst. |
| J-M5 | Finanzielle Transparenz. |

Im Pilot schmerzen drei Bereiche am meisten, in dieser Reihenfolge:

1. gemeinsame Vorhaben im Viertel,
2. die Überwachung der Verwaltung (Gruppe B),
3. eigene Vorhaben als Eigentümer.

Der erste und der dritte Bereich liegen außerhalb der Beiratsrolle im engen Sinn. Sie gehören zu den [[#Weitere Rollen|weiteren Rollen]]. Das ist ein erster Gegenbeleg zu [[H-01 - Beiratsfokus deckt den ersten Pilotbedarf]] und betrifft den Zuschnitt aus [[K-01 - Beirat als erster Produkteinstieg]]. Ob die Rangfolge über den Pilot hinaus gilt, klären die Interviews.

## A · Aufmerksamkeit steuern

### J-A1 · Wissen, was mich braucht

> Als Verwaltungsbeirat muss ich in meiner regelmäßigen Arbeitszeit für das Amt verlässlich erkennen, welche offenen Vorgänge meine Entscheidung brauchen, um nichts liegen zu lassen.

- **Ergebnis:** Minimiere die Wahrscheinlichkeit, dass ein entscheidungsbedürftiger Vorgang unbemerkt in einem langen Schriftwechsel liegen bleibt. Ziel: eine feste, kurze Wochenzeit und kein Gefühl, etwas übersehen zu haben.
- **Verbindlichkeit:** Sorgfalt · **Status:** beobachtet

### J-A2 · Dringendes von Wartbarem trennen

> Als Verwaltungsbeirat muss ich zwischen meinen festen Arbeitszeiten erkennen, was wirklich nicht warten kann, um schnell zu reagieren, ohne täglich hinzusehen.

- **Ergebnis:** Minimiere die Zahl der Unterbrechungen, die nicht von einer rechtlichen Frist, einer Unterschrift, einem akuten Gebäudeproblem oder drohenden Kosten ausgehen. Minimiere zugleich die Zahl dringender Vorgänge, die erst in der nächsten festen Arbeitszeit auffallen.
- **Verbindlichkeit:** Sorgfalt · **Status:** beobachtet

### J-A3 · Wieder einsteigen

> Als Verwaltungsbeirat muss ich nach einigen Tagen Pause wissen, wo ich bei einem offenen Vorgang stand und was sich seitdem geändert hat, um weiterzumachen, ohne den Verlauf neu zusammenzusetzen.

- **Ergebnis:** Minimiere die Zeit, um nach einer Pause den Stand eines Vorgangs und die Änderungen seither zu erfassen. Ziel: wenige Minuten. Heute kostet der Wiedereinstieg mehr Zeit als die Entscheidung selbst.
- **Verbindlichkeit:** Anliegen · **Status:** beobachtet

### J-A4 · Eigene Einschätzung einbringen

> Als Verwaltungsbeirat muss ich vor jeder Äußerung in meinem Namen sicherstellen, dass sie meine eigene Abwägung und meinen Ton wiedergibt, um hinter ihr stehen zu können.

- **Ergebnis:** Minimiere den Anteil der Äußerungen in seinem Namen, die nicht nach dem Beirat klingen oder seine Abwägung verfehlen.
- **Verbindlichkeit:** Anliegen · **Status:** beobachtet

### J-A5 · Vorgänge nachweisbar abschließen

> Als Verwaltungsbeirat muss ich beim Erledigen eines offenen Vorgangs festhalten, womit und wann er erledigt ist, um später belegen zu können, dass nichts offen geblieben ist.

- **Ergebnis:** Minimiere die Zahl der Vorgänge, deren Erledigung sich später nicht belegen lässt.
- **Verbindlichkeit:** Sorgfalt · **Status:** Kandidat. Die Job-Map-Prüfung zeigt beim Schritt „abschließen“ eine Lücke ([[JTBD-Research - Grundlagen und Methodik Verwaltungsbeirat]], Abschnitt 1.5). In den Interviews als Forschungsfrage FF-9 aus dem [[Interviewleitfaden - Beirats-Interviews]] zu prüfen.

## B · Verwaltung überwachen und führen

### J-B1 · Zusagen verbindlich machen

> Als Verwaltungsbeirat muss ich bei jeder Zusage der Verwaltung Termin und erwartetes Ergebnis klären, um Verzögerungen früh zu sehen und keinen Rückstand entstehen zu lassen.

- **Ergebnis:** Minimiere die Zahl der offenen Zusagen ohne Termin und die Zeit, bis eine Verzögerung bemerkt wird.
- **Verbindlichkeit:** Sorgfalt · **Status:** beobachtet

### J-B2 · Rechtzeitig erfahren, was die Verwaltung tut

> Als Verwaltungsbeirat muss ich von wesentlichen Anfragen, Aufträgen und Zahlungen im Namen der Gemeinschaft erfahren, bevor Fakten geschaffen sind, um meine Überwachungsaufgabe noch wirksam wahrnehmen zu können.

- **Ergebnis:** Minimiere die Wahrscheinlichkeit, dass der Beirat von einem wesentlichen Geschäftsvorfall erst nachträglich oder gar nicht erfährt.
- **Verbindlichkeit:** Sorgfalt · **Status:** beobachtet

### J-B3 · Nachdruck ohne Beziehungsschaden

> Als Verwaltungsbeirat muss ich bei hängenden Vorgängen Bewegung erzeugen, ohne die Zusammenarbeit mit der Verwaltung zu beschädigen, um die zugesagten Ergebnisse zu erhalten.

- **Ergebnis:** Minimiere die Zeit, bis ein hängender Vorgang wieder vorankommt, ohne dass sich das Verhältnis zur Verwaltung verschlechtert.
- **Verbindlichkeit:** Anliegen · **Status:** beobachtet

### J-B4 · Leistung mit Tatsachen bewerten

> Als Verwaltungsbeirat muss ich vor Entlastung oder Wiederbestellung der Verwaltung belegen können, was zugesagt, was geliefert und wie schnell es geliefert wurde, um mein Urteil auf Tatsachen statt auf Erinnerung zu stützen.

- **Ergebnis:** Minimiere den Anteil der Leistungsbewertung, der nur auf Erinnerung beruht.
- **Verbindlichkeit:** Sorgfalt · **Status:** beobachtet

### J-B5 · Wissen, was wir verlangen können

> Als Verwaltungsbeirat muss ich vor dem Ende des Verwaltervertrags wissen, welche Leistung zu welchem Preis vereinbart ist und welche marktüblich wäre, um die Neubestellung auf vergleichbarer Grundlage vorzubereiten.

- **Ergebnis:** Minimiere die Unsicherheit über vertraglich geschuldete Leistung und angemessenen Preis zum Zeitpunkt der Neubestellung. Ziel: ein klares Anforderungsprofil und vergleichbare Angebote.
- **Verbindlichkeit:** Sorgfalt · **Status:** beobachtet

## C · Geld prüfen

### J-C1 · Wirtschaftsplan und Abrechnung prüfen

> Als Verwaltungsbeirat muss ich vor dem Beschluss der Eigentümerversammlung Wirtschaftsplan und Jahresabrechnung prüfen und dazu Stellung nehmen, um den Eigentümern eine belegte Entscheidungsgrundlage zu geben.

- **Ergebnis:** Minimiere die Zeit für eine belegte Stellungnahme vor der Versammlung und die Wahrscheinlichkeit, eine prüfungsrelevante Abweichung zu übersehen. Heute fehlen als Laie Zeit und Prüfschema.
- **Verbindlichkeit:** Pflicht (§ 29 Abs. 2 S. 2 WEG, Soll-Vorschrift) · **Status:** beobachtet

### J-C2 · Gegen die Konten prüfen

> Als Verwaltungsbeirat muss ich bei der Prüfung Kontostände und Erhaltungsrücklage mit den tatsächlichen Kontobewegungen abgleichen, um sicher zu sein, dass Geplantes, Erhobenes und Abgerechnetes zusammenpassen oder jede Abweichung erklärt ist.

- **Ergebnis:** Minimiere die Zahl der Konten und Bewegungen der Gemeinschaft, die der Beirat im Prüfzeitraum nicht gesehen hat.
- **Verbindlichkeit:** Sorgfalt, mit Haftungsbezug · **Status:** beobachtet

### J-C3 · Geteilte Kosten nachvollziehen

> Als Verwaltungsbeirat muss ich bei Kosten, die mehrere Gemeinschaften tragen, erkennen, welche Gemeinschaft welchen Anteil nach welchem Schlüssel trägt, um sicher zu sein, dass jede geteilte Rechnung bei allen Beteiligten gleich und richtig gebucht ist.

- **Ergebnis:** Minimiere die Zahl geteilter Rechnungen, deren Anteil oder Schlüssel sich zwischen den beteiligten Gemeinschaften unterscheidet oder ungeklärt ist.
- **Verbindlichkeit:** Sorgfalt · **Status:** beobachtet

### J-C4 · Marktgerecht zahlen

> Als Verwaltungsbeirat muss ich vor der Verlängerung oder Preisanpassung eines Dauervertrags der Gemeinschaft wissen, ob er seinen Preis wert ist, um automatische Preissteigerungen nicht ungeprüft hinzunehmen.

- **Ergebnis:** Minimiere die Zahl der größeren Dauerpositionen, die noch nie bewusst auf ihren Preis geprüft wurden.
- **Verbindlichkeit:** Anliegen · **Status:** beobachtet

### J-C5 · Rücklage und künftiger Bedarf

> Als Verwaltungsbeirat muss ich vor dem Beschluss über den Wirtschaftsplan einschätzen können, ob die Erhaltungsrücklage zum absehbaren Bedarf am Gebäude passt, um die Rücklage begründet statt nur fortgeschrieben zu sehen.

- **Ergebnis:** Minimiere die Unsicherheit, ob die Rücklage den absehbaren Erhaltungsbedarf deckt.
- **Verbindlichkeit:** Anliegen · **Status:** Vorschlag

## D · Bestand und Risiken kennen

### J-D1 · Unterlagen vollständig kennen

> Als Verwaltungsbeirat muss ich spätestens nach Amtsantritt oder Verwalterwechsel wissen, welche Unterlagen die Gemeinschaft haben muss und welche davon fehlen, um Lücken gezielt schließen zu lassen.

- **Ergebnis:** Minimiere die Zahl der Pflichtunterlagen, deren Vorhandensein oder Verbleib unbekannt ist. Heute liegen sie verstreut über Papier, Vorverwaltung und Verwaltung.
- **Verbindlichkeit:** Sorgfalt · **Status:** beobachtet

### J-D2 · Risiken früh sehen

> Als Verwaltungsbeirat muss ich schlummernde Risiken wie Versicherungslücken, ausstehende Wartung oder ablaufende Fristen erkennen, bevor sie teuer werden, um Schäden und Kosten von der Gemeinschaft abzuwenden.

- **Ergebnis:** Minimiere die Wahrscheinlichkeit, dass eine Frist, eine Prüfpflicht oder eine Pflichtversicherung der Gemeinschaft unbemerkt abläuft.
- **Verbindlichkeit:** Sorgfalt · **Status:** beobachtet

### J-D3 · Die geltende Regel kennen

> Als Verwaltungsbeirat muss ich bei jeder Frage, etwa wer bauen darf, wer zahlt oder wer abstimmt, die geltende Regel mit Fundstelle kennen, um meine Position auf Wortlaut statt auf Hörensagen zu stützen.

- **Ergebnis:** Minimiere die Zeit, um zu einer Frage die maßgebliche Regel in Teilungserklärung, Nachträgen und Beschlüssen zu finden.
- **Verbindlichkeit:** Anliegen · **Status:** beobachtet

### J-D4 · Eigene Pflichten und Risiken kennen

> Als Verwaltungsbeirat muss ich bei jeder Handlung im Amt wissen, was ich darf, muss und riskiere, um pflichtgemäß zu handeln und das auch zeigen zu können.

- **Ergebnis:** Minimiere die Unsicherheit über Pflichten und Haftung des Beirats, auch wenn sich die Rechtsprechung ändert.
- **Verbindlichkeit:** Sorgfalt · **Status:** beobachtet

### J-D5 · Ansprüche aus der Bauzeit sichern

> Als Verwaltungsbeirat muss ich bei Schäden am Gemeinschaftseigentum erkennen, was davon Baumangel und was Wartungsversäumnis ist, um Mängelansprüche vor Ablauf der Fristen geltend machen zu lassen.

- **Ergebnis:** Minimiere die Zahl bekannter Mängel, die nicht zugeordnet oder nicht rechtzeitig angezeigt sind.
- **Verbindlichkeit:** Sorgfalt · **Status:** Vorschlag

## E · Beschlüsse der Gemeinschaft

### J-E1 · Versammlung vorbereiten

> Als Verwaltungsbeirat muss ich vor der Eigentümerversammlung zu jedem Tagesordnungspunkt Stand, Vorgeschichte, Alternativen und unsere Position kennen, um in der Versammlung eine belegte Position vertreten zu können.

- **Ergebnis:** Minimiere die Zeit, um zu einem Tagesordnungspunkt Einladungstext, Vorgeschichte und offene Fragen zusammenzuführen. Ziel: In der Sitzung ist jeder Tagesordnungspunkt in Sekunden verständlich.
- **Verbindlichkeit:** Anliegen · **Status:** beobachtet

### J-E2a · Niederschrift prüfen

> Als Verwaltungsbeirat muss ich vor meiner Mitunterschrift prüfen, ob die Niederschrift der Versammlung die Beschlüsse richtig wiedergibt, um keine fehlerhafte Niederschrift mitzuverantworten.

- **Ergebnis:** Minimiere die Zahl der Fehler, die in der unterschriebenen Niederschrift verbleiben.
- **Verbindlichkeit:** Pflicht für den Beiratsvorsitzenden oder seinen Vertreter (Mitunterschrift nach § 24 Abs. 6 WEG), für weitere Mitglieder Sorgfalt · **Status:** beobachtet

### J-E2b · Umsetzung der Beschlüsse verfolgen

> Als Verwaltungsbeirat muss ich nach jeder Versammlung verfolgen, ob die Verwaltung die Beschlüsse umsetzt, um eine ausbleibende Umsetzung früh anzusprechen.

- **Ergebnis:** Minimiere die Zahl der Beschlüsse mit unbekanntem Umsetzungsstand, auch bei älteren Beschlüssen.
- **Verbindlichkeit:** Sorgfalt · **Status:** beobachtet

### J-E3 · Zwischen den Versammlungen entscheiden

> Als Verwaltungsbeirat muss ich für dringliche Fragen zwischen zwei Versammlungen einen gangbaren und rechtssicheren Weg zum Beschluss kennen, um sie ohne Sonderversammlung wirksam entscheiden zu lassen.

- **Ergebnis:** Minimiere die Zahl dringlicher Fragen, die mangels Allstimmigkeit liegen bleiben oder eine Sonderversammlung erfordern.
- **Verbindlichkeit:** Anliegen · **Status:** beobachtet

### J-E4 · Einheitlicher Rahmen für Eigentümer-Vorhaben

> Als Verwaltungsbeirat muss ich darauf hinwirken, dass für wiederkehrende Vorhaben einzelner Eigentümer am Haus, etwa Kühlung, Solar oder Laden, einmal ein fairer Rahmen mit klaren Auflagen beschlossen wird, um Grundsatzdebatten im Einzelfall zu vermeiden.

- **Ergebnis:** Minimiere die Zahl der Eigentümer-Vorhaben, die eine neue Grundsatzdebatte auslösen.
- **Verbindlichkeit:** Anliegen · **Status:** beobachtet · **Ebene:** angrenzender Job, berührt die Rolle „Eigentümer mit eigenen Vorhaben“

## F · Eigentümer und Bewohner

### J-F1 · Anliegen aufnehmen und verfolgen

> Als Verwaltungsbeirat muss ich bei jedem Anliegen, das ein Eigentümer an mich heranträgt, den Stand kennen, um zu verhindern, dass Anliegen bei der Verwaltung versanden.

- **Ergebnis:** Minimiere die Zahl der Anliegen ohne bekannten Stand. Zu Beginn gab es einen großen Altbestand, danach wenige neue Anliegen.
- **Verbindlichkeit:** Anliegen · **Status:** beobachtet

### J-F2 · Alle verständlich informieren

> Als Verwaltungsbeirat muss ich nach jeder wesentlichen Entwicklung alle Eigentümer verständlich informieren, auch die, die kein Deutsch sprechen, um sicherzustellen, dass jeder weiß, was erledigt, offen und geplant ist.

- **Ergebnis:** Minimiere die Zahl der Eigentümer, die den Stand von Erledigtem, Offenem und Geplantem nicht kennen oder nicht verstehen.
- **Verbindlichkeit:** Anliegen · **Status:** beobachtet

### J-F3 · Private Daten anderer schützen

> Als Verwaltungsbeirat muss ich bei jeder Prüfung mit Unterlagen umgehen, die Daten anderer Eigentümer enthalten, ohne fremde personenbezogene Daten weiterzugeben, um die Privatsphäre der Miteigentümer zu wahren.

- **Ergebnis:** Minimiere die Zahl fremder personenbezogener Angaben, die in Berichte, Schreiben oder zu Dritten gelangen. Zielwert null.
- **Verbindlichkeit:** Pflicht (DSGVO, Datenminimierung); die datenschutzrechtliche Rolle des Beirats selbst ist ungeklärt · **Status:** beobachtet

### J-F4 · Rolle bei Nachbarschaftsstreit kennen

> Als Verwaltungsbeirat muss ich bei Streit über Hausordnung oder Nutzung wissen, was meine Aufgabe ist und was nicht, um den Streit an die zuständige Stelle zu geben und unparteiisch zu bleiben.

- **Ergebnis:** Minimiere die Zahl der Streitfälle, in denen der Beirat ohne Mandat als Schiedsrichter auftritt.
- **Verbindlichkeit:** Anliegen · **Status:** Vorschlag · **Ebene:** angrenzender Job

## G · Gebäude im laufenden Betrieb

### J-G1 · Akutes ist in zuständigen Händen

> Als Verwaltungsbeirat muss ich bei einem akuten Ereignis am Gebäude sicher sein, dass jemand Zuständiges handelt und ich davon erfahre, um Schäden zu begrenzen, ohne selbst einspringen zu müssen.

- **Ergebnis:** Minimiere die Zeit, bis ein akutes Ereignis in zuständigen Händen ist (Ziel: am selben Tag), und die Liegezeit kleiner Defekte.
- **Verbindlichkeit:** Anliegen · **Status:** Vorschlag

### J-G2 · Bezahlte Leistung wird erbracht

> Als Verwaltungsbeirat muss ich bemerken, ob die Verwaltung die Leistung der Dienstleister der Gemeinschaft kontrolliert, um sicher zu sein, dass die Gemeinschaft nur erbrachte Leistung bezahlt.

- **Ergebnis:** Minimiere die Zahl der Rechnungen für Leistungen, die nicht oder nicht vollständig erbracht wurden.
- **Verbindlichkeit:** Sorgfalt · **Status:** Vorschlag

## H · Kontinuität

### J-H1 · Übergabefähig bleiben

> Als Verwaltungsbeirat muss ich meinen Stand jederzeit so halten, dass jemand ohne Vorwissen übernehmen kann, um die Gemeinschaft nicht vom Wissen in meinem Kopf abhängig zu machen, wenn ich ausfalle oder abgebe.

- **Ergebnis:** Minimiere die Zeit, die eine Vertretung ohne Vorwissen braucht, um offene Vorgänge, Fristen und Zuständigkeiten zu kennen. Zielwert aus dem Pilot: eine Stunde. Er ist eine Pilotangabe und nicht mit dem Wochenbudget aus J-RB1 zu verwechseln.
- **Verbindlichkeit:** Anliegen · **Status:** beobachtet · **Prüfmaßstab für** [[H-10 - Lesbare Übergabe genügt dem ersten Vertretungsbedarf]]

### J-H2 · Gemeinschaften getrennt halten

> Als Verwaltungsbeirat mehrerer Gemeinschaften muss ich Vorgänge, Schriftwechsel und Geld jeder Gemeinschaft formal sauber getrennt halten, um sicher zu sein, dass nichts in der falschen Gemeinschaft landet.

- **Ergebnis:** Minimiere die Zahl der Vorgänge, die der falschen Gemeinschaft zugeordnet sind. Erschwernis: gleiche Verwaltung, vermischte Schriftwechsel.
- **Verbindlichkeit:** Sorgfalt · **Status:** beobachtet

### J-H3 · Schnell ins Amt finden

> Als neu bestellter Verwaltungsbeirat muss ich auch ohne Übergabe durch meinen Vorgänger zügig ein vollständiges Bild der Lage bekommen, um das Amt von Beginn an pflichtgemäß auszuüben.

- **Ergebnis:** Minimiere die Zeit nach Amtsantritt, bis offene Vorgänge, Verträge, Fristen und Altlasten bekannt sind. Ziel: wenige Wochen.
- **Verbindlichkeit:** Anliegen · **Status:** Vorschlag

## Emotionale und soziale Jobs

Diese Jobs beschreiben, wie sich der Beirat fühlen und wie er gesehen werden will. Sie gelten über alle Gruppen hinweg. Sie folgen derselben Schablone; „muss“ meint hier ein Bedürfnis, keine Pflicht.

### J-EM1 · Ruhe

> Als Verwaltungsbeirat muss ich darauf vertrauen können, dass nichts anbrennt, auch wenn ich eine Woche nicht hinsehe, um das Amt ohne Daueranspannung zu führen.

### J-EM2 · Souveränität

> Als Verwaltungsbeirat muss ich Sachverhalte selbst verstehen und beurteilen können, bevor ich eskaliere, um nicht von der Einschätzung anderer abhängig zu sein.

### J-EM3 · Partnerschaft (sozial)

> Als Verwaltungsbeirat muss ich von der Verwaltung als konstruktiv wahrgenommen werden, um auch kritische Punkte in einer tragfähigen Zusammenarbeit klären zu können.

### J-EM4 · Gemeinwohl (sozial)

> Als Verwaltungsbeirat muss ich erkennbar im Interesse aller Eigentümer und des Viertels handeln, um das Vertrauen der Gemeinschaft in mein Amt zu erhalten.

### J-EM5 · Nicht allein sein

> Als Verwaltungsbeirat muss ich die Last des Amts mit anderen Beiräten und Nachbarn teilen können, um nicht allein für alles einzustehen.

### J-EM6 · Grenze halten

> Als Verwaltungsbeirat muss ich den Aufwand des Amts begrenzt halten, um das Ehrenamt als Ehrenamt ausüben zu können.

## Weitere Rollen

Wer Beirat ist, trägt meist weitere Rollen mit eigenen Jobs. Die Fassung v0.2 zählt diese Jobs, beschreibt sie aber nicht. Deshalb enthält diese Note dazu keine Job-Sätze. Die Zahlen sind eine erste Zählung aus dem Pilot.

| Rolle | Gezählte Jobs | Hinweis |
| --- | --- | --- |
| Beirat im Viertel (gemeinsame Vorhaben, Austausch) | 7 | größter Schmerz im Pilot; nächster Kandidat für eine eigene Beschreibung; eigenes Interviewmodul |
| Eigentümer mit eigenen Vorhaben | 6 | an dritter Stelle der Pilot-Schmerzpunkte; berührt J-E4 |
| Vermieter | 3 | |
| Mieter und Bewohner | 3 | |
| Verwaltung (Gegenüber) | etwa 6 | im Pilot nicht erhoben |

## Randbedingungen

Randbedingungen sind keine Jobs und keine Lösungen. Sie beschreiben den Rahmen, in dem jeder Job erfüllt werden muss, und dienen in der Research als Auswahl- und Prüfkriterien.

| Kennung | Randbedingung |
| --- | --- |
| J-RB1 | Rund eine Stunde pro Woche für das Amt; schnelle Reaktion auf Dringendes. Pilotangabe, als Annahme geprüft in [[H-03 - Wochenarbeit bleibt innerhalb einer Stunde]]. |
| J-RB2 | Kontroll- und Zustimmungsrechte, keine Ausführungsbefugnis. |
| J-RB3 | Nichts geht ohne persönliche Freigabe des Beirats nach außen. |
| J-RB4 | Daten anderer Eigentümer nur so weit, wie die Prüfung es erfordert. |
| J-RB5 | Ergebnisse bleiben für Menschen ohne Vorkenntnis und ohne besondere Hilfsmittel lesbar. |
| J-RB6 | Bewertungen des Beirats über die Verwaltung bleiben standardmäßig intern und gehen nur nach bewusster Prüfung je Empfänger weiter, im Sinne von [[K-07 - Sachstand gezielt teilen und Bewertungen intern halten]] und [[DF-11 - Sachstand und Bewertung]]. |

## Bezüge zum Produkt

Die Tabelle zeigt, wo das Konzept einen Job bereits aufgreift. Ein Bezug heißt nicht, dass der Job gelöst ist. Er zeigt, wo Interviewergebnisse auf Entscheidungen, Hypothesen und Features zurückwirken.

| Job | Bezüge | Worum es geht |
| --- | --- | --- |
| J-0, J-M2, J-M3 | [[H-01 - Beiratsfokus deckt den ersten Pilotbedarf]], [[H-02 - Einzelne Vorgänge machen den Arbeitsstand verständlich]], [[K-03 - Einzeln erledigbarer Vorgang als Kerneinheit]], [[F-03 - Einzelne Vorgänge bearbeiten]] | Vorgang als Einheit, Beiratsfokus |
| J-A1 | [[H-04 - Sieben Entscheidungen sind ein brauchbares Arbeitsbudget]], [[K-05 - Sieben reguläre Entscheidungen mit sichtbarem Überlauf]], [[F-06 - Wochenpaket vorbereiten]], [[F-07 - Entscheidungskarten entscheiden]] | begrenzte Auswahl dessen, was eine Entscheidung braucht |
| J-A2, J-A3 | [[F-10 - Lagecheck und Wiedereinstieg]], [[F-05 - Quellen und Verlauf zuordnen]] | Dringlichkeit, Verlauf, Wiedereinstieg |
| J-A4 | [[F-08 - Kommunikation vorbereiten und Versand erfassen]] | eigene Abwägung in ausgehender Kommunikation |
| J-A5 | [[F-03 - Einzelne Vorgänge bearbeiten]] | Abschluss eines Vorgangs |
| J-B1, J-B3 | [[K-06 - Eskalation an Versand und Fristen ausrichten]], [[F-04 - Termine und eigene Schritte führen]], [[F-09 - Verwaltungszusagen nachfassen]] | Zusage, Termin, Eskalation |
| J-B4 | [[F-15 - Auswertungen und Feedback vertiefen]] | Leistungsbilanz, späterer Ausbau |
| J-C2, J-C3, J-G2 | [[F-17 - Rechnungen und Zahlungen führen]] | nur teilweise, späterer Ausbau |
| J-E1, J-F2 | [[F-14 - Berichte und Versammlungsvorbereitung]] | Versammlung und Bericht, späterer Ausbau |
| J-F1 | [[F-03 - Einzelne Vorgänge bearbeiten]], [[F-05 - Quellen und Verlauf zuordnen]] | Anliegen als Vorgang |
| J-F3, J-RB6 | [[K-07 - Sachstand gezielt teilen und Bewertungen intern halten]], [[F-11 - Vertraulichkeit und gezielte Übergabe]], [[DF-10 - Vertraulichkeitsprüfung]] | Vertraulichkeit je Empfänger |
| J-G1 | [[F-16 - Operative Handwerkersteuerung]] | späterer Ausbau; J-RB2 beachten |
| J-H1 | [[K-08 - Vertretung zunächst durch lesbare Übergabe unterstützen]], [[H-09 - Eine ausgewählte Übergabe ist ohne Hintergrundwissen verständlich]], [[H-10 - Lesbare Übergabe genügt dem ersten Vertretungsbedarf]], [[F-11 - Vertraulichkeit und gezielte Übergabe]] | lesbare Übergabe |
| J-H2 | [[K-02 - Zwei Gemeinschaften für einen Bearbeiter]], [[F-01 - Gemeinschaften, Personen und Rollen]], [[DF-12 - Gemeinschaftstrennung]] | Trennung der Gemeinschaften |
| J-RB1 | [[H-03 - Wochenarbeit bleibt innerhalb einer Stunde]] | Zeitbudget |
| J-RB3 | [[F-08 - Kommunikation vorbereiten und Versand erfassen]] | Freigabe vor Versand |

**Jobs ohne Bezug im Konzept:** J-B2, J-B5, J-C1, J-C4, J-C5, J-D1 bis J-D5, J-E2a, J-E2b, J-E3, J-E4, J-F4, J-H3 und J-EM1 bis J-EM6. Besonders auffällig ist J-C1: eine gesetzliche Pflicht ohne Feature. Ob diese Jobs in den Produktumfang gehören, entscheiden die Interviews und eine spätere Produktentscheidung, nicht dieser Katalog.

**Konzeptteile ohne Job:** [[H-05 - Manuelle Eingangsübernahme bleibt alltagstauglich]], [[H-06 - Vorbereitete Wochenarbeit ist ohne verpflichtende KI nützlich]], [[H-07 - Obsidian trägt die tatsächliche mobile Arbeit]], [[H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]], [[H-11 - Der Nutzen führt zu erneuter Verwendung]], [[H-12 - Ein optionaler Onlinedienst kann wirtschaftlich tragfähig sein]] sowie die Entscheidungen K-10 bis K-17 betreffen die Lösung, ihren Betrieb oder das Geschäftsmodell. Das ist erwartbar, weil der Katalog lösungsneutral ist. Das Erfassen und Zuordnen von Eingängen ([[F-05 - Quellen und Verlauf zuordnen]]) ist am ehesten ein Teilschritt von J-A1 und J-B2.

## Änderungen

**Fachsprache (22.11.2026):**

- WCS-Begriffe übernommen ([[K-20 - WCS-Datenmodell als fachliche Grundlage]]): „offener Vorgang“ statt „offener Punkt“, „Eskalation“ statt „gestuftes Nachfassen“. Die Job-Sätze bleiben inhaltlich gleich.

**v0.3 (21.11.2026):**

- Alle Kennungen tragen das Präfix `J-`, um Verwechslungen mit anderen Kennungen im Repository zu vermeiden.
- Begriffe an das Konzept angeglichen: „offener Punkt“ statt „Thema“, „Tagesordnungspunkt“ in J-E1, Gruppe E heißt „Beschlüsse der Gemeinschaft“.
- J-RB6 an [[K-07 - Sachstand gezielt teilen und Bewertungen intern halten]] angepasst: standardmäßig intern statt pauschal vertraulich.
- Job-Sätze geschärft: Situation in J-A1, J-C4, J-C5, J-D1, J-D4, J-D5, J-F1, J-F2 ergänzt; Messgrößen aus J-A3 und J-E1 ins Ergebnis verschoben; Ziele von J-B3, J-B5, J-D2, J-H3 und J-EM2 auf den nächsthöheren Fortschritt gerichtet; J-A4 ohne Annahme über fremde Entwürfe; J-G2 auf die Überwachung der Verwaltung ausgerichtet.
- J-E2 in J-E2a (Niederschrift prüfen, Pflicht) und J-E2b (Umsetzung verfolgen, Sorgfalt) geteilt, weil der Satz zwei Objekte hatte.
- J-A5 als Kandidat aus der Job-Map-Prüfung aufgenommen.
- Eigener Typ `JobsToBeDone` mit Verknüpfungen zu Akteuren, Hypothesen, Entscheidungen und Regeln; neuer Abschnitt „Bezüge zum Produkt“.

**Nachprüfung v0.3 (21.11.2026):**

- Job-Sätze geschärft: J-B1 (Termin klären statt festhalten), J-C1 (ohne Formvorgabe „schriftlich“, die das Gesetz nicht nennt), J-D5 (Satzbau), J-E2b und J-G2 (eigenes „um …“ statt Wiederholung bzw. passend zum Ergebnis), J-F1 (ohne Selbstverständliches).
- J-A2 um das Gegenstück im Ergebnis ergänzt: übersehenes Dringendes.
- Verbindlichkeit präzisiert: J-E2a trifft nach § 24 Abs. 6 WEG den Vorsitzenden oder seinen Vertreter; J-F3 mit Hinweis auf die ungeklärte Rolle des Beirats; § 29 Abs. 2 S. 2 WEG als Soll-Vorschrift benannt.
- Statusmodell auf die Research verwiesen; „Jobs ohne Bezug“ um J-EM1 bis J-EM6 vervollständigt.

**Erste Fassung dieser Note (21.11.2026):** Überführung der Ausgangsfassung v0.2 in die Schablone, mit Ergebnis, Verbindlichkeit und Status je Job.
