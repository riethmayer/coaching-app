// The Founder Leadership System (Founder Coach): four areas, twelve aspects,
// one statement per aspect, scored on a four-stop scale. The three lenses
// group the areas into "manage myself", "manage my team", "manage my impact".
import { Schema } from 'effect';

export const QuadrantId = Schema.Literals([
	'elevate_yourself',
	'activate_your_team',
	'communicate_your_vision',
	'dominate_your_market'
]);
export type QuadrantId = typeof QuadrantId.Type;

export const AspectId = Schema.Literals([
	'role',
	'meetings',
	'energy',
	'talent',
	'coaching',
	'culture',
	'storytelling',
	'strategy',
	'alignment',
	'growth',
	'fundraising',
	'ma'
]);
export type AspectId = typeof AspectId.Type;

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
	's12'
]);
export type StatementId = typeof StatementId.Type;

export const LensId = Schema.Literals(['self', 'team', 'impact']);
export type LensId = typeof LensId.Type;

// 0 = satisfied, 3 = urgent. Averages stay in the same range.
export const Score = Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 3 }));
export type Score = typeof Score.Type;

export interface ScaleStop {
	readonly value: Score;
	readonly label: string;
	readonly meaning: string;
}

export const SCALE: ReadonlyArray<ScaleStop> = [
	{ value: 0, label: "I'm good here", meaning: 'satisfied; not a priority' },
	{ value: 1, label: 'I can improve', meaning: 'room to improve, but not a priority' },
	{ value: 2, label: 'Important focus', meaning: 'a priority to work on' },
	{ value: 3, label: 'Urgent focus', meaning: 'an urgent priority to work on now' }
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
		question: 'How I spend my time, run my meetings and keep my energy.',
		quadrants: ['elevate_yourself']
	},
	{
		id: 'team',
		name: 'Manage my team',
		question: 'Who sits in each seat, how I coach them, and the culture they work in.',
		quadrants: ['activate_your_team']
	},
	{
		id: 'impact',
		name: 'Manage my impact',
		question:
			'The story, the strategy, and whether the company grows, raises and deals on strong terms.',
		quadrants: ['communicate_your_vision', 'dominate_your_market']
	}
];

export interface Quadrant {
	readonly id: QuadrantId;
	readonly name: string;
	readonly blurb: string;
	readonly lens: LensId;
	readonly aspects: ReadonlyArray<AspectId>;
}

export const QUADRANTS: ReadonlyArray<Quadrant> = [
	{
		id: 'elevate_yourself',
		name: 'Elevate Yourself',
		blurb: 'How the CEO spends their time, runs meetings and keeps their energy.',
		lens: 'self',
		aspects: ['role', 'meetings', 'energy']
	},
	{
		id: 'activate_your_team',
		name: 'Activate Your Team',
		blurb: 'The quality of the leadership team, how it is coached and the culture it works in.',
		lens: 'team',
		aspects: ['talent', 'coaching', 'culture']
	},
	{
		id: 'communicate_your_vision',
		name: 'Communicate Your Vision',
		blurb: 'The story, the strategy and whether leaders are aligned on it.',
		lens: 'impact',
		aspects: ['storytelling', 'strategy', 'alignment']
	},
	{
		id: 'dominate_your_market',
		name: 'Dominate Your Market',
		blurb: 'Growth, capital and buying or selling businesses.',
		lens: 'impact',
		aspects: ['growth', 'fundraising', 'ma']
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
		desc: 'How the CEO spends their time and whether it is on work only the CEO can do',
		outcome: 'Play a more strategic role',
		quadrant: 'elevate_yourself'
	},
	{
		id: 'meetings',
		name: 'Meetings',
		desc: "The quality and usefulness of the team's meetings",
		outcome: 'Run meetings that drive outcomes',
		quadrant: 'elevate_yourself'
	},
	{
		id: 'energy',
		name: 'Energy',
		desc: "The CEO's physical and mental stamina and burnout risk",
		outcome: 'Protect my energy and avoid burnout',
		quadrant: 'elevate_yourself'
	},
	{
		id: 'talent',
		name: 'Talent',
		desc: 'The quality of the people in each seat and how underperformance is handled',
		outcome: 'Get A-players in every seat',
		quadrant: 'activate_your_team'
	},
	{
		id: 'coaching',
		name: 'Coaching',
		desc: "How the CEO develops leaders' ability to solve problems themselves",
		outcome: 'Coach my leaders instead of doing it for them',
		quadrant: 'activate_your_team'
	},
	{
		id: 'culture',
		name: 'Culture',
		desc: "The company's shared behaviours and whether they fit what winning requires",
		outcome: 'Build a culture that wins',
		quadrant: 'activate_your_team'
	},
	{
		id: 'storytelling',
		name: 'Storytelling',
		desc: 'The narrative that wins customers and investors',
		outcome: 'Tell a compelling company story',
		quadrant: 'communicate_your_vision'
	},
	{
		id: 'strategy',
		name: 'Strategy',
		desc: 'The choices about where to play and what not to do',
		outcome: 'Sharpen our strategy',
		quadrant: 'communicate_your_vision'
	},
	{
		id: 'alignment',
		name: 'Alignment',
		desc: "Leaders' clarity on expectations and their accountability for them",
		outcome: 'Align my leadership team on expectations',
		quadrant: 'communicate_your_vision'
	},
	{
		id: 'growth',
		name: 'Growth',
		desc: "The company's growth rate relative to its stage",
		outcome: 'Accelerate our growth',
		quadrant: 'dominate_your_market'
	},
	{
		id: 'fundraising',
		name: 'Fundraising',
		desc: 'Readiness to raise capital on competitive terms',
		outcome: 'Run a competitive fundraise',
		quadrant: 'dominate_your_market'
	},
	{
		id: 'ma',
		name: 'M&A',
		desc: 'Readiness to buy or sell a business on strong terms',
		outcome: 'Buy or sell a business on strong terms',
		quadrant: 'dominate_your_market'
	}
];

export interface Statement {
	readonly id: StatementId;
	readonly aspect: AspectId;
	readonly text: string;
}

// Order follows the Founder Coach CEO Focus Finder.
export const STATEMENTS: ReadonlyArray<Statement> = [
	{
		id: 's01',
		aspect: 'role',
		text: "I'm clear on my role as CEO and focus on work only I can do."
	},
	{
		id: 's02',
		aspect: 'meetings',
		text: 'My team meetings are focused, essential and drive outcomes.'
	},
	{
		id: 's03',
		aspect: 'energy',
		text: 'My physical and mental energy are strong, with no burnout risk in the next 6 months.'
	},
	{
		id: 's04',
		aspect: 'storytelling',
		text: 'My storytelling wins the hearts and minds of customers and investors.'
	},
	{
		id: 's05',
		aspect: 'strategy',
		text: "Our strategy is bold, focused and clear on what we won't do."
	},
	{
		id: 's06',
		aspect: 'alignment',
		text: "My leaders know what's expected and hold themselves accountable."
	},
	{
		id: 's07',
		aspect: 'talent',
		text: "I have A-players in every seat and a clear plan for anyone who isn't."
	},
	{
		id: 's08',
		aspect: 'coaching',
		text: 'I coach my leaders to solve problems without doing it for them.'
	},
	{
		id: 's09',
		aspect: 'culture',
		text: 'Our company culture reflects what I believe it will take to win.'
	},
	{ id: 's10', aspect: 'growth', text: "We're achieving top-quartile growth for our stage." },
	{
		id: 's11',
		aspect: 'fundraising',
		text: "I'm ready to run a competitive fundraise in the next 6 months."
	},
	{
		id: 's12',
		aspect: 'ma',
		text: "I'm ready to buy or sell a business on strong terms in the next 6 months."
	}
];

export interface Overlap {
	readonly key: 'clarity' | 'freedom' | 'tenx' | 'results' | 'impact';
	readonly name: string;
	readonly of: ReadonlyArray<QuadrantId>;
}

export const OVERLAPS: ReadonlyArray<Overlap> = [
	{ key: 'clarity', name: 'Clarity', of: ['elevate_yourself', 'communicate_your_vision'] },
	{ key: 'freedom', name: 'Freedom', of: ['elevate_yourself', 'activate_your_team'] },
	{ key: 'tenx', name: '10X', of: QuadrantId.literals },
	{ key: 'results', name: 'Results', of: ['activate_your_team', 'dominate_your_market'] },
	{ key: 'impact', name: 'Impact', of: ['communicate_your_vision', 'dominate_your_market'] }
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
