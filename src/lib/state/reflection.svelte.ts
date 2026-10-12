// Bridge between the Effect runtime and Svelte runes. Components read
// `reflection.current` and call the methods; the service owns the truth and
// publishes every change back through `changes`.
import { Effect, Stream } from 'effect';
import type { LensId, Score, StatementId } from '../domain/framework';
import type { Reflection } from '../domain/reflection';
import { Reflections } from '../services/Reflections';
import { runtime } from '../runtime';

let current = $state<Reflection | undefined>(undefined);
let error = $state<string | undefined>(undefined);
let started = false;

const run = (effect: Effect.Effect<Reflection, unknown, Reflections>) =>
	runtime.runPromise(effect).then(
		(next) => {
			current = next;
			error = undefined;
		},
		(cause: unknown) => {
			error = cause instanceof Error ? cause.message : String(cause);
		}
	);

export const reflection = {
	get current() {
		return current;
	},
	get error() {
		return error;
	},
	start() {
		if (started) return;
		started = true;
		runtime.runFork(
			Effect.gen(function* () {
				const service = yield* Reflections;
				current = yield* service.current;
				yield* Stream.runForEach(service.changes, (next) =>
					Effect.sync(() => {
						current = next;
					})
				);
			})
		);
	},
	score: (statement: StatementId, score: Score) =>
		run(Reflections.use((s) => s.score(statement, score))),
	note: (lens: LensId, text: string) => run(Reflections.use((s) => s.note(lens, text))),
	commit: (action: string, committed: boolean) =>
		run(Reflections.use((s) => s.commit(action, committed))),
	reset: () => run(Reflections.use((s) => s.reset))
};
