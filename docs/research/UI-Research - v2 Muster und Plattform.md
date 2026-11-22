---
type: Research
status: entwurf
version: "2.0"
date: 2026-11-15
scope: mvp
---

# UI-Research · v2 Muster und Plattform

Webrecherche vom 15.11.2026 als Grundlage für den Neuentwurf von Informationsarchitektur, Nutzerflows und Mockups (v2). Ausgelöst durch das Review des ersten Entwurfs: zu viele gleichrangige Seiten, unklarer Einstieg in die Wochenarbeit, zu textlastige Darstellung. Ergänzt [[UI-Research - Mobile Bedienung und Accessibility]] und [[UI-Research - NuxtUI und Komponentenwahl]]; ersetzt sie nicht. Keine Nutzerinterviews; alle Ableitungen sind Designentscheidungen und bleiben im Review prüfbar.

## Befunde und Konsequenzen

| # | Befund (Quelle) | Konsequenz für v2 |
| --- | --- | --- |
| 1 | Weekly Reviews funktionieren als geführter Assistent: ein Schritt pro Bildschirm, feste Reihenfolge, ca. 20–30 min ([FacileThings](https://facilethings.com/blog/en/weekly-review-feature), [Todoist](https://todoist.com/productivity-methods/weekly-review)). | Wochenarbeit wird ein geführter Ablauf in 5 Schritten mit Fortschritt, Pause und Wiederaufnahme statt einer Übersichtsseite. |
| 2 | „Warten auf“ braucht zugesagtes Datum und eigenes Prüfdatum getrennt; jede Prüfung endet in genau einer Entscheidung ([Super Productivity](https://super-productivity.com/blog/gtd-waiting-for-list/)). | Schritt „Nachhalten“ mit vier Antworten: Eingegangen · Weiter warten · Nachfassen · Neu planen. Wartezeit als Balken. Deckt DF-03/04/05/06. |
| 3 | Triage: annehmen, als Dublette verbinden, ablehnen, zurückstellen; nichts verschwindet still ([Linear Triage](https://linear.app/docs/triage), [saasui Inbox](https://www.saasui.design/blog/saas-email-inbox-ux-patterns)). | Schritt „Eingang sichten“: Zu Vorgang · Neuer Vorgang · Dublette · Später · Nicht relevant (mit Grund); Später bleibt sichtbare Datenlücke. Einzeltasten auf Desktop. |
| 4 | Gute Verläufe: Akteur + Verb + vorher→nachher, Tagestrenner, Mensch und System visuell getrennt, „Beginn der Historie“-Marker ([saasui Activity-Log](https://www.saasui.design/blog/saas-activity-feed-audit-log-ux-patterns)). | Vorgangsakte als Zeitleiste mit drei Formen: ○ Fakt, ◆ Deine Bewertung, ● Deine Handlung, ◌ geplant. Korrekturen als neue Einträge (DF-13). |
| 5 | Die Überbuchungswarnung ist das wirksamste Element eines Planungsrituals ([Asian Efficiency zu Sunsama](https://www.asianefficiency.com/schedule-management/sunsama-review/)). | Entscheidungsbudget 7 als Segmentleiste; Dringendes läuft sichtbar rot darüber hinaus (K-05, DF-09). |
| 6 | Obsidian mobil: kein Ribbon; die Host-Navigation unten schwebt und blendet sich aus ([Obsidian Help Mobile](https://obsidian.md/help/mobile), [Forum 2026](https://forum.obsidian.md/t/mobile-ui-change-floating-nav-has-heavy-impact-on-daily-workflow-request-option-for-fixed-bottom-nav/110876)). | Keine zweite Tabbar unten. Ziele als Segment oben; „Erfassen“ als schwebender Button oberhalb der Host-Leiste; Aktionsleisten mit Abstand zur Host-Leiste. |
| 7 | Bottom Sheets nur für kurze, temporäre Aufgaben, mit Schließen-Button, nie gestapelt; mehr als zwei Offenlegungsebenen schaden ([NN/g Bottom Sheets](https://www.nngroup.com/articles/bottom-sheet/), [NN/g Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)). | Sheets nur für Erfassen und „Als gesendet markieren“. Maximale Tiefe: Ziel → Vorgangsakte. |
| 8 | Der Beirat unterstützt und überwacht, entscheidet aber nicht für die Gemeinschaft; Nachweise schützen ihn ([VDIV Folge 7](https://vdiv.de/publikationen/magazine/detail/das-neue-weg-folge-7-die-rolle-des-verwaltungsbeirats), [VDIV](https://vdiv.de/publikationen/magazine/detail/an-einem-strang-ziehen), [Immoportal](https://www.immoportal.com/node/83955)). | Wording „Deine Bewertung“, „Empfehlen“, „Versand dokumentieren“; Hinweis „beauftragt wird durch die Verwaltung“ (DF-01, DF-15). |
| 9 | Plugin-Richtlinien: Satzanfang-Großschreibung, Einstellungen ohne „Einstellungen“-Überschriften, Theme-Variablen statt Hardcodes ([Obsidian Plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)). | Eigene App-Optik über eigene Tokens, technisch auf Obsidian-Variablen abbildbar; Hell/Dunkel als Token-Paar. |
| 10 | Nuxt UI: Sidebar ab `lg` fest, darunter Slideover; Panels stapeln mobil ([DashboardSidebar](https://ui.nuxt.com/docs/components/dashboard-sidebar), [DashboardPanel](https://ui.nuxt.com/docs/components/dashboard-panel)). | Desktop: Sidebar + Arbeitsfläche + Kontextpanel; mobil eine Spalte, Kontextpanel wird Tabs. |
| 11 | Bases-Views-API registriert eigene Ansichten über Vault-Notizen ([Obsidian Bases view](https://docs.obsidian.md/plugins/guides/bases-view)). | Option für die Vorgangsliste als Bases-View prüfen (technische Konzeption), passt zu DF-22. |

## Evidenzgrenzen

- Sunsama-Details stammen aus einer Drittbewertung, FacileThings aus einem Blogbeitrag von 2014.
- Keine der Quellen beschreibt ein Beirat-spezifisches Werkzeug; die Übertragung ist eine Designhypothese (H-03, H-04, H-07).
- casavi SmartTask wurde gesichtet ([Training](https://training.casavi.com/en/smarttask/)); die Seite beschreibt Status und Felder nicht.

## Verknüpfte Designdokumente

[[UI-Design - Leitlinien und Reviewumfang]] · [[00 - Sitemap]] · [[FLOW-01 - Gesamtfluss des Beirats-MVP]]
