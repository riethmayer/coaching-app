// Application service: holds the current reflection, applies changes, persists
// every change, and publishes the new value to subscribers.
import { Context, DateTime, Effect, Layer, Option, Stream, SubscriptionRef } from 'effect';
import type { LensId, Score, StatementId } from '../domain/framework';
import { empty, withCommitment, withNote, withScore, type Reflection } from '../domain/reflection';
import { ReflectionStore, type StoreError } from './ReflectionStore';

export class Reflections extends Context.Service<
	Reflections,
	{
		readonly current: Effect.Effect<Reflection>;
		readonly changes: Stream.Stream<Reflection>;
		score(statement: StatementId, score: Score): Effect.Effect<Reflection, StoreError>;
		note(lens: LensId, text: string): Effect.Effect<Reflection, StoreError>;
		commit(action: string, committed: boolean): Effect.Effect<Reflection, StoreError>;
		readonly reset: Effect.Effect<Reflection, StoreError>;
	}
>()('coaching-app/services/Reflections') {
	static readonly layerNoDeps = Layer.effect(
		Reflections,
		Effect.gen(function* () {
			const store = yield* ReflectionStore;
			const now = yield* DateTime.now;

			// A stored reflection that no longer decodes is reported and replaced by
			// an empty one: the alternative is an app that cannot start.
			const stored = yield* store.load.pipe(
				Effect.catchTag('ReflectionStore.StoreError', (error) =>
					Effect.logWarning('stored reflection unreadable, starting empty', error).pipe(
						Effect.as(Option.none<Reflection>())
					)
				)
			);
			const state = yield* SubscriptionRef.make(Option.getOrElse(stored, () => empty(now)));

			const apply = Effect.fnUntraced(function* (
				change: (current: Reflection, at: DateTime.Utc) => Reflection
			) {
				const at = yield* DateTime.now;
				const next = yield* SubscriptionRef.updateAndGet(state, (current) => change(current, at));
				yield* store.save(next);
				return next;
			});

			const score = Effect.fn('Reflections.score')(function* (
				statement: StatementId,
				value: Score
			) {
				return yield* apply((current, at) => withScore(current, statement, value, at));
			});

			const note = Effect.fn('Reflections.note')(function* (lens: LensId, text: string) {
				return yield* apply((current, at) => withNote(current, lens, text, at));
			});

			const commit = Effect.fn('Reflections.commit')(function* (
				action: string,
				committed: boolean
			) {
				return yield* apply((current, at) => withCommitment(current, action, committed, at));
			});

			const reset = Effect.gen(function* () {
				yield* store.clear;
				return yield* apply((_, at) => empty(at));
			}).pipe(Effect.withSpan('Reflections.reset'));

			return Reflections.of({
				current: SubscriptionRef.get(state),
				changes: SubscriptionRef.changes(state),
				score,
				note,
				commit,
				reset
			});
		})
	);

	static readonly layerTest = this.layerNoDeps.pipe(
		Layer.provideMerge(ReflectionStore.layerMemory)
	);
}
