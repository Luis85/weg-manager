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

**Unsaved input** (German: nicht gespeicherte Eingaben):
What the user typed or chose in a record's form since it opened and has not saved. Closing the form asks before it is discarded.
_Avoid_: draft (a stored copy, which does not exist yet), dirty data

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

**Matter number** (German: Vorgangsnummer):
The readable number of a matter, one sequence across all communities, shown with the community's short code ("AW 041"). A new matter gets the highest number in the vault plus one; two matters with the same number (after a sync) are an issue. The number is never the identity: references use the matter's id.
_Avoid_: id, reference number, ticket number

**Matter kind** (German: Vorgangsart):
What kind of matter it is, from a closed list: `manager_promise` (Zusage Verwaltung), `third_party_promise` (Zusage Dritter), `board_deadline` (Frist Beirat), `legal_deadline` (Frist gesetzlich), `question` (Frage), `board_task` (Aufgabe Beirat).
_Avoid_: type, category

**Matter status** (German: Bearbeitungsstand):
Where a matter stands: `open` (offen), `unclear` (ungeklärt), `done` (erledigt), `obsolete` (hinfällig). "Not kept" (nicht eingehalten) is no status but a rating of the board's own.
_Avoid_: state, phase, rating

**Topic** (German: Thema):
A short word or phrase that groups matters, such as "Beleuchtung". It bundles matters without tying their status together.
_Avoid_: tag, category, subject

**Outcome** (German: Zusage, erwartetes Ergebnis):
The one result a matter is done with, in one sentence.
_Avoid_: promise (in code), goal, deliverable

**Next step** (German: nächster Schritt):
The concrete next action on a matter.
_Avoid_: todo (a to-do is the board member's own step), action item

**Source** (German: Quelle):
Where a matter comes from, in short: a mail, minutes, a meeting, a talk. `unknown` is allowed and shown as a source gap, so capturing never blocks.
_Avoid_: origin (that is how a matter came about: import, split, merge), reference

**Check mark** (German: Prüfvermerk):
A hint the plugin computes and never stores: `overdue` (überfällig) when an open or unclear matter's due date has passed, `ask_for_date` (Termin erfragen) when an open matter has no due date.
_Avoid_: flag, warning, rating

**Due kind** (German: Art des Termins):
What a due date is: `promise` (Zusage), `contractual` (vertraglich), `formal_deadline` (formelle Frist), `requested_reply` (gewünschte Antwort). With `due_source` (who gave it, where) and `due_checked` (`confirmed`, `proposed`, `unknown`).
_Avoid_: deadline type, priority

**Business time zone** (German: Zeitzone Europe/Berlin):
The zone "today" and "overdue" are counted in: Europe/Berlin, wherever the device is (PBI-09).
_Avoid_: local time, device time

**Follow-up date** (German: Wiedervorlage):
The board member's own date to look at a matter again. It never changes the due date.
_Avoid_: reminder, due date, deadline

**History entry** (German: Verlaufseintrag):
One dated line of a matter's history, in the section "Verlauf" of its note: what happened, when (or that the day is unknown), by whom, from which source and when it was recorded. Entries are only ever appended.
_Avoid_: event (host and vault events keep that name), log line, comment

**Status change** (German: Statuswechsel):
A change of a matter's status with its reason, written as the new status and a history entry of kind `status_change` in one step. Closing a matter needs a source too.
_Avoid_: transition, state change

**Split** (German: Aufteilung):
Turning a collective matter into two or more matters, its parts, each with its own outcome, due date or clarification, responsible and next step. The source becomes obsolete with `split_into_ids`; each part carries `split_from_id`.
_Avoid_: divide, fork

**Duplicate** (German: Dublette):
A matter that records the same expected outcome as another matter of the same community.
_Avoid_: copy, clone

**Merge** (German: Zusammenführung):
Closing a duplicate into its target: the target takes the values the person chose and `merged_from_ids`, the duplicate becomes obsolete with `merged_into_id`. Each history stays in its own note.
_Avoid_: combine, join

**Correction** (German: Korrektur):
A history entry that corrects an earlier one (`corrects`); the earlier one stays and is shown as corrected.
_Avoid_: edit, amendment

**Contact** (German: Kontakt):
A person or a company the board member deals with, kept as one note of type `contact` in the folder `Kontakte`. A contact has a role in one or more communities; the role gives it no authority.
_Avoid_: addressee, stakeholder, user, person (a person is one kind of contact)

**Contact kind** (German: Art des Kontakts):
Whether a contact is a `person` or a `company`. A person may belong to a company (`organization_id`); the company shows its people.
_Avoid_: type (the note type is `contact`), organisation (in code only `organization_id`)

**Role** (German: Rolle):
What a contact is in one community, from a closed list: `board` (Beirat), `deputy` (Vertretung), `owner` (Eigentümer), `manager` (Verwaltung), `other_board` (Beirat andere Gemeinschaft), `third_party` (Dritte), `agent` (Agent). A contact has at most one role per community, stored as `<community id>:<role>` in the list `roles`.
_Avoid_: function, position, permission

**Private contact** (German: private Person):
A contact marked `private: true`, such as an owner. The plugin never copies anything from a private contact into drafts, cards, reports or anything shared, and an agent never gets it as context. An owner role makes a contact private.
_Avoid_: personal, confidential, hidden

**Inactive contact** (German: nicht mehr verwendet):
A contact marked `inactive: true`. It is never deleted, so older matters and messages still show who it was; lists hide it unless asked to show it.
_Avoid_: archived, deleted, disabled

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
