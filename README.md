# coaching-app

A founder's self-reflection on the Founder Leadership System (Founder Coach),
built as a static SvelteKit app with Effect.

Score the twelve statements of the framework on how much each needs your
attention, see them on the wheel, and get a plan of concrete actions under
three lenses:

- **Manage myself**: role, meetings, energy.
- **Manage my team**: talent, coaching, culture.
- **Manage my impact**: storytelling, strategy, alignment, growth,
  fundraising, M&A.

Tick the actions you commit to, add your own, and export the whole thing as
Markdown for your journal. Answers never leave the browser; they live in local
storage.

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

```bash
pnpm check        # types (svelte-check)
pnpm lint         # prettier + eslint
pnpm test         # vitest, once
pnpm build        # static site in build/
```

## Deploy

`pnpm build` writes a static site to `build/`. For a sub-path host such as
GitHub Pages, set the base path at build time:

```bash
BASE_PATH=/coaching-app pnpm build
```

## How it is built

- `src/lib/domain/` is pure: the framework data, the `Reflection` record and
  its derivations, the action catalogue and planner, the Markdown export.
- `src/lib/services/` holds the Effect services. `ReflectionStore` is the
  persistence port (Web Storage adapter, memory adapter for tests).
  `Reflections` applies changes, persists them, and publishes every new value.
- `src/lib/runtime.ts` is the composition root, one `ManagedRuntime`.
- `src/lib/state/reflection.svelte.ts` bridges the runtime into Svelte runes.
- `src/routes/` has three pages: intro, reflect, plan.

See `AGENTS.md` for the rules an agent (or a person) follows when changing it.

## Credits

The framework and the twelve statements are Founder Coach's
[CEO Focus Finder](https://foundercoach.com/focus). The action catalogue is
this repo's own.
