---
name: "ambition-calibrator"
description: "Erhöht den Ehrgeiz einer Aufgabe, ohne sie zu erweitern: schreibt eine Anfrage tiefer, nicht größer um (Ziel-Leiter, Rohdaten, professionelle Methoden, benachbarte Feld-Linsen) und prüft das Ergebnis mit einem anderen Richter als dem Modell. Verwenden, wenn der Benutzer nach Tiefe oder mehr Ehrgeiz fragt oder einen Bericht, eine Präsentation, eine Analyse, einen Plan oder ein Leistungsziel übergibt. Nicht für Routine-Fehlerbehebungen oder Umschreibungen von Eingabeaufforderungen."
---

# Kalibrierung des Ehrgeizes (Tiefer, nicht größer)

Wenn ein Benutzer einem KI-Assistenten eine Aufgabe gibt, die als wörtliche Pflicht formuliert ist, entscheidet der Assistent zuerst, ob die Anfrage unterambitioniert ist, und schreibt sie dann um, um eine tiefere Version derselben Aufgabe zu verlangen, niemals eine größere. Die drei Achsen sind Höhe (das Ergebnis über die Aufgabe hinaus), Tiefe (die Rohdaten, Methoden und Beweise, die ein Top-Profi verwenden würde) und Reichweite (die angrenzenden Felder, deren Methoden gelten). Jeder Lauf endet mit einer gezeigten Umschreibung, einer Bestätigung, wenn die Umschreibung Umfang oder Kosten ändert, einer Prüfung durch etwas anderes als den Assistenten und einer Übergabemitteilung, die Verifiziertes von Unverifiziertem trennt.

## Anweisungen

### Stufe 1: Aufnahme, Umfangssperre und Umgehung

Bevor etwas erweitert wird, erfasse die Anfrage und entscheide, ob eine Erweiterung überhaupt gewünscht ist.

- **Umfangsschutz: tiefer, nicht größer.** Eine Erweiterung kann die verwendeten Eingaben, die angewendeten Methoden, das Ziel und die erforderlichen Beweise ändern. Sie darf keine vom Benutzer nicht angeforderten Liefergegenstände hinzufügen, die Zielgruppe erweitern oder Systeme außerhalb der Aufgabe berühren. Ein neuer Index, eine Migration, ein Cache, ein geplanter Job oder eine Abhängigkeit zählen als außerhalb der Aufgabe: Liste sie unter Folgeaufgaben auf und schalte sie auf Bestätigung frei. Wenn die Umschreibung ein neues Lieferobjekt erfordern würde, liste es stattdessen als optionale Folgeaufgabe auf, anstatt es einzubauen.
- **Erfasse die Anfrage wörtlich.** Behalte die Formulierung des Benutzers als Referenz für jede spätere Prüfung bei. Paraphrasiere sie nicht in Notizen.
- **Erfasse jede Obergrenze.** Wörter wie „nur“, „bloß“, „schnell“, „nichts anderes anfassen“ oder „keine neuen Dateien“ setzen eine Obergrenze. Eine Obergrenze bedeutet keine Erweiterung: Führe die Aufgabe wie gewünscht aus und erwähne in einer Zeile, dass eine tiefere Version existiert.
- **Auslöser für Erweiterung.** Erweitere nur, wenn der Benutzer nach Tiefe oder Ehrgeiz fragt („geh tiefer“, „so gut du kannst“, „warum ist die Ausgabe flach“) oder die Anfrage ein ergebnisorientiertes Lieferobjekt wie einen Bericht, eine Präsentation, eine Analyse, einen Plan, eine Prüfung oder ein Leistungsziel benennt. Jede andere Anfrage wird umgangen. Wenn eine Anfrage sowohl einen Auslöser als auch eine Umgehungsbedingung erfüllt, gewinnt eine explizite Benutzeranfrage nach Tiefe; ein ergebnisorientiertes Nomen allein nicht. Eine Anfrage, etwas schneller, billiger oder kleiner zu machen, das dem Benutzer gehört, ist ein Leistungsziel, keine Geschwindigkeit (Geschwindigkeit bedeutet, dass der Assistent die Arbeit des Benutzers in kürzerer Zeit erledigt).
- **Umgehungsprüfung.** Überspringe die Stufen 2 bis 5 und führe die Aufgabe genau wie gewünscht aus, wenn der obige Auslöser nicht erfüllt ist oder wenn eine der folgenden Bedingungen zutrifft: Die Anfrage ist eine einstufige Bearbeitung, Nachschlageoperation, Umbenennung, Formatierungsänderung oder eine Frage mit bekannter Antwort; die Arbeit ist trivial nachzuarbeiten und von geringem Einsatz; der Benutzer ist mitten im Fluss und die Anfrage ist eine Fortsetzung eines bereits genehmigten Plans; oder die Anfrage ist ein kurzer, klarer Befehl wie „Tests ausführen“ oder „dies committen“. Wenn die Anfrage leer oder unverständlich ist, frage stattdessen, was sie erreichen soll. Gib das Ergebnis als `Ambition check: bypassed (reason)` an und fahre fort. Wenn die benannte Sache nicht existiert (eine Variable, Datei oder ein Endpunkt, der nicht gefunden werden kann), durchsuche die benannte Datei (und eine repositoryweite Suche nach dem Namen), und wenn sie immer noch nicht gefunden wird, melde dies und frage, was gemeint war, anstatt eine Bearbeitung zu erfinden. Lasse die Umgehungszeile in diesem Fall weg. Eine Umgehung für eine triviale Aufgabe erfordert keine Erwähnung einer tieferen Version; eine Umgehung, die durch eine Benutzer-Obergrenze verursacht wird, oder durch eine Anfrage, die ergebnisorientiert ist, aber keinen Auslöser erfüllt, erhält die einzeilige Erwähnung. Wenn du erweiterst, beginne mit `Ambition check: expanding (reason)`. Umgehung ist der Standard für kleine Aufgaben, da die Erweiterung Kosten in Zeit, Geld und Aufmerksamkeit des Benutzers verursacht.
- **Umgebungsprüfung.** Tiefe und Reichweite hängen davon ab, ob der Assistent einen Computer hat: die Fähigkeit, Befehle auszuführen, ein Werkzeug zu installieren und die echten Daten zu lesen. Erfasse, welche davon verfügbar sind: Shell, Fähigkeit, Pakete zu installieren, Lesezugriff auf Rohdaten (Logs, Datenbank, Exporte, Repository-Historie) und eine Möglichkeit, eine Prüfung durchzuführen. Wenn etwas fehlt, kennzeichne die Schritte, die es benötigen, in der Umschreibung als `not run` , anstatt sie stillschweigend wegzulassen, und fahre mit dem fort, was getan werden kann. Stoppe und frage den Benutzer nur, wenn der fehlende Zugriff der gesamte Punkt der Erweiterung ist.

### Stufe 2: Höhe (Das Ziel über das Ziel hinaus)

Klettere von der Aufgabe zum Ergebnis, dem sie dient, und schreibe den Aufstieg nieder.

- **Baue eine Drei-Stufen-Leiter.**
  1. **Basisaufgabe:** was wörtlich angefordert wurde.
  2. **Direktes Ergebnis:** der unmittelbare Nutzen, den der Benutzer daraus zieht.
  3. **Ergebnis:** was der Benutzer als Nächstes tun möchte, die dauerhafte Veränderung, auf die die Aufgabe hinarbeitet.
- **Prüfe, ob die Höhe passt.** Höhe funktioniert, wenn es ein endgültiges Ergebnis gibt, das in einem Satz genannt und schließlich beobachtet werden kann. Wenn die Beobachtung Daten benötigt, auf die du keinen Zugriff hast, schreibe trotzdem die Leiter und liste diese Daten als fehlende Voraussetzung auf. Sie passt schlecht zu kreativer Arbeit, deren Wert das Artefakt selbst ist. Wenn das Ergebnis nicht in einem Satz genannt werden kann oder die Arbeit kreativ ist, stoppe bei Sprosse 2 und notiere `Altitude: not applicable (reason)`.
- **Nenne die Voraussetzungen für eine dauerhafte Version.** Das Erreichen eines stehenden Ergebnisses, wie z. B. die Aufrechterhaltung von etwas anstatt dessen einmalige Behebung, erfordert normalerweise Zugriff, den die einzelne Aufgabe nicht hatte: einen Datenfeed, eine Zuordnung zwischen Versionen und Commits, einen Ort zur Reproduktion und Verifizierung. Liste auf, was fehlt. Baue oder plane nichts Wiederkehrendes ohne die Zustimmung des Benutzers und behaupte nicht, das Ergebnis werde aufrechterhalten, wenn du die Aufgabe nur einmal erledigt hast.
- **Formuliere die angehobene Anfrage als Fragen an die Daten.** Zum Beispiel: Was hat sich geändert, warum und was ist dagegen zu tun; oder welche wenigen Entscheidungen sind am dringendsten, mit Argumenten dafür und dagegen; oder was ein besserer Mechanismus als das aktuelle Artefakt wäre, validiert anhand der eigenen Historie des Benutzers. Behalte das ursprüngliche Lieferobjekt des Benutzers als Lieferobjekt bei.

### Stufe 3: Tiefe (Rohmaterial, Methoden und Beweise)

Schreibe die Aufgabe so um, wie ein führender Praktiker auf diesem Gebiet sie angehen würde. Eine Änderung der Vokabel ist keine Änderung der Methode; die Methode, die Eingaben und die Instrumente müssen sich ändern.

- **Beantworte vier Fragen schriftlich, bevor du umschreibst.**
  1. **Expertenlücke:** Was würde ein Top-Profi hier tun, was die Anfrage nicht verlangt?
  2. **Rohmaterial:** Was ist das Rohmaterial, mit dem er anfangen würde, anstatt dessen, was für den Benutzer aufbereitet wurde? Nenne tatsächliche Quellen: Abfrageergebnisse, Logs, Schemata, Exporte, Spuren, Repository-Historie, Seed-Daten. Prüfe, was tatsächlich verfügbar ist, bevor du es nennst, und sage, wenn es nicht verfügbar ist.
  3. **Methoden und Werkzeuge:** die spezifischen Instrumente, statistischen Tests, Profiler oder Entwurfsmuster und warum jeder zutrifft. Wenn der Assistent nach einer Markdown-Tabelle greift, wo eine Datenbank oder ein statistisches Modell das professionelle Instrument ist, wechsle die Instrumente oder sage, warum es nicht geht.
  4. **Externe Beweise:** Was außer dem Assistenten oder dem Benutzer würde zeigen, dass das Ergebnis richtig ist.
- **Setze ehrlich ein anspruchsvolles Ziel.** Behalte das vom Benutzer angegebene Ziel als Akzeptanzschwelle bei. Füge eine messbar schwierigere Zahl hinzu (z. B. eine Latenz weit unter der angegebenen), die als `stretch`gekennzeichnet ist, um eine strukturelle Überarbeitung statt einer Oberflächenkorrektur zu erzwingen. Wenn der Benutzer kein Ziel angegeben hat, schlage eines vor und kennzeichne es als `proposed`. Notiere beide als Ziele, nicht als Versprechen, und melde die tatsächlich erreichte Zahl.
- **Hinterfrage Annahmen mit Rohdaten.** Wenn der Benutzer eine Überzeugung äußert, von der die Aufgabe abhängt, füge einen Schritt hinzu, der versucht, sie anhand der Rohdaten zu reproduzieren oder zu widerlegen, bevor er darauf aufbaut.
- **Suche nach neuem Wissen erst, wenn die Grundlagen stimmen.** Sobald die Daten verstanden sind, kann eine zweite Runde nach einem blinden Fleck suchen, z. B. einem frühen Signal, das niemand verfolgt, und muss jede Behauptung auf Daten testen, auf die sie nicht angepasst wurde.
- **Verwende den Seed-Prompt, wenn du eine schnelle Umschreibung benötigst.** Dieser Prompt aus dem Quellbeitrag erzeugt die vier oben genannten Antworten: „Ich möchte eine tiefere Version dieser Aufgabe, keine größere. Bevor du sie umschreibst: (1) sag, was ein Top-Profi auf diesem Gebiet hier tun würde, was ich nicht verlange; (2) nenne das Rohmaterial, mit dem er anfangen würde, anstatt dessen, was bereits für mich aufbereitet wurde; (3) nenne die spezifischen Methoden und Werkzeuge, die er verwenden würde; (4) sage, was außer dir oder mir zeigen würde, dass das Ergebnis richtig ist. Schreibe dann meine Eingabeaufforderung um, um genau das zu verlangen.“

### Stufe 4: Reichweite (Methoden aus angrenzenden Feldern)

Bringe mehr Felder als die Aufgabe offensichtlich benötigt, als Methoden denn als Kostüme.

- **Ersetze das Nomen durch ein Verb.** Schreibe das Ergebnis als das um, was es für Menschen tut. Eine Quartalspräsentation wird zu einer Entscheidungsvorbereitung für vielbeschäftigte Menschen, die eine Geschichte über Ursache und Wirkung verstehen und unter Unsicherheit in dreißig Minuten entscheiden müssen. Das Verb deckt auf, welche Felder wichtig sind.
- **Wähle bis zu fünf Linsen und nicht mehr als eine echte Prüfung.** Jede Linse ist eine professionelle Disziplin, deren Methode gilt, z. B. ein Statistiker, ein forensischer Buchhalter, der Summen abstimmt, ein Shortseller, der nach der schwächsten Behauptung sucht, ein Redakteur, der kürzt, ein Sicherheitstechniker, der Eingaben angreift. Für jede Linse schreibe die konkrete Prüfung, die sie durchführt, und das Artefakt, das sie erzeugt. Eine Linse ohne konkrete Prüfung ist Rollenspiel: Lass sie weg und verwende weniger Linsen, anstatt auf eine Anzahl aufzufüllen.
- **Tue, was der Profi tut; schreibe nicht wie er.** Fordere niemals eine Persona-Stimme. Fordere das Verfahren an, das der Profi durchführt.
- **Führe die Linsen standardmäßig inline aus.** Wende jede Linse als Durchlauf über die Arbeit in dieser Sitzung an. Das Starten von Unteragenten ist optional: Tue dies nur, wenn der Benutzer es angefordert hat oder zugestimmt hat.
- **Fordere umsetzbare Ergebnisse.** Jede Linse endet entweder mit einer spezifischen vorgenommenen Änderung oder einem spezifischen Grund, warum keine notwendig war.

### Stufe 5: Die umgeschriebene Anfrage und das Bestätigungsgate

Zeige die Umschreibung, bevor du sie ausführst.

- **Erstelle die umgeschriebene Anfrage in diesem Format:**

  ```markdown
  ### Ehrgeiz-Umschreibung
  - **Ursprüngliche Anfrage (wörtlich):** ...
  - **Ziel-Leiter:** Basisaufgabe / direktes Ergebnis / Ergebnis (oder „Höhe: nicht anwendbar“)
  - **Zu lesende Rohdaten:** ...
  - **Methoden und Instrumente:** ...
  - **Linsen und die von ihnen durchgeführte Prüfung:** ...
  - **Ziel:** ...
  - **Externer Richter:** der genaue Befehl, Test, Abfrage oder Gutachter (oder „nicht verfügbar“)
  - **Außerhalb des Umfangs / optionale Folgeaufgaben:** ...
  - **Kosten und Nebeneffekte:** Zeit, Tokens, Installationen, Schreibvorgänge, alles schwer umkehrbare
  ```

- **Bestätigungsregel.** Fordere den Benutzer zur Bestätigung auf, bevor du ausführst, wenn die Umschreibung den Umfang erweitert, materiell mehr Zeit oder Geld kostet, neuen Zugriff oder Installationen benötigt, in etwas außerhalb der Arbeitsdateien schreibt, große oder sensible Daten liest oder schwer rückgängig zu machen ist. Wenn du unsicher bist, ob eine Umschreibung eine dieser Linien überschreitet, frage nach. Wenn sie nur die Methode innerhalb desselben Umfangs bei ähnlichen Kosten verschärft, gib die Umschreibung an und fahre fort. Führe niemals allein aufgrund der Umschreibung aus, wenn der Benutzer um Überprüfung gebeten hat.
- **Wenn der Benutzer jetzt nicht antworten kann** (ein nicht-interaktiver Lauf), stoppe am Gate und gib die Umschreibung als endgültige Ausgabe zurück, markiert als `awaiting confirmation`. Nicht ausführen.
- **Wenn der Benutzer ablehnt oder einschränkt,** führe die ursprüngliche Anfrage nur mit den akzeptierten Teilen aus und notiere, was fallen gelassen wurde.

### Stufe 6: Ausführen und den externen Richter laufen lassen

Erledige die Arbeit, dann verifiziere sie mit etwas anderem als der eigenen Meinung des Assistenten.

- **Wähle den Richter in dieser Reihenfolge der Präferenz:** (1) eine ausführbare Prüfung, die ein Ergebnis liefert: Tests, ein Linter oder Typ-Checker, ein Benchmark, eine Abfrage der Rohdaten, eine Abstimmung von Summen; (2) eine zurückgehaltene Prüfung, z. B. Daten, auf die die Analyse nicht angepasst wurde; (3) ein separater Gutachter mit neuem Kontext, z. B. eine andere Modellinstanz oder ein isolierter Überprüfungslauf, der nur die Ausgabe und die Anforderung sieht; (4) der Benutzer, mit den genauen zu beantwortenden Fragen.
- **Führe ihn aus und zeige die Ausgabe unverändert.** Füge den Befehl und einen unveränderten Auszug seiner Pass/Fail-Zeilen und Summen ein; halte ein langes Protokoll aus dem Chat heraus und biete es auf Anfrage an. Fasse kein Ergebnis zusammen, das du nicht angezeigt hast.
- **Bewerte niemals deine eigene Arbeit.** Eine Aussage wie „das sieht korrekt aus“ ist keine Verifizierung. Wo der einzig verfügbare Richter du selbst bist, ist das Urteil `UNVERIFIED: no external judge available`, gefolgt von dem, was es verifizieren würde.
- **Behauptet keinen deterministischen Erfolg, es sei denn, eine deterministische Prüfung wurde durchgeführt.** Kreative Arbeit und Ermessensentscheidungen haben normalerweise keinen deterministischen Richter. Sage das und biete einen menschlichen Überprüfungsschritt an, anstatt eine Punktzahl zu erfinden.
- **Bei Fehlschlag, korrigiere und wiederhole** denselben Richter, bis zu drei Runden. Wenn er immer noch fehlschlägt, stoppe, melde die fehlschlagende Ausgabe und frage den Benutzer, wie er fortfahren soll. Ändere den Richter nicht, um ihn bestehen zu lassen.

### Stufe 7: Übergabe

Beende mit einem kurzen Bericht, den der Benutzer prüfen kann.

- **Berichte diese Punkte:** die Ziel-Leiter; die vier Antworten; die Linsen und was jede gefunden hat; den Richterbefehl und seine unveränderte Ausgabe; eine Liste mit der Überschrift `Unverified`; Kompromisse und getroffene Entscheidungen; und das dauerhafte hinterlassene Ding, falls vorhanden (ein Skript, ein Test, eine Abfrage, eine Checkliste), mit der Anleitung zur erneuten Ausführung.
- **Sage, was manuell bleibt.** Wenn ein wiederkehrendes Ergebnis einen Zeitplan, eine Anmeldeinformation oder einen anderen nicht gewährten Zugriff benötigt, nenne es als offenen Schritt, anstatt anzudeuten, dass es automatisiert ist.

## Erfolgskriterien

Das Verfahren ist abgeschlossen, wenn alle folgenden Punkte aus dem Transkript bestätigt werden können:

- Entweder wurde eine Umgehungszeile mit einem Grund aufgezeichnet, oder die vier schriftlichen Antworten existieren zusammen mit einer Ziel-Leiter oder einer `Altitude: not applicable` -Notiz.
- Die Umschreibung fügte kein vom Benutzer nicht angefordertes Lieferobjekt hinzu.
- Eine Bestätigung wurde angefordert, als die Umschreibung Umfang, Kosten, Zugriff oder Risiko erweiterte.
- Ein externer Richter wurde ausgeführt und seine unveränderte Ausgabe wird angezeigt, oder das Ergebnis ist explizit als `UNVERIFIED: no external judge available`gekennzeichnet.
- Jede Linse hat eine konkrete Prüfung aufgezeichnet, und es wurde keine Persona-Stimme verwendet.

## Fehler und Eskalation

- Wenn das Ziel des Benutzers unklar ist oder das Ergebnis nicht genannt werden kann, stelle eine klärende Frage, anstatt ein höheres Ziel zu erraten.
- Wenn die fehlenden Rohdaten oder der Runner der Kernpunkt der Erweiterung sind, stoppe, melde, was fehlt, und frage den Benutzer, ob er Zugriff gewähren oder ein reduziertes Ergebnis akzeptieren möchte. Andernfalls kennzeichne die betroffenen Schritte als `not run` und fahre fort.
- Wenn der Richter dreimal fehlschlägt, stoppe und übergib die fehlschlagende Ausgabe an den Benutzer.
- Wenn die Umschreibung abgelehnt wird, führe die ursprüngliche Anfrage aus und argumentiere nicht erneut.

## Verbote

- Füge niemals vom Benutzer nicht angeforderte Lieferobjekte, Zielgruppen oder Systeme hinzu; erweitere die Tiefe, nicht die Größe.
- Erweitere niemals eine Anfrage, die eine Obergrenze hat oder für die Umgehung in Frage kommt.
- Verwende niemals Persona-Rollenspiele anstelle einer Methode.
- Starte niemals Unteragenten ohne die Zustimmung des Benutzers.
- Bewerte niemals deine eigene Arbeit oder behaupte einen deterministischen Erfolg, der nicht stattgefunden hat.
- Bearbeite niemals den Richter, das Ziel oder die Daten, um eine Prüfung zu bestehen.
- Präsentiere niemals die Anekdoten oder Zitate des Quellbeitrags als deine eigenen Ergebnisse.

## Ausgeführte Beispiele

### Beispiel 1: Umgehung bei einer kleinen Aufgabe

- **Eingabe:** „Benenne die Variable `tmp` in `retry_count` in `worker.py`um.“
- **Aktion:** Notiere `Ambition check: bypassed (single-step edit)`, nimm die Umbenennung vor und führe den engsten Test oder eine Syntaxprüfung durch.
- **Nicht tun:** Mache aus einer Umbenennung keine Prüfung der Fehlerbehandlung des Moduls.

### Beispiel 2: Eine Deck-Anfrage mit einem echten Ergebnis

- **Eingabe:** „Erstelle das Deck für die vierteljährliche Geschäftsüberprüfung aus diesen Exporten.“ Die Exporte befinden sich im Arbeitsverzeichnis.
- **Aktion:** Klettere die Leiter (Deck, dann eine entscheidungsreife Überprüfung, dann frühzeitig erkannte Probleme). Lies die Rohdatenexporte anstelle des Zusammenfassungsblatts, formuliere die Frage neu als das, was sich geändert hat, warum, und was zu tun ist, und wähle Linsen wie einen Analysten, der die Schlagzeilenzahlen reproduziert, und einen Skeptiker, der die schwächste Behauptung angreift. Zeige die Umschreibung und bestätige, da sie jeden Export liest und Abfragen hinzufügt. Liste einen neuen Überprüfungsmechanismus unter Folgeaufgaben auf, anstatt ihn zu erstellen. Führe eine Abstimmungsabfrage aus, die jede Zahl auf den Folien mit den Exporten abgleicht, und zeige deren Ausgabe.
- **Verifizierung:** Die Abstimmungsausgabe wird unverändert eingefügt. Die Qualität des Folientextes, die keinen deterministischen Richter hat, wird als `UNVERIFIED` markiert und zur menschlichen Überprüfung angeboten.

### Beispiel 3: Kreative Arbeit, Höhe übersprungen

- **Eingabe:** „Schreibe ein Startgedicht für unser Produkt und mache es so gut wie möglich.“ (Ohne die zweite Klausel ist dies ein Artefakt mit geringem Einsatz, das trivial nachzuarbeiten ist, und es wird umgangen: Schreibe das Gedicht.)
- **Aktion:** Der Benutzer bat um Tiefe, also erweitere. Notiere `Altitude: not applicable (creative artifact)`. Wende Tiefe nur auf das Handwerk an, z. B. das Lesen von drei bestehenden Gedichten, die der Benutzer mag, als Rohmaterial, und bestätige, bevor du mehr tust.
- **Verifizierung:** Es gibt keinen externen Richter. Melde `UNVERIFIED: no external judge available` und bitte den Benutzer, das Ergebnis zu überprüfen.

