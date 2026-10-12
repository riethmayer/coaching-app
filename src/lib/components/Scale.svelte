<script lang="ts">
	import { SCALE, type Score } from '#lib/domain/framework.js';

	interface Props {
		value?: Score;
		onpick: (value: Score) => void;
	}
	let { value, onpick }: Props = $props();
</script>

<div class="scale" role="radiogroup">
	<div class="labels"><span>Not a priority</span><span>Priority</span></div>
	<div class="track"><div class="mid"></div></div>
	<div class="stops">
		{#each SCALE as stop (stop.value)}
			<button
				type="button"
				class="stop"
				class:on={value === stop.value}
				role="radio"
				aria-checked={value === stop.value}
				title={stop.meaning}
				onclick={() => onpick(stop.value)}
			>
				<span class="dot"></span>
				<span class="cap">{stop.label}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.scale {
		position: relative;
		padding: 0 48px;
		margin: 14px 0 6px;
	}
	.labels {
		display: flex;
		justify-content: space-between;
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #8a8a84;
		margin-bottom: 8px;
	}
	.track {
		height: 6px;
		border-radius: 3px;
		background: linear-gradient(90deg, #cfe3d5, #f1e3bd 50%, #e8907f);
		position: relative;
	}
	.mid {
		position: absolute;
		left: 50%;
		top: -6px;
		bottom: -6px;
		border-left: 1px dashed #b5b3ad;
	}
	.stops {
		display: flex;
		justify-content: space-between;
		margin-top: -14px;
	}
	.stop {
		background: none;
		border: 0;
		padding: 0;
		width: 96px;
		margin: 0 -48px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		color: #6b6b66;
		font: inherit;
	}
	.dot {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: #fff;
		border: 2px solid #cfcdc8;
		transition: all 0.15s;
	}
	.stop:hover .dot {
		border-color: #8a8a84;
	}
	.stop.on .dot {
		background: #fff;
		border: 4px solid #d9542b;
		width: 26px;
		height: 26px;
	}
	.cap {
		font-size: 11px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		text-align: center;
		line-height: 1.3;
	}
	.stop.on .cap {
		color: #2b2b2b;
		font-weight: 700;
	}
</style>
