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
				'role.audit-hours',
				true,
				t0
			),
			'self',
			'Say no to the Tuesday pipeline review.',
			t0
		);
		const md = toMarkdown(r);
		expect(md).toContain('# AI builder reflection · 2026-10-12');
		expect(md).toContain(
			'| Role | My time goes to planning what gets built and designing how it gets checked. Agents carry the production work, and I review by risk, not everything at the same depth. | 3 · Urgent focus |'
		);
		expect(md).toContain(
			"| Guardrails | Boundaries live in code and credentials, not in prompts: typed errors, domain boundaries, one ubiquitous language, sandboxes, scoped access. One-way actions need approval. | 0 · I'm good here |"
		);
		expect(md).toContain('| Pace | ');
		expect(md).toContain('## Manage myself (avg 3.0)');
		expect(md).toContain('### Role · Urgent focus');
		expect(md).toContain("- [x] Audit last week's hours");
		expect(md).toContain("- [ ] Sort this week's agent output into risk tiers");
		expect(md).toContain('> Say no to the Tuesday pipeline review.');
		expect(md).toContain('## Manage my impact (avg 0.0)');
		expect(md).toContain('Nothing to work on here right now.');
	});
});
