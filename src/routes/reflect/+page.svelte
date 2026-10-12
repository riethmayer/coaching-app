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
		<p class="count muted">{done} of {STATEMENTS.length} answered</p>
		<h1>How much does each of these need your attention right now?</h1>
		<p class="hint muted">Left means you are good here. Right means it is urgent.</p>

		{#each QUADRANTS as q (q.id)}
			<section class="quadrant">
				<header>
					<h2>{q.name}</h2>
					<p class="muted">{q.blurb}</p>
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
				Build my plan →
			</a>
			{#if !complete}
				<span class="muted">Answer all {STATEMENTS.length} for a complete plan.</span>
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
		grid-template-columns: minmax(0, 1fr) 420px;
		gap: 48px;
		align-items: start;
	}
	.side {
		position: sticky;
		top: 24px;
	}
	.count {
		font-size: 12px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		margin: 0 0 8px;
	}
	h1 {
		font-size: 30px;
	}
	.hint {
		margin-bottom: 28px;
	}
	.quadrant {
		background: #fff;
		border: 1px solid #e3e0d8;
		border-radius: 16px;
		padding: 20px 24px;
		margin-bottom: 20px;
	}
	.quadrant header p {
		margin: 0 0 8px;
		font-size: 14px;
	}
	.statement {
		padding: 16px 0 10px;
		border-top: 1px solid #efece5;
	}
	.statement.hot {
		background: #fbf9f4;
		margin: 0 -24px;
		padding-left: 24px;
		padding-right: 24px;
	}
	.aspect {
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #3b5bdb;
	}
	.text {
		font-family: Georgia, serif;
		font-size: 20px;
		margin: 4px 0 0;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 18px;
		margin-top: 12px;
	}
	a.button.disabled {
		opacity: 0.45;
		pointer-events: none;
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
