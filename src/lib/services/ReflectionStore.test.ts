import { describe, expect, it } from '@effect/vitest';
import { DateTime, Effect, Option } from 'effect';
import { empty, withScore } from '../domain/reflection';
import { ReflectionStore, type KeyValueStorage } from './ReflectionStore';

interface FakeStorage extends KeyValueStorage {
	readonly map: Map<string, string>;
}

const fakeStorage = (): FakeStorage => {
	const map = new Map<string, string>();
	return {
		map,
		getItem: (key) => map.get(key) ?? null,
		setItem: (key, value) => void map.set(key, value),
		removeItem: (key) => void map.delete(key)
	};
};

const layerWith = (storage: KeyValueStorage) =>
	ReflectionStore.layerWebStorage({ key: 'k', storage });

describe('ReflectionStore.layerWebStorage', () => {
	it.effect('round-trips a reflection through JSON', () =>
		Effect.gen(function* () {
			const store = yield* ReflectionStore;
			const r = withScore(
				empty(DateTime.makeUnsafe('2026-10-12T20:00:00Z')),
				's02',
				1,
				DateTime.makeUnsafe('2026-10-12T20:05:00Z')
			);
			yield* store.save(r);
			const loaded = yield* store.load;
			expect(loaded).toEqual(Option.some(r));
		}).pipe(Effect.provide(layerWith(fakeStorage())))
	);

	it.effect('stores the date as an ISO string', () => {
		const storage = fakeStorage();
		return Effect.gen(function* () {
			const store = yield* ReflectionStore;
			yield* store.save(empty(DateTime.makeUnsafe('2026-10-12T20:00:00Z')));
			expect(JSON.parse(storage.map.get('k') ?? '{}')).toEqual({
				scores: [],
				notes: [],
				commitments: [],
				updatedAt: '2026-10-12T20:00:00.000Z'
			});
		}).pipe(Effect.provide(layerWith(storage)));
	});

	it.effect('is empty when the key is missing and clears on demand', () =>
		Effect.gen(function* () {
			const store = yield* ReflectionStore;
			expect(yield* store.load).toEqual(Option.none());
			yield* store.save(empty(DateTime.makeUnsafe(0)));
			yield* store.clear;
			expect(yield* store.load).toEqual(Option.none());
		}).pipe(Effect.provide(layerWith(fakeStorage())))
	);

	it.effect('fails with a typed error on unreadable content', () =>
		Effect.gen(function* () {
			const store = yield* ReflectionStore;
			const result = yield* store.load.pipe(Effect.flip);
			expect(result._tag).toBe('ReflectionStore.StoreError');
			expect(result.operation).toBe('load');
		}).pipe(
			Effect.provide(
				layerWith({
					getItem: () => 'not json',
					setItem: () => undefined,
					removeItem: () => undefined
				})
			)
		)
	);
});
