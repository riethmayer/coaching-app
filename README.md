# coaching-app

An AI builder's self-reflection, built as a SvelteKit app with Effect, Drizzle
and SQLite, in the Riethmayer brand (product-minded agentic engineering).

Score sixteen statements on how much each needs your attention, see them on the
wheel, and get a plan of concrete practices under three lenses:

- **Manage myself** (_Judgement_): role, focus, pace, craft.
- **Manage my agents** (_Delegation_): context, done, autonomy, compute.
- **Manage my impact** (_Ownership_ and _Initiative_): accountability,
  guardrails, feedback, portfolio; strategy, ambition, alignment, adoption.

Where the four pillars meet on the wheel: clarity, leverage, reliability,
outcomes, and the 10x in the middle.

Tick the actions you commit to, add your own, and export the whole thing as
Markdown for your journal. Answers are stored in a SQLite database on the
server; the app has no accounts, so everyone who reaches it shares one
reflection.

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:5173, database in data/coaching.db
```

The database and its tables are created on first start from the SQL in
`drizzle/`. After changing `src/lib/server/db/schema.ts`, run
`pnpm db:generate` and commit the new migration.

```bash
pnpm check        # types (svelte-check)
pnpm lint         # prettier + eslint
pnpm test         # vitest, once
pnpm build        # Node server in build/
```

## Deploy

`pnpm build` writes a Node server to `build/`. Start it from the repository
root so it finds the migrations:

```bash
PORT=3000 node build
```

| Variable         | Default            | Meaning                                  |
| ---------------- | ------------------ | ---------------------------------------- |
| `DATABASE_PATH`  | `data/coaching.db` | SQLite file; its directory is created    |
| `MIGRATIONS_DIR` | `drizzle`          | Folder with the generated SQL migrations |
| `PORT`           | `3000`             | adapter-node listen port                 |

## How it is built

- `src/lib/domain/` is pure: the framework data, the `Reflection` record and
  its derivations, the action catalogue and planner, the Markdown export.
- `src/lib/services/` holds the Effect services. `ReflectionStore` is the
  persistence port: an HTTP adapter for the browser, a memory adapter for
  tests. `Reflections` applies changes, persists them, and publishes every new
  value.
- `src/lib/server/db/` is the server side: the Drizzle schema and the SQLite
  adapter of `ReflectionStore`. `src/routes/api/reflection/+server.ts` exposes
  the store as one resource (GET, PUT, DELETE).
- `src/lib/runtime.ts` (browser) and `src/lib/server/runtime.ts` (server) are
  the two composition roots, one `ManagedRuntime` each.
- `src/lib/state/reflection.svelte.ts` bridges the runtime into Svelte runes.
- `src/routes/` has three pages: intro, reflect, plan.

See `AGENTS.md` for the rules an agent (or a person) follows when changing it.

## Brand

Visuals follow the Anime Gradient system of riethmayer.com: signal yellow on
tunnel dark, Barlow Condensed display, IBM Plex Sans body, IBM Plex Mono
kickers, editorial frame, the period mark as the logo. Fonts load from Google
Fonts; the logo SVGs live in `src/lib/assets/`.

## Credits

The structure (four areas, one statement per aspect, three lenses, the wheel
with its overlaps) is adapted from Founder Coach's
[CEO Focus Finder](https://foundercoach.com/focus). The pillars, the statements
and the action catalogue are this repo's own.
