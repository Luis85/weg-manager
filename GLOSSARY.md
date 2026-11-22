# WEG Manager

The language of a plugin that helps one advisory-board member of German condominium owner associations keep track of open matters. Product documents and the UI are German; code and the file contract are English. Each entry gives the English term used in code and the German term it stands for.

## Language

**Community** (German: Gemeinschaft):
One association the board member works for, such as a WEG or its underground car park. Every other record belongs to exactly one community.
_Avoid_: WEG (one kind of community), association, property, tenant

**Short code** (German: Kürzel):
The two to five characters that name a community wherever its full name does not fit. It is unique. It can be changed later; references use the record's id, never the short code (K-20, PBI-78).
_Avoid_: abbreviation, slug, key, id

**Kind** (German: Art):
What sort of community it is, in the user's own words, such as WEG, Tiefgarage or Viertel (offered as suggestions, never a closed list). It implies no legal form and no powers.
_Avoid_: type, category, legal form

**Unit label** (German: Einheitenbezeichnung):
What a community calls the things its owners own, such as Einheiten or Stellplätze.
_Avoid_: unit type, unit name

**Colour** (German: Farbe):
The colour that marks a community beside its short code, one of a fixed palette and different for each community. It never carries meaning alone: the short code is always shown with it.
_Avoid_: theme, accent

**Community switch** (German: Gemeinschaftswechsel):
The control in the app frame that shows the community selection and changes it, for every open view.
_Avoid_: filter, picker, dropdown

**Community selection** (German: Gemeinschaftskontext):
The community the user is working in right now. It is visible before any editing or output.
_Avoid_: filter, context, tenant, current community

**Record**:
One thing the product keeps, such as a community, stored as one note.
_Avoid_: entity, object, document, entry

**Note** (German: Notiz):
A Markdown file in the vault. A note that carries a record is the record's only store.
_Avoid_: file, page, document

**File contract** (German: Dateivertrag):
The documented form of the notes of one record type: its fields, their meaning and its version. People and agents may create and change notes by it without the plugin.
_Avoid_: schema (the version marker inside a note), format, data model

**Issue**:
A named reason why a note or a value breaks its file contract or a rule. An issue is shown to the user and never repaired silently.
_Avoid_: error, warning, violation, problem

**Reference** (German: Verweis):
A field of a record that names another record by its `id`, such as a contact's communities. A reference whose target no note carries is shown with an issue and kept as it is.
_Avoid_: link, relation, foreign key, wikilink (a link in a note's text)

**Today** (German: heute):
The user's local calendar day, from the clock of the machine the plugin runs on, which changes at local midnight. Values such as "overdue" are derived from it.
_Avoid_: now, date, current date, timestamp

**Read-only** (German: schreibgeschützt):
A note the plugin shows but never writes, because a write could damage it: it comes from a newer version, or its identity is missing, broken or shared.
_Avoid_: locked, disabled, invalid

**Conflict** (German: Konflikt):
A field that the user changed in a form and someone else changed in the note meanwhile, to another value. Nothing is saved until the user chooses which value applies.
_Avoid_: collision, clash, merge error

**Setup** (German: Einrichtung):
The guided steps on the first start in a vault without a community, ending with the communities written as notes. Whether setup is needed follows from the vault, never from a stored flag.
_Avoid_: onboarding (the whole path), wizard (the UI pattern), installation (happens in Obsidian)

**First steps** (German: Erste Schritte):
The card on the overview that lists the next things to do after setup. Each step counts as done when the vault shows it, not when the user ticks it.
_Avoid_: checklist, to-do, task (a task is a record)

**Contextual hint** (German: Hinweis im Kontext):
A single note shown beside an element the first time the user works in an area, closed with one click and remembered per device. Hints never chain, never block and never write notes. There is no tour.
_Avoid_: tour, tutorial, coach mark, tooltip (a tooltip shows on hover every time)

**Matter** (German: Vorgang):
One thing the board member follows up until it has one checkable result: a promise, a deadline, a question or a task. It belongs to exactly one community, has a number that runs across all communities and is never deleted. Routes say `vorgang`, command ids and code say `matter`.
_Avoid_: point, item, ticket, issue (an issue is a broken note), task (a to-do is the board member's own step)
**Settings section** (German: Bereich der Einstellungen):
One area of the plugin's settings screen, such as the communities or the data issues, contributed by one module and reached through the screen's own navigation. Its id (`communities`, `data-issues`) is the `section` of the settings route.
_Avoid_: tab, page, panel, category

**Data issues** (German: Datenprobleme):
The settings section that lists the notes the plugin cannot read or assign to a record type, each with its issue and a way to open it in Obsidian. A record with an issue of its own stays in its module's section.
_Avoid_: data problems, errors, broken notes

**Tracer slice** (German: Durchstich):
The first record type built through every layer, to prove the path that all later types take.
_Avoid_: walking skeleton, demo, prototype

## Not yet named

The domain model follows the WCS data dictionary (K-20); its German terms and fields are in `docs/entities/00 - Fachliches Domänenmodell.md`. Verlaufseintrag, Eskalation, Entscheidungskarte, To-do, Übergabe, Prüfvermerk, Person und Rolle, Thema, Termin, Quelle and the other entities in `docs/entities/` get their English term here when their slice is planned. The keys in the entity notes are proposals until then. Host and vault events keep the name event; they are not the domain's Verlaufseintrag.
