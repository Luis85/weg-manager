# WEG Manager

The language of a plugin that helps one advisory-board member of German condominium owner associations keep track of open matters. Product documents and the UI are German; code and the file contract are English. Each entry gives the English term used in code and the German term it stands for.

## Language

**Community** (German: Gemeinschaft):
One association the board member works for, such as a WEG or its underground car park. Every other record belongs to exactly one community.
_Avoid_: WEG (one kind of community), association, property, tenant

**Short code** (German: Kürzel):
The two to five characters that name a community wherever its full name does not fit. It is unique and fixed once given.
_Avoid_: abbreviation, slug, key, id

**Kind** (German: Art):
What sort of community it is, in the user's own words, such as WEG or Tiefgarage. It implies no legal form and no powers.
_Avoid_: type, category, legal form

**Unit label** (German: Einheitenbezeichnung):
What a community calls the things its owners own, such as Einheiten or Stellplätze.
_Avoid_: unit type, unit name

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

**Tracer slice** (German: Durchstich):
The first record type built through every layer, to prove the path that all later types take.
_Avoid_: walking skeleton, demo, prototype

## Not yet named

Punkt, Thema, Ansprechpartner, Termin, Ereignis, Quelle and the other entities in `docs/design/entities/` get their English term when their slice is planned.
