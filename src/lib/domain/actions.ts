// The action catalogue and the planner. Every aspect has three concrete
// practices; `minScore` is the lowest score at which an item is proposed, so a
// "can improve" aspect gets the lightweight habit and a priority aspect gets
// the structural moves as well.
import { Option } from 'effect';
import { LENSES, type AspectId, type Lens, type Score } from './framework';
import {
	focus,
	isCommitted,
	lensAverage,
	quadrantsOf,
	type Reflection,
	type ScoredAspect
} from './reflection';

export type Cadence = 'today' | 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface ActionItem {
	readonly id: string;
	readonly aspect: AspectId;
	readonly title: string;
	readonly why: string;
	readonly cadence: Cadence;
	readonly minScore: Score;
}

const item = (
	id: string,
	aspect: AspectId,
	minScore: Score,
	cadence: Cadence,
	title: string,
	why: string
): ActionItem => ({ id, aspect, minScore, cadence, title, why });

export const CATALOGUE: ReadonlyArray<ActionItem> = [
	// Elevate Yourself
	item(
		'role.only-i-can',
		'role',
		2,
		'today',
		'Write the "only I can do" list and audit last week\'s calendar against it',
		'Everything not on the list is a delegation candidate; the calendar shows how far you are from the role.'
	),
	item(
		'role.delegate-weekly',
		'role',
		1,
		'weekly',
		'Delegate one recurring task a week, with a named owner and the decision right that goes with it',
		'Delegating the task without the decision keeps you in the loop; the owner has to be able to finish it.'
	),
	item(
		'role.ceo-blocks',
		'role',
		2,
		'weekly',
		'Block two half-days a week for CEO-only work and defend them like customer meetings',
		'Strategic work never wins a fight for leftover time; it needs reserved time.'
	),
	item(
		'meetings.cull',
		'meetings',
		2,
		'today',
		'Cancel or halve every standing meeting that has no decision and no owner',
		'A meeting without a decision is a status email with a room.'
	),
	item(
		'meetings.purpose-owner',
		'meetings',
		1,
		'weekly',
		'Give every meeting a written purpose, a decision list, and one owner per action',
		'Written purpose stops drift; named owners stop actions evaporating.'
	),
	item(
		'meetings.leadership-cadence',
		'meetings',
		2,
		'weekly',
		'Run the weekly leadership meeting on a fixed agenda: numbers, blockers, decisions',
		'A fixed agenda makes the meeting about the business, not about whoever talks longest.'
	),
	item(
		'energy.protect-sleep',
		'energy',
		2,
		'today',
		'Put sleep and one weekly recovery block in the calendar before anything else',
		'Energy is the input to every other aspect; it is scheduled first or it is scheduled never.'
	),
	item(
		'energy.track',
		'energy',
		1,
		'daily',
		'Track energy for two weeks: what drains, what restores, at what time of day',
		'You cannot change a pattern you have not seen written down.'
	),
	item(
		'energy.remove-trigger',
		'energy',
		2,
		'monthly',
		'Name the burnout trigger and remove one source of it this month: a role, a meeting, or a person',
		'Burnout is usually one or two sources, not everything; removing one changes the slope.'
	),
	// Activate Your Team
	item(
		'talent.rate-seats',
		'talent',
		2,
		'today',
		'Rate every leadership seat A, B or C with evidence, and decide on each C within 30 days',
		'A tolerated C seat costs the team more than the search for a replacement.'
	),
	item(
		'talent.scorecards',
		'talent',
		1,
		'monthly',
		'Write the scorecard for each leadership role before the next hire or review',
		'A seat without a scorecard cannot be rated, hired for, or held accountable.'
	),
	item(
		'talent.start-search',
		'talent',
		2,
		'today',
		'Start the search for the weakest seat now; a senior replacement takes a quarter',
		'Waiting for the seat to improve costs the quarter you will need anyway.'
	),
	item(
		'coaching.three-questions',
		'coaching',
		2,
		'weekly',
		'In every 1:1, ask three questions before offering one answer',
		'Leaders learn to solve problems by solving them while you listen.'
	),
	item(
		'coaching.hand-back',
		'coaching',
		1,
		'weekly',
		'Hand back one problem a week that a leader brought to you to solve',
		'Each problem you keep teaches the team to bring you the next one.'
	),
	item(
		'coaching.development-goal',
		'coaching',
		2,
		'quarterly',
		'Agree one development goal per leader with a quarterly checkpoint',
		'Coaching without a goal is advice; a goal makes it measurable.'
	),
	item(
		'culture.behaviours',
		'culture',
		2,
		'today',
		'Write the three behaviours winning requires and the three that have to stop',
		'Culture is what you reward and what you tolerate; naming both makes it actionable.'
	),
	item(
		'culture.recognise-correct',
		'culture',
		1,
		'weekly',
		'Recognise one behaviour publicly each week and correct one privately',
		'Behaviour follows what the CEO visibly notices.'
	),
	item(
		'culture.decisions-review',
		'culture',
		2,
		'quarterly',
		'Review hiring, promotion and exit decisions against the behaviours every quarter',
		'People decisions are the loudest statement of what the culture really is.'
	),
	// Communicate Your Vision
	item(
		'storytelling.one-page',
		'storytelling',
		2,
		'today',
		'Write the one-page story: the change in the world, why now, why us',
		'A story that is not written down changes every time you tell it.'
	),
	item(
		'storytelling.test',
		'storytelling',
		1,
		'monthly',
		'Test the story on five customers and two investors; log what lands and what does not',
		'The audience decides what is compelling, not the author.'
	),
	item(
		'storytelling.repeat',
		'storytelling',
		2,
		'monthly',
		'Retell the story at every all-hands until the team tells it back to you',
		'The team can only sell a story it can repeat.'
	),
	item(
		'strategy.one-page',
		'strategy',
		2,
		'today',
		'Write the strategy on one page: where to play, how to win, what we will not do',
		'If it does not fit on a page, the team is making the choices for you.'
	),
	item(
		'strategy.stop-list',
		'strategy',
		1,
		'quarterly',
		'List the three things we stop doing this quarter and announce them',
		'A strategy without a stop list is a wish list.'
	),
	item(
		'strategy.monthly-review',
		'strategy',
		2,
		'monthly',
		'Review the one-pager with the leadership team monthly; change it only with evidence',
		'A monthly review keeps the strategy alive without making it fashion.'
	),
	item(
		'alignment.outcomes',
		'alignment',
		2,
		'today',
		'Give each leader three written outcomes for the quarter, each with a measure',
		'Accountability needs something written to be accountable to.'
	),
	item(
		'alignment.weekly-rag',
		'alignment',
		1,
		'weekly',
		'Review the outcomes weekly as red, amber, green, with no narrative allowed',
		'Colours force a verdict; narrative lets everyone stay amber.'
	),
	item(
		'alignment.name-gap',
		'alignment',
		2,
		'weekly',
		'Name an accountability gap directly with the leader concerned within a week of seeing it',
		'A gap that goes unnamed for a month becomes the standard.'
	),
	// Dominate Your Market
	item(
		'growth.one-metric',
		'growth',
		2,
		'today',
		'Pick the single growth metric and name the one constraint holding it back',
		'Growth work spread over five metrics moves none of them.'
	),
	item(
		'growth.weekly-experiment',
		'growth',
		1,
		'weekly',
		'Run one growth experiment a week with a hypothesis and a kill criterion',
		'A weekly cadence produces fifty learnings a year; a quarterly one produces four.'
	),
	item(
		'growth.benchmark',
		'growth',
		2,
		'quarterly',
		'Benchmark against top-quartile for your stage and put the gap into the plan',
		'You cannot plan to close a gap you have not measured.'
	),
	item(
		'fundraising.start-early',
		'fundraising',
		2,
		'today',
		'Build the investor list and the data room now; a fundraise starts six months before the term sheet',
		'The round you start late is the round you take on their terms.'
	),
	item(
		'fundraising.updates',
		'fundraising',
		1,
		'monthly',
		'Send a monthly update to the next-round investors you want',
		'Investors fund a line, not a dot; the update draws the line.'
	),
	item(
		'fundraising.rehearse',
		'fundraising',
		2,
		'monthly',
		'Rehearse the pitch with a hostile audience until the hard questions are boring',
		'The first time you hear the hard question should not be in the partner meeting.'
	),
	item(
		'ma.thesis',
		'ma',
		2,
		'today',
		'Write the thesis: what we would buy or who would buy us, and why',
		'A deal without a thesis is a reaction to whoever calls first.'
	),
	item(
		'ma.target-list',
		'ma',
		1,
		'quarterly',
		'Keep a running list of targets and acquirers and meet one every quarter',
		'Relationships built before the deal set the terms of the deal.'
	),
	item(
		'ma.house-in-order',
		'ma',
		2,
		'quarterly',
		'Get the house in order: clean cap table, contracts, metrics, and an adviser on call',
		'Diligence punishes mess with price; order is the cheapest leverage you have.'
	)
];

export const actionById = (id: string): Option.Option<ActionItem> =>
	Option.fromUndefinedOr(CATALOGUE.find((a) => a.id === id));

export interface PlannedAction extends ActionItem {
	readonly committed: boolean;
}

export interface PlannedAspect extends ScoredAspect {
	readonly actions: ReadonlyArray<PlannedAction>;
}

export interface LensPlan {
	readonly lens: Lens;
	readonly average: Option.Option<number>;
	readonly aspects: ReadonlyArray<PlannedAspect>;
}

// Every scored aspect with at least "I can improve" gets the actions its score
// unlocks, highest score first. "I'm good here" aspects stay out of the plan.
export const plan = (r: Reflection): ReadonlyArray<LensPlan> =>
	LENSES.map((lens) => {
		const aspectIds = new Set(quadrantsOf(lens.id).flatMap((q) => q.aspects));
		const aspects = focus(r)
			.filter((f) => aspectIds.has(f.aspect.id) && f.score >= 1)
			.map((f) => ({
				...f,
				actions: CATALOGUE.filter((a) => a.aspect === f.aspect.id && a.minScore <= f.score).map(
					(a) => ({ ...a, committed: isCommitted(r, a.id) })
				)
			}));
		return { lens, average: lensAverage(r, lens.id), aspects };
	});

export const committedActions = (r: Reflection): ReadonlyArray<ActionItem> =>
	r.commitments.flatMap((c) =>
		Option.match(actionById(c.action), { onNone: () => [], onSome: (a) => [a] })
	);
