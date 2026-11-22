---
type: Research
status: entwurf
scope: ""
date: 2026-11-21
actors:
  - "[[ACT-01-Beirat]]"
  - "[[ACT-02-Verwaltung]]"
  - "[[ACT-03-Eigentuemer]]"
---

# JTBD-Research · Grundlagen und Methodik Verwaltungsbeirat

**Ergebnis:** Der Jobkatalog [[JTBD - Verwaltungsbeirat]] ist methodisch tragfähig und fachlich gut verankert. Fast jeder Job hat eine Grundlage im WEG oder in angrenzendem Recht. Am stärksten verpflichtend sind J-C1 (Prüfung und Stellungnahme, als Soll-Vorschrift), J-E2a (Prüfung der Niederschrift vor der Mitunterschrift des Vorsitzenden) und J-F3 (Datenminimierung). J-C2 hat ein besonders hohes Haftungsgewicht: Wer die Auszüge eines bekannten Rücklagenkontos nicht prüft, handelt laut einem Bericht über einen Hinweisbeschluss des OLG München grob fahrlässig [S]. Größte Evidenzlücke ist der Beirat selbst. Zu Zeitaufwand, Überforderung und Nachwuchs von Beiräten gibt es keine belastbaren Zahlen. Genau dort setzt die eigene User Research an.

## Auftrag, Methode und Evidenzgrenze

Desk Research am 21.11.2026 in drei parallelen Strängen:

1. JTBD-Methodik: Formulierung, Ebenen, Outcomes, Interview- und Befragungsmethoden.
2. Fachliche Grundlagen der Jobs A–D.
3. Fachliche Grundlagen der Jobs E–H, der emotionalen Jobs und der weiteren Rollen.

Grundlage ist die Fassung „JTBD Verwaltungsbeirat v0.2“ vom 21.11.2026. Sie liegt nicht im Repository.

**Was geprüft wurde und was nicht:**

- WEG-Normtexte sind am Wortlaut auf gesetze-im-internet.de geprüft, ebenso die Gesetzesbegründung BT-Drs. 19/18791 und drei BGH-Pressemitteilungen.
- Die übrigen Urteile stammen aus Fachportalen und Verbänden (Haufe, VDIV, Wohnen im Eigentum, Haus & Grund, LTO, rewis). Ihre Volltexte wurden nicht gelesen.
- Bei der Methodik waren einige Primärquellen nicht abrufbar, darunter Klements Originalartikel; Kalbachs Buch nur über Auszug und Rezension. Wo das zutrifft, ist es vermerkt.
- Es fanden keine Interviews, Beobachtungen oder Befragungen statt.

**Kennzeichnung:**

- **[B]**: Beleg, am Normtext, an der Drucksache, an einer BGH-Pressemitteilung oder an der Methodikquelle selbst geprüft.
- **[S]**: sekundär, aus Fachportal oder Verband, nicht am Urteil selbst geprüft.
- **[A]**: eigene Ableitung für dieses Projekt.
- **[L]**: Lücke, nichts Belastbares gefunden.

Keine Rechtsberatung. Rechtsaussagen helfen bei der Einordnung der Jobs und entscheiden keinen konkreten Fall. Vor einer Verwendung in Produkttexten sind Urteile im Volltext gegenzulesen.

## 1. Methodik: Jobs sauber formulieren

### 1.1 Was ein Job ist

- [B] Ein Job ist „the progress that the customer is trying to make in a given circumstance“. Die Umstände sind wichtiger als Merkmale der Person, und Jobs haben immer auch soziale und emotionale Dimensionen ([Christensen et al., HBR 2016](https://hbr.org/2016/09/know-your-customers-jobs-to-be-done)).
- [B] Ein Job Statement hat die Form Verb + Objekt + Kontext und ist stabil: „The Job doesn't change when the solution changes“ ([Strategyn, JTBD-Template](https://strategyn.com/?p=42514)). Kalbach verwendet dieselbe Grammatik ([UXmatters, Buchauszug](http://www.uxmatters.com/mt/archives/2020/05/book-excerpt-the-jobs-to-be-done-playbook.php)).
- [B] Ein Job nennt keine Lösung: „Do not include any reference to a particular solution in your job map“ ([Strategyn, Job Map](https://strategyn.com/jobs-to-be-done/jobs-to-be-done-playbook/build-your-job-map/)).

### 1.2 Ebenen

| JTBD-Ebene [B] | Entsprechung im Katalog [A] |
| --- | --- |
| Job Executor | Abschnitt „Job-Ausführender“: der ehrenamtliche Beirat. Eigentümer sind Abnehmer, die Verwaltung ist Gegenüber. |
| Core Functional Job | Hauptjob J-0 |
| Job-Map-Schritte bzw. Teiljobs | J-A1–J-H3, thematisch gruppiert |
| Related Jobs | J-E4, J-F4 und die weiteren Rollen |
| Emotionale und soziale Jobs | J-EM1 bis J-EM6 |
| Desired Outcomes | Erfolgsmaße J-M1 bis J-M5 und die „Ergebnis“-Zeile je Job |
| Constraints | Randbedingungen J-RB1 bis J-RB6 |
| Consumption Jobs | bewusst nicht enthalten. Sie entstehen erst mit einer Lösung. |

Strategyn führt Executor, Core Job, Job Map, Related, Emotional und Consumption Jobs als feste Template-Elemente ([Strategyn, JTBD-Template](https://strategyn.com/?p=42514)).

### 1.3 Die Schablone „Als <Rolle> muss ich …, um …“

[B] Gegen rollenbasierte User Stories gibt es eine bekannte Kritik. Sie beschreiben Funktionen statt Motivation und blenden Situation und Kausalität aus ([Intercom, Job Stories](https://www.intercom.com/blog/accidentally-invented-job-stories/); [Klement bei Intercom](https://www.intercom.com/blog/using-job-stories-design-features-ui-ux/)). Klement räumt aber ein, dass Rollen als Teil der Situation hilfreich sein können ([jtbd.info](https://jtbd.info/replacing-the-user-story-with-the-job-story-af7cdee10c27), nur über Auszug).

[A] Für diesen Katalog ist die Schablone vertretbar. „Verwaltungsbeirat“ ist keine erfundene Persona, sondern eine gesetzlich definierte Rolle mit Pflichten. Das ist genau der Job Executor, und die Rolle erklärt hier tatsächlich Ursache: Viele Jobs entstehen aus dem Amt. Vier Regeln halten die Sätze JTBD-tauglich:

1. **Situation in den Satz.** Jeder Satz nennt, wann der Job anfällt, etwa „vor dem Beschluss der Eigentümerversammlung“. Das entspricht Klements „When“.
2. **Keine Lösung im „muss ich …“.** Werkzeuge, Kanäle und Funktionen sind ausgeschlossen. Prüfung: Wäre der Satz vor 20 Jahren und in 10 Jahren derselbe?
3. **„muss“ von der Rechtspflicht trennen.** Die Schablone verwendet überall „muss“. Ob es eine Pflicht ist, steht im Feld Verbindlichkeit (Pflicht, Sorgfalt, Anliegen).
4. **„um …“ zeigt nach oben.** Das Ziel ist der nächsthöhere Job oder ein Fortschritt, nie ein Feature. Prüfung mit der Warum-Wie-Leiter: „Warum?“ führt Richtung Hauptjob, „Wie?“ Richtung Schritt oder Lösung.

### 1.4 Ergebnisse als Desired Outcomes

- [B] Ein Desired Outcome hat die Form Richtung + Messgröße + Objekt + Kontext, etwa „Minimize the time it takes to …“ ([Strategyn](https://strategyn.com/?p=42514); [Strategyn, Unmet Needs](https://strategyn.com/quantify-your-customers-unmet-needs)). Ein Core Job hat typischerweise 50 bis 150 Outcomes.
- [B] Das starre Format kann im Gespräch unnatürlich klingen ([JTBD Substack](https://jobstobedone.substack.com/p/desired-outcome-or-something-simpler)).
- [A] Die „Erfolg“-Aussagen der Fassung v0.2 beschreiben Zielzustände. Der Katalog überführt sie in je eine Messgröße mit Richtung. In der Research sollten je Job ein bis drei weitere Outcomes entstehen. Der Schmerz liefert dafür das Gegenstück.

### 1.5 Lückenprüfung mit der Job Map

[B] Die universelle Job Map hat acht Schritte: Define, Locate, Prepare, Confirm, Execute, Monitor, Modify, Conclude. Nicht jeder Job hat alle ([Strategyn, Job Map](https://strategyn.com/jobs-to-be-done/jobs-to-be-done-playbook/build-your-job-map/); [Customer-Centered Innovation Map](https://strategyn.com/customer-centered-innovation-map/)).

[A] Zuordnung aller Teiljobs aus Fassung 0.3 zu ihrem Hauptschritt, jeder Job genau einmal. Einige Jobs berühren mehrere Schritte; genannt ist der prägende.

| Schritt | Bedeutung für den Beirat | Jobs |
| --- | --- | --- |
| Define | festlegen, was ansteht und was die eigene Entscheidung braucht | J-A1, J-A2, J-E1, J-C5 |
| Locate | Informationen, Unterlagen und Regeln beschaffen | J-B2, J-D1, J-D3, J-F1, J-H3 |
| Prepare | Grundlage für Prüfung oder Position herstellen | J-B5, J-E4 |
| Confirm | vor dem Handeln prüfen, ob es zulässig und richtig ist | J-D4, J-F3, J-F4, J-E2a |
| Execute | prüfen, Stellung nehmen, informieren, Beschluss herbeiführen | J-C1, J-C3, J-C4, J-E3, J-A4, J-F2 |
| Monitor | Zusagen, Konten, Risiken und Leistungen beobachten | J-B1, J-C2, J-D2, J-D5, J-G1, J-G2, J-E2b, J-H2 |
| Modify | bei Abweichung nachsteuern | J-B3, J-A3 |
| Conclude | abschließen, bilanzieren, übergeben | J-A5, J-B4, J-H1 |

Die Prüfung in Fassung 0.2 fand beim Schritt Conclude keinen Job für den Abschluss einzelner Vorgänge. Daraus ist der Kandidat J-A5 entstanden; er bleibt bis zu den Interviews ungeprüft (Abschnitt 4, Frage 1; im Leitfaden FF-9).

## 2. Fachliche Grundlagen je Job

Die Tabellen nennen je Job die maßgebliche Grundlage und, wo vorhanden, Frist oder Haftungsbezug. Die rechte Spalte begründet die Einstufung der Verbindlichkeit im Katalog.

### 2.1 Rolle des Beirats insgesamt

- [B] Wohnungseigentümer werden durch Beschluss zum Mitglied des Beirats bestellt. Eine Mitgliederzahl schreibt das Gesetz nicht vor; Vorsitzender und Stellvertreter sind nur bei mehreren Mitgliedern zu bestimmen ([§ 29 Abs. 1 WEG](https://www.gesetze-im-internet.de/woeigg/__29.html)). [S] Ein einzelnes Mitglied nimmt dann die Aufgaben des Vorsitzenden wahr (BT-Drs. 19/18791, S. 78; am Wortlaut des Gesetzes nicht ablesbar).
- [B] Er „unterstützt und überwacht den Verwalter bei der Durchführung seiner Aufgaben“ (§ 29 Abs. 2 S. 1 WEG). Einen Rhythmus schreibt das Gesetz nicht vor. Die Gesetzesbegründung warnt ausdrücklich vor einer Überlastung des Beirats (BT-Drs. 19/18791, S. 78).
- [B] Der Beiratsvorsitzende vertritt die Gemeinschaft gegenüber dem Verwalter ([§ 9b Abs. 2 WEG](https://www.gesetze-im-internet.de/woeigg/__9b.html)). Nach außen hat der Beirat keine Vertretungsmacht.
- [B] Ein eigenes Einsichtsrecht hat der Beirat nicht, nur das jedes Eigentümers ([§ 18 Abs. 4 WEG](https://www.gesetze-im-internet.de/woeigg/__18.html); BT-Drs. 19/18791, S. 78).
- [B] Wer unentgeltlich tätig ist, haftet nur für Vorsatz und grobe Fahrlässigkeit (§ 29 Abs. 3 WEG).
- [B] Die Amtszeit ist gesetzlich nicht geregelt; Abberufung ist jederzeit möglich ([S] BGH V ZR 225/24, [Haufe](https://www.haufe.de/immobilien/verwaltung/bgh-juristische-personen-koennen-weg-verwaltungsbeirat-sein_258_657256.html)).

### 2.2 A · Aufmerksamkeit steuern

| Job | Grundlage und Frist | Einordnung |
| --- | --- | --- |
| J-A1 | [B] Überwachung als Daueraufgabe (§ 29 Abs. 2 S. 1 WEG), ohne vorgeschriebenen Rhythmus. | [A] Ein fester Wochenrhythmus ist kein Rechtsgebot, belegt aber Sorgfalt. |
| J-A2 | [B] Fristen, die den Beirat treffen: Anfechtungsklage 1 Monat, Begründung 2 Monate ab Beschluss ([§ 45 WEG](https://www.gesetze-im-internet.de/woeigg/__45.html)). Einladung soll mindestens 3 Wochen vorher erfolgen ([§ 24 Abs. 4](https://www.gesetze-im-internet.de/woeigg/__24.html)). Die Niederschrift ist „unverzüglich“ aufzunehmen; der Beiratsvorsitzende oder sein Vertreter unterschreibt mit (§ 24 Abs. 6). Eine eigene Frist für die Unterschrift nennt das Gesetz nicht. Mängelansprüche 5 Jahre ab Abnahme ([§ 634a BGB](https://www.gesetze-im-internet.de/bgb/__634a.html)). Regelverjährung 3 Jahre ([§§ 195, 199 BGB](https://www.gesetze-im-internet.de/bgb/__199.html)). Wiederbestellung des Verwalters frühestens 1 Jahr vor Ablauf ([§ 26 Abs. 2](https://www.gesetze-im-internet.de/woeigg/__26.html)). | [A] Die Liste der „unterbrechenden“ Anlässe aus v0.2 (Fristen, Unterschriften, Akutes, Kosten) ist rechtlich gut gedeckt. |
| J-A3 | [B] Gesetzliche „Gedächtnisse“ der Gemeinschaft sind Beschluss-Sammlung und Niederschriften (§ 24 Abs. 6–8 WEG). | [A] Keine Pflicht. [S] Beiratsprotokolle können zu den einsehbaren Verwaltungsunterlagen zählen (LG Frankfurt, laut Sekundärquelle). Das berührt J-RB6. |
| J-A4 | [B] Der Beirat gibt eine *eigene* Stellungnahme ab (§ 29 Abs. 2 S. 2 WEG). | [A] Was hinausgeht, ist entweder Meinung oder Erklärung des Vorsitzenden nach § 9b Abs. 2. Der Unterschied sollte im Text erkennbar sein. |

### 2.3 B · Verwaltung überwachen und führen

| Job | Grundlage und Frist | Einordnung |
| --- | --- | --- |
| J-B1 | [B] Der Verwaltervertrag ist Geschäftsbesorgung. Der Verwalter schuldet Nachricht, Auskunft über den Stand und Rechenschaft ([§§ 675, 666 BGB](https://www.gesetze-im-internet.de/bgb/__666.html)). Gläubigerin ist die Gemeinschaft, vertreten durch den Beiratsvorsitzenden (§ 9b Abs. 2). Beschlüsse muss der Verwalter vollziehen (BT-Drs. 19/18791, S. 74 f.). | [A] Ein Auskunftsverlangen mit Datum ist das rechtliche Gegenstück zu „Zusage mit Termin“. |
| J-B2 | [B] Der Verwalter darf ohne Beschluss handeln bei Maßnahmen untergeordneter Bedeutung, die nicht zu erheblichen Verpflichtungen führen, und bei Maßnahmen, die zur Wahrung einer Frist oder zur Abwendung eines Nachteils erforderlich sind ([§ 27 Abs. 1 WEG](https://www.gesetze-im-internet.de/woeigg/__27.html)). Die Eigentümer können das per Beschluss einschränken, etwa durch Wertgrenzen oder indem sie „Zahlungen ab einem bestimmten Betrag“ an eine Zustimmung binden (§ 27 Abs. 2; BT-Drs. 19/18791, S. 75). Nach außen bleibt die Vertretungsmacht unbeschränkt (§ 9b Abs. 1 S. 3). | [A] Der rechtliche Hebel für J-B2 ist ein Informations- oder Zustimmungsvorbehalt ab einer Wertgrenze. Ein Verstoß ist eine Pflichtverletzung im Innenverhältnis. |
| J-B3 | [B] Eskalationsstufen: Auskunft verlangen (§ 666 BGB), Befugnisse beschränken (§ 27 Abs. 2), Einberufung verlangen (mehr als ein Viertel der Eigentümer, § 24 Abs. 2) oder, wenn der Verwalter fehlt oder sich pflichtwidrig weigert, als Vorsitzender selbst einberufen (§ 24 Abs. 3), Abberufung jederzeit (§ 26 Abs. 3), Beschlussersetzungsklage ([§ 44 Abs. 1 S. 2](https://www.gesetze-im-internet.de/woeigg/__44.html)). | [S] Kleine Gemeinschaften finden zunehmend keine Verwaltung ([VDIV, Verwalterlosigkeit](https://vdiv.de/presse/details/wege-aus-der-verwalterlosigkeit-innovative-ansaetze-zur-verwaltung-kleiner-eigentuemergemeinschaften-gesucht)). [A] Das macht den Wechsel schwer und den Wunsch nach Nachdruck ohne Bruch plausibel. |
| J-B4 | [S] Eine Entlastung widerspricht ordnungsmäßiger Verwaltung, wenn Ansprüche gegen den Verwalter erkennbar sind (BGH V ZB 11/03, [Haufe](https://www.haufe.de/id/beitrag/entlastung-des-verwalters-HI13042099.html)). Eine nachträgliche Genehmigung steht ihr gleich (BGH V ZR 76/24, [RWS](https://www.rws-verlag.de/aktuell/wirtschaftsrecht-aktuell/bgh-versaeumnisurteil-vom-18-juli-2025-v-zr-7624-83287)). | [A] Eine belegte Bilanz aus Zusage, Lieferung und Dauer macht genau diese Prüfung möglich. |
| J-B5 | [B] Bestellung höchstens 5 Jahre, Erstbestellung 3 Jahre. Der Vertrag endet spätestens 6 Monate nach Abberufung. Diese Regeln sind zwingend (§ 26 WEG). Anspruch auf einen zertifizierten Verwalter; Ausnahme bei weniger als neun Sondereigentumsrechten, wenn ein Eigentümer Verwalter ist und weniger als ein Drittel einen zertifizierten Verwalter verlangt ([§ 26a](https://www.gesetze-im-internet.de/woeigg/__26a.html), § 19 Abs. 2 Nr. 6, § 48 Abs. 4). [S] Muster-Verwaltervertrag von VDIV und Haus & Grund, Februar 2025 ([Haus & Grund](https://www.hausundgrund.de/verband/bayern/neuer-verwaltervertrag-fuer-die-weg-verwaltung)). Durchschnittliche Vergütung 2025 rund 29 € je Einheit und Monat, netto oder brutto offen ([VDIV-Branchenbarometer 2026](https://vdiv.de/news-details/branchenbarometer-2026-wirtschaftlich-auf-wachstumskurs-personell-am-limit)). | [A] Das Leistungsverzeichnis des Mustervertrags taugt als Anforderungsprofil. Das Zeitfenster ergibt sich aus der Wiederbestellungsfrist. |

### 2.4 C · Geld prüfen

| Job | Grundlage und Frist | Einordnung |
| --- | --- | --- |
| J-C1 | [B] Wirtschaftsplan und Jahresabrechnung „sollen“ vor dem Beschluss vom Beirat geprüft und mit seiner Stellungnahme versehen werden (§ 29 Abs. 2 S. 2 WEG). Beschlossen werden nur Vorschüsse und Nachschüsse; das Zahlenwerk dient der Vorbereitung ([§ 28](https://www.gesetze-im-internet.de/woeigg/__28.html); BT-Drs. 19/18791, S. 76 f.). Dazu kommt der Vermögensbericht (§ 28 Abs. 4). [S] Fehler machen den Beschluss nur anfechtbar, wenn sie die Abrechnungsspitze ändern (BGH V ZR 195/23, [Haufe](https://www.haufe.de/immobilien/verwaltung/bgh-nur-zahlungsrelevante-fehler-kippen-jahresabrechnung_258_635188.html)). | Pflicht. [L] Eine frei verfügbare Prüfcheckliste für Beiräte von einem Verband wurde nicht gefunden; es gibt [VDIV-Tipps zur Belegprüfung](https://vdiv.de/publikationen/magazine/detail/10-tipps-fuer-die-belegpruefung-mit-verwaltungsbeiraeten). |
| J-C2 | [S] OLG München, Hinweisbeschluss vom 3.6.2026 (31 U 1110/26e): Beiräte, die die Auszüge eines ihnen bekannten Rücklagenkontos nicht prüfen, handeln grob fahrlässig. Ihre Unkenntnis wird der Gemeinschaft zugerechnet, ein Anspruch war deshalb verjährt ([VDIV](https://vdiv.de/aktuelles/urteile/details/daempfer-fuer-das-ehrenamt-der-verwaltungsbeirat-handelt-grob-fahrlaessig-wenn-er-die-kontoauszuege-des-ruecklagenkontos-nicht-prueft)). [B] Kontoauszüge gehören zu den einsehbaren Verwaltungsunterlagen (§ 18 Abs. 4; BT-Drs. 19/18791, S. 59 f.). | Sorgfalt mit hohem Haftungsgewicht. [A] Das Risiko ist ein bekanntes, aber ungeprüftes Konto. Die Reichweite des Beschlusses (Einzelfall oder Linie) ist offen. |
| J-C3 | [B] Kostenverteilung nach Miteigentumsanteilen, abweichend per Mehrheitsbeschluss für einzelne Kostenarten ([§ 16 Abs. 2 WEG](https://www.gesetze-im-internet.de/woeigg/__16.html)). [B] Ist eine objektbezogene Kostentrennung für eine Tiefgarage vereinbart, braucht eine Umverteilung auf alle einen sachlichen Grund (BGH V ZR 236/23, [PM 033/2025](https://www.bundesgerichtshof.de/SharedDocs/Pressemitteilungen/DE/2025/2025033.html)). | [A] Entscheidend ist, ob die Tiefgarage eine eigene Gemeinschaft oder eine Untergemeinschaft ist. Bei getrennten Gemeinschaften beruhen geteilte Kosten auf Vertrag oder Dienstbarkeit, nicht auf § 16. [L] Keine Fachquelle zu Durchlaufposten zwischen getrennten Gemeinschaften gefunden. |
| J-C4 | [B] Vor Erhaltungsmaßnahmen keine allgemeine Pflicht zu Vergleichsangeboten; ein Beschluss über ein objektiv ungeeignetes oder überteuertes Angebot kann aber gegen ordnungsmäßige Verwaltung verstoßen. Das muss der Kläger innerhalb der Anfechtungsfrist rügen und beweisen (BGH V ZR 7/25, [PM 057/2026](https://www.bundesgerichtshof.de/SharedDocs/Pressemitteilungen/DE/2026/2026057.html)). [B] Laufzeit- und Kündigungsgrenzen für Dauerverträge mit Verbrauchern ([§ 309 Nr. 9 BGB](https://www.gesetze-im-internet.de/bgb/__309.html)); die Gemeinschaft gilt in der Regel als Verbraucher ([S] BGH VIII ZR 243/13, Urteil von 2015). [L] Ob das nach der WEG-Reform 2020 fortgilt, ist ungeprüft. | [A] Das BGH-Urteil betrifft Erhaltungsmaßnahmen; die Übertragung auf Dauerverträge ist eine Ableitung. Je Dauerposition sind Laufzeit, Kündigungstermin und Preisanpassungsklausel die prüfbaren Angaben. |
| J-C5 | [B] Zur ordnungsmäßigen Verwaltung gehört eine „angemessene Erhaltungsrücklage“ ([§ 19 Abs. 2 Nr. 4](https://www.gesetze-im-internet.de/woeigg/__19.html)), gemeint ist verfügbares Vermögen (BT-Drs. 19/18791, S. 61). Eine Höhe ist nicht festgelegt. [S] Anhaltspunkte sind die Peterssche Formel und die Sätze nach [§ 28 II. BV](https://www.gesetze-im-internet.de/bvo_2/__28.html) ([VDIV](https://vdiv.de/publikationen/magazine/detail/die-erhaltungsruecklage)). | [A] Am belastbarsten ist ein Erhaltungsplan aus Bauteilen, Restnutzungsdauer und Kosten. |

### 2.5 D · Bestand und Risiken kennen

| Job | Grundlage und Frist | Einordnung |
| --- | --- | --- |
| J-D1 | [B] Mindestbestand mit Fundstelle: Teilungserklärung und Gemeinschaftsordnung (§§ 3, 8, 10 WEG), Aufteilungsplan ([§ 7 Abs. 4](https://www.gesetze-im-internet.de/woeigg/__7.html)), Niederschriften und Beschluss-Sammlung (§ 24 Abs. 6–8), Wirtschaftspläne, Abrechnungen und Vermögensberichte (§ 28), Verträge, Kontoauszüge und Pläne (§ 18 Abs. 4), Versicherungen (§ 19 Abs. 2 Nr. 3), Verwaltervertrag (§ 26), Energieausweis, Prüfbescheinigungen und Abnahmeprotokoll. | [A] Fehlt etwas aus der Vorverwaltung, hat die Gemeinschaft einen Herausgabeanspruch (§ 667 BGB). [L] Eine Unterlagen-Checkliste speziell für Beiräte wurde nicht gefunden. |
| J-D2 | [B] Versicherung des Gemeinschaftseigentums zum Neuwert und Haftpflicht (§ 19 Abs. 2 Nr. 3). Elementarschaden ist nicht ausdrücklich genannt ([WiE-Positionspapier April 2026](https://www.wohnen-im-eigentum.de/system/files/documents/wie_positionspapier_elementarschadenversicherung_08042026.pdf)). [B] Prüfpflichten: Legionellen bei Großanlagen mit Duschen und gewerblicher Abgabe, etwa Vermietung, mindestens alle 3 Jahre ([§ 31 TrinkwV](https://www.gesetze-im-internet.de/trinkwv_2023/__31.html)), Aufzug-Hauptprüfung höchstens alle 2 Jahre ([BetrSichV Anhang 2](https://www.gesetze-im-internet.de/betrsichv_2015/anhang_2.html)). [S] CO-Warnanlage und Lüftung der Tiefgarage nach Landesrecht, meist alle 3 Jahre. Rauchwarnmelder nach Landesbauordnung. [B] Die Gemeinschaft bleibt für Verkehrssicherung verantwortlich, auch wenn die Teilungserklärung die Erhaltung zuweist (BGH V ZR 102/24, [PM 072/2026](https://www.bundesgerichtshof.de/SharedDocs/Pressemitteilungen/DE/2026/2026072.html)). | [A] Fristen und Prüfer hängen vom Bundesland und von der Garagengröße ab. Beides ist für den Pilot zu klären. |
| J-D3 | [B] Rangfolge: zwingendes Gesetz, Vereinbarungen (Teilungserklärung, Gemeinschaftsordnung, Nachträge), dispositives Gesetz, Beschlüsse, Hausordnung ([§ 10](https://www.gesetze-im-internet.de/woeigg/__10.html), [§ 23 Abs. 4](https://www.gesetze-im-internet.de/woeigg/__23.html), § 19 Abs. 2 Nr. 1 WEG). Die Beschluss-Sammlung ist Fundstelle für Beschlüsse ab 1.7.2007. [B] Seit 1.1.2026 binden ältere Beschlüsse aufgrund einer Öffnungsklausel neue Erwerber nur noch, wenn sie im Grundbuch stehen ([§ 48](https://www.gesetze-im-internet.de/woeigg/__48.html)). | [A] Ältere Beschlüsse stehen nur in den Niederschriften. Das erschwert die Suche nach der geltenden Regel. |
| J-D4 | [B] Haftung nur für Vorsatz und grobe Fahrlässigkeit bei Unentgeltlichkeit (§ 29 Abs. 3), mit dem Ziel, das Ehrenamt zu fördern (BT-Drs. 19/18791, S. 79). [S] Eine Vermögensschadenhaftpflicht für Beiräte auf Kosten der Gemeinschaft gilt als ordnungsmäßig ([Haufe](https://www.haufe.de/id/beitrag/relevante-versicherungsarten-im-immobilienbereich-zertv-26-vermoegensschadenhaftpflicht-fuer-beiraete-HI15287318.html)). [S] Ob eine Aufwandspauschale schon „entgeltlich“ ist, ist strittig; eine Pauschale von 500 € je Mitglied und Jahr wurde aufgehoben (AG München 481 C 15463/16). | [A] Die Haftungsprivilegierung schützt nicht bei oberflächlicher Prüfung (siehe J-C2). [L] Der Datenschutzstatus des Beirats ist ungeklärt. |
| J-D5 | [B] Mängelansprüche am Bauwerk verjähren 5 Jahre ab Abnahme (§ 634a BGB); Abnahme und Vorbehalt nach [§ 640 BGB](https://www.gesetze-im-internet.de/bgb/__640.html). [S] Eine Abnahme durch den Bauträger als Erstverwalter ist unwirksam; dann beginnt die Verjährung nicht ([VDIV](https://vdiv.de/publikationen/magazine/detail/unwirksame-abnahme-des-gemeinschaftseigentums-durch-den-bautraeger-als-erstverwalter)). Die Gemeinschaft kann Mängelrechte per Beschluss an sich ziehen (BGH V ZR 213/21), eine Untergemeinschaft nicht (BGH V ZR 132/23, [Haufe](https://www.haufe.de/immobilien/verwaltung/bgh-untergemeinschaft-kann-keine-maengelrechte-an-sich-ziehen_258_624700.html)). | [A] Baumangel und Wartungsversäumnis unterscheiden sich in Anspruchsgegner und Frist (5 Jahre gegenüber 2 Jahren bzw. Regelverjährung). |

### 2.6 E · Beschlüsse der Gemeinschaft

| Job | Grundlage und Frist | Einordnung |
| --- | --- | --- |
| J-E1 | [B] Mindestens eine Versammlung pro Jahr; Einladung in Textform, Frist soll 3 Wochen betragen (§ 24 Abs. 1, 4 WEG). Beschlüsse sind nur gültig, wenn der Gegenstand in der Einladung bezeichnet war (§ 23 Abs. 2). Fehlt ein Verwalter oder weigert er sich pflichtwidrig, dürfen der Beiratsvorsitzende, sein Vertreter oder ein ermächtigter Eigentümer einberufen (§ 24 Abs. 3). Virtuelle Versammlung per Dreiviertelbeschluss für höchstens 3 Jahre (§ 23 Abs. 1a); bis 2028 bleibt dann mindestens eine Präsenzversammlung pro Jahr nötig (§ 48 Abs. 6). | [A] Keine Vorbereitungspflicht. Die Prüfung nach § 29 Abs. 2 S. 2 bindet den Beirat aber an den Versammlungszyklus. |
| J-E2a, J-E2b | [B] Die Niederschrift ist unverzüglich aufzunehmen; der Beiratsvorsitzende oder sein Vertreter unterschreibt mit (§ 24 Abs. 6). Beschluss-Sammlung fortlaufend mit Anfechtungsvermerken (§ 24 Abs. 7, 8). Beschlüsse gelten, bis sie rechtskräftig aufgehoben sind (§ 23 Abs. 4). [S] Die Unterschrift setzt eine inhaltliche Prüfung voraus ([Haufe](https://www.haufe.de/immobilien/verwaltung/bgh-unterzeichnung-des-versammlungsprotokolls-durch-verwalter_258_332536.html)). | J-E2a ist Pflicht für Vorsitzenden oder Vertreter, J-E2b Sorgfalt. [A] Die Anfechtungsfrist läuft ab Beschluss, nicht ab Protokoll. Ein spätes Protokoll verkürzt also die Prüfzeit. |
| J-E3 | [B] Ein Umlaufbeschluss braucht die Zustimmung aller in Textform. Für einen einzelnen Gegenstand kann vorab beschlossen werden, dass im Umlauf die Mehrheit genügt (§ 23 Abs. 3). [S] Dieser Vorab-Beschluss ist selbst anfechtbar; ein Mehrheits-Umlauf ohne ihn ist anfechtbar, nicht nichtig (BGH V ZR 190/25, 17.7.2026, [VDIV](https://vdiv.de/aktuelles/urteile/details/auch-absenkungsbeschluesse-lassen-sich-versenken-der-umlaufbeschluss-wiederum-versenkt-gegebenenfalls-die-anfechtungsklage)). [B] Notmaßnahmen durch jeden Eigentümer (§ 18 Abs. 3) und durch den Verwalter (§ 27 Abs. 1 Nr. 2). | [A] Praktischer Weg: Vorab-Beschlüsse für absehbare Gegenstände und Wertgrenzen nach § 27 Abs. 2 in der ordentlichen Versammlung. [L] Kein höchstrichterliches Urteil nach dem WEMoG zu den Grenzen einer Entscheidungsübertragung auf den Beirat gefunden. |
| J-E4 | [B] Bauliche Veränderungen brauchen einen Beschluss. Jeder Eigentümer kann angemessene Maßnahmen zu Barrierefreiheit, E-Laden, Einbruchschutz, Glasfaser und seit 17.10.2024 Steckersolargeräten verlangen; über das Wie entscheidet die Gemeinschaft ([§ 20 WEG](https://www.gesetze-im-internet.de/woeigg/__20.html)). Kosten nach [§ 21](https://www.gesetze-im-internet.de/woeigg/__21.html). [S] Klimageräte: Gestattung nur per Beschluss (V ZR 105/24); eine Gestattung schließt spätere Lärmabwehr nicht aus (V ZR 128/24); auch eine nicht privilegierte Maßnahme kann per Klage durchgesetzt werden, befürchteter Lärm allein reicht nicht zur Ablehnung (V ZR 162/25, [Haufe](https://www.haufe.de/immobilien/verwaltung/bgh-wohnungseigentuemer-duerfen-klimaanlage-einbauen_258_692022.html)). [S] Ein gemeinschaftliches Konzept mit Auflagen kann Einzelgestattungen überholen (AG München 1292 C 13811/24, Wallbox). | [A] Ein Rahmenbeschluss über das Wie ist denkbar. Er ersetzt die Einzelgestattung nicht. [L] Wie weit er künftige Anträge bindet, ist höchstrichterlich offen. |

### 2.7 F · Eigentümer und Bewohner

| Job | Grundlage und Frist | Einordnung |
| --- | --- | --- |
| J-F1 | [B] Jeder Eigentümer kann von der Gemeinschaft ordnungsmäßige Verwaltung verlangen (§ 18 Abs. 2) und Einsicht nehmen (§ 18 Abs. 4). | [A] Die Rolle als Ansprechpartner der Eigentümer steht nicht im Gesetz. Sie ergibt sich aus der Praxis ([S] [WIRO-Magazin](https://magazin.wiro.de/2025/01/fuer-die-gemeinschaft/)). |
| J-F2 | [B] Keine Pflicht zur Mehrsprachigkeit. Textform regelt die Form, nicht die Sprache. | [L] Keine Statistik zu Eigentümern ohne Deutschkenntnisse gefunden. [A] Zu klären ist, ob das Problem die Sprache oder die Fachsprache ist. |
| J-F3 | [S] Verantwortlicher im Sinne der DSGVO ist nach überwiegender Auffassung die Gemeinschaft, der Verwalter verarbeitet für sie ([LfDI Rheinland-Pfalz](https://www.datenschutz.rlp.de/themen/immobilienverwaltung)). Der Verwalter soll bei der Einsicht Nicht-Erforderliches schwärzen. [B] Datenminimierung nach Art. 5 Abs. 1 lit. c DSGVO. [S] Die Haushaltsausnahme greift bei Verwaltungszwecken in Chatgruppen kaum. | Pflicht; welche datenschutzrechtliche Rolle der Beirat selbst hat, ist offen (siehe J-D4). [A] Einsicht mit Fremddaten ist für die Prüfung gedeckt, die Weiterverbreitung davon zu trennen. [L] Keine Stellungnahme einer Aufsichtsbehörde speziell zum Beirat gefunden; der WEG-Senat hat zu E-Mail-Adressen der Eigentümer noch nicht entschieden. |
| J-F4 | [B] Hausordnung per Mehrheitsbeschluss (§ 19 Abs. 2 Nr. 1). Pflichten der Eigentümer nach [§ 14](https://www.gesetze-im-internet.de/woeigg/__14.html). Unterlassungsansprüche wegen des Gemeinschaftseigentums übt nur die Gemeinschaft aus ([§ 9a Abs. 2](https://www.gesetze-im-internet.de/woeigg/__9a.html); [S] BGH V ZR 284/19, V ZR 86/21). Bei Störungen des Sondereigentums handelt der einzelne Eigentümer. | [A] Kein Schlichtungsmandat des Beirats. Zuständig sind Gemeinschaft (vertreten durch den Verwalter), betroffener Eigentümer oder Vermieter. |

### 2.8 G · Gebäude im laufenden Betrieb

| Job | Grundlage und Frist | Einordnung |
| --- | --- | --- |
| J-G1 | [B] Erhaltung gehört zur ordnungsmäßigen Verwaltung (§ 19 Abs. 2 Nr. 2). Notmaßnahmen nach § 18 Abs. 3 und § 27 Abs. 1 Nr. 2. [S] Verkehrssicherung liegt bei der Gemeinschaft und darf an Dienstleister übertragen werden (BGH VIII ZR 250/23, [Rödl](https://www.roedl.com/insights/haftung-vermieter-sturz-vereister-gemeinschaftsweg/)). | [A] Keine eigene Notkompetenz des Beirats. Für J-G1 zählen Erreichbarkeit und Meldewege. |
| J-G2 | [S] Nach Übertragung bleibt der Gemeinschaft eine Kontroll- und Überwachungspflicht (BGH V ZR 43/19, [Haufe](https://www.haufe.de/immobilien/verwaltung/bgh-weg-haftet-nicht-fuer-fehler-von-dienstleistern_258_512974.html)). | [A] Der Beirat überwacht den Verwalter, nicht die Dienstleister. Er prüft also, ob der Verwalter kontrolliert. |

### 2.9 H · Kontinuität

| Job | Grundlage und Frist | Einordnung |
| --- | --- | --- |
| J-H1 | [B] Bei mehreren Mitgliedern gibt es Vorsitz und Stellvertretung (§ 29 Abs. 1). Keine Übergabepflicht. | [A] Ein Ein-Personen-Beirat hat keine gesetzliche Vertretung. Unterlagen, die er für die Gemeinschaft erhalten hat, gehören ihr (§ 667 BGB analog). Vertrauliche Bewertungen (J-RB6) sind bei der Übergabe gesondert zu behandeln. |
| J-H2 | [B] Jede Gemeinschaft ist eigenständig rechtsfähig und hat eigenes Vermögen (§ 9a Abs. 1, 3). [S] Mindestens ein eigenes Konto je Gemeinschaft ([VDIV](https://vdiv.de/publikationen/magazine/detail/fragen-rund-um-die-kontofuehrung)). Untergemeinschaften gibt es nur auf Grundlage der Gemeinschaftsordnung; eine verselbständigte Untergemeinschaft „Tiefgarage“ ist möglich (BGH V ZR 184/16, V ZR 204/20). | [A] Getrennte Gemeinschaften haben getrennte Versammlungen, Pläne, Abrechnungen, Beschluss-Sammlungen und Konten. |
| J-H3 | [S] Leitfäden und Schulungen für neue Beiräte: WiE-Ratgeber „Hilfe, wir sind Verwaltungsbeirat“ und Kurse ([WiE](https://www.wohnen-im-eigentum.de/veranstaltungen/schulungen)), VDIV-Beitragsreihe ([VDIV](https://vdiv.de/publikationen/magazine/detail/der-verwaltungsbeirat-1)). | [A] Erste Pflichtanlässe nach Amtsantritt sind die nächste Prüfung (§ 29 Abs. 2 S. 2) und die nächste Mitunterschrift (§ 24 Abs. 6). |

### 2.10 Emotionale und soziale Jobs

- [B] Die Haftungsbeschränkung nach § 29 Abs. 3 WEG soll die Bereitschaft zum Ehrenamt fördern (BT-Drs. 19/18791, S. 79). Das betrifft J-EM1 und J-EM6.
- [S] 62,1 % der Verwaltungen bezeichnen sich als überlastet ([VDIV-Branchenbarometer](https://vdiv.de/immobilienverwaltung/branchenbarometer)). Für J-EM3 heißt das, dass auch das Gegenüber unter Druck steht.
- [S] Praxisbericht: zwei Beiräte für 200 Wohnungen, „viel Arbeit, kein Lohn“, man müsse „Reibung aushalten“ ([WIRO-Magazin](https://magazin.wiro.de/2025/01/fuer-die-gemeinschaft/)).
- [L] Keine quantitativen Daten zu Zeitaufwand, Überforderung, Fluktuation oder unbesetzten Beiräten. Auch der Freiwilligensurvey weist das Amt nicht gesondert aus.

### 2.11 Weitere Rollen

Die Fassung v0.2 zählt diese Jobs nur. Die Recherche liefert Rahmen für ihre spätere Erhebung, keine Job-Sätze.

| Rolle | Fachlicher Rahmen |
| --- | --- |
| Beirat im Viertel | [A] Es gibt kein Quartiersrecht für Gemeinschaften; jede beschließt für sich, Verträge schließt jeweils der Verwalter. [B] Gemeinsame Ladeinfrastruktur benachbarter Gebäude ist vereinbar ([§ 12 GEIG](https://www.gesetze-im-internet.de/geig/__12.html)). [S] Die Bundesförderung für Laden im Mehrparteienhaus lief für Gemeinschaften bis 10.11.2026; der VDIV kritisiert, dass jede Hausnummer als eigenes Objekt zählt ([VDIV](https://vdiv.de/news-details/foerderantraege-fuer-ladeinfrastruktur-in-mehrparteienhaeusern-antragsfrist-endet)). [S] Das GEG ist seit 29.7.2026 durch das Gebäudemodernisierungsgesetz ersetzt ([Bundesregierung](https://www.bundesregierung.de/breg-de/schwerpunkte/wirksam-regieren/neues-gebaeudemodernisierungsgesetz-2430284)); ob die frühere Quartiersregel fortgilt, ist ungeprüft. [L] Keine Belege für gemeinsame Ausschreibungen mehrerer Gemeinschaften oder Beiratsnetzwerke. |
| Eigentümer mit eigenen Vorhaben | [B] Ansprüche nach § 20 Abs. 2, 3 WEG, Kosten nach § 21 Abs. 1, bei Ablehnung Beschlussersetzungsklage (§ 44 Abs. 1 S. 2). Mieter können parallel nach [§ 554 BGB](https://www.gesetze-im-internet.de/bgb/__554.html) verlangen. [A] Hier liegt ein möglicher Interessenkonflikt mit der Beiratsrolle. |
| Vermieter | [B] Betriebskostenabrechnung spätestens 12 Monate nach Ende des Abrechnungszeitraums ([§ 556 Abs. 3 BGB](https://www.gesetze-im-internet.de/bgb/__556.html)). [S] Eine fehlende WEG-Abrechnung entschuldigt den Vermieter nicht (BGH VIII ZR 249/15). [A] Daraus entsteht Zeitdruck auf J-C1. |
| Mieter und Bewohner | [B] Keine Rechte in der Gemeinschaft; Duldung von Erhaltungsmaßnahmen nach [§ 15 WEG](https://www.gesetze-im-internet.de/woeigg/__15.html). [A] Bewohner bemerken Akutes und Schlechtleistung oft zuerst, haben aber keinen formalen Meldeweg zur Gemeinschaft. |
| Verwaltung | [B] Aufgaben nach §§ 24, 27, 28 WEG, Vertretung nach außen (§ 9b Abs. 1). [S] Überlastung und Verwalterlosigkeit kleiner Gemeinschaften (VDIV). |

## 3. User Research auf den Jobs aufbauen

### 3.1 Interviews

- [B] Switch-Interviews rekonstruieren die Zeitleiste eines tatsächlichen Wechsels: erster Gedanke, Suche, Ereignis, Entscheidung. Die vier Kräfte (Push, Pull, Angst, Gewohnheit) werden nicht direkt erfragt, sondern ergeben sich aus den Ereignissen. Muster zeigen sich oft nach 5–8 Interviews je Job ([jobstobedone.org](https://jobstobedone.org/switch-interview/); [Pull and Anxiety](https://jobstobedone.org/radio/pull-and-anxiety/)); thoughtbot nennt 8–10 ([thoughtbot](https://thoughtbot.com/playbook/validation/switch-interviews)).
- [B] Ergiebig sind Umwege (Workarounds), Nichtnutzung und Aufgaben, die man lieber loswäre ([HBR 2016](https://hbr.org/2016/09/know-your-customers-jobs-to-be-done)).
- [S] Mit den tatsächlichen Job-Ausführenden sprechen, nicht mit Stellvertretern, und über Schmerz statt über Lösungen ([Kalbach, UXmatters](http://www.uxmatters.com/mt/archives/2020/05/book-excerpt-the-jobs-to-be-done-playbook.php)).
- [B] Acht Interviews zeigen, dass ein Job existiert, nicht wie verbreitet er ist ([SurveyMonkey](https://www.surveymonkey.com/learn/product-development/jobs-to-be-done/)).

[A] Daraus ist der ausgearbeitete [[Interviewleitfaden - Beirats-Interviews]] entstanden: Kernteil mit zwei jüngsten Fällen entlang der Job-Map-Schritte, Wahlmodule je Situation, Bewertungskarte, Datenschutzregeln, Protokollvorlage und Auswertung. Dieser Leitfaden ist maßgeblich; die folgenden Abschnitte begründen Auswahl und Befragung.

### 3.2 Rekrutierung

[A] Teilnehmende werden nach Merkmalen des Ausführenden ausgewählt, nicht nach Demografie, und über Situationen gestreut: allein oder im Gremium, eine oder mehrere Gemeinschaften, Amtsdauer, Verwalterwechsel, Vorhaben im Viertel, Amt fast abgegeben. Einschlusskriterien, Streuung und Screening-Fragen stehen im [[Interviewleitfaden - Beirats-Interviews]]. Realistisch sind 8–12 Interviews in zwei Runden.

### 3.3 Befragung und Priorisierung

- [B] Jedes Outcome wird nach Wichtigkeit und Zufriedenheit bewertet; gezählt wird der Anteil der zwei höchsten Stufen. Opportunity = Wichtigkeit + max(Wichtigkeit − Zufriedenheit, 0) auf einer Skala von 0 bis 20 ([Strategyn](https://strategyn.com/quantify-your-customers-unmet-needs); [Strategyn, Market Opportunity](https://strategyn.com/outcome-driven-innovation/market-opportunity/)).
- [S] Ab 10 gilt ein Outcome als unterversorgt ([CustomerThink](https://customerthink.com/what-unmet-needs-should-be-targeted-for-growth/)). Feinere Bänder stammen aus Drittvorlagen, nicht von Ulwick.
- [S] Häufig genannte Stichproben von 180 und mehr Befragten stammen aus Drittquellen ([IdeaPlan](https://www.ideaplan.io/templates/outcome-driven-template)).

[A] Für ehrenamtliche Beiräte ist eine statistisch belastbare Befragung unrealistisch. Pragmatisch ist eine Kurzbefragung mit 15–30 Beiräten über die 20–40 wichtigsten Outcomes. Der Score dient dann als Rangfolge, nicht als Signifikanzaussage; bei kleinem n werden Rohzahlen ausgewiesen. Die Schmerz-Rangfolge des Pilots (Viertel vor Überwachung vor eigenen Vorhaben) ist eine Hypothese aus einem Fall.

### 3.4 Status der Jobs

[A] Die Quellen geben keine Statusstufen vor. Vorschlag, verträglich mit dem Katalog:

| Status | Bedeutung | Mindestbeleg |
| --- | --- | --- |
| Vorschlag | aus Erfahrung oder Annahme, in v0.2 mit „(V)“ markiert | keine externe Evidenz |
| Kandidat | in der Research als mögliche Lücke erkannt | methodische Ableitung, keine Nennung im Pilot |
| beobachtet | im Pilot aufgetreten | Nennung im Pilot; datierte Vorfälle ohne Fremddaten werden bei der Auswertung nachgetragen |
| bestätigt | von anderen Beiräten unabhängig berichtet | mindestens drei Interviews mit spontaner Nennung |
| priorisiert | Outcomes quantitativ bewertet | Befragung mit n und Score |
| verworfen | kein Job oder nicht bestätigt | Begründung und Datum |

## 4. Offene Fragen an Katalog und Research

Diese Fragen betreffen Katalog, Rechtslage und Pilot. Die Forschungsfragen für die Interviews (FF-1 bis FF-9) stehen im [[Interviewleitfaden - Beirats-Interviews]].

1. **Abschluss eines Vorgangs:** Bestätigen die Interviews den Kandidaten J-A5 „Vorgänge nachweisbar abschließen“? Die Job-Map-Prüfung zeigt dort eine Lücke.
2. **Hauptjob schärfen:** Gehört „ohne dass das Ehrenamt zum Zweitberuf wird“ in den Hauptjob oder nur zu J-EM6 und J-RB1?
3. **Verbindlichkeit:** Die Einstufung Pflicht, Sorgfalt, Anliegen ist rechtlich gegenzulesen, besonders für J-C2 nach dem OLG-München-Beschluss.
4. **Tiefgarage:** Ist sie im Pilot eine eigene Gemeinschaft oder eine Untergemeinschaft? Davon hängen J-C3, J-D5 und J-H2 ab.
5. **Bundesland und Garagengröße:** Bestimmen Prüffristen und Prüfer in J-D2.
6. **Zeitaufwand:** Wie viele Stunden pro Woche und welche Spitzen im Jahr? Ab wann kippt das Amt zum Zweitberuf? Dafür gibt es keine Fremddaten.
7. **Weitere Rollen:** Die gezählten Jobs von „Beirat im Viertel“ (7) und „Eigentümer mit eigenen Vorhaben“ (6) zuerst beschreiben; dort liegt laut Pilot der größte Schmerz.
8. **Verwaltung als Gegenüber:** Sollte die Verwaltung ergänzend befragt werden, um J-B1–J-B5 von beiden Seiten zu sehen?
9. **Sprache oder Fachsprache:** Liegt das Problem in J-F2 bei Fremdsprachen oder bei der Verständlichkeit für Laien?

## 5. Recherchelücken

- Urteilsvolltexte nicht gelesen; alle mit [S] markierten Urteile sind vor Verwendung gegenzulesen. Am Normtext nachgeprüft am 21.11.2026: §§ 9b, 18, 19, 23, 24, 26, 27, 28, 29, 45, 48 WEG, § 31 TrinkwV sowie die BGH-Pressemitteilungen 033/2025, 057/2026 und 072/2026. Das gilt besonders für den OLG-München-Beschluss 31 U 1110/26e und BGH V ZR 190/25.
- Datenschutzstatus des Beirats: keine Aussage einer Aufsichtsbehörde gefunden.
- Landesrecht zu Garagen, Prüfungen und Rauchwarnmeldern nur beispielhaft erfasst.
- Elementarschaden: Gesetzesstand nach April 2026 nicht verifiziert.
- Gebäudemodernisierungsgesetz: Nachfolgeregeln der früheren GEG-Paragraphen zu Quartier und WEG nicht geprüft.
- Keine Quelle zu Durchlaufposten zwischen rechtlich getrennten Gemeinschaften.
