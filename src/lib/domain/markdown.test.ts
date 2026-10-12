import { DateTime } from 'effect';
import { describe, expect, it } from 'vitest';
import { toMarkdown } from './markdown';
import { empty, withCommitment, withNote, withScore } from './reflection';

const t0 = DateTime.makeUnsafe('2026-10-12T20:00:00Z');

describe('toMarkdown', () => {
	it('renders the date, the scores table, the plan and the notes', () => {
		const r = withNote(
			withCommitment(
				withScore(withScore(empty(t0), 's01', 3, t0), 's10', 0, t0),
				'role.only-i-can',
				true,
				t0
			),
			'self',
			'Say no to the Tuesday pipeline review.',
			t0
		);
		const md = toMarkdown(r);
		expect(md).toContain('# Founder reflection · 2026-10-12');
		expect(md).toContain(
			"| Role | I'm clear on my role as CEO and focus on work only I can do. | 3 · Urgent focus |"
		);
		expect(md).toContain(
			"| Growth | We're achieving top-quartile growth for our stage. | 0 · I'm good here |"
		);
		expect(md).toContain('| Energy | ');
		expect(md).toContain('## Manage myself (avg 3.0)');
		expect(md).toContain('### Role · Urgent focus');
		expect(md).toContain('- [x] Write the "only I can do" list');
		expect(md).toContain('- [ ] Block two half-days a week');
		expect(md).toContain('> Say no to the Tuesday pipeline review.');
		expect(md).toContain('## Manage my impact (avg 0.0)');
		expect(md).toContain('Nothing to work on here right now.');
	});
});
