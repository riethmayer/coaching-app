// Generates static/rules.html, the "Build alone. Compound together."
// field rules: content below, styles in style.css. Run: node scripts/rules/gen.mjs

import fs from 'node:fs';

const pillars = [
	{
		id: 'judgement',
		n: 'One',
		name: 'Judgement',
		sub: 'How to hold an opinion worth codifying.',
		epigraph:
			'I shipped 44 pull requests in one day. The real work happened before: I made every decision the agents would need, then walked away.',
		rules: [
			[
				'Keep a high quality bar everywhere.',
				'High quality <em>where it matters</em>.',
				"Not everything can be great. Agents give you the capacity to overdesign: spend it on the one experience that decides the outcome, and keep the rest good enough. One overdesigned thing makes a product stand out. Ten fine ones don't."
			],
			[
				'Figure it out along the way.',
				'Hand over the work, not the <em>decision</em>.',
				'Most builders underestimate the friction before they and the agent are fully aligned. Settle the decisions before the agents start, sort out what needs you, and let the rest run without you.'
			],
			[
				'Build what you can, now that you can build anything.',
				'Pick what <em>moves the needle</em>.',
				'You can build everything now. Not everything should be built. A hundred small things, or pleasing everyone around you, add up to nothing that matters.'
			],
			[
				'Start with the quick wins.',
				'Do the <em>hard</em> thing first.',
				'Agents make quick wins free, and they feel like progress. The strategic work is usually the hard part. Spend your extra iterations there.'
			],
			[
				'Start the next thing while the agents run.',
				'<em>Finish</em> before you start.',
				'Agents make starting free and distraction look productive. Value only lands when the work is finished.'
			],
			[
				'Run agents around the clock and keep up.',
				'Pace for a <em>marathon</em>.',
				'Agents do not tire; you do. Put the hard stop in the calendar first, or it never gets there.'
			],
			[
				'Stay above the code.',
				'Go <em>down</em> to the code when you lack proof.',
				'You cannot scale what you do not understand. Work low-level until you can judge what comes back.'
			],
			[
				'Be good at everything the project needs.',
				'Go <em>deep</em> in one area.',
				'Hold one bar high enough to be worth codifying. Borrow the others from teammates who hold theirs.'
			]
		]
	},
	{
		id: 'delegation',
		n: 'Two',
		name: 'Delegation',
		sub: 'How to run your loop alone, with agents doing the work.',
		epigraph:
			"Twelve agents on one project, and they already step on each other's toes. Add a colleague with their agents, and it stops working.",
		rules: [
			[
				'Write better prompts.',
				'Put the context <em>at the work</em>.',
				'An AGENTS.md next to the code is read on every run. A clever prompt in a chat is retyped every time.'
			],
			[
				'Let the agent remember for you.',
				'Decide what it <em>remembers</em>.',
				'A memory layer keeps the wrong things, out of context, and they skew every run that follows. Work without it, give the right context each time, and write down on purpose what carries over.'
			],
			[
				'Write a detailed plan first.',
				'Write the <em>definition of done</em> first.',
				'A checkable finish line beats a long plan. When the spec is unclear, a throwaway build finds it faster than a document.'
			],
			[
				'Tell the agent to never give up.',
				'Give the agent a way to <em>give up</em>.',
				'An agent that may not fail will fake success. “I am stuck” is a valid result.'
			],
			[
				'Keep a human in the loop.',
				'Remove checkpoints <em>on purpose</em>.',
				'Every checkpoint you keep needs a reason. The others keep you in the loop and the agents waiting.'
			],
			[
				"Fix the agent's mistake yourself.",
				'Fix the <em>system</em> that let it happen.',
				'A mistake you fix by hand comes back on the next run. A fixed instruction, check or skill stops it for every agent on the team.'
			],
			[
				'Pick the best model.',
				'Route each job to the <em>cheapest</em> model that can do it.',
				'Frontier models plan and judge; cheaper ones execute. Combine models instead of crowning one.'
			],
			[
				'Put two people on the hard project.',
				'One human <em>per loop</em>.',
				"Ten agents on one project already step on each other's toes. A second human with their own agents in the same loop turns building into coordination."
			]
		]
	},
	{
		id: 'ownership',
		n: 'Three',
		name: 'Ownership',
		sub: 'How to own a bar, not a project.',
		epigraph:
			'We ship without reading every line. At this pace we could not. The bar lives in the checks now, and someone owns each one.',
		rules: [
			[
				'Tell the agent what not to do.',
				'Take away what it <em>can</em> do.',
				'An instruction lowers the risk; only access the agent never had removes it. Sandboxes, scoped keys, approval for one-way actions.'
			],
			[
				'Trust the agent when it says done.',
				'Verify with a check it <em>cannot edit</em>.',
				'A self-report is not evidence. Tests it may mark passing but never delete, or a second agent that checks the goal.'
			],
			[
				'Catch the bugs in review.',
				'Catch them <em>before</em> review.',
				"Run each gate as early as it can: the agent's own loop, then pre-commit, then CI. Caught while the agent has the context, a failure costs a retry."
			],
			[
				'A human must approve every line.',
				'Review by <em>risk</em>.',
				'A careful reviewer covers about 400 lines a sitting. Let the criticality tier decide how strict the gates are, read the critical path yourself, and let checks carry the rest.'
			],
			[
				'Ship as much as you can.',
				'Ship what you can <em>explain</em>.',
				'Align up front so the review is simple, and have every pull request explain itself in flow diagrams and decisions, not a wall of diff. Review at that level, every time. A mistake you let through becomes context for every future run.'
			],
			[
				'Write the rule in the docs.',
				'Write it in the <em>types</em>.',
				'An agent can drift past a boundary in a document. It cannot drift past one the compiler enforces.'
			],
			[
				'Own your project end to end.',
				'Own a <em>bar</em>, not a project.',
				"A project ends. A bar in the shared system raises every builder's work. One owner per bar, and one referee when bars conflict."
			],
			[
				'Keep everything you built.',
				'<em>Retire</em> what nobody uses.',
				'Support for software nobody depends on is the new technical debt. Demote as readily as you promote.'
			]
		]
	},
	{
		id: 'initiative',
		n: 'Four',
		name: 'Initiative',
		sub: 'How to build on each other.',
		epigraph: 'I am no data engineer. My agents work like one, because a colleague wrote down how.',
		rules: [
			[
				'Automate the process.',
				'<em>Delete</em> the step first.',
				'Automating a step nobody needs makes the waste faster. Per workflow: delete, automate, build, buy, or wait.'
			],
			[
				'Buy what is not your core business.',
				'Build what was never <em>possible</em> before.',
				'We built our own link and open tracking instead of buying it. Now every service has it out of the box, adoption costs nothing, and the data lands in the warehouse where every agent can use it. No integration would have done that.'
			],
			[
				'Give agents small, safe tasks.',
				'Hand them <em>whole jobs</em>.',
				'Habits formed on weaker models keep the asks small. The limit has moved, and only trying shows where.'
			],
			[
				'Build it together.',
				'Build <em>on each other</em>.',
				"A teammate's codified bar makes your agents good at work you never learned. Add yours, and theirs get better too."
			],
			[
				'Align in a meeting.',
				'Align with a <em>working version</em>.',
				'A rough demo settles questions that a deck only raises.'
			],
			[
				'The third time, write it down.',
				'The third time, <em>build the workflow</em>.',
				'Time that leaves a reusable workflow behind keeps paying. Repeating the task never does.'
			],
			[
				'Launch and move on.',
				'Stay until someone <em>benefits</em>.',
				'Shipping is not the end. Two weeks after launch, sit with one user and fix what keeps them from using it.'
			],
			[
				'Measure usage.',
				'Measure <em>changed behavior</em>.',
				'Logins prove nothing. Name the one behavior that should change and the metric that shows it.'
			]
		]
	}
];

const mark = (size, cls = 'mark') =>
	`<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 512 512" aria-hidden="true"><circle cx="256" cy="256" r="188" fill="none" stroke="#FAC800" stroke-width="76"/><circle cx="256" cy="256" r="42" fill="#F7F4EA"/></svg>`;

// The four pillars as overlapping circles; the active one is lit.
const wheel = (active) => {
	const pos = {
		judgement: [385, 385],
		delegation: [615, 385],
		ownership: [615, 615],
		initiative: [385, 615]
	};
	const circles = Object.entries(pos)
		.map(
			([id, [cx, cy]]) =>
				`<circle cx="${cx}" cy="${cy}" r="200" class="${id === active ? 'lit' : 'dim'}"/>`
		)
		.join('');
	return `<svg class="pillar-wheel" viewBox="160 160 680 680" aria-hidden="true">${circles}<text x="500" y="512" text-anchor="middle" dominant-baseline="middle">10X</text></svg>`;
};

let page = 0;
const footer = () => {
	page++;
	return `<footer><span>Riethmayer · AI builder field rules</span><span>${String(page).padStart(2, '0')}</span></footer>`;
};

const pages = [];

pages.push(`<section class="page cover">
  <div class="halftone" aria-hidden="true"></div>
  <header class="brand">${mark(40)}<span class="word">RIETHMAYER<i class="dot"></i></span></header>
  <div class="cover-body">
    <p class="kicker">/// AI builder field rules</p>
    <h1>Build alone. Compound <span class="hl">together</span><i class="dot big"></i></h1>
    <p class="cover-sub">32 rules for AI builders, and where common belief is wrong.</p>
  </div>
  <div class="cover-foot"><span><b>Jan Riethmayer</b> · product-minded agentic engineering</span><span>riethmayer.com</span></div>
  ${footer()}
</section>`);

pages.push(`<section class="page prose">
  <p class="kicker">/// Foreword</p>
  <h2>The team stopped sharing <span class="hl">projects</span>.</h2>
  <p>Agents changed what one engineer can ship in a week. They also changed what a team is. One builder running ten agents on a project already has them stepping on each other's toes. Add a second human with their own agents to the same loop, and building turns into coordination.</p>
  <p>So the team no longer shares projects. It shares a system. Nobody is an expert in everything. Each of us holds a high bar in one area, such as data engineering, data analysis or web development, and writes it into the conventions, checks and skills every agent uses. Each builder ships alone, on top of everyone's bar. That is where the work compounds.</p>
  <p>Most teams still reward output: more code, more tokens, more merges. The builders ahead of the curve have a clear north star. They can measure it, and they can still explain and fact-check it.</p>
  <p>Here are 32 common beliefs and the builder's version of each, grouped by the four pillars of the <b>AI builder reflection</b>: Judgement, Delegation, Ownership and Initiative. They come from my own practice and from the patterns across hundreds of talks by builders I admire.</p>
  <p>Take what is useful. Argue with the rest.</p>
  <div class="sign">${mark(56, 'mark sign-mark')}<p><b>Jan Riethmayer</b><br/>Product-minded agentic engineering</p></div>
  ${footer()}
</section>`);

let num = 0;
for (const [i, p] of pillars.entries()) {
	pages.push(`<section class="page pillar">
  <p class="kicker">/// Pillar ${p.n}</p>
  <h2 class="pillar-title">${p.name}<i class="dot"></i></h2>
  <p class="pillar-sub">${p.sub}</p>
  <blockquote><p>${p.epigraph}</p><cite>Jan</cite></blockquote>
  ${wheel(p.id)}
  ${footer()}
</section>`);
	for (let half = 0; half < 2; half++) {
		const items = p.rules
			.slice(half * 4, half * 4 + 4)
			.map(([book, builder, why]) => {
				num++;
				return `<article class="rule">
    <span class="num">${String(num).padStart(2, '0')}</span>
    <div>
      <p class="book"><span class="lbl">Common belief →</span>${book}</p>
      <p class="builder"><span class="lbl">Builder →</span><span class="line">${builder}</span></p>
      <p class="why">${why}</p>
    </div>
  </article>`;
			})
			.join('\n  ');
		pages.push(`<section class="page rules">
  <p class="kicker">/// 0${i + 1} ${p.name}</p>
  ${items}
  ${footer()}
</section>`);
	}
}

pages.push(`<section class="page prose epilogue">
  <p class="kicker">/// Epilogue</p>
  <h2>Build the way only <span class="hl">you</span> can.</h2>
  <p>You will not agree with all thirty-two, and you should not. The point is not a new rulebook to follow instead of the old one. The point is that your judgement, not the model, now sets the pace.</p>
  <p class="big">Run your loop alone. Put your best opinion where every agent meets it. Build on each other.</p>
  <div class="sign">${mark(56, 'mark sign-mark')}<p><b>Jan Riethmayer</b><br/>riethmayer.com</p></div>
  ${footer()}
</section>`);

pages.push(`<section class="page cta">
  <h2>Where does your attention need to <span class="hl">go</span>?</h2>
  <p>Score sixteen statements across the four pillars in ten minutes. You get your wheel, and a plan of concrete practices for the aspects that need you most.</p>
  ${wheel('')}
  <a class="button" href="/reflect">Take the AI builder reflection <span aria-hidden="true">-></span></a>
  ${footer()}
</section>`);

const css = fs.readFileSync(new URL('./style.css', import.meta.url), 'utf8');
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Build alone. Compound together. · Riethmayer</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
<style>
${css}
</style>
</head>
<body>
${pages.join('\n\n')}
</body>
</html>
`;
fs.writeFileSync(new URL('../../static/rules.html', import.meta.url), html);
console.log(`${pages.length} pages, ${num} rules`);
