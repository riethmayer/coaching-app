// SQLite adapter for the ReflectionStore port: better-sqlite3 through Drizzle.
// Opening the database applies the pending migrations from `migrationsFolder`.
import Database from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { Config, Effect, Layer, Option, Schema } from 'effect';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { Reflection } from '../../domain/reflection';
import { ReflectionStore, StoreError } from '../../services/ReflectionStore';
import { commitments, notes, reflections, scores } from './schema';

export interface SqliteOptions {
	// A file path, or ':memory:' for a database that lives as long as the layer.
	readonly path: string;
	readonly migrationsFolder: string;
}

// The app keeps one reflection; its head row always has this id.
const CURRENT = 1;

const open = (options: SqliteOptions) => {
	if (options.path !== ':memory:') mkdirSync(dirname(options.path), { recursive: true });
	const sqlite = new Database(options.path);
	sqlite.pragma('journal_mode = WAL');
	sqlite.pragma('foreign_keys = ON');
	const db = drizzle(sqlite);
	migrate(db, { migrationsFolder: options.migrationsFolder });
	return { sqlite, db };
};

export const layerSqlite = (options: SqliteOptions) =>
	Layer.effect(
		ReflectionStore,
		Effect.gen(function* () {
			const storeError = (operation: string) => (cause: unknown) =>
				new StoreError({ operation, cause });
			const { db } = yield* Effect.acquireRelease(
				Effect.try({ try: () => open(options), catch: storeError('open') }),
				({ sqlite }) => Effect.sync(() => sqlite.close())
			);
			const decode = Schema.decodeUnknownEffect(Reflection);
			const encode = Schema.encodeEffect(Reflection);

			const load = Effect.gen(function* () {
				const rows = yield* Effect.try({
					try: () =>
						db.transaction((tx) => {
							const head = tx.select().from(reflections).where(eq(reflections.id, CURRENT)).get();
							if (head === undefined) return undefined;
							return {
								scores: tx
									.select({ statement: scores.statement, score: scores.score })
									.from(scores)
									.where(eq(scores.reflectionId, CURRENT))
									.all(),
								notes: tx
									.select({ lens: notes.lens, text: notes.text })
									.from(notes)
									.where(eq(notes.reflectionId, CURRENT))
									.all(),
								commitments: tx
									.select({ action: commitments.action })
									.from(commitments)
									.where(eq(commitments.reflectionId, CURRENT))
									.all(),
								updatedAt: head.updatedAt
							};
						}),
					catch: storeError('load')
				});
				if (rows === undefined) return Option.none<Reflection>();
				const reflection = yield* decode(rows).pipe(Effect.mapError(storeError('load')));
				return Option.some(reflection);
			}).pipe(Effect.withSpan('ReflectionStore.load'));

			const save = Effect.fn('ReflectionStore.save')(function* (reflection: Reflection) {
				const encoded = yield* encode(reflection).pipe(Effect.mapError(storeError('save')));
				yield* Effect.try({
					try: () =>
						db.transaction((tx) => {
							tx.insert(reflections)
								.values({ id: CURRENT, updatedAt: encoded.updatedAt })
								.onConflictDoUpdate({
									target: reflections.id,
									set: { updatedAt: encoded.updatedAt }
								})
								.run();
							tx.delete(scores).where(eq(scores.reflectionId, CURRENT)).run();
							tx.delete(notes).where(eq(notes.reflectionId, CURRENT)).run();
							tx.delete(commitments).where(eq(commitments.reflectionId, CURRENT)).run();
							if (encoded.scores.length > 0) {
								tx.insert(scores)
									.values(encoded.scores.map((s) => ({ reflectionId: CURRENT, ...s })))
									.run();
							}
							if (encoded.notes.length > 0) {
								tx.insert(notes)
									.values(encoded.notes.map((n) => ({ reflectionId: CURRENT, ...n })))
									.run();
							}
							if (encoded.commitments.length > 0) {
								tx.insert(commitments)
									.values(encoded.commitments.map((c) => ({ reflectionId: CURRENT, ...c })))
									.run();
							}
						}),
					catch: storeError('save')
				});
			});

			const clear = Effect.try({
				try: () => db.delete(reflections).where(eq(reflections.id, CURRENT)).run(),
				catch: storeError('clear')
			}).pipe(Effect.asVoid, Effect.withSpan('ReflectionStore.clear'));

			return ReflectionStore.of({ load, save, clear });
		})
	);

// Production wiring. Both values come from the environment, with defaults
// that fit `pnpm dev` and `node build` run from the repository root.
export const layerSqliteConfig = Layer.unwrap(
	Effect.gen(function* () {
		const path = yield* Config.String('DATABASE_PATH').pipe(Config.withDefault('data/coaching.db'));
		const migrationsFolder = yield* Config.String('MIGRATIONS_DIR').pipe(
			Config.withDefault('drizzle')
		);
		return layerSqlite({ path, migrationsFolder });
	})
);
