---
type: Decision
id: K-13
status: festgelegt
date: 2026-11-15
source: "Direkte Nutzerentscheidung zur UI-Konzeption vom 15.11.2026"
---

# K-13 · Nuxt UI als Frontend-Komponentenbasis

## Entscheidung

Nuxt UI wird als Komponentenbasis für das Frontend und das erste MVP-UI-Design verwendet. Die aktuelle Arbeit erstellt ausschließlich Ansichts-Notes, User-Flows und High-Fidelity-Mockups (Designstand v2); keine Implementierung.

## Kontext und Auswirkungen

Die gewählte Basis liefert eine einheitliche Sprache für Navigation, Tabellen, Formulare, Dialoge, Datumsfelder und Zustandsrückmeldungen. Die genaue Zuordnung ist in [[UI-Research - NuxtUI und Komponentenwahl]] und in [[UI-Design - Leitlinien und Reviewumfang]] festgehalten. Für v2 wurde eine eigene, sachliche App-Optik im Obsidian-Tab mit Hell- und Dunkelvariante gewählt (neutrale Flächen, Geist-Schrift, Gemeinschaftsfarben); die Bilder bleiben überprüfbare Gestaltungsvorschläge.

## Grenzen

Die Entscheidung führt weder Nuxt-SSR noch einen Server, ein eigenes Konto oder eine Pflichtintegration ein. Das bestehende lokale Obsidian-Produkt bleibt maßgeblich; die vollständige mobile Kernreise bleibt Produktziel und folgt nach dem MVP (Stand 21.11.2026, [[K-09 - Vollständige mobile Wochenarbeit unterstützen]]). Paketversion, technische Einbettung, CSS-Isolation, lokale Assets, Host-Themes, mobile Dateiabläufe (erst für den Ausbau nach dem MVP) und tatsächliche Accessibility sind vor Implementierung beziehungsweise Release gesondert zu klären.

## Bezüge

[[UI-Design - Leitlinien und Reviewumfang]], [[UI-Research - NuxtUI und Komponentenwahl]], [[F-21 - Nichtfunktionale Anforderungen]], [[K-11 - Lokalen Obsidian-Kern ohne Konto und KI-Pflicht anbieten]].
