import { DateTime, Option } from 'effect';
import { describe, expect, it } from 'vitest';
import { CATALOGUE, committedActions, plan } from './actions';
import { ASPECTS } from './framework';
import { empty, withCommitment, withScore } from './reflection';

const t0 = DateTime.makeUnsafe(0);

describe('catalogue', () => {
	it('offers every aspect a habit at "I can improve" and more at priority', () => {
		for (const aspect of ASPECTS) {
			const items = CATALOGUE.filter((a) => a.aspect === aspect.id);
			expect(
				items.some((a) => a.minScore <= 1),
				aspect.id
			).toBe(true);
			expect(items.length, aspect.id).toBeGreaterThanOrEqual(3);
		}
	});

	it('has unique ids', () => {
		expect(new Set(CATALOGUE.map((a) => a.id)).size).toBe(CATALOGUE.length);
	});
});

describe('plan', () => {
	it('leaves "I\'m good here" aspects out and sorts urgent first', () => {
		const r = withScore(withScore(withScore(empty(t0), 's01', 0, t0), 's02', 2, t0), 's03', 3, t0);
		const self = plan(r).find((p) => p.lens.id === 'self');
		expect(self?.aspects.map((a) => a.aspect.id)).toEqual(['pace', 'focus']);
		expect(self?.average).toEqual(Option.some(5 / 3));
	});

	it('unlocks only the actions the score reaches', () => {
		const r = withScore(empty(t0), 's07', 1, t0);
		const team = plan(r).find((p) => p.lens.id === 'team');
		const context = team?.aspects.find((a) => a.aspect.id === 'context');
		expect(context?.actions.map((a) => a.id)).toEqual(['context.current-state']);
		const urgent = plan(withScore(r, 's07', 3, t0)).find((p) => p.lens.id === 'team');
		expect(urgent?.aspects[0]?.actions.length).toBe(3);
	});

	it('marks committed actions and resolves them from the catalogue', () => {
		const r = withCommitment(withScore(empty(t0), 's11', 2, t0), 'adoption.one-metric', true, t0);
		const impact = plan(r).find((p) => p.lens.id === 'impact');
		const adoption = impact?.aspects.find((a) => a.aspect.id === 'adoption');
		expect(adoption?.actions.find((a) => a.id === 'adoption.one-metric')?.committed).toBe(true);
		expect(committedActions(r).map((a) => a.id)).toEqual(['adoption.one-metric']);
	});

	it('ignores a commitment whose action left the catalogue', () => {
		const r = withCommitment(empty(t0), 'gone.action', true, t0);
		expect(committedActions(r)).toEqual([]);
	});
});
