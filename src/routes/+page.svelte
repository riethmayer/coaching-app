<script lang="ts">
	import { resolve } from '$app/paths';
	import Wheel from '#lib/components/Wheel.svelte';
	import { LENSES, QUADRANTS, STATEMENTS, quadrantById } from '#lib/domain/framework.js';
	import { answered, aspectScores } from '#lib/domain/reflection.js';
	import { reflection } from '#lib/state/reflection.svelte.js';

	const current = $derived(reflection.current);
	const done = $derived(current === undefined ? 0 : answered(current));
</script>

<div class="two">
	<div>
		<p class="kicker">/// 01 Reflect</p>
		<h1>Build with judgement.<br />Ship with discipline<i class="dot"></i></h1>
		<p class="lede">
			Score sixteen statements on how much each one needs your attention right now. The scores
			become concrete practices for managing yourself, your agents, and your impact in production.
		</p>

		<div class="lenses">
			{#each LENSES as lens, i (lens.id)}
				<section class="card">
					<h3 class="k">0{i + 1} / {lens.name}</h3>
					<p class="q">{lens.question}</p>
					<p class="areas">{lens.quadrants.map((q) => quadrantById(q).name).join(' · ')}</p>
				</section>
			{/each}
		</div>

		<div class="areas-list">
			{#each QUADRANTS as q (q.id)}
				<p><b>{q.name}.</b> <span class="muted">{q.blurb}</span></p>
			{/each}
		</div>

		<div class="actions">
			{#if done === 0}
				<a class="button" href={resolve('/reflect')}
					>Start reflecting <span aria-hidden="true">-></span></a
				>
			{:else}
				<a class="button" href={resolve('/reflect')}
					>Continue ({done} of {STATEMENTS.length}) <span aria-hidden="true">-></span></a
				>
				<a class="ghost" href={resolve('/plan')}>See my plan</a>
			{/if}
		</div>
	</div>
	<aside class="halftone">
		<Wheel scores={current === undefined ? {} : aspectScores(current)} />
	</aside>
</div>

<style>
	.two {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 460px;
		gap: 56px;
		align-items: start;
	}
	.lenses {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
		margin: 32px 0 24px;
	}
	.lenses .card {
		padding: 16px 18px;
	}
	.q {
		margin: 0 0 10px;
		font-size: 13.5px;
		color: var(--muted);
	}
	.areas {
		margin: 0;
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink);
	}
	.areas-list p {
		margin: 8px 0;
		font-size: 15px;
	}
	.areas-list b {
		font-family: var(--display);
		font-size: 19px;
		text-transform: uppercase;
		letter-spacing: 0.01em;
		margin-right: 4px;
	}
	.actions {
		margin-top: 32px;
		display: flex;
		gap: 14px;
		align-items: center;
		flex-wrap: wrap;
	}
	aside {
		padding: 24px 0 0;
	}
	@media (max-width: 1000px) {
		.two {
			grid-template-columns: 1fr;
		}
		.lenses {
			grid-template-columns: 1fr;
		}
	}
</style>
