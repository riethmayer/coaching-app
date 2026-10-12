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
		<h1>Twelve statements. Three lenses. One plan.</h1>
		<p class="lead">
			Score the twelve statements of the Founder Leadership System on how much each one needs your
			attention. The app turns the scores into concrete actions to manage yourself, your team and
			your impact better.
		</p>

		<div class="lenses">
			{#each LENSES as lens (lens.id)}
				<section>
					<h3>{lens.name}</h3>
					<p class="muted">{lens.question}</p>
					<p class="areas">{lens.quadrants.map((q) => quadrantById(q).name).join(' · ')}</p>
				</section>
			{/each}
		</div>

		<div class="areas-list">
			{#each QUADRANTS as q (q.id)}
				<p><b>{q.name}.</b> {q.blurb}</p>
			{/each}
		</div>

		<div class="actions">
			{#if done === 0}
				<a class="button" href={resolve('/reflect')}>Start reflecting</a>
			{:else}
				<a class="button" href={resolve('/reflect')}>Continue ({done} of {STATEMENTS.length})</a>
				<a class="link" href={resolve('/plan')}>See my plan</a>
			{/if}
		</div>
	</div>
	<aside>
		<Wheel scores={current === undefined ? {} : aspectScores(current)} />
	</aside>
</div>

<style>
	.two {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 440px;
		gap: 48px;
		align-items: start;
	}
	.lead {
		font-size: 18px;
		max-width: 60ch;
	}
	.lenses {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		margin: 28px 0;
	}
	.lenses section {
		background: #fff;
		border: 1px solid #e3e0d8;
		border-radius: 14px;
		padding: 16px;
	}
	.lenses h3 {
		margin-bottom: 6px;
	}
	.lenses p {
		margin: 0 0 8px;
		font-size: 14px;
	}
	.areas {
		font-size: 12px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #3b5bdb;
	}
	.areas-list p {
		margin: 6px 0;
		font-size: 15px;
	}
	.actions {
		margin-top: 28px;
		display: flex;
		gap: 20px;
		align-items: center;
	}
	.link {
		color: #2b2b2b;
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
