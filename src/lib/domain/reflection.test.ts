import { DateTime, Option } from 'effect';
import { describe, expect, it } from 'vitest';
import {
	answered,
	empty,
	focus,
	isComplete,
	lensAverage,
	quadrantAverage,
	scoreOf,
	withCommitment,
	withNote,
	withScore,
	type Reflection
} from './reflection';
import { STATEMENTS } from './framework';

const t0 = DateTime.makeUnsafe(0);
const t1 = DateTime.makeUnsafe(60_000);

describe('reflection', () => {
	it('starts empty and incomplete', () => {
		const r = empty(t0);
		expect(answered(r)).toBe(0);
		expect(isComplete(r)).toBe(false);
		expect(Option.isNone(scoreOf(r, 's01'))).toBe(true);
	});

	it('replaces an existing score instead of appending', () => {
		const r = withScore(withScore(empty(t0), 's01', 1, t0), 's01', 3, t1);
		expect(r.scores).toEqual([{ statement: 's01', score: 3 }]);
		expect(r.updatedAt).toEqual(t1);
	});

	it('is complete after all sixteen statements', () => {
		const r = STATEMENTS.reduce<Reflection>((acc, st) => withScore(acc, st.id, 0, t0), empty(t0));
		expect(isComplete(r)).toBe(true);
	});

	it('averages a quadrant over its scored aspects only', () => {
		// role 3, focus 1, pace and craft unscored → (3 + 1) / 2
		const r = withScore(withScore(empty(t0), 's01', 3, t0), 's02', 1, t0);
		expect(quadrantAverage(r, 'judgement')).toEqual(Option.some(2));
		expect(Option.isNone(quadrantAverage(r, 'delegation'))).toBe(true);
	});

	it('averages the impact lens over both of its pillars', () => {
		// strategy 2 (initiative) and guardrails 0 (ownership) → 1
		const r = withScore(withScore(empty(t0), 's04', 2, t0), 's10', 0, t0);
		expect(lensAverage(r, 'impact')).toEqual(Option.some(1));
	});

	it('orders focus by score, framework order as tie-break', () => {
		const r = withScore(withScore(withScore(empty(t0), 's02', 2, t0), 's09', 3, t0), 's01', 2, t0);
		expect(focus(r).map((f) => `${f.aspect.id}:${f.tier}`)).toEqual([
			'compute:urgent',
			'role:important',
			'focus:important'
		]);
	});

	it('keeps one note per lens and drops blank notes', () => {
		const r = withNote(withNote(empty(t0), 'self', 'first', t0), 'self', 'second', t1);
		expect(r.notes).toEqual([{ lens: 'self', text: 'second' }]);
		expect(withNote(r, 'self', '   ', t1).notes).toEqual([]);
	});

	it('toggles commitments without duplicates', () => {
		const on = withCommitment(withCommitment(empty(t0), 'a', true, t0), 'a', true, t0);
		expect(on.commitments).toEqual([{ action: 'a' }]);
		expect(withCommitment(on, 'a', false, t0).commitments).toEqual([]);
	});
});
