// Persistence port for the reflection. The browser adapter talks to the app's
// own HTTP API; the server adapter (src/lib/server/db) is SQLite; the memory
// adapter backs tests.
import { Context, Effect, Layer, Option, Ref, Schema } from 'effect';
import { HttpClient, HttpClientRequest, HttpClientResponse } from 'effect/http';
import { Reflection } from '../domain/reflection';

export class StoreError extends Schema.TaggedError<StoreError>()('ReflectionStore.StoreError', {
	operation: Schema.String,
	cause: Schema.Defect()
}) {}

export class ReflectionStore extends Context.Service<
	ReflectionStore,
	{
		readonly load: Effect.Effect<Option.Option<Reflection>, StoreError>;
		save(reflection: Reflection): Effect.Effect<void, StoreError>;
		readonly clear: Effect.Effect<void, StoreError>;
	}
>()('coaching-app/services/ReflectionStore') {
	// `url` is the one resource: GET reads it (204 when nothing is stored yet),
	// PUT replaces it, DELETE clears it. Requires an HttpClient.
	static readonly layerHttp = (options: { readonly url: string }) =>
		Layer.effect(
			ReflectionStore,
			Effect.gen(function* () {
				const client = (yield* HttpClient.HttpClient).pipe(HttpClient.filterStatusOk);
				const storeError = (operation: string) => (cause: unknown) =>
					new StoreError({ operation, cause });
				const decodeBody = HttpClientResponse.schemaBodyJson(Reflection);
				const encodeBody = HttpClientRequest.schemaBodyJson(Reflection);

				const load = client.get(options.url).pipe(
					Effect.flatMap((response) =>
						response.status === 204
							? Effect.succeed(Option.none<Reflection>())
							: decodeBody(response).pipe(Effect.map(Option.some))
					),
					Effect.mapError(storeError('load')),
					Effect.withSpan('ReflectionStore.load')
				);

				const save = Effect.fn('ReflectionStore.save')(function* (reflection: Reflection) {
					const request = yield* encodeBody(HttpClientRequest.put(options.url), reflection).pipe(
						Effect.mapError(storeError('save'))
					);
					yield* client.execute(request).pipe(Effect.mapError(storeError('save')));
				});

				const clear = client
					.del(options.url)
					.pipe(
						Effect.asVoid,
						Effect.mapError(storeError('clear')),
						Effect.withSpan('ReflectionStore.clear')
					);

				return ReflectionStore.of({ load, save, clear });
			})
		);

	static readonly layerMemory = Layer.effect(
		ReflectionStore,
		Effect.gen(function* () {
			const state = yield* Ref.make<Option.Option<Reflection>>(Option.none());
			return ReflectionStore.of({
				load: Ref.get(state),
				save: (reflection) => Ref.set(state, Option.some(reflection)),
				clear: Ref.set(state, Option.none())
			});
		})
	);
}
