---
type: Actor
kind: System
---

# Obsidian

**Einordnung im MVP:** Technisches Hostsystem.

## Ziel

Den lokalen WEG-Manager-Client auf dem Desktop ausführen. Die Ausführung auf dem festzulegenden Referenz-Handy folgt nach dem MVP ([[K-09 - Vollständige mobile Wochenarbeit unterstützen]]).

## Interaktion

Stellt die Laufzeitumgebung des Plugins und den lokalen Vault bereit. Ermöglicht die Nutzung lokaler Fachnotizen und Originalanhänge und bildet den Kontext für Start, Wiederaufnahme und Deaktivierung des Plugins.

## Systemgrenze und Einschränkungen

Die betrachtete Systemgrenze ist das WEG-Manager-Plugin; Obsidian liegt als Host außerhalb dieser Grenze. Daraus folgen keine zugesagten Rollenrechte, Hintergrundläufe oder Mehrgeräte-Synchronisation. Betriebssystem, Vault und Dateiformate werden nicht als zusätzliche fachliche Akteure modelliert.

## Anforderungen

[[docs/requirements/PBI-30 - Bestand sichern und wiederherstellen|PBI-30 · Bestand sichern und wiederherstellen]], [[docs/requirements/PBI-31 - Konflikte ohne Datenverlust klären|PBI-31 · Konflikte ohne Datenverlust klären]], [[docs/requirements/PBI-32 - Ohne KI selbstständig beginnen|PBI-32 · Ohne KI selbstständig beginnen]], [[docs/requirements/PBI-33 - Wochenarbeit auf dem Handy abschließen|PBI-33 · Wochenarbeit auf dem Handy abschließen]].

Grundlage: [MVP-PRD 1.1](../../02-MVP-PRD.md) und Intake-Abgleich (historische Quelle im Git-Commit `b3a1cc2`, Pfad `docs/03-Intake-Abgleich.md`).
