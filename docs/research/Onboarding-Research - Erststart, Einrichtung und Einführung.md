---
type: Research
status: entwurf
scope: mvp
date: 2026-11-22
---

# Onboarding-Research · Erststart, Einrichtung und Einführung

**Ergebnis:** Der geplante Ablauf ist umsetzbar: Vault → Plugin installieren → aktivieren → Einrichtung → Lage → Einführung. Er hält die Obsidian-Richtlinien ein, wenn vier Bedingungen gelten.

1. Die Ansicht öffnet sich von selbst nur einmal, im Hook `onUserEnable()`. Obsidian hat ihn genau dafür vorgesehen [B]. Bei jedem weiteren Start öffnet das Plugin nichts selbst [A].
2. Die Einrichtung ist eine Route in der eigenen Ansicht, kein Modal beim Start. Sie legt erst dann Notizen an, wenn der Mensch speichert [A].
3. Es gibt keine Telemetrie im Plugin. Sie ist im Verzeichnis verboten [B]. Den Erfolg der Einführung misst nur der Pilot durch Beobachtung [A].
4. Für den Zustand der Einführung zählt auch der Vault, nicht nur die Plugin-Daten. Gibt es schon Gemeinschaften, entfällt die Einrichtung [A].

Die Forschung spricht gegen eine lange, blockierende Tour. Tutorials im Kartenstapel-Stil verbessern weder Erfolg noch Tempo. Sie lassen eine App sogar schwerer wirken [B]. Besser passen Leerzustände mit klarer nächster Aktion, eine kurze Checkliste „Erste Schritte“ auf der Lage und eine kurze Tour, die man ablehnen kann [A]. Die Einrichtung fragt nur das Nötigste ab: Name und Art je Gemeinschaft. Kürzel, Einheitenbezeichnung und Farbe sind vorbelegt und änderbar. Verwaltung und Kontakte bleiben optional, der Registerimport kommt nach der Einrichtung [A]. Nuxt UI 4.13.0 bringt alle Bausteine mit: `UStepper`, `UForm`, `UModal`, `UPopover`, `UEmpty`, `UProgress`. Dazu kommt der Composable `useTour`. Eine fertige Tour-Komponente gibt es nicht, aber auch keine neue Abhängigkeit ist nötig [B].

## Methode und Evidenzgrenze

Desk Research am 22.11.2026. Alle verlinkten Seiten wurden an diesem Tag geöffnet.

- **Obsidian:** Die Entwicklerdoku wurde als Git-Stand gelesen: [obsidian-developer-docs @ `1c26772`](https://github.com/obsidianmd/obsidian-developer-docs/tree/1c26772ac13d6e9870c865936d389fdfe694e742/en) vom 21.10.2026. Dazu kamen `node_modules/obsidian/obsidian.d.ts` und `CHANGELOG.md` (API 1.14.4) und die Hilfeseiten auf obsidian.md/help. Die alten Adressen unter help.obsidian.md leiten dorthin um. Zwei frühere Adressen auf docs.obsidian.md (Developer policies, Submission requirements) liefern inzwischen „Not Found“. Zitiert wird darum der Git-Stand.
- **Plugin-Beispiele:** Quelltext von neun Plugins, flach geklont am 22.11.2026, Commits unten unter Quellen. Ausgewertet wurde nur das Startverhalten im Code. Ob es bei Nutzern gut ankommt, wurde nicht geprüft.
- **Onboarding-Forschung:** NN/g-Artikel, das GOV.UK Design System, W3C WAI (APG, Tutorials, WCAG-2.2-Understanding). Gelesen wurden die Seiten selbst, nicht die Studien dahinter.
- **Nuxt UI:** ui.nuxt.com, die Reka-UI-Doku und die Typdefinitionen der installierten Version `@nuxt/ui` 4.13.0.
- Es gab keine Nutzertests, keinen Prototyp und keinen e2e-Lauf. Wie sich `onUserEnable` zur Laufzeit verhält, ist nicht geprüft (siehe Offene Fragen).

**Kennzeichnung:**

- **[B]** Beleg, an der genannten Primärquelle geprüft.
- **[S]** Sekundärquelle oder Anbieterblog, nicht an Primärdaten geprüft.
- **[A]** eigene Ableitung für WEG Manager.
- **[L]** Lücke, nichts Belastbares gefunden.

## 1 Obsidian-Plattform und Richtlinien

### 1.1 Was vor dem ersten Plugin-Code passiert

- [B] Obsidian läuft standardmäßig im eingeschränkten Modus (Restricted Mode), damit kein Fremdcode läuft. Community-Plugins liegen dann zwar im Vault, werden aber ignoriert ([Plugin security](https://obsidian.md/help/plugin-security)).
- [B] Zum Installieren muss man den eingeschränkten Modus abschalten: **Turn on community plugins**. Dann folgen **Settings → Community plugins → Browse**, Plugin wählen, **Install**. Aktivieren geht direkt danach mit **Enable** oder später unter **Installed plugins** ([Community plugins](https://obsidian.md/help/community-plugins)).
- [B] Obsidian warnt: Plugins führen Fremdcode aus. Sie können auf Dateien zugreifen, ins Internet gehen und Programme installieren. Jede Version wird automatisch gescannt, beliebte und gemeldete Plugins werden zusätzlich von Hand geprüft ([Plugin security](https://obsidian.md/help/plugin-security)).
- [B] Community-Plugins aktualisieren sich nicht selbst. Der Mensch wählt **Check for updates** und dann **Update all** oder **Update** ([Community plugins](https://obsidian.md/help/community-plugins)).
- [B] Die Konfiguration liegt je Vault im Ordner `.obsidian` ([Configuration folder](https://obsidian.md/help/configuration-folder)). `loadData()`/`saveData()` lesen und schreiben `data.json` „in the plugin folder“ ([loadData](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Reference/TypeScript%20API/Plugin/loadData.md), [saveData](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Reference/TypeScript%20API/Plugin/saveData.md)).
- [B] `onExternalSettingsChange()` wird aufgerufen, wenn `data.json` von außen geändert wurde, „usually … a Sync service“ ([onExternalSettingsChange](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Reference/TypeScript%20API/Plugin/onExternalSettingsChange.md)).
- [A] Bis zum ersten Aktivieren kann das Plugin also gar nichts tun. Den Weg durch den eingeschränkten Modus müssen README und Verzeichnisbeschreibung erklären, nicht das Plugin. Die Plugin-Daten gelten je Vault und können per Sync auf ein zweites Gerät kommen. „Erststart“ heißt also: erster Start in diesem Vault. Es heißt nicht: erster Start auf diesem Gerät.

### 1.2 Lebenszyklus: onload, onLayoutReady, onUserEnable, Updates

- [B] `onload()` läuft, „whenever the user starts using the plugin“, also bei jedem Start von Obsidian und nach jedem Aktivieren ([Anatomy of a plugin](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Getting%20started/Anatomy%20of%20a%20plugin.md)).
- [B] In `onload` gehören nur Registrierungen, also Befehle, View-Typen und Post-Processors. Teure Arbeit und Datenabrufe gehören nicht hinein. Code für den Start gehört „for most cases“ in `workspace.onLayoutReady`. Der wird erst aufgerufen, wenn Obsidian fertig geladen hat ([Optimize plugin load time](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Guides/Optimize%20plugin%20load%20time.md)).
- [B] Obsidian öffnet beim Start alle Ansichten wieder, die im Workspace gespeichert sind. Seit 1.7.2 sind das zunächst DeferredViews. Die echte View entsteht erst, wenn ihr Tab sichtbar wird ([Defer views](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Guides/Defer%20views.md)).
- [B] **`onUserEnable()`** (seit 1.7.2): „Perform any initial setup code. The user has explicitly interacted with the plugin so its safe to engage with the user. If your plugin registers a custom view, you can open it here.“ ([onUserEnable](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Reference/TypeScript%20API/Plugin/onUserEnable.md), [docs.obsidian.md](https://docs.obsidian.md/Reference/TypeScript+API/Plugin/onUserEnable)). Laut API-Changelog ist der Hook „a place to perform one-time initialize after the user installs and enables your plugin“. Für eine eigene View sei er „a good place to initialize it rather than recreating the view in `Plugin#onload`“ (`node_modules/obsidian/CHANGELOG.md`, API 1.14.4; [obsidian-api CHANGELOG](https://github.com/obsidianmd/obsidian-api/blob/master/CHANGELOG.md)).
- [B] Wird das Plugin aktualisiert, baut Obsidian offene Blätter an ihrer alten Stelle neu auf. Darum sollen Plugins in `onunload` keine Blätter schließen ([Plugin guidelines › Don't detach leaves in onunload](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Releasing/Plugin%20guidelines.md)).
- [B] Referenzen auf eigene Views soll das Plugin nicht halten. Es holt sie mit `getLeavesOfType()` und prüft sie mit `instanceof`. Wer mit einer View sprechen will, macht sie vorher mit `revealLeaf` sichtbar ([Plugin guidelines](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Releasing/Plugin%20guidelines.md), [Defer views](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Guides/Defer%20views.md)).
- [A] Folgen für WEG Manager:
  - Erkennen, ob eingerichtet ist, und die Lage öffnen gehören nach `onLayoutReady` oder `onUserEnable`, nicht in `onload`. Im Repo meldet `src/infrastructure/obsidian/shell/events.ts` `LayoutReady` schon als Ereignis.
  - Ein Update ist kein Erststart. Die Ansicht steht nach dem Update wieder da, wo sie war.
  - Die `minAppVersion` 1.15.1 im `manifest.json` liegt über 1.7.2. `onUserEnable` steht also zur Verfügung.

### 1.3 Was die Richtlinien sagen und was nicht

| Thema | Befund | Kennzeichnung |
| --- | --- | --- |
| Telemetrie | „Plugins and themes must not: … Include client-side telemetry.“ Server-Telemetrie, Netzwerknutzung und Dateizugriff außerhalb des Vaults nur mit Hinweis im README ([Developer policies](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Community%20directory/Developer%20policies.md)). | [B] |
| Werbung, Pop-ups | Statische Werbung „such as banners and pop-up messages within the plugin's own interface“ ist nur mit Hinweis im README erlaubt (ebd.). | [B] |
| Selbst-Update | Plugins dürfen sich und ihre Abhängigkeiten nicht selbst installieren oder aktualisieren (ebd.). | [B] |
| Hotkeys | „Avoid setting a default hotkey for commands“ ([Plugin guidelines](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Releasing/Plugin%20guidelines.md)). | [B] |
| Settings-Tab | Keine Überschrift ganz oben, kein „Settings“ in Überschriften, Satzanfang-Großschreibung, `setHeading()` statt `<h1>` (ebd.). | [B] |
| Konsole | In der Standardeinstellung nur Fehler, keine Debug-Ausgaben (ebd.). | [B] |
| Desktop/Mobile | Node- und Electron-APIs verlangen `isDesktopOnly: true` ([Submission requirements](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Community%20directory/Submission%20requirements%20for%20plugins.md)). `addStatusBarItem` gibt es mobil nicht ([Plugin](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Reference/TypeScript%20API/Plugin.md)). WEG Manager setzt `isDesktopOnly: true`. | [B] |
| Befehls-IDs | Ohne Plugin-ID, Obsidian setzt sie selbst davor (Submission requirements). | [B] |
| Views/Tabs/Modals automatisch öffnen | Keine ausdrückliche Regel in Guidelines, Policies oder Submission requirements. Der einzige Hinweis ist positiv: In `onUserEnable` darf die View geöffnet werden. | [L], [B] für `onUserEnable` |
| Erststart-Dialog, Notices | Keine Regel. Der Modal-Leitfaden zeigt das Öffnen über einen Befehl ([Modals](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/User%20interface/Modals.md)). | [L] |
| Dateien/Ordner ohne Zustimmung anlegen | Keine Regel. Nur API-Hinweise: Vault-API statt Adapter, `normalizePath()`, `processFrontMatter` (Guidelines › Vault). | [L] |

- [A] Wo keine Regel steht, gilt eine strenge Lesart. Sie folgt aus dem Leitbild „prioritizing private and offline usage“ ([Developer policies](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Community%20directory/Developer%20policies.md)) und aus dem eigenen [[K-14 - Markdown und Frontmatter als offene Datengrundlage]]:
  - Nichts unterbricht beim normalen Start.
  - Nichts landet ungefragt im Vault.
  - Kein Notice wirbt für Funktionen.

## 2 Beispiele aus dem Plugin-Ökosystem

Ausgewertet wurde der Quelltext am jeweiligen Commit (siehe Quellen).

| Plugin | Erststart- und Einführungsverhalten | Kennzeichnung |
| --- | --- | --- |
| **Excalidraw** | Nach dem Laden öffnet sich ein `ReleaseNotes`-Modal, wenn `showReleaseNotes` an ist und die Version neuer ist als `previousRelease`. Bei Neuinstallation (`previousRelease` `0.0.0`) zeigt es den Text `FIRST_RUN` mit einem Kurs-Link, sonst die Notizen ab der letzten gesehenen Version. Die Version wird beim Schließen gespeichert. Abschalten geht im Settings-Tab, erneut aufrufen mit dem Befehl „release-notes“ (`src/core/main.ts`, `src/shared/Dialogs/ReleaseNotes.ts`, `src/core/managers/CommandManager.ts`). | [B] |
| **Obsidian Projects** | Ist beim Öffnen der eigenen Ansicht noch kein Projekt da, öffnet sich ein `OnboardingModal` „Get started with Projects“. Es bietet „Create new project“ oder „Try a demo project“. Das Demo legt nur auf Klick einen Ordner mit Beispielnotizen an, der Tooltip sagt das vorher. Dazu kommen Tipps zu den anderen Wegen: Ansicht, Befehlspalette, Dateiexplorer (`src/ui/app/App.svelte`, `onboarding/Onboarding.svelte`, `onboarding/demoProject.ts`). | [B] |
| **Homepage** | Öffnet beim Start eine eingestellte Notiz. `openOnStartup` ist standardmäßig an, `autoCreate` aus: Die Notiz wird also nicht ungefragt angelegt. Obsidians eigene Release Notes werden zurückgehalten und danach gezeigt, außer `hideReleaseNotes` ist an (`src/settings.ts`, `src/main.ts`). | [B] |
| **Calendar** | Legt bei jedem Layout-Ready seine View in der rechten Seitenleiste an, wenn keine da ist (`initLeaf`, `src/main.ts`, Stand 2022). Das ist das Gegenmodell: Die View öffnet sich bei jedem Start, nicht nur einmal. | [B] |
| **Omnisearch** | Hat einen Schlüssel `welcomeMessage`, damit ein Hinweis nach einem Update nur einmal kommt. Der Notice ist derzeit auskommentiert, nur die Version wird gespeichert (`src/main.ts`, `executeFirstLaunchTasks`). | [B] |
| **Tasks, Templater** | Kein Willkommensdialog gefunden. Der Settings-Tab verlinkt auf die Doku (Tasks: publish.obsidian.md/tasks; Templater: silentvoid13.github.io/Templater). | [B] |
| **Dataview, Kanban** | Kein Willkommensdialog gefunden. `onLayoutReady` dient nur dem Index bzw. Patches. | [B] |

- [A] Das Ökosystem kennt drei Muster:
  1. ein einmaliges Modal mit Versionsschlüssel in `data.json` (Excalidraw, Omnisearch),
  2. einen Leerzustand der eigenen Ansicht mit Start- und Demo-Angebot (Projects),
  3. reine Doku-Links (Tasks, Templater).
- [A] Eine geführte Tour im Plugin wurde in keinem der neun Plugins gefunden. Projects passt am besten zu WEG Manager: Das Angebot erscheint erst in der eigenen Ansicht, und Beispieldaten entstehen nur auf ausdrücklichen Klick.

## 3 Onboarding-Muster

### 3.1 Tour, Tutorial und kontextuelle Hilfe

- [B] Kartenstapel-Tutorials sind „push revelations“. Sie zeigen Neues ohne Bezug zur Aufgabe und unterbrechen. „Pull revelations“ erscheinen dagegen, wenn ein Signal zeigt, dass die Hilfe jetzt nützt. Tutorials seien „dramatically overused“ und schnitten in Studien oft schlecht ab. Nutzer wollen sofort loslegen und überspringen. Gut ist eine Anleitung, die man selbst ausführt und später wieder aufrufen kann ([Laubheimer, NN/g 2023](https://www.nngroup.com/articles/onboarding-tutorials/)).
- [B] In einer Studie mit 70 Personen und vier iOS-Apps verbesserten Tutorials weder den Erfolg (91 % mit, 94 % ohne Tutorial) noch die Zeit. Wer das Tutorial gelesen hatte, fand die Aufgaben aber deutlich schwerer: 4,92 gegenüber 5,49 von 7 ([Kendrick, NN/g 2020](https://www.nngroup.com/articles/mobile-tutorials/)).
- [B] Onboarding lohnt sich nur in bestimmten Fällen. Einer davon: Die App braucht Angaben des Nutzers, um anzufangen. Anpassung des Inhalts gehört ins Onboarding, kurz und mit Begründung. Optische Anpassung „doesn't belong in onboarding“. Anleitungen sollen „brief, optional“ sein und keine schlechte Gestaltung ausgleichen ([Kendrick, NN/g 2020](https://www.nngroup.com/articles/mobile-app-onboarding/)).
- [B] Hinweisblasen (Coach Marks) zeigt man einzeln, im richtigen Moment und neben dem betroffenen Element, nicht als Kette. Man muss sie leicht wegklicken können ([Harley, NN/g 2014](https://www.nngroup.com/articles/mobile-instructional-overlay/)).
- [A] Für Laien mit wenig Zeit heißt das zweierlei. Die Einrichtung ist berechtigt, weil das Plugin ohne Gemeinschaft nichts zeigen kann. Eine lange Tour ist es nicht. Die Lage soll sich selbst erklären. Die Tour bleibt kurz und freiwillig.

### 3.2 Assistent (Wizard)

- [B] Assistenten eignen sich für Neulinge und seltene Abläufe wie die Einrichtung. Gute Assistenten:
  - zeigen alle Schritte und markieren den aktuellen,
  - halten eine klare Reihenfolge ein und haben „Zurück“ und „Weiter“,
  - beschriften Knöpfe mit der echten nächsten Aktion statt nur „Weiter“,
  - lassen den Menschen mittendrin aufhören und später weitermachen,
  - haben sinnvolle Vorgaben,
  - zeigen Hilfe neben dem Assistenten, nicht darüber.

  ([Budiu, NN/g 2017](https://www.nngroup.com/articles/wizards/))
- [B] GOV.UK: „Start by asking one question per page“. Oben steht immer ein Zurück-Link. Man fragt nur, was man wirklich braucht, und weiß, warum ([Question pages](https://design-system.service.gov.uk/patterns/question-pages/)). Vor dem Abschluss steht eine Seite „Check answers“ mit „Change“-Links. Nach einer Änderung geht es zurück zu dieser Seite. Übersprungene optionale Fragen zeigen „Not provided“ ([Check answers](https://design-system.service.gov.uk/patterns/check-answers/)).
- [B] Eine Aufgabenliste (Task list) passt nur zu längeren Abläufen über mehrere Sitzungen. Ihre Zustände sind Not yet started, In progress, Completed und Cannot start yet. Die Reihenfolge ist möglichst frei. Wer zurückkommt, sieht die Liste zuerst ([Complete multiple tasks](https://design-system.service.gov.uk/patterns/complete-multiple-tasks/)).
- [B] Progressive Offenlegung verschiebt seltene Optionen auf einen zweiten Bildschirm. Das hilft Neulingen, Fehler zu vermeiden. Was zuerst erscheint, wirkt wichtig ([Nielsen, NN/g 2006](https://www.nngroup.com/articles/progressive-disclosure/)).

### 3.3 Leerzustände

- [B] Leerzustände sollen drei Dinge tun ([Kaplan, NN/g 2021](https://www.nngroup.com/articles/empty-state-interface-design/)):
  - den Systemzustand sagen, also wirklich leer oder ein Fehler,
  - erklären, wie sich der Bereich füllt,
  - direkt zur nächsten Aufgabe führen, etwa mit einem Knopf zum Anlegen oder einem Doku-Link.

### 3.4 Messung

- [S] In der SaaS-Praxis heißt die Zeit bis zum ersten Nutzen „time to value“, das Erreichen eines festgelegten Meilensteins „Aktivierung“. Ein Anbieterblog nennt den Durchschnitt als Kennzahl unvollständig und empfiehlt Kohortenkurven ([ProductLed 2022/2024](https://productled.com/blog/activation-velocity)).
- [A] WEG Manager darf im Client nicht messen (1.3). Darum gelten diese Größen nur im Pilot, beobachtet und von Hand protokolliert, passend zu [[H-08 - Der Pilot kann den Kernablauf selbstständig fortführen]]. Vorschlag für Messpunkte:
  - Zeit vom Aktivieren bis zur ersten gespeicherten Gemeinschaft,
  - Zeit bis zum ersten erfassten Punkt,
  - ob die Person die erste Wochenarbeit ohne Hilfe beginnt,
  - wie oft sie dabei Hilfe braucht.

## 4 Barrierefreiheit

- [B] Modaler Dialog laut APG ([Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)):
  - Beim Öffnen geht der Fokus in den Dialog. Bei viel Inhalt geht er auf ein statisches Element am Anfang mit `tabindex="-1"`.
  - Tab bleibt im Dialog, Escape schließt.
  - Danach kehrt der Fokus zum auslösenden Element zurück.
  - `aria-modal="true"` nur, wenn außen wirklich gesperrt und optisch verdeckt ist.
  - `aria-labelledby` zeigt auf den sichtbaren Titel.
- [B] WCAG 2.2, 2.4.11 Focus Not Obscured (Minimum, AA): Ein fokussiertes Element darf nicht ganz von Inhalt des Autors verdeckt sein. Gefährdet ist ein nichtmodales Overlay, das keinen Fokus nimmt und andere fokussierbare Elemente verdecken kann. Ein richtig gebauter modaler Dialog besteht immer ([Understanding 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)).
- [B] 3.3.7 Redundant Entry (A): Was im selben Ablauf schon eingegeben wurde, wird vorbelegt oder steht zur Auswahl ([Understanding 3.3.7](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html)).
- [B] 3.2.6 Consistent Help (A): Hilfe, etwa ein Selbsthilfe-Angebot, steht auf allen Seiten einer Sammlung an derselben Stelle ([Understanding 3.2.6](https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html)).
- [B] 1.4.13 Content on Hover or Focus (AA): Inhalte, die bei Hover oder Fokus erscheinen, kann man schließen, mit der Maus erreichen, und sie bleiben stehen ([Understanding 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)).
- [B] Mehrseitige Formulare ([WAI Tutorial Multi-page Forms](https://www.w3.org/WAI/tutorials/forms/multi-page/)):
  - Der Fortschritt steht im Titel und in der Hauptüberschrift, zum Beispiel „Schritt 2 von 3“.
  - Der erste Schritt nennt die Zahl der Schritte.
  - Die Schrittanzeige ist eine geordnete Liste mit versteckten Texten „Erledigt:“ und „Aktuell:“.
- [L] Für Touren gibt es kein eigenes APG-Muster. [A] Eine Tour-Karte, die den Fokus übernimmt, folgt dem Dialog-Muster. Sie ist modal oder nichtmodal mit Fokus und hält damit 2.4.11 ein.

## 5 Nuxt UI

Installiert ist `@nuxt/ui` 4.13.0 mit `reka-ui` 2.11.0 und `@vueuse/core` ^14.4.0 (`node_modules/@nuxt/ui/package.json`).

| Baustein | Befund | Verwendung [A] |
| --- | --- | --- |
| [Stepper](https://ui.nuxt.com/docs/components/stepper) | „A set of steps that are used to indicate progress through a multi-step process.“ Props `items`, `orientation`, `linear` (Standard `true`), `disabled`, `v-model`; Methoden `next()`, `prev()`, `hasNext`, `hasPrev`. Keine eigene A11y-Seite [B]. Reka-Stepper: Pfeiltasten, Enter/Space, `data-state` active/inactive/completed ([Reka Stepper](https://reka-ui.com/docs/components/stepper)) [B]. | Schrittanzeige der Einrichtung. „Schritt n von m“ zusätzlich als Text in die Überschrift (WAI). |
| [Form](https://ui.nuxt.com/docs/components/form) und FormField | Eigene Validierung oder Schema, Fehler am Feld (siehe [[UI-Research - NuxtUI und Komponentenwahl]]) [B]. Laut AGENTS.md TanStack Form, die Prüfungen rufen Domänenregeln auf. | Ein Formular je Schritt, Prüfung über die Domänenregeln von DV-01. |
| [Modal](https://ui.nuxt.com/docs/components/modal), [Slideover](https://ui.nuxt.com/docs/components/slideover) | `dismissible`, `modal`, `overlay`, `portal`, Event `close:prevent` [B]. Fokusverhalten nicht dokumentiert [L]. | Willkommensdialog vor der Tour; Rückfrage „Einrichtung abbrechen?“, wenn ungespeicherte Eingaben da sind. |
| [Popover](https://ui.nuxt.com/docs/components/popover) | Prop `reference` mit Element oder virtuellem Element, „can be changed reactively to re-anchor the popover (e.g. for a guided tour)“, dazu `modal`, `dismissible` [B]. Reka Popover: „Adheres to the Dialog WAI-ARIA design pattern“, Esc schließt ([Reka Popover](https://reka-ui.com/docs/components/popover)) [B]. | Tour-Karte. |
| [useTour](https://ui.nuxt.com/docs/composables/use-tour) | „A composable to build guided tours by re-anchoring a single Popover across steps.“ Steps mit `target` (ID, Selektor, Element; `null` = mittig), Rückgabe `open`, `index`, `current`, `reference`, `total`, `start`, `next`, `prev`, `goTo`, `finish`; scrollt das Ziel ins Bild. Optional ein Spotlight per `clip-path`, Overlay mit `aria-hidden`. Tastatur und A11y nicht dokumentiert [B]. In 4.13.0 vorhanden, Export `@nuxt/ui/composables` (`dist/runtime/composables/useTour.d.ts`) [B]. | Tour ohne neue Abhängigkeit. Tastatur, Fokus, Live-Region und reduzierte Bewegung baut das Projekt selbst. |
| Tour-Komponente | Keine. Der PR „feat(Tour): new component“ ([nuxt/ui#5781](https://github.com/nuxt/ui/pull/5781)) ist geschlossen, ohne Merge [B]. | Nicht abwarten, `useTour` + `UPopover` nutzen. |
| [Empty](https://ui.nuxt.com/docs/components/empty) | „A component to display an empty state.“ `icon`, `title`, `description`, `actions` [B]. | Leerzustände von Lage, Punkten und Kontakten mit direkter Aktion. |
| Progress, [ProgressGroup](https://ui.nuxt.com/docs/components/progress-group) | Fortschrittsbalken; ProgressGroup teilt in Segmente. A11y-Rollen nicht dokumentiert [B]/[L]. | Höchstens für „2 von 4 erledigt“ in der Checkliste, immer mit Text dazu. |
| Tooltip | Vorhanden in 4.13.0 [B]. | Nicht für Pflichtinformationen (1.4.13, Touch). |

- [A] Nach AGENTS.md gehört jede neu genutzte Komponente in die `@source`-Listen in `src/styles/app.css`. Heute stehen dort App, Alert, Avatar, Button, Card, FormField, Icon, Input, Link, Modal, Skeleton und Slideover. Neu dazu kämen Stepper, Popover, Empty und gegebenenfalls Progress.

## 6 Konsequenzen für WEG Manager

> [!note] Entscheidung vom 22.11.2026
> Die Festlegung weicht in einigen Punkten von den folgenden Empfehlungen ab: Es gibt keine Tour, auch nicht als Angebot, sondern nur Hinweise im Kontext je Gerät. Der Assistent hat zwei Schritte ohne Willkommensschritt. Das Kürzel wird änderbar, und Eingaben bleiben bis zum Neustart von Obsidian erhalten. Gültig ist [[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]].

### 6.1 Ansicht beim Erststart öffnen

- [A] **Einmal öffnen, in `onUserEnable()`.** Die Lage öffnet sich in einem neuen Tab, ohne die Notiz des Menschen zu ersetzen. Weil noch keine Gemeinschaft da ist, zeigt sie die Route „Einrichtung“. Bei jedem weiteren Start öffnet das Plugin nichts selbst: kein Modal, kein Notice. Obsidian stellt die View aus dem Workspace wieder her, wenn sie offen war (1.2).
- [A] **Zustand aus dem Vault ableiten.** „Einrichtung nötig“ gilt genau dann, wenn der `NoteStore` keine gültige Gemeinschaft findet. Ein Flag in `data.json` entscheidet das nicht. So landet ein zweites Gerät mit synchronisiertem Vault nicht in der Einrichtung. Das gilt auch, wenn ein Agent die Notizen nach DV-01 angelegt hat.
- [A] **Keine Pflicht-Unterbrechung.** Wer die Ansicht schließt, kommt über Ribbon, Befehl „Einrichtung fortsetzen“ oder den Leerzustand der Lage zurück. Kein Standard-Hotkey.
- [A] **Nichts ungefragt im Vault.** Ordner `WEG Manager/Gemeinschaften` und Notizen entstehen erst, wenn eine Gemeinschaft gespeichert wird. Der Prüfschritt nennt vorher den Ablageort. Beispieldaten nur auf ausdrücklichen Wunsch, deutlich als Beispiel benannt und in einem eigenen Ordner, wie bei Projects. Für den MVP besser gar nicht, weil sie sich mit echten Daten vermischen können.

### 6.2 Was die Einrichtung minimal abfragt

DV-01 verlangt `name`, `short_code`, `color`, `kind` und `unit_label`. Für den ersten Nutzen reicht weniger:

| Schritt | Fragt ab | Vorbelegt, änderbar | Pflicht |
| --- | --- | --- | --- |
| 1 Gemeinschaft | Name („Ahornweg 12“), Art als Auswahl mit freiem Wert (WEG, Tiefgarage, Sonstige) | Einheitenbezeichnung aus der Art (Einheiten bzw. Stellplätze); Kürzel aus dem Namen vorgeschlagen und geprüft; Farbe: nächste freie der Palette | ja |
| 1a weitere Gemeinschaft | „Gibt es noch eine Gemeinschaft, etwa eine Tiefgarage?“ | Name aus der ersten übernommen („Tiefgarage Ahornweg 12“), Art Tiefgarage (3.3.7) | nein |
| 2 Verwaltung | Name der Verwaltung, optional E-Mail | Gilt für alle Gemeinschaften, abwählbar je Gemeinschaft (3.3.7) | nein, „Später“ |
| 3 Prüfen | Zusammenfassung mit „Ändern“ je Angabe, Ablageort, Knopf „Gemeinschaften anlegen“ | – | – |

- [A] Optische Anpassung wie Farbe nicht in den Vordergrund (NN/g). Die Farbe steht nur als vorbelegte Zeile in der Prüfung.
- [A] Kürzel als „Kürzel (2–5 Zeichen, später nicht änderbar)“ erklären. Das ist der einzige Wert, der danach fest ist.
- [A] Laut [[VIEW-07 - Einstellungen und Einrichtung]] ist „Register übernehmen (optional)“ der dritte Schritt der Einrichtung. Er sollte in die Checkliste wandern: Er ist lang, braucht eine Datei und ist nicht für jeden nötig. „Kontakte“ gehört erst in die Einrichtung, wenn es den Notiztyp gibt. Im GLOSSARY ist Ansprechpartner noch „Not yet named“.
- [A] Nicht abfragen: Anschrift, Zahl der Einheiten, eigene Angaben (Name, Grußformel), Wochenrhythmus, Ablageordner. Dafür gibt es gute Standardwerte, und diese Angaben braucht erst eine spätere Aufgabe. Dann fragt das Plugin in dem Moment, in dem sie gebraucht werden.

### 6.3 Speichern, Abbrechen, Fortsetzen

- [A] Jede Gemeinschaft wird mit „Anlegen“ im Prüfschritt zur Notiz, alle zusammen. Bricht der Mensch vorher ab, bleiben die Eingaben nur im Speicher der offenen Ansicht. Es gibt dann eine Rückfrage, und `data.json` speichert keine Entwürfe. So kommen keine halben Daten in den Vault und keine personenbezogenen Angaben aus Schritt 2 in Plugin-Daten.
- [A] Fortsetzen geschieht über den Vault-Zustand. Gibt es Gemeinschaften, aber noch keine Verwaltung, zeigt die Checkliste „Verwaltung eintragen“ statt die Einrichtung neu zu starten.
- [A] Die Knöpfe heißen nach der Aktion, etwa „Weiter zur Verwaltung“ oder „Gemeinschaften anlegen“. Dazu „Zurück“ auf jedem Schritt. „Schritt n von 3“ steht in Überschrift und Tab-Titel (WAI, NN/g).

### 6.4 Tour oder Checkliste

- [A] **Hauptmittel ist eine Checkliste „Erste Schritte“** als Karte auf der Lage, je Punkt mit direkter Aktion:
  - ersten Punkt erfassen,
  - Register übernehmen (optional),
  - Verwaltung eintragen (optional),
  - erste Wochenarbeit starten.

  Sie richtet sich nach dem GOV.UK-Muster: Zustand als Text, freie Reihenfolge. Erledigtes ergibt sich aus dem Vault, nicht aus Klicks. Mit „Ausblenden“ verschwindet sie.
- [A] **Leerzustände** mit `UEmpty` in jeder Ansicht: was hier erscheint und ein Knopf für den nächsten Schritt.
- [A] **Tour nur als Angebot.** Nach der Einrichtung erscheint ein kurzer Dialog „Kurze Einführung (4 Schritte, 1 Minute)?“ mit „Starten“ und „Nicht jetzt“. Der Designstand sieht 7 blockierende Schritte vor. Auf 4–5 kürzen: Kennzahlen, Wochenarbeit, Erfassen, Gemeinschaftswechsel, Hilfe. Jede Karte hat einen Satz, Fokus auf den Kartentitel, Esc beendet, Zurück und Weiter, „n / m“ als Text, bei reduzierter Bewegung keine Animation. Bauen mit `useTour` + `UPopover`.
- [A] **Kontextuelle Hinweise** zeigt das Plugin einzeln beim ersten Kontakt mit einer Funktion, nicht in der Tour. Ein Beispiel ist der erste Wochenstart. Man kann sie für immer schließen.

### 6.5 Wiederholen aus den Einstellungen

- [A] Im Obsidian-Settings-Tab (native API, keine Überschrift ganz oben) eine Gruppe „Einführung“ mit:
  - „Einführung erneut starten“,
  - „Erste Schritte wieder anzeigen“,
  - Link zur Hilfe.

  Das sind technische Plugin-Zustände und passen damit zur Regel „eine Bearbeitungsstelle je Einstellung“ (PBI-49). Gemeinschaften selbst bearbeitet der Mensch nur in der Ansicht.
- [A] Befehle „Einführung starten“ und „Einrichtung fortsetzen“, ohne Hotkey. Ein Hilfe-Einstieg steht in jeder Ansicht an derselben Stelle (3.2.6).
- [A] `data.json` hält nur `onboarding: { tour: "offered" | "done" | "dismissed", tourVersion, checklistHidden }`. Bei einer neuen Tour-Version gibt es einen dezenten Hinweis in der Hilfe, kein Modal nach dem Update.

### 6.6 Laien, Ehrenamt, Datenschutz

- [A] Sprache:
  - Alltagsworte statt Fachbegriffe: „Gemeinschaft“ mit Beispiel „z. B. WEG Ahornweg 12 oder deren Tiefgarage“, nicht „Rechtsträger“.
  - „Art“ ohne Rechtsfolge (GLOSSARY).
  - Kein „Schema“, „Frontmatter“ oder „Vault“ im Assistenten. „Notizen in diesem Ordner“ genügt, ein Link führt zur Erklärung für Interessierte.
- [A] Wenige Pflichtfelder, kein Konto, keine KI, keine Netzwerkanfrage in der Einrichtung, passend zu [[K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]].
- [A] Keine Eigentümerdaten in der Einrichtung. Personenbezug entsteht erst mit Kontakten. Datenminimierung nach Art. 5 Abs. 1 lit. c DSGVO, belegt in [[JTBD-Research - Grundlagen und Methodik Verwaltungsbeirat]] (J-F3), spricht dafür, Verwaltung und Kontakte optional und später abzufragen.
- [A] Eine Sprache je Obsidian-Einstellung, alle Texte aus den Katalogen. Ordnernamen bleiben deutsch (DV-01).

## 7 Offene Fragen

1. Wann genau ruft Obsidian `onUserEnable()` auf? Nur beim ersten Aktivieren nach der Installation, oder bei jedem Aus- und Einschalten? Auch, wenn ein synchronisiertes Gerät das Plugin übernimmt? Zu prüfen mit `obsidianPage.enablePlugin` im e2e-Lauf. **Geklärt am 22.11.2026** per Spike: bei jedem Aktivieren durch den Nutzer und bei jedem Update, nie beim Start und nie über Sync (Ergebnis in [[K-19 - Onboarding über Einrichtungsassistent, Erste Schritte und Hinweise im Kontext]], O-19d).
2. Prüft der Review oder der Scanner, ob ein Plugin Ansichten automatisch öffnet? Eine Regel fand sich nicht [L].
3. Funktionieren mit `useTour` + `UPopover` im Obsidian-Fenster und im Pop-out Fokus, Portal-Ziel und z-Index richtig? Und wie verhalten sich Hotkeys von Obsidian, etwa Pfeiltasten und Esc, während der Tour?
4. Seit welcher Nuxt-UI-Version gibt es `useTour`, und gilt es als stabil? Die Doku nennt keine Version.
5. Kommt die Verwaltung schon in den Durchstich, oder erst mit dem Notiztyp Ansprechpartner?
6. Brauchen Laien Beispieldaten zum Ausprobieren? Und wie trennt man sie dann sicher von echten Daten?
7. Soll der Tour-Zustand per Sync geteilt werden, oder ist er je Gerät gewollt?
8. Messung im Pilot: Wer beobachtet, und welche Zeiten werden notiert? Abzustimmen mit dem [[Interviewleitfaden - Beirats-Interviews]].

## Quellen

Alle abgerufen am 22.11.2026.

**Obsidian**

- [Plugin guidelines](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Releasing/Plugin%20guidelines.md), auch [docs.obsidian.md](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)
- [Developer policies](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Community%20directory/Developer%20policies.md)
- [Submission requirements for plugins](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Community%20directory/Submission%20requirements%20for%20plugins.md)
- [Anatomy of a plugin](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Getting%20started/Anatomy%20of%20a%20plugin.md), [Optimize plugin load time](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Guides/Optimize%20plugin%20load%20time.md), [Defer views](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Guides/Defer%20views.md), [Manage plugin lifecycle](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Guides/Manage%20plugin%20lifecycle.md)
- [Views](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/User%20interface/Views.md), [Modals](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/User%20interface/Modals.md)
- API-Referenz: [Plugin](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Reference/TypeScript%20API/Plugin.md), [onUserEnable](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Reference/TypeScript%20API/Plugin/onUserEnable.md), [loadData](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Reference/TypeScript%20API/Plugin/loadData.md), [saveData](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Reference/TypeScript%20API/Plugin/saveData.md), [onExternalSettingsChange](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Reference/TypeScript%20API/Plugin/onExternalSettingsChange.md)
- [obsidian-api CHANGELOG](https://github.com/obsidianmd/obsidian-api/blob/master/CHANGELOG.md), lokal geprüft in `node_modules/obsidian/CHANGELOG.md` (1.14.4)
- Hilfe: [Community plugins](https://obsidian.md/help/community-plugins), [Plugin security](https://obsidian.md/help/plugin-security), [Configuration folder](https://obsidian.md/help/configuration-folder)

**Plugin-Quelltexte**

- Excalidraw [@75c8f3b](https://github.com/zsviczian/obsidian-excalidraw-plugin/tree/75c8f3b792c63e302d2d0e24ad49dc800491ed5d)
- Obsidian Projects [@bb1484e](https://github.com/marcusolsson/obsidian-projects/tree/bb1484ef382f4ff55625b4c1762eef57dc480cd5)
- Homepage [@07d0c6f](https://github.com/mirnovov/obsidian-homepage/tree/07d0c6faaa2c41a7fcf701b017a1631fa4837fb8)
- Calendar [@ef3f269](https://github.com/liamcain/obsidian-calendar-plugin/tree/ef3f2696da11aa1d11a272179caea062d6144640)
- Omnisearch [@e4a51ab](https://github.com/scambier/obsidian-omnisearch/tree/e4a51ab52a2cd3924367ea9cf0bb439f83e62318)
- Tasks [@9fecdd6](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/9fecdd678fb84c212ed535b1f3e09719cd3bbee2)
- Templater [@006dc61](https://github.com/SilentVoid13/Templater/tree/006dc61f64902dc9c72cad15c26b988576339719)
- Dataview [@5ad0994](https://github.com/blacksmithgu/obsidian-dataview/tree/5ad0994ff384cbb797de382e7edff2388141b73a)
- Kanban [@5134c05](https://github.com/mgmeyers/obsidian-kanban/tree/5134c05ad9a7861f551cd15d57cf50db8394901a)

**Onboarding-Forschung**

- NN/g: [Onboarding Tutorials vs. Contextual Help](https://www.nngroup.com/articles/onboarding-tutorials/) (Laubheimer, 12.02.2023), [Mobile Tutorials: Wasted Effort or Efficiency Boost?](https://www.nngroup.com/articles/mobile-tutorials/) (Kendrick, 08.03.2020), [Mobile-App Onboarding](https://www.nngroup.com/articles/mobile-app-onboarding/) (Kendrick, 21.06.2020), [Wizards](https://www.nngroup.com/articles/wizards/) (Budiu, 25.06.2017), [Designing Empty States in Complex Applications](https://www.nngroup.com/articles/empty-state-interface-design/) (Kaplan, 19.09.2021), [Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) (Nielsen, 03.12.2006), [Instructional Overlays and Coach Marks](https://www.nngroup.com/articles/mobile-instructional-overlay/) (Harley, 16.02.2014)
- GOV.UK Design System: [Question pages](https://design-system.service.gov.uk/patterns/question-pages/), [Check answers](https://design-system.service.gov.uk/patterns/check-answers/), [Complete multiple tasks](https://design-system.service.gov.uk/patterns/complete-multiple-tasks/)
- [S] ProductLed: [Activation Velocity](https://productled.com/blog/activation-velocity) (Jarczyn, 2022, aktualisiert 2024)

**Barrierefreiheit**

- W3C WAI: [APG Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [Multi-page Forms](https://www.w3.org/WAI/tutorials/forms/multi-page/)
- WCAG 2.2 Understanding: [2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), [3.3.7](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html), [3.2.6](https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html), [1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)

**Nuxt UI und Reka UI**

- Nuxt UI: [Stepper](https://ui.nuxt.com/docs/components/stepper), [Popover](https://ui.nuxt.com/docs/components/popover), [useTour](https://ui.nuxt.com/docs/composables/use-tour), [Modal](https://ui.nuxt.com/docs/components/modal), [Empty](https://ui.nuxt.com/docs/components/empty), [ProgressGroup](https://ui.nuxt.com/docs/components/progress-group), [PR #5781](https://github.com/nuxt/ui/pull/5781)
- Reka UI: [Popover](https://reka-ui.com/docs/components/popover), [Stepper](https://reka-ui.com/docs/components/stepper)
- Lokal: `node_modules/@nuxt/ui` 4.13.0 (`dist/runtime/composables/useTour.d.ts`, `dist/runtime/components/`)
