// A reflection is the founder's answers plus what they committed to. It is the
// one record the app persists; everything else is derived from it.
import { DateTime, Option, Schema } from 'effect';
import {
	ASPECTS,
	LensId,
	QUADRANTS,
	Score,
	STATEMENTS,
	StatementId,
	lensById,
	quadrantById,
	statementForAspect,
	type Aspect,
	type AspectId,
	type QuadrantId
} from './framework';

export const ScoreEntry = Schema.Struct({ statement: StatementId, score: Score });
export type ScoreEntry = typeof ScoreEntry.Type;

export const Note = Schema.Struct({ lens: LensId, text: Schema.String });
export type Note = typeof Note.Type;

// `action` is an ActionItem id from the catalogue. Unknown ids are kept so an
// older catalogue cannot silently drop a commitment; the planner ignores them.
export const Commitment = Schema.Struct({ action: Schema.String });
export type Commitment = typeof Commitment.Type;

export const Reflection = Schema.Struct({
	scores: Schema.Array(ScoreEntry),
	notes: Schema.Array(Note),
	commitments: Schema.Array(Commitment),
	updatedAt: Schema.DateTimeUtcFromString
});
export type Reflection = typeof Reflection.Type;
export type ReflectionEncoded = typeof Reflection.Encoded;

export const empty = (now: DateTime.Utc): Reflection => ({
	scores: [],
	notes: [],
	commitments: [],
	updatedAt: now
});

export const scoreOf = (r: Reflection, statement: StatementId): Option.Option<Score> =>
	Option.fromUndefinedOr(r.scores.find((s) => s.statement === statement)?.score);

export const withScore = (
	r: Reflection,
	statement: StatementId,
	score: Score,
	now: DateTime.Utc
): Reflection => ({
	...r,
	scores: [...r.scores.filter((s) => s.statement !== statement), { statement, score }],
	updatedAt: now
});

export const noteOf = (r: Reflection, lens: LensId): string =>
	r.notes.find((n) => n.lens === lens)?.text ?? '';

export const withNote = (
	r: Reflection,
	lens: LensId,
	text: string,
	now: DateTime.Utc
): Reflection => ({
	...r,
	notes: [
		...r.notes.filter((n) => n.lens !== lens),
		...(text.trim() === '' ? [] : [{ lens, text }])
	],
	updatedAt: now
});

export const isCommitted = (r: Reflection, action: string): boolean =>
	r.commitments.some((c) => c.action === action);

export const withCommitment = (
	r: Reflection,
	action: string,
	committed: boolean,
	now: DateTime.Utc
): Reflection => ({
	...r,
	commitments: [
		...r.commitments.filter((c) => c.action !== action),
		...(committed ? [{ action }] : [])
	],
	updatedAt: now
});

export const answered = (r: Reflection): number => r.scores.length;
export const isComplete = (r: Reflection): boolean => answered(r) === STATEMENTS.length;

// One statement per aspect, so an aspect's score is that statement's score.
export const aspectScore = (r: Reflection, aspect: AspectId): Option.Option<Score> =>
	scoreOf(r, statementForAspect(aspect).id);

const average = (values: ReadonlyArray<number>): Option.Option<number> =>
	values.length === 0
		? Option.none()
		: Option.some(values.reduce((a, b) => a + b, 0) / values.length);

export const quadrantAverage = (r: Reflection, quadrant: QuadrantId): Option.Option<number> =>
	average(
		quadrantById(quadrant).aspects.flatMap((a) =>
			Option.match(aspectScore(r, a), { onNone: () => [], onSome: (s) => [s] })
		)
	);

export const lensAverage = (r: Reflection, lens: LensId): Option.Option<number> =>
	average(
		lensById(lens)
			.quadrants.flatMap((q) => quadrantById(q).aspects)
			.flatMap((a) => Option.match(aspectScore(r, a), { onNone: () => [], onSome: (s) => [s] }))
	);

export type Tier = 'urgent' | 'important' | 'improve' | 'good';

export const tierOf = (score: Score): Tier =>
	score >= 3 ? 'urgent' : score >= 2 ? 'important' : score >= 1 ? 'improve' : 'good';

export interface ScoredAspect {
	readonly aspect: Aspect;
	readonly score: Score;
	readonly tier: Tier;
}

// Scored aspects, highest score first, framework order as the tie-break.
export const focus = (r: Reflection): ReadonlyArray<ScoredAspect> =>
	ASPECTS.flatMap((aspect) =>
		Option.match(aspectScore(r, aspect.id), {
			onNone: () => [],
			onSome: (score) => [{ aspect, score, tier: tierOf(score) }]
		})
	).sort((a, b) => b.score - a.score);

// Aspect scores keyed by aspect id, for the wheel.
export const aspectScores = (r: Reflection): Partial<Record<AspectId, Score>> =>
	Object.fromEntries(
		r.scores.map((s) => [STATEMENTS.find((st) => st.id === s.statement)?.aspect, s.score])
	);

export const quadrantsOf = (lens: LensId) => lensById(lens).quadrants.map(quadrantById);
export { QUADRANTS };
