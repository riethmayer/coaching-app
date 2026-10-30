// The AI builder reflection: four pillars, sixteen aspects, one statement per
// aspect, scored on a four-stop scale. The structure (areas, one statement per
// aspect, lenses, overlaps) is adapted from Founder Coach's Founder Leadership
// System; the content is this repo's own, in the voice of product-minded
// agentic engineering. The three lenses group the pillars into "manage
// myself", "manage my agents", "manage my impact".
import { Schema } from 'effect';

export const QuadrantId = Schema.Literals(['judgement', 'delegation', 'ownership', 'initiative']);
export type QuadrantId = typeof QuadrantId.Type;

export const AspectId = Schema.Literals([
	'role',
	'focus',
	'pace',
	'craft',
	'context',
	'done',
	'autonomy',
	'compute',
	'accountability',
	'guardrails',
	'feedback',
	'portfolio',
	'strategy',
	'ambition',
	'alignment',
	'adoption'
]);
export type AspectId = typeof AspectId.Type;

// Stored scores reference these ids, so an id keeps its aspect once released.
export const StatementId = Schema.Literals([
	's01',
	's02',
	's03',
	's04',
	's05',
	's06',
	's07',
	's08',
	's09',
	's10',
	's11',
	's12',
	's13',
	's14',
	's15',
	's16'
]);
export type StatementId = typeof StatementId.Type;

export const LensId = Schema.Literals(['self', 'team', 'impact']);
export type LensId = typeof LensId.Type;

// 0 = solid, 3 = urgent. Averages stay in the same range.
export const Score = Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 3 }));
export type Score = typeof Score.Type;

export interface ScaleStop {
	readonly value: Score;
	readonly label: string;
	// For pills and legends, where the full label does not fit on one line.
	readonly short: string;
	readonly meaning: string;
}

export const SCALE: ReadonlyArray<ScaleStop> = [
	{ value: 0, label: "I'm good here", short: 'Good here', meaning: 'solid; not a priority' },
	{
		value: 1,
		label: 'I can improve',
		short: 'Can improve',
		meaning: 'room to improve, but not a priority'
	},
	{ value: 2, label: 'Important focus', short: 'Important', meaning: 'a priority to work on' },
	{
		value: 3,
		label: 'Urgent focus',
		short: 'Urgent',
		meaning: 'an urgent priority to work on now'
	}
];

export interface Lens {
	readonly id: LensId;
	readonly name: string;
	readonly question: string;
	readonly quadrants: ReadonlyArray<QuadrantId>;
}

export const LENSES: ReadonlyArray<Lens> = [
	{
		id: 'self',
		name: 'Manage myself',
		question:
			'Whether my time goes to planning and checks, whether I pick work by value, whether I pace myself for a marathon, and whether my own judgement keeps up.',
		quadrants: ['judgement']
	},
	{
		id: 'team',
		name: 'Manage my agents',
		question:
			'What my agents get, what done means, how far they run without me, and which model does the job at what cost.',
		quadrants: ['delegation']
	},
	{
		id: 'impact',
		name: 'Manage my impact',
		question:
			'Whether I can answer for what runs, and whether I go after the right things, aim high enough, bring people along and stay until it is used.',
		quadrants: ['ownership', 'initiative']
	}
];

export interface Quadrant {
	readonly id: QuadrantId;
	readonly name: string;
	readonly blurb: string;
	readonly lens: LensId;
	readonly aspects: ReadonlyArray<AspectId>;
}

// Clockwise from the top left of the wheel.
export const QUADRANTS: ReadonlyArray<Quadrant> = [
	{
		id: 'judgement',
		name: 'Judgement',
		blurb:
			'You are the bottleneck, not the models. Your judgement decides where your time goes, which work is worth it, and how you pace yourself so this stays a marathon, not a sprint.',
		lens: 'self',
		aspects: ['role', 'focus', 'pace', 'craft']
	},
	{
		id: 'delegation',
		name: 'Delegation',
		blurb:
			'Hand over the work as you would to a strong colleague: the context, what done means, the authority to run without you, and the right model at the right price.',
		lens: 'team',
		aspects: ['context', 'done', 'autonomy', 'compute']
	},
	{
		id: 'ownership',
		name: 'Ownership',
		blurb:
			'You answer for what runs. Boundaries live in code and credentials, the system reports on itself, and every tool has an owner and a reason to exist.',
		lens: 'impact',
		aspects: ['accountability', 'guardrails', 'feedback', 'portfolio']
	},
	{
		id: 'initiative',
		name: 'Initiative',
		blurb:
			'Go after the right things: decide what to build and what to delete, aim higher than the old backlog, bring people along with a working version, and stay until it is used.',
		lens: 'impact',
		aspects: ['strategy', 'ambition', 'alignment', 'adoption']
	}
];

export interface Aspect {
	readonly id: AspectId;
	readonly name: string;
	readonly desc: string;
	readonly outcome: string;
	readonly quadrant: QuadrantId;
}

export const ASPECTS: ReadonlyArray<Aspect> = [
	{
		id: 'role',
		name: 'Role',
		desc: 'Whether your time goes to planning what gets built and designing how it gets checked, or to production work agents could carry',
		outcome: 'Spend my time on planning and on the checks',
		quadrant: 'judgement'
	},
	{
		id: 'focus',
		name: 'Focus',
		desc: 'Whether you pick work by the value it adds and finish it, now that agents can build almost anything, or by what piques your interest',
		outcome: 'Pick the work by value, and finish it',
		quadrant: 'judgement'
	},
	{
		id: 'pace',
		name: 'Pace',
		desc: 'Whether you judge your own capacity: the toll of watching agents, switching context and reviewing output, paced for a marathon, not a sprint',
		outcome: 'Pace myself for a marathon',
		quadrant: 'judgement'
	},
	{
		id: 'craft',
		name: 'Craft',
		desc: 'Whether you form your own view before you ask a model, check your calls against outcomes, and keep your skills ahead of what agents take over',
		outcome: 'Form my own view first, and keep my skills ahead of the agents',
		quadrant: 'judgement'
	},
	{
		id: 'context',
		name: 'Context',
		desc: 'Whether agents get curated context at the work: stable rules, current state, handoff notes, and memory they keep up to date themselves',
		outcome: 'Put curated context at the work',
		quadrant: 'delegation'
	},
	{
		id: 'done',
		name: 'Done',
		desc: 'Whether every run starts with a definition of done the agent can check, including a way to give up',
		outcome: 'Write a checkable definition of done before the run',
		quadrant: 'delegation'
	},
	{
		id: 'autonomy',
		name: 'Autonomy',
		desc: 'Whether you remove checkpoints on purpose, run agents in parallel, and hand over whole jobs instead of watching one',
		outcome: 'Hand over whole jobs and step out of the loop',
		quadrant: 'delegation'
	},
	{
		id: 'compute',
		name: 'Compute',
		desc: 'Whether each job runs on the cheapest model that can do it, you know what a useful outcome costs, and each release is judged on your own test cases',
		outcome: 'Know the cost per outcome, and route each job to the right model',
		quadrant: 'delegation'
	},
	{
		id: 'accountability',
		name: 'Accountability',
		desc: 'Whether you can explain what ships, with proof near every claim, and output stays within what you and your checks can review',
		outcome: 'Ship only what I can explain and prove',
		quadrant: 'ownership'
	},
	{
		id: 'guardrails',
		name: 'Guardrails',
		desc: 'Whether boundaries live in code and credentials, not in prompts: typed errors, domain boundaries, one ubiquitous language, sandboxes, scoped access, approval for one-way actions',
		outcome: 'Put the boundary in the code, not in the prompt',
		quadrant: 'ownership'
	},
	{
		id: 'feedback',
		name: 'Feedback',
		desc: 'Whether the system reports quality and process as data early enough to act before anything ships, a check the agent cannot edit verifies its work, and each verdict schedules the next correction',
		outcome: 'Let the system tell me before it ships, and schedule the correction',
		quadrant: 'ownership'
	},
	{
		id: 'portfolio',
		name: 'Portfolio',
		desc: 'Whether every tool and agent you run has an owner, a reason to exist and a criticality tier that sets how strict its gates are, and you retire what nobody depends on',
		outcome: 'Tier by criticality, gate by tier, retire what nobody uses',
		quadrant: 'ownership'
	},
	{
		id: 'strategy',
		name: 'Strategy',
		desc: 'Whether the vision is compressed into decisions and constraints, including what to delete, automate, build, buy, or leave alone',
		outcome: 'Decide what to build, and what to delete',
		quadrant: 'initiative'
	},
	{
		id: 'ambition',
		name: 'Ambition',
		desc: 'Whether the capacity agents free up goes into work that was never worth building before, or only into the same work with fewer hands',
		outcome: 'Aim at work that was never worth building before',
		quadrant: 'initiative'
	},
	{
		id: 'alignment',
		name: 'Alignment',
		desc: 'Whether everyone, human and agent, knows what is being built, for whom, and why now, shown with a working version rather than a deck',
		outcome: 'Show a working version, not a deck',
		quadrant: 'initiative'
	},
	{
		id: 'adoption',
		name: 'Adoption',
		desc: 'Whether shipped systems change how people work, and you stay with them until someone benefits',
		outcome: 'Measure by changed behavior, and stay until it lands',
		quadrant: 'initiative'
	}
];

export interface Statement {
	readonly id: StatementId;
	readonly aspect: AspectId;
	readonly text: string;
}

// Order follows the pillars; the reflect page groups them the same way.
export const STATEMENTS: ReadonlyArray<Statement> = [
	{
		id: 's01',
		aspect: 'role',
		text: 'My time goes to planning what gets built and designing how it gets checked. Agents carry the production work, and I review by risk, not everything at the same depth.'
	},
	{
		id: 's02',
		aspect: 'focus',
		text: 'I can build everything now. Not everything should be built. I pick the work by the value it adds for someone, and I finish what I start.'
	},
	{
		id: 's03',
		aspect: 'pace',
		text: "I judge my own capacity as carefully as the agents' work. Context switches, watching runs and review load are paced for a marathon, not a sprint."
	},
	{
		id: 's13',
		aspect: 'craft',
		text: 'I form my own view before I ask a model, check my calls against what happened, and keep learning ahead of what agents take over.'
	},
	{
		id: 's07',
		aspect: 'context',
		text: 'My agents get curated context at the work: rules, current state, handoff notes. Relevant, not more, and they keep their own memory up to date.'
	},
	{
		id: 's08',
		aspect: 'done',
		text: "Every run starts with a definition of done the agent can check, and a way to give up. I never take an agent's word for done."
	},
	{
		id: 's14',
		aspect: 'autonomy',
		text: 'I hand over whole jobs and remove checkpoints on purpose. Several agents do useful work at once, and I am not watching any of them.'
	},
	{
		id: 's09',
		aspect: 'compute',
		text: 'Each job runs on the cheapest model that can do it, and I know what a useful outcome costs. Every model release is judged on my own test cases.'
	},
	{
		id: 's06',
		aspect: 'accountability',
		text: 'I can explain everything that ships, with proof near every claim. My agents produce no more than I and my checks can review.'
	},
	{
		id: 's10',
		aspect: 'guardrails',
		text: 'Boundaries live in code and credentials, not in prompts: typed errors, domain boundaries, one ubiquitous language, sandboxes, scoped access. One-way actions need approval.'
	},
	{
		id: 's12',
		aspect: 'feedback',
		text: 'The system tells me when quality slips, before it ships. Gates run as early as they can and write data, a check the agent cannot edit verifies its work, and each verdict schedules the next correction.'
	},
	{
		id: 's15',
		aspect: 'portfolio',
		text: 'Every tool and agent I run has an owner, a reason to exist and a criticality tier. The tier decides how strict its gates are, and I retire what nobody depends on as readily as I promote what works.'
	},
	{
		id: 's04',
		aspect: 'strategy',
		text: 'Strategy fits on one page of decisions and constraints, including what we delete, automate, build, buy, or leave alone.'
	},
	{
		id: 's16',
		aspect: 'ambition',
		text: 'The capacity agents free up goes into work that was never worth building before, not only into the same work with fewer hands.'
	},
	{
		id: 's05',
		aspect: 'alignment',
		text: 'Everyone, human and agent, knows what we are building, for whom, and why now. I show a working version instead of a deck.'
	},
	{
		id: 's11',
		aspect: 'adoption',
		text: 'What I ship changes how people work, and I can show it. I stay with it until someone actually benefits.'
	}
];

export interface Overlap {
	readonly key: 'clarity' | 'leverage' | 'center' | 'reliability' | 'outcomes';
	readonly name: string;
	readonly of: ReadonlyArray<QuadrantId>;
}

// Where two pillars meet on the wheel. The centre, where all four meet, is the
// 10x.
export const OVERLAPS: ReadonlyArray<Overlap> = [
	{ key: 'clarity', name: 'Clarity', of: ['judgement', 'initiative'] },
	{ key: 'leverage', name: 'Leverage', of: ['judgement', 'delegation'] },
	{ key: 'center', name: '10x', of: QuadrantId.literals },
	{ key: 'reliability', name: 'Reliability', of: ['delegation', 'ownership'] },
	{ key: 'outcomes', name: 'Outcomes', of: ['ownership', 'initiative'] }
];

const byId = <T extends { readonly id: string }>(items: ReadonlyArray<T>, id: string): T => {
	const found = items.find((item) => item.id === id);
	if (found === undefined) throw new Error(`unknown id ${id}`);
	return found;
};

export const aspectById = (id: AspectId): Aspect => byId(ASPECTS, id);
export const quadrantById = (id: QuadrantId): Quadrant => byId(QUADRANTS, id);
export const lensById = (id: LensId): Lens => byId(LENSES, id);
export const statementById = (id: StatementId): Statement => byId(STATEMENTS, id);
export const statementForAspect = (aspect: AspectId): Statement => {
	const found = STATEMENTS.find((s) => s.aspect === aspect);
	if (found === undefined) throw new Error(`no statement for aspect ${aspect}`);
	return found;
};
export const scaleStop = (value: Score): ScaleStop => {
	const found = SCALE.find((s) => s.value === value);
	if (found === undefined) throw new Error(`no scale stop for ${value}`);
	return found;
};
