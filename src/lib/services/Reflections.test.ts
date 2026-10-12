import { describe, expect, it } from '@effect/vitest';
import { DateTime, Effect, Fiber, Layer, Option, Stream } from 'effect';
import { TestClock } from 'effect/testing';
import { ReflectionStore } from './ReflectionStore';
import { Reflections } from './Reflections';

describe('Reflections', () => {
	it.effect('starts empty when nothing is stored', () =>
		Effect.gen(function* () {
			const service = yield* Reflections;
			const current = yield* service.current;
			expect(current.scores).toEqual([]);
			expect(DateTime.toEpochMillis(current.updatedAt)).toBe(0);
		}).pipe(Effect.provide(Reflections.layerTest))
	);

	it.effect('persists every change through the store', () =>
		Effect.gen(function* () {
			const service = yield* Reflections;
			const store = yield* ReflectionStore;
			yield* service.score('s01', 2);
			yield* service.commit('role.only-i-can', true);
			yield* service.note('self', 'Block Fridays.');
			const stored = yield* store.load;
			expect(Option.getOrUndefined(stored)).toMatchObject({
				scores: [{ statement: 's01', score: 2 }],
				commitments: [{ action: 'role.only-i-can' }],
				notes: [{ lens: 'self', text: 'Block Fridays.' }]
			});
		}).pipe(Effect.provide(Reflections.layerTest))
	);

	it.effect('stamps changes with the clock', () =>
		Effect.gen(function* () {
			const service = yield* Reflections;
			yield* TestClock.adjust('1 hour');
			const next = yield* service.score('s03', 3);
			expect(DateTime.toEpochMillis(next.updatedAt)).toBe(3_600_000);
		}).pipe(Effect.provide(Reflections.layerTest))
	);

	it.effect('replays the current value to a new subscriber, then every change', () =>
		Effect.gen(function* () {
			const service = yield* Reflections;
			const collector = yield* Stream.runCollect(Stream.take(service.changes, 2)).pipe(
				Effect.forkScoped
			);
			yield* Effect.yieldNow;
			yield* service.score('s05', 1);
			const seen = yield* Fiber.join(collector);
			expect(seen.map((r) => r.scores.length)).toEqual([0, 1]);
		}).pipe(Effect.provide(Reflections.layerTest))
	);

	it.effect('reset clears the store and the current value', () =>
		Effect.gen(function* () {
			const service = yield* Reflections;
			const store = yield* ReflectionStore;
			yield* service.score('s01', 2);
			const after = yield* service.reset;
			expect(after.scores).toEqual([]);
			const stored = yield* store.load;
			expect(Option.getOrUndefined(stored)?.scores).toEqual([]);
		}).pipe(Effect.provide(Reflections.layerTest))
	);

	it.effect('starts empty when the stored value is unreadable', () =>
		Effect.gen(function* () {
			const service = yield* Reflections;
			const current = yield* service.current;
			expect(current.scores).toEqual([]);
		}).pipe(
			Effect.provide(
				Reflections.layerNoDeps.pipe(
					Layer.provide(ReflectionStore.layerWebStorage({ key: 'k', storage: corrupted }))
				)
			)
		)
	);
});

const corrupted = {
	getItem: () => '{"scores": "not an array"}',
	setItem: () => undefined,
	removeItem: () => undefined
};
