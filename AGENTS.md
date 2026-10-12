# coaching-app

A single-page SvelteKit app for a founder's self-reflection on the Founder
Leadership System (Founder Coach): score the twelve statements, see the wheel,
and turn the scores into action items under three lenses: manage myself,
manage my team, manage my impact. State lives in the browser's local storage;
there is no backend.

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
  port with a Web Storage adapter and a memory adapter for tests;
  `Reflections` is the application service that applies changes, persists
  them and publishes the new value.
- `src/lib/runtime.ts` — composition root: one `ManagedRuntime` built from the
  application layer wired to local storage.
- `src/lib/state/reflection.svelte.ts` — the only place Svelte touches the
  runtime. Components read `reflection.current` and call its methods.
- `src/lib/components/` — `Wheel` (SVG of the framework) and `Scale`.
- `src/routes/` — `/` intro, `/reflect` the twelve statements, `/plan` the
  action plan and export.

## Rules

- Persisted data goes through the `Reflection` schema: decode on load, encode
  on save. Never `JSON.parse` into a typed value by cast.
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
pnpm test         # vitest, once
pnpm build        # static build into build/
```
