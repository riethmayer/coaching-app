<script lang="ts">
	// The four-stop scale as mono pills: tags, not a slider. The chosen stop is
	// the one yellow fill on the row.
	import { SCALE, type Score } from '#lib/domain/framework.js';

	interface Props {
		value?: Score;
		onpick: (value: Score) => void;
	}
	let { value, onpick }: Props = $props();
</script>

<div class="scale" role="radiogroup">
	{#each SCALE as stop (stop.value)}
		<button
			type="button"
			class="pill"
			class:on={value === stop.value}
			role="radio"
			aria-checked={value === stop.value}
			title={`${stop.label}: ${stop.meaning}`}
			onclick={() => onpick(stop.value)}
		>
			<span class="n">{stop.value}</span>
			{stop.short}
		</button>
	{/each}
</div>

<style>
	.scale {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 14px 0 4px;
	}
	.pill {
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		border: 1px solid var(--line-strong);
		color: var(--muted);
		background: transparent;
		border-radius: 999px;
		padding: 7px 14px 7px 10px;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		transition:
			border-color 0.15s,
			color 0.15s,
			background 0.15s;
	}
	.pill:hover {
		border-color: var(--yellow);
		color: var(--ink);
	}
	.pill.on {
		background: var(--yellow);
		border-color: var(--yellow);
		color: var(--tunnel);
		font-weight: 600;
	}
	.n {
		display: inline-block;
		min-width: 14px;
		text-align: center;
		border-right: 1px solid currentColor;
		padding-right: 8px;
		opacity: 0.7;
	}
	.pill.on .n {
		opacity: 1;
	}
</style>
