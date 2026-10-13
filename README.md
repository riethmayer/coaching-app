# coaching-app

A founder's self-reflection on the Founder Leadership System (Founder Coach),
built as a SvelteKit app with Effect, Drizzle and SQLite.

Score the twelve statements of the framework on how much each needs your
attention, see them on the wheel, and get a plan of concrete actions under
three lenses:

- **Manage myself**: role, meetings, energy.
- **Manage my team**: talent, coaching, culture.
- **Manage my impact**: storytelling, strategy, alignment, growth,
  fundraising, M&A.

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

## Credits

The framework and the twelve statements are Founder Coach's
[CEO Focus Finder](https://foundercoach.com/focus). The action catalogue is
this repo's own.
