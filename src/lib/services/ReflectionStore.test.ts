import { describe, expect, it } from '@effect/vitest';
import { DateTime, Effect, Layer, Option } from 'effect';
import { FetchHttpClient } from 'effect/http';
import { empty, withScore } from '../domain/reflection';
import { ReflectionStore } from './ReflectionStore';

const URL = 'http://app.test/api/reflection';

// An in-memory stand-in for the API route, behind the Fetch reference so the
// real fetch-based HttpClient runs against it.
const fakeApi = () => {
	let stored: string | undefined;
	let failWith: number | undefined;
	const fetch: typeof globalThis.fetch = async (input, init) => {
		const request = new Request(input, init);
		if (failWith !== undefined) return new Response(null, { status: failWith });
		switch (request.method) {
			case 'GET':
				return stored === undefined
					? new Response(null, { status: 204 })
					: new Response(stored, { headers: { 'content-type': 'application/json' } });
			case 'PUT':
				stored = await request.text();
				return new Response(null, { status: 204 });
			case 'DELETE':
				stored = undefined;
				return new Response(null, { status: 204 });
			default:
				return new Response(null, { status: 405 });
		}
	};
	return {
		fetch,
		get stored() {
			return stored;
		},
		fail: (status: number) => {
			failWith = status;
		}
	};
};

const layerWith = (api: ReturnType<typeof fakeApi>) =>
	ReflectionStore.layerHttp({ url: URL }).pipe(
		Layer.provide(FetchHttpClient.layer),
		Layer.provide(Layer.succeed(FetchHttpClient.Fetch, api.fetch))
	);

describe('ReflectionStore.layerHttp', () => {
	it.effect('round-trips a reflection through the API', () =>
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
		}).pipe(Effect.provide(layerWith(fakeApi())))
	);

	it.effect('sends the date as an ISO string', () => {
		const api = fakeApi();
		return Effect.gen(function* () {
			const store = yield* ReflectionStore;
			yield* store.save(empty(DateTime.makeUnsafe('2026-10-12T20:00:00Z')));
			expect(JSON.parse(api.stored ?? '{}')).toEqual({
				scores: [],
				notes: [],
				commitments: [],
				updatedAt: '2026-10-12T20:00:00.000Z'
			});
		}).pipe(Effect.provide(layerWith(api)));
	});

	it.effect('is empty on 204 and clears on demand', () =>
		Effect.gen(function* () {
			const store = yield* ReflectionStore;
			expect(yield* store.load).toEqual(Option.none());
			yield* store.save(empty(DateTime.makeUnsafe(0)));
			yield* store.clear;
			expect(yield* store.load).toEqual(Option.none());
		}).pipe(Effect.provide(layerWith(fakeApi())))
	);

	it.effect('fails with a typed error when the API fails', () => {
		const api = fakeApi();
		api.fail(500);
		return Effect.gen(function* () {
			const store = yield* ReflectionStore;
			const result = yield* store.load.pipe(Effect.flip);
			expect(result._tag).toBe('ReflectionStore.StoreError');
			expect(result.operation).toBe('load');
		}).pipe(Effect.provide(layerWith(api)));
	});
});
