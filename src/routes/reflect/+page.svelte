<script lang="ts">
	import { resolve } from '$app/paths';
	import Scale from '#lib/components/Scale.svelte';
	import Wheel from '#lib/components/Wheel.svelte';
	import {
		QUADRANTS,
		STATEMENTS,
		aspectById,
		type AspectId,
		type Score,
		type Statement
	} from '#lib/domain/framework.js';
	import { answered, aspectScores, isComplete, scoreOf } from '#lib/domain/reflection.js';
	import { reflection } from '#lib/state/reflection.svelte.js';
	import { Option } from 'effect';

	const current = $derived(reflection.current);
	const done = $derived(current === undefined ? 0 : answered(current));
	const complete = $derived(current !== undefined && isComplete(current));
	let highlight = $state<AspectId | undefined>(undefined);

	const valueOf = (st: Statement): Score | undefined =>
		current === undefined ? undefined : Option.getOrUndefined(scoreOf(current, st.id));

	const pick = (st: Statement, value: Score) => {
		highlight = st.aspect;
		void reflection.score(st.id, value);
	};

	const statementsOf = (aspects: ReadonlyArray<AspectId>) =>
		STATEMENTS.filter((st) => aspects.includes(st.aspect));
</script>

<div class="two">
	<div>
		<p class="kicker">/// 02 Reflect · {done} of {STATEMENTS.length} answered</p>
		<h1>Where does your attention need to go?</h1>
		<p class="lede hint">
			Left means you are solid here. Right means it is urgent. Four pillars, four statements each.
		</p>

		{#each QUADRANTS as q, i (q.id)}
			<section class="card quadrant">
				<header>
					<p class="kicker">0{i + 1} / {q.name}</p>
					<p class="blurb muted">{q.blurb}</p>
				</header>
				{#each statementsOf(q.aspects) as st (st.id)}
					<div class="statement" class:hot={highlight === st.aspect}>
						<span class="aspect">{aspectById(st.aspect).name}</span>
						<p class="text">{st.text}</p>
						<Scale value={valueOf(st)} onpick={(v) => pick(st, v)} />
					</div>
				{/each}
			</section>
		{/each}

		<div class="actions">
			<a
				class="button"
				class:disabled={done === 0}
				href={resolve('/plan')}
				aria-disabled={done === 0}
			>
				Build my plan <span aria-hidden="true">-></span>
			</a>
			{#if !complete}
				<span class="muted note">Answer all {STATEMENTS.length} for a complete plan.</span>
			{/if}
		</div>
	</div>
	<aside class="side">
		<Wheel scores={current === undefined ? {} : aspectScores(current)} {highlight} />
	</aside>
</div>

<style>
	.two {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 440px;
		gap: 56px;
		align-items: start;
	}
	.side {
		position: sticky;
		top: 24px;
	}
	.hint {
		margin-bottom: 28px;
	}
	.quadrant {
		margin-bottom: 18px;
	}
	.quadrant header .kicker {
		margin-bottom: 4px;
	}
	.blurb {
		margin: 0 0 6px;
		font-size: 13.5px;
	}
	.statement {
		padding: 18px 0 12px;
		border-top: 1px solid var(--line);
		margin: 0 -24px;
		padding-left: 24px;
		padding-right: 24px;
		border-left: 2px solid transparent;
	}
	.statement.hot {
		border-left-color: var(--yellow);
		background: rgba(250, 200, 0, 0.04);
	}
	.aspect {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.text {
		font-size: 18px;
		line-height: 1.45;
		margin: 6px 0 0;
		max-width: 62ch;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 18px;
		margin-top: 16px;
		flex-wrap: wrap;
	}
	.note {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	@media (max-width: 1000px) {
		.two {
			grid-template-columns: 1fr;
		}
		.side {
			position: static;
		}
	}
</style>
