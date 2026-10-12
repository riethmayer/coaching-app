// Persistence port for the reflection. The real adapter is Web Storage; the
// memory adapter backs tests.
import { Context, Effect, Layer, Option, Ref, Schema } from 'effect';
import { Reflection } from '../domain/reflection';

export class StoreError extends Schema.TaggedError<StoreError>()('ReflectionStore.StoreError', {
	operation: Schema.String,
	cause: Schema.Defect()
}) {}

// The subset of the Web Storage API the adapter needs, so tests can pass a
// Map-backed fake and the browser passes `localStorage`.
export interface KeyValueStorage {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
	removeItem(key: string): void;
}

export class ReflectionStore extends Context.Service<
	ReflectionStore,
	{
		readonly load: Effect.Effect<Option.Option<Reflection>, StoreError>;
		save(reflection: Reflection): Effect.Effect<void, StoreError>;
		readonly clear: Effect.Effect<void, StoreError>;
	}
>()('coaching-app/services/ReflectionStore') {
	static readonly layerWebStorage = (options: {
		readonly key: string;
		readonly storage: KeyValueStorage;
	}) =>
		Layer.sync(ReflectionStore, () => {
			const decode = Schema.decodeUnknownEffect(Reflection);
			const encode = Schema.encodeEffect(Reflection);
			const storeError = (operation: string) => (cause: unknown) =>
				new StoreError({ operation, cause });

			const load = Effect.gen(function* () {
				const raw = yield* Effect.try({
					try: () => options.storage.getItem(options.key),
					catch: storeError('load')
				});
				if (raw === null) return Option.none<Reflection>();
				const json = yield* Effect.try({
					try: () => JSON.parse(raw) as unknown,
					catch: storeError('load')
				});
				const reflection = yield* decode(json).pipe(Effect.mapError(storeError('load')));
				return Option.some(reflection);
			}).pipe(Effect.withSpan('ReflectionStore.load'));

			const save = Effect.fn('ReflectionStore.save')(function* (reflection: Reflection) {
				const encoded = yield* encode(reflection).pipe(Effect.mapError(storeError('save')));
				yield* Effect.try({
					try: () => options.storage.setItem(options.key, JSON.stringify(encoded)),
					catch: storeError('save')
				});
			});

			const clear = Effect.try({
				try: () => options.storage.removeItem(options.key),
				catch: storeError('clear')
			}).pipe(Effect.withSpan('ReflectionStore.clear'));

			return ReflectionStore.of({ load, save, clear });
		});

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
