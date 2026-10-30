// The action catalogue and the planner. Every aspect has at least three
// concrete practices; `minScore` is the lowest score at which an item is proposed, so a
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
	// Judgement
	item(
		'role.audit-hours',
		'role',
		2,
		'today',
		"Audit last week's hours: planning, designing checks, or production work an agent could have carried",
		'The production hours are the ones to hand to the agents; planning and checks are the role.'
	),
	item(
		'role.review-by-risk',
		'role',
		1,
		'weekly',
		"Sort this week's agent output into risk tiers; read the top tier line by line and let checks carry the rest",
		'Reviewing everything at the same depth is how review becomes the bottleneck and the burnout.'
	),
	item(
		'role.third-repeat',
		'role',
		2,
		'weekly',
		'The third time you do a task by hand, build the prompt, skill or workflow that does it instead',
		'Time that leaves a reusable workflow behind keeps paying; time spent repeating the task does not.'
	),
	item(
		'focus.value-check',
		'focus',
		2,
		'today',
		"Next to every item on this week's list, write who it adds value for; park what has no answer",
		'Interest is a bad proxy for value; the question has to be asked per item, in writing.'
	),
	item(
		'focus.park-curiosity',
		'focus',
		1,
		'weekly',
		'Keep a parking list for new models, tools and frameworks; try one a week, in a time box',
		'Curiosity does not go away by being suppressed; a time box keeps it from eating the week.'
	),
	item(
		'focus.finish-first',
		'focus',
		2,
		'weekly',
		'Name the one outcome the week serves and two things you will not do, and finish what is open before starting anything new',
		'Agents make starting cheap and distraction look productive; finishing is where the value is.'
	),
	item(
		'pace.batch-switches',
		'pace',
		2,
		'today',
		'Batch the agent work: start several runs, then do one deep task; stop checking every turn',
		'The context switch is the toll; batching makes the switches fewer and planned instead of constant.'
	),
	item(
		'pace.measure-focus',
		'pace',
		1,
		'daily',
		'For two weeks, log interruptions per hour and how long it takes to get back into the work',
		'Focus is a setting you can measure and change, not a matter of willpower.'
	),
	item(
		'pace.hard-stop',
		'pace',
		2,
		'weekly',
		'Put a hard stop for the day and one agent-free recovery block a week in the calendar before anything else',
		'Agents run around the clock; you do not. The stop is scheduled first or it is scheduled never.'
	),
	item(
		'craft.attempt-first',
		'craft',
		1,
		'daily',
		'Write your own answer or sketch before you prompt, then compare it with what the model says',
		'Judgement grows by being used; asking first lets the model do the thinking you need to practise.'
	),
	item(
		'craft.check-calls',
		'craft',
		2,
		'quarterly',
		"Check last quarter's calls against what happened: what you committed to, what came of it, what you avoided",
		'Everyone tells a kind story about their own work; outcomes are the honest check.'
	),
	item(
		'craft.skill-bet',
		'craft',
		2,
		'quarterly',
		'List which of your skills agents now cover, and pick one skill to build ahead of where they are going',
		'Expertise loses value quickly now; choosing what to learn next is part of the job.'
	),
	// Delegation
	item(
		'context.at-the-work',
		'context',
		2,
		'today',
		'Put the context at the work: an AGENTS.md in every directory that matters, with the invariants an agent must keep',
		'Instructions next to the code are the ones that get read; context in chat history is re-explained every run.'
	),
	item(
		'context.current-state',
		'context',
		1,
		'weekly',
		'Keep a short current-state file per project: goal, active decisions, open questions, next step; agents read it on every run',
		'History in a chat is not instructions; a current-state file stops old decisions from steering new runs.'
	),
	item(
		'context.curate',
		'context',
		2,
		'weekly',
		'Once a week, cut the context an agent gets: drop what it did not use, keep what it got wrong without',
		'The context window is the scarcest resource an agent has; a focused agent is a performant agent.'
	),
	item(
		'done.checkable',
		'done',
		2,
		'today',
		'Write the definition of done for the next run as checks the agent runs before it reports back, plus a way to say it is stuck',
		'An agent that may not give up will fake success; checks it runs itself make done something you can verify.'
	),
	item(
		'done.closed-loop',
		'done',
		1,
		'weekly',
		'When you give the same correction twice, put it into the prompt, skill or check it came from',
		'Fixing the output fixes one run; fixing the source fixes every run after it.'
	),
	item(
		'done.discovery-run',
		'done',
		2,
		'weekly',
		'When the spec is unclear, run a short throwaway build first, then write the definition of done from what it showed',
		'A rough first version often shows what you actually wanted faster than a long plan.'
	),
	item(
		'autonomy.checkpoint-audit',
		'autonomy',
		2,
		'today',
		'List every point where a run waits for you, and remove the ones a check now covers',
		'Each checkpoint you keep should have a reason; the others only keep you in the loop.'
	),
	item(
		'autonomy.agent-count',
		'autonomy',
		1,
		'weekly',
		'At random moments, count how many agents are doing useful work for you, and raise the number by one',
		'Watching one agent is still doing the work; useful agents in parallel is the measure of delegation.'
	),
	item(
		'autonomy.whole-job',
		'autonomy',
		2,
		'weekly',
		'Hand one job a week that is bigger than you think an agent can do, with the material and a definition of done; scale back only after it fails',
		'Habits formed on weaker models keep the asks small; the limit has moved and only trying shows where.'
	),
	item(
		'compute.cost-per-outcome',
		'compute',
		2,
		'today',
		'Log what each finished agent task costs, including retries and your review time',
		'Token count is not the measure; the cost of a useful result is.'
	),
	item(
		'compute.routing',
		'compute',
		1,
		'weekly',
		'Write down which model gets which job; move one repeated job to a cheaper model and compare the results',
		'The cheapest model that can do the job is the right one, and only a comparison shows which one that is.'
	),
	item(
		'compute.release-rerun',
		'compute',
		2,
		'monthly',
		'Keep three to five test cases per recurring task and re-run them on every model release before switching',
		'A new model changes the answer to the same prompt; your own test cases are the only honest comparison.'
	),
	// Ownership
	item(
		'accountability.explain',
		'accountability',
		2,
		'today',
		'Open a random agent-written file from last week and explain it without the chat; fix what you cannot explain',
		"Code nobody can explain becomes someone else's problem, usually at the worst time."
	),
	item(
		'accountability.proof',
		'accountability',
		1,
		'weekly',
		"Put a metric, a log line or a diagram next to every claim in this week's pull requests and notes",
		'Proof near every claim is what separates a field report from a slogan.'
	),
	item(
		'accountability.review-budget',
		'accountability',
		2,
		'weekly',
		'Watch your review queue, not your pull request count; start no new runs while it is over the limit you set',
		'Agents produce faster than anyone reviews; output beyond review capacity is risk, not progress.'
	),
	item(
		'guardrails.scoped-access',
		'guardrails',
		2,
		'today',
		'Run unattended agents in a sandbox with scoped credentials, and put send, delete, publish, spend and production changes behind approval',
		'An instruction in a prompt lowers the risk; only access the agent never had removes it.'
	),
	item(
		'guardrails.typed-errors',
		'guardrails',
		2,
		'today',
		'Make failures typed: every service names its errors in the signature, and nothing throws across a boundary',
		'An agent cannot drift past a boundary the compiler enforces; a thrown string it can ignore.'
	),
	item(
		'guardrails.language',
		'guardrails',
		1,
		'weekly',
		'Write the ubiquitous language down, one term per concept, and rename one mismatch a week in code, docs and prompts',
		'Humans and agents read the same words; two names for one thing is a bug waiting for a reader.'
	),
	item(
		'guardrails.boundaries',
		'guardrails',
		2,
		'monthly',
		'Draw the domain boundaries as ports and adapters, and put a deterministic check on cross-boundary imports, duplication and dead code',
		'A boundary in a doc is advice; a boundary in a check is a guardrail.'
	),
	item(
		'feedback.shift-left',
		'feedback',
		2,
		'today',
		"Move each rule into a gate at the earliest point it can run: the agent's own loop, then pre-commit, then CI; lint, types, secrets, tests",
		'A failure caught while the agent still has the context costs a retry; caught after it ships, it costs an incident. A rule an agent has to remember gets skipped.'
	),
	item(
		'feedback.sweep',
		'feedback',
		1,
		'weekly',
		'Run the quality sweep every week and read the delta: what your changes introduced, what they fixed',
		'A verdict you can query beats a feeling about the codebase; the delta tells you what this week cost.'
	),
	item(
		'feedback.independent-check',
		'feedback',
		2,
		'weekly',
		'Give every long run a check the agent cannot edit: tests it may mark passing but never delete, or a second agent that verifies the goal',
		'An agent reporting its own success is not evidence; the checker has to sit outside its reach.'
	),
	item(
		'feedback.evals-correction',
		'feedback',
		2,
		'monthly',
		'Give every prompt or model change an eval with ground truth, and schedule the correction from the verdict before the praise arrives',
		'Prompt changes go through evidence, not taste; a red verdict without a scheduled correction is a story.'
	),
	item(
		'portfolio.owner',
		'portfolio',
		2,
		'today',
		'List every tool and agent you run with its owner and backup owner; give the ones without an owner one, or switch them off',
		'A system without an owner has no one to notice when it breaks.'
	),
	item(
		'portfolio.tiers',
		'portfolio',
		1,
		'monthly',
		'Give each tool and agent a criticality tier, from personal experiment to business-critical, and write down the gates each tier has to pass before it ships',
		'The same gates for everything either slow the experiments or under-protect what the business depends on; the tier decides how strict to be.'
	),
	item(
		'portfolio.retire',
		'portfolio',
		2,
		'quarterly',
		'Each quarter, retire at least one tool or agent nobody depends on',
		'Support for software nobody uses is the new technical debt; demotion matters as much as promotion.'
	),
	// Initiative
	item(
		'strategy.one-page',
		'strategy',
		2,
		'today',
		'Write the strategy on one page: the behavior that should change, for whom, why now, and what we will not build',
		'If it does not fit on a page, the team and the agents are making the choices for you.'
	),
	item(
		'strategy.constraints',
		'strategy',
		1,
		'quarterly',
		'Turn the strategy into three constraints a pull request can be checked against, and announce them',
		'A constraint aims every decision; a deck aims none.'
	),
	item(
		'strategy.build-choice',
		'strategy',
		2,
		'monthly',
		'Before automating a workflow, decide whether to delete, automate, build, buy, or wait, and cut the steps nobody needs first',
		'Automating a step nobody needs only makes the waste faster.'
	),
	item(
		'ambition.backlog-dig',
		'ambition',
		1,
		'monthly',
		'List the projects you once ruled out as too costly, and test one a month with agents',
		'The old backlog was priced for human hours; at agent prices some of it is now the best work available.'
	),
	item(
		'ambition.bigger-problem',
		'ambition',
		2,
		'weekly',
		'Before the next build, ask whether the problem is big enough, and write the bigger version next to it',
		'When building gets cheap, the size of the problem you pick decides the size of the result.'
	),
	item(
		'ambition.no-cuts',
		'ambition',
		2,
		'quarterly',
		'When agents free up capacity, name the new work it goes to before anyone proposes a cut',
		'Freed capacity spent only on doing the same work with fewer hands is a lack of imagination, not a strategy.'
	),
	item(
		'alignment.outcomes',
		'alignment',
		2,
		'today',
		'Give each owner three written outcomes for the quarter, each with a measure',
		'Accountability needs something written to be accountable to.'
	),
	item(
		'alignment.working-version',
		'alignment',
		1,
		'weekly',
		'Replace one alignment meeting a week with a rough working version people can try',
		'A working version settles questions that a deck only raises.'
	),
	item(
		'alignment.why-now',
		'alignment',
		2,
		'weekly',
		'Open every build with the product question, what should change, for whom, and why now, and refuse work without an answer',
		'A teammate or an agent without the why optimises the wrong thing, fast.'
	),
	item(
		'adoption.one-metric',
		'adoption',
		2,
		'today',
		'Name the one behavior each system should change and the metric that shows it; drop the systems with neither',
		'The system only counts once behavior changed; output without a metric is theatre.'
	),
	item(
		'adoption.watch-usage',
		'adoption',
		1,
		'weekly',
		'Watch one person work with the system every week and log what they did instead',
		'The demo worked; the adoption failed. You find out by watching, not by asking.'
	),
	item(
		'adoption.follow-through',
		'adoption',
		2,
		'weekly',
		'Two weeks after each launch, check in with one user and fix what keeps them from using it',
		'Shipping to production is not the end; the work is done when someone benefits.'
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
