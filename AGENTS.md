# coaching-app

A SvelteKit app for an AI builder's self-reflection: score sixteen statements
across four pillars (judgement, delegation, ownership, initiative), see the
wheel, and turn the scores into practices under three lenses: manage myself,
manage my agents, manage my impact. The structure is
adapted from Founder Coach's Founder Leadership System; the content is this
repo's own, in the voice of product-minded agentic engineering. Pages render in the browser and talk to the app's own
API; the server keeps the one reflection in SQLite through Drizzle. There are
no accounts.

## Learning more about Effect

This repository uses the Effect TypeScript library.

Before writing any Effect code, first read `node_modules/effect/AGENTS.md`
**completely**, and follow the links in the file when required.

If you need to learn more about particular Effect APIs and concepts that the
guide doesn't cover, search through the source code in `node_modules/effect/src`.

## Layout

- `src/lib/domain/` — pure domain: the framework data, the reflection record
  and its derivations, the action catalogue and planner, markdown export.
  No I/O, no Effect services; functions take and return values.
- `src/lib/services/` — Effect services. `ReflectionStore` is the persistence
  port with an HTTP adapter (browser) and a memory adapter (tests);
  `Reflections` is the application service that applies changes, persists
  them and publishes the new value.
- `src/lib/server/db/` — server only (SvelteKit forbids importing it from the
  browser). `schema.ts` is the Drizzle schema; `SqliteReflectionStore.ts` is
  the SQLite adapter of `ReflectionStore`, which runs the migrations in
  `drizzle/` when it opens the database.
- `src/lib/server/runtime.ts` — server composition root, configured through
  Effect `Config` (`DATABASE_PATH`, `MIGRATIONS_DIR`).
- `src/routes/api/reflection/+server.ts` — the reflection as one HTTP
  resource: GET (204 when empty), PUT, DELETE. Thin: decode, call the store,
  map `StoreError` to 500 and `SchemaError` to 400.
- `src/lib/runtime.ts` — browser composition root: one `ManagedRuntime` built
  from the application layer wired to the HTTP adapter.
- `src/lib/state/reflection.svelte.ts` — the only place Svelte touches the
  runtime. Components read `reflection.current` and call its methods.
- `src/lib/components/` — `Wheel` (SVG of the framework) and `Scale` (the
  four stops as pills).
- `src/routes/` — `/` intro, `/reflect` the sixteen statements, `/plan` the
  action plan and export.

## Brand

The visuals follow the Riethmayer Anime Gradient system (canonical spec:
`~/src/radical-cto/brand/anime-gradient/SYSTEM.md`). The rules that matter
here: dark is canonical (tunnel `#151716` canvas, cream text, signal yellow
`#FAC800` leads); no blue, purple or teal anywhere; magenta only as a thin
thread; one glow per page (the body background) and one halftone zone per
surface; Barlow Condensed uppercase for display, IBM Plex Sans body, IBM Plex
Mono kickers (`/// 0X NAME`); pills for tags and statuses; hairlines, not
shadows; radii 2, 6 or 999 px; the period mark is the logo. Tokens are the
custom properties in `src/routes/+layout.svelte`. Copy is in the field-report
voice: direct, outcomes over output, proof near every claim.

## Rules

- Persisted data goes through the `Reflection` schema: decode on load, encode
  on save, on both sides of the HTTP boundary and when reading rows. Never
  `JSON.parse` into a typed value by cast.
- Schema changes go through `src/lib/server/db/schema.ts` and
  `pnpm db:generate`; the generated SQL in `drizzle/` is committed and is what
  the server applies. Never edit the database by hand.
- Server code reads configuration through `Config` in a layer, not
  `process.env`. `drizzle.config.ts` is the one exception because drizzle-kit
  runs it outside Effect.
- Typed failures are `Schema.TaggedError` classes; the UI shows the message
  and offers a reset, it does not swallow them.
- Dates come from `DateTime.now` inside Effect so tests control time with
  `TestClock`.
- Tests are `@effect/vitest` `it.effect` with explicit layers;
  `Reflections.layerTest` wires the memory store.

## Commands

```bash
pnpm dev          # dev server
pnpm check        # svelte-check (types)
pnpm lint         # prettier + eslint
pnpm test         # vitest, once (in-memory SQLite for the server tests)
pnpm build        # Node server into build/
pnpm db:generate  # new migration from schema.ts into drizzle/
```
