# coaching-app

A SvelteKit app for a founder's self-reflection on the Founder Leadership
System (Founder Coach): score the twelve statements, see the wheel, and turn
the scores into action items under three lenses: manage myself, manage my
team, manage my impact. Pages render in the browser and talk to the app's own
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
- `src/lib/components/` — `Wheel` (SVG of the framework) and `Scale`.
- `src/routes/` — `/` intro, `/reflect` the twelve statements, `/plan` the
  action plan and export.

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
