<script lang="ts">
	import { resolve } from '$app/paths';
	import Wheel from '#lib/components/Wheel.svelte';
	import { committedActions, plan } from '#lib/domain/actions.js';
	import { STATEMENTS, scaleStop } from '#lib/domain/framework.js';
	import { toMarkdown } from '#lib/domain/markdown.js';
	import { answered, aspectScores, noteOf } from '#lib/domain/reflection.js';
	import { reflection } from '#lib/state/reflection.svelte.js';
	import { DateTime, Option } from 'effect';

	const current = $derived(reflection.current);
	const done = $derived(current === undefined ? 0 : answered(current));
	const plans = $derived(current === undefined ? [] : plan(current));
	const committed = $derived(current === undefined ? 0 : committedActions(current).length);
	const markdown = $derived(current === undefined ? '' : toMarkdown(current));

	let copied = $state(false);
	let confirmReset = $state(false);

	const fmt = (n: number) => n.toFixed(1);

	async function copy() {
		await navigator.clipboard.writeText(markdown);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	function download() {
		if (current === undefined) return;
		const blob = new Blob([markdown], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `ai-builder-reflection-${DateTime.formatIsoDate(current.updatedAt)}.md`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function reset() {
		if (!confirmReset) {
			confirmReset = true;
			setTimeout(() => (confirmReset = false), 4000);
			return;
		}
		confirmReset = false;
		void reflection.reset();
	}
</script>

{#if current === undefined}
	<p class="kicker">/// Loading</p>
{:else if done === 0}
	<p class="kicker">/// 03 Plan</p>
	<h1>No answers yet.</h1>
	<p>
		<a class="button" href={resolve('/reflect')}
			>Start reflecting <span aria-hidden="true">-></span></a
		>
	</p>
{:else}
	<div class="two">
		<div>
			<p class="kicker">
				/// 03 Plan · {done} of {STATEMENTS.length} answered · {committed} committed · updated {DateTime.formatIsoDate(
					current.updatedAt
				)}
			</p>
			<h1>My plan<i class="dot"></i></h1>
			<p class="lede hint">
				Each lens lists the aspects you flagged, most urgent first, with the practices that fit the
				score. Tick what you commit to. Add your own in the box.
			</p>

			{#each plans as lp, i (lp.lens.id)}
				<section class="card lens">
					<header>
						<div>
							<p class="kicker">0{i + 1} / {lp.lens.name}</p>
							<h2>{lp.lens.name}</h2>
							<p class="q muted">{lp.lens.question}</p>
						</div>
						{#if Option.isSome(lp.average)}
							<span class="avg" title="average score across this lens">{fmt(lp.average.value)}</span
							>
						{/if}
					</header>

					{#if lp.aspects.length === 0}
						<p class="muted none">Nothing to work on here right now.</p>
					{/if}

					{#each lp.aspects as a (a.aspect.id)}
						<div class="aspect">
							<div class="aspect-head">
								<h3>{a.aspect.name}</h3>
								<span class="badge {a.tier}">{scaleStop(a.score).label}</span>
							</div>
							<p class="outcome">{a.aspect.outcome}</p>
							<ul class="items">
								{#each a.actions as act (act.id)}
									<li class:on={act.committed}>
										<label>
											<input
												type="checkbox"
												checked={act.committed}
												onchange={(e) => reflection.commit(act.id, e.currentTarget.checked)}
											/>
											<span class="title">{act.title}</span>
											<span class="pill cadence">{act.cadence}</span>
										</label>
										<p class="why muted">{act.why}</p>
									</li>
								{/each}
							</ul>
						</div>
					{/each}

					<label class="note">
						<span>My own commitment for this lens</span>
						<textarea
							rows="2"
							placeholder="One sentence, with a date."
							value={noteOf(current, lp.lens.id)}
							onchange={(e) => reflection.note(lp.lens.id, e.currentTarget.value)}></textarea>
					</label>
				</section>
			{/each}

			<div class="actions">
				<button class="primary" type="button" onclick={copy}
					>{copied ? 'Copied' : 'Copy as Markdown'}</button
				>
				<button class="ghost" type="button" onclick={download}>Download .md</button>
				<a class="link" href={resolve('/reflect')}>Change answers</a>
				<button class="ghost danger" type="button" onclick={reset}
					>{confirmReset ? 'Click again to erase everything' : 'Start over'}</button
				>
			</div>
		</div>
		<aside class="side">
			<Wheel scores={aspectScores(current)} />
			<details class="preview">
				<summary>Markdown preview</summary>
				<pre>{markdown}</pre>
			</details>
		</aside>
	</div>
{/if}

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
	.lens {
		margin-bottom: 18px;
	}
	.lens header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
	}
	.lens header .kicker {
		margin-bottom: 6px;
	}
	.lens h2 {
		margin-bottom: 6px;
	}
	.q {
		margin: 0 0 12px;
		font-size: 13.5px;
		max-width: 60ch;
	}
	.avg {
		font-family: var(--display);
		font-size: 44px;
		font-weight: 800;
		line-height: 1;
		color: var(--yellow);
	}
	.none {
		margin: 0;
	}
	.aspect {
		border-top: 1px solid var(--line);
		padding: 16px 0 8px;
	}
	.aspect-head {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.aspect-head h3 {
		margin: 0;
	}
	.outcome {
		margin: 4px 0 10px;
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.items {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.items li {
		padding: 8px 0;
	}
	.items label {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 12px;
		align-items: baseline;
		cursor: pointer;
	}
	.items input {
		width: 16px;
		height: 16px;
		accent-color: var(--yellow);
		border-radius: 2px;
	}
	.items li.on .title {
		font-weight: 600;
	}
	.cadence {
		padding: 3px 10px;
		font-size: 10px;
	}
	.why {
		margin: 2px 0 0 28px;
		font-size: 13px;
	}
	.note {
		display: block;
		margin-top: 16px;
	}
	.note span {
		display: block;
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--yellow);
		margin-bottom: 6px;
	}
	.note textarea {
		width: 100%;
		font: inherit;
		color: var(--ink);
		padding: 10px 12px;
		border: 1px solid var(--line-strong);
		border-radius: 6px;
		background: var(--surface-2);
		resize: vertical;
	}
	.note textarea:focus {
		outline: 1px solid var(--yellow);
		border-color: var(--yellow);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
		margin-top: 12px;
	}
	.link {
		font-family: var(--mono);
		font-size: 12px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink);
		padding: 0 6px;
	}
	.danger {
		color: var(--danger);
		border-color: rgba(255, 93, 108, 0.45);
		margin-left: auto;
	}
	.danger:hover {
		background: var(--danger);
		border-color: var(--danger);
		color: var(--tunnel);
	}
	.preview {
		margin-top: 20px;
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.preview summary {
		cursor: pointer;
	}
	.preview pre {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 6px;
		padding: 12px;
		max-height: 360px;
		overflow: auto;
		white-space: pre-wrap;
		font-size: 12px;
		letter-spacing: 0;
		text-transform: none;
		color: var(--ink);
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
