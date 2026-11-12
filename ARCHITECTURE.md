# MADAR — Architecture

## Layers (dependencies point downward only)
1. **UI** (`src/App.tsx`, later `src/ui/*`) — React, no game rules, renders `Character` and calls engine functions.
2. **Engine** (`src/engine`) — pure functions `(Character) -> Character`. No DOM, no React, no I/O. Seeded RNG (`rng.ts`) lives inside the save, so lives are reproducible and testable.
3. **Data** (`src/data`) — events, later careers, countries, achievements as plain typed arrays. Adding content = adding data, not code.
4. **i18n** (`src/i18n`) — `en.ts` / `ar.ts` key tables. Gameplay code only emits keys (`ev.<id>.t`, `ev.<id>.<choice>`, `log.*`); `scripts/check.ts` fails if any key is missing in either language.
5. **Storage** (`src/storage`) — IndexedDB, 3 slots, versioned (`v`), validated on load, previous save kept as backup before every overwrite.

## Event engine
`GameEvent { id, minAge, maxAge, weight, once, needs[], blocks[], countries[], choices[{ id, effects{stats, flags, closeness} }] }`.
Each year: filter by conditions -> weighted pick (never the same event twice in a row) -> player chooses -> effects apply -> flags change which events become eligible later (the hook for long-term consequences).

## Folder structure
```
src/engine/   types, rng, engine (create, ageUp, choose)
src/data/     events (more files per system later)
src/i18n/     index, en, ar
src/storage/  db
src/App.tsx, main.tsx, styles.css
scripts/check.ts      headless simulation + i18n coverage test
.github/workflows/    build + deploy to GitHub Pages
```
Planned: `engine/{education,career,finance,health,crime,legacy}.ts`, `data/{careers,countries,achievements}.ts`, `ui/` per screen.

## Milestone 1 (this drop)
Menu with 3 slots, bilingual UI with live RTL/LTR switch, character creation, 9 stats, age-up loop, 5 events, basic family, autosave/continue, death.
## Sequence
Finish Phase 1 gaps (PWA/offline, more creation options, ~40 events) -> Education -> Careers + Finance -> Relationships/children -> Health -> Business/Crime/Travel -> Death/legacy/generations -> Achievements + polish + Capacitor.
