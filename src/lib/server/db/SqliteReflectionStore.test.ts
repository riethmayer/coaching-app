import { describe, expect, it } from '@effect/vitest';
import { DateTime, Effect, Option } from 'effect';
import { empty, withCommitment, withNote, withScore } from '../../domain/reflection';
import { ReflectionStore } from '../../services/ReflectionStore';
import { layerSqlite } from './SqliteReflectionStore';

// A fresh in-memory database per test, migrated from the checked-in SQL.
const layer = () => layerSqlite({ path: ':memory:', migrationsFolder: 'drizzle' });

const at = (iso: string) => DateTime.makeUnsafe(iso);

describe('ReflectionStore.layerSqlite', () => {
	it.effect('is empty before the first save', () =>
		Effect.gen(function* () {
			const store = yield* ReflectionStore;
			expect(yield* store.load).toEqual(Option.none());
		}).pipe(Effect.provide(layer()))
	);

	it.effect('round-trips scores, notes, commitments and the timestamp', () =>
		Effect.gen(function* () {
			const store = yield* ReflectionStore;
			let r = empty(at('2026-10-12T20:00:00Z'));
			r = withScore(r, 's02', 1, at('2026-10-12T20:01:00Z'));
			r = withScore(r, 's07', 3, at('2026-10-12T20:02:00Z'));
			r = withNote(r, 'team', 'Hire a head of sales.', at('2026-10-12T20:03:00Z'));
			r = withCommitment(r, 'role.only-i-can', true, at('2026-10-12T20:04:00Z'));
			yield* store.save(r);
			const loaded = yield* store.load;
			expect(Option.getOrUndefined(loaded)).toEqual({
				...r,
				scores: expect.arrayContaining([...r.scores])
			});
		}).pipe(Effect.provide(layer()))
	);

	it.effect('the latest save replaces the previous one', () =>
		Effect.gen(function* () {
			const store = yield* ReflectionStore;
			const first = withScore(
				empty(at('2026-10-12T20:00:00Z')),
				's01',
				2,
				at('2026-10-12T20:01:00Z')
			);
			yield* store.save(withCommitment(first, 'energy.protect-sleep', true, first.updatedAt));
			const second = withScore(first, 's01', 0, at('2026-10-12T21:00:00Z'));
			yield* store.save(second);
			const loaded = Option.getOrUndefined(yield* store.load);
			expect(loaded?.scores).toEqual([{ statement: 's01', score: 0 }]);
			expect(loaded?.commitments).toEqual([]);
			expect(loaded?.updatedAt).toEqual(second.updatedAt);
		}).pipe(Effect.provide(layer()))
	);

	it.effect('clear removes everything', () =>
		Effect.gen(function* () {
			const store = yield* ReflectionStore;
			yield* store.save(
				withScore(empty(at('2026-10-12T20:00:00Z')), 's01', 2, DateTime.makeUnsafe(0))
			);
			yield* store.clear;
			expect(yield* store.load).toEqual(Option.none());
		}).pipe(Effect.provide(layer()))
	);

	it.effect('fails with a typed error when the database cannot be opened', () =>
		Effect.gen(function* () {
			const store = yield* ReflectionStore;
			yield* store.load;
		}).pipe(
			Effect.provide(layerSqlite({ path: ':memory:', migrationsFolder: 'does-not-exist' })),
			Effect.flip,
			Effect.map((error) => {
				expect(error._tag).toBe('ReflectionStore.StoreError');
				expect(error.operation).toBe('open');
			})
		)
	);
});
