// The reflection as one HTTP resource: GET reads it (204 while nothing is
// stored), PUT replaces it, DELETE clears it. Handlers decode input, call the
// store, and map its typed failure to a status.
import { json } from '@sveltejs/kit';
import { Effect, Option, Schema } from 'effect';
import { Reflection } from '#lib/domain/reflection.js';
import { serverRuntime } from '#lib/server/runtime.js';
import { ReflectionStore, type StoreError } from '#lib/services/ReflectionStore.js';
import type { RequestHandler } from './$types';

const decodeBody = Schema.decodeUnknownEffect(Schema.fromJsonString(Reflection));
const encode = Schema.encodeEffect(Reflection);

const noContent = () => new Response(null, { status: 204 });
const storeFailed = (error: StoreError) =>
	Effect.succeed(json({ error: error._tag, operation: error.operation }, { status: 500 }));

export const GET: RequestHandler = () =>
	serverRuntime.runPromise(
		ReflectionStore.use((store) => store.load).pipe(
			Effect.flatMap(
				Option.match({
					onNone: () => Effect.succeed(noContent()),
					onSome: (reflection) => encode(reflection).pipe(Effect.orDie, Effect.map(json))
				})
			),
			Effect.catchTag('ReflectionStore.StoreError', storeFailed)
		)
	);

export const PUT: RequestHandler = ({ request }) =>
	serverRuntime.runPromise(
		Effect.gen(function* () {
			const body = yield* Effect.promise(() => request.text());
			const reflection = yield* decodeBody(body);
			yield* ReflectionStore.use((store) => store.save(reflection));
			return noContent();
		}).pipe(
			Effect.catchTag('SchemaError', (error) =>
				Effect.succeed(json({ error: error._tag, message: error.message }, { status: 400 }))
			),
			Effect.catchTag('ReflectionStore.StoreError', storeFailed)
		)
	);

export const DELETE: RequestHandler = () =>
	serverRuntime.runPromise(
		ReflectionStore.use((store) => store.clear).pipe(
			Effect.as(noContent()),
			Effect.catchTag('ReflectionStore.StoreError', storeFailed)
		)
	);
