---
type: DesignSpec
status: entwurf
date: 2026-11-22
---

# Mockup-Quellen

Die Mockups unter `docs/design/sitemap/assets/v2-*.png` entstehen aus den HTML-Dateien in diesem Ordner, mit Ausnahme der Prototyp-Screenshots `v2-P-*`. So lassen sie sich nachziehen, wenn sich Begriffe oder Gestaltung ändern ([[K-20 - WCS-Datenmodell als fachliche Grundlage]], O-D15).

- **Eine Datei je Bild.** Jede Quelle trägt im `<head>` die Angabe `<meta name="mockup" content="out=v2-….png; width=1440; height=1024; scale=2">`. `width` und `height` sind die Größe des Fensters in CSS-Pixeln, `scale` der Faktor für die Bildpixel.
- **Gemeinsame Gestaltung:** `shared.css` enthält die Tokens und Bausteine des Prototyps, hell und dunkel (`<html data-theme="dark">`). Eigene Regeln stehen im `<style>` der Datei.
- **Kein Netz:** Eine Quelle lädt nichts von außen, keine Webfonts und keine CDNs. Das Build-Skript bricht ab, wenn doch.
- **Synthetische Daten:** keine echten Namen, Adressen oder Beträge. Die Begriffe folgen [[00 - Fachliches Domänenmodell]].
- **Bauen:** im Wurzelverzeichnis `node docs/design/mockups/build.mjs`. Mit einem Filter wird nur ein Teil gebaut, etwa `node docs/design/mockups/build.mjs Dlg`. Das Skript braucht Playwright mit Chromium. Playwright ist keine Abhängigkeit des Projekts; es wird über den normalen Modulpfad gefunden, etwa über `NODE_PATH`.

Die Prototyp-Screenshots `v2-P-D-*` und `v2-P-M-*` entstehen aus `docs/design/prototype/WEG-Manager-Prototyp.html`, siehe [[Prototyp - Stand Pilot]].
