<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import mark from '#lib/assets/period-mark.svg';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { STATEMENTS } from '#lib/domain/framework.js';
	import { answered } from '#lib/domain/reflection.js';
	import { reflection } from '#lib/state/reflection.svelte.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	$effect(() => {
		reflection.start();
	});

	const done = $derived(reflection.current === undefined ? 0 : answered(reflection.current));
	const path = $derived(page.url.pathname.replace(/\/$/, ''));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>AI builder reflection · Riethmayer</title>
</svelte:head>

<div class="frame">
	<span class="coords">52.52 N 13.40 E</span>
	<header>
		<a class="brand" href={resolve('/')}>
			<img class="mark" src={mark} alt="" width="36" height="36" />
			<span class="word">RIETHMAYER<i class="dot"></i></span>
			<span class="sub">/// AI builder reflection</span>
		</a>
		<nav>
			<a
				class="pill"
				href={resolve('/reflect')}
				class:on={path.endsWith('/reflect')}
				aria-current={path.endsWith('/reflect') ? 'page' : undefined}
			>
				Reflect <small>{done}/{STATEMENTS.length}</small>
			</a>
			<a
				class="pill"
				href={resolve('/plan')}
				class:on={path.endsWith('/plan')}
				aria-current={path.endsWith('/plan') ? 'page' : undefined}>Plan</a
			>
		</nav>
	</header>

	{#if reflection.error}
		<p class="error">
			<span class="k">/// Failure</span>
			{reflection.error}. Your last saved answers are kept.
		</p>
	{/if}

	<main>
		{@render children()}
	</main>

	<footer>
		<span>Answers are stored on this server. No accounts.</span>
		<span>
			Structure adapted from Founder Coach's Founder Leadership System · content for AI builders ·
			<a href="https://riethmayer.com">riethmayer.com</a>
		</span>
	</footer>
</div>

<style>
	:global(:root) {
		--tunnel: #151716;
		--charcoal: #262b29;
		--asphalt: #3b403e;
		--cream: #f7f4ea;
		--rail: #8e8f91;
		--yellow: #fac800;
		--yellow-soft: #fff1a8;
		--amber: #d89b00;
		--ochre: #8f690b;
		--magenta: #97005d;
		--success: #52c782;
		--danger: #ff5d6c;

		--bg: var(--tunnel);
		--surface: var(--charcoal);
		--surface-2: var(--asphalt);
		--ink: var(--cream);
		--muted: var(--rail);
		--line: rgba(142, 143, 145, 0.28);
		--line-strong: rgba(142, 143, 145, 0.5);

		--display: 'Barlow Condensed', 'Arial Narrow', Impact, sans-serif;
		--body: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif;
		--mono: 'IBM Plex Mono', ui-monospace, monospace;
	}
	:global(*) {
		box-sizing: border-box;
	}
	:global(html) {
		background: var(--bg);
		color: var(--ink);
		font:
			15px/1.6 var(--body),
			sans-serif;
		-webkit-font-smoothing: antialiased;
	}
	/* the one glow on the page: city-dusk */
	:global(body) {
		margin: 0;
		min-height: 100vh;
		background:
			radial-gradient(820px 520px at 16% -8%, rgba(250, 200, 0, 0.22), transparent 60%),
			radial-gradient(560px 420px at 92% 30%, rgba(151, 0, 93, 0.1), transparent 62%),
			linear-gradient(180deg, #151716 0%, #1a1d1b 52%, #151716 100%);
		background-attachment: fixed;
	}
	:global(::selection) {
		background: var(--yellow);
		color: var(--tunnel);
	}
	:global(h1),
	:global(h2) {
		font-family: var(--display);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: -0.01em;
		line-height: 0.95;
		margin: 0 0 14px;
		text-wrap: balance;
	}
	:global(h1) {
		font-size: clamp(40px, 6vw, 72px);
	}
	:global(h2) {
		font-size: 32px;
	}
	:global(h3) {
		font-family: var(--body);
		font-weight: 600;
		font-size: 18px;
		line-height: 1.3;
		margin: 0 0 8px;
	}
	:global(p) {
		margin: 0 0 12px;
	}
	:global(a) {
		color: var(--ink);
	}
	:global(.kicker) {
		font-family: var(--mono);
		font-size: 12px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--yellow);
		margin: 0 0 14px;
	}
	:global(.muted) {
		color: var(--muted);
	}
	:global(.lede) {
		font-size: 18px;
		line-height: 1.55;
		max-width: 62ch;
		color: rgba(247, 244, 234, 0.82);
	}
	:global(.card) {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 6px;
		padding: 20px 24px;
	}
	:global(.card h3.k) {
		font-family: var(--mono);
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--yellow);
		margin: 0 0 8px;
	}
	:global(a.button),
	:global(button.primary) {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		min-height: 44px;
		background: var(--yellow);
		color: var(--tunnel);
		border: 0;
		border-radius: 2px;
		padding: 12px 20px;
		font-family: var(--mono);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		text-decoration: none;
		cursor: pointer;
		transition: background 0.15s;
	}
	:global(a.button:hover),
	:global(button.primary:hover) {
		background: var(--yellow-soft);
	}
	:global(button.primary:disabled),
	:global(a.button.disabled) {
		opacity: 0.45;
		cursor: not-allowed;
		pointer-events: none;
	}
	:global(button.ghost),
	:global(a.ghost) {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		background: transparent;
		color: var(--ink);
		border: 1px solid rgba(247, 244, 234, 0.35);
		border-radius: 2px;
		padding: 11px 18px;
		font-family: var(--mono);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		text-decoration: none;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s,
			border-color 0.15s;
	}
	:global(button.ghost:hover),
	:global(a.ghost:hover) {
		border-color: var(--yellow);
		background: var(--yellow);
		color: var(--tunnel);
	}
	:global(.pill) {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		border: 1px solid var(--line-strong);
		color: var(--muted);
		border-radius: 999px;
		padding: 5px 12px;
		text-decoration: none;
		background: transparent;
	}
	:global(.pill.on) {
		background: var(--yellow);
		border-color: var(--yellow);
		color: var(--tunnel);
		font-weight: 600;
	}
	:global(.badge) {
		display: inline-block;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		border-radius: 999px;
		padding: 3px 10px;
		border: 1px solid var(--line-strong);
		color: var(--muted);
	}
	:global(.badge.urgent) {
		background: var(--yellow);
		border-color: var(--yellow);
		color: var(--tunnel);
		font-weight: 600;
	}
	:global(.badge.important) {
		border-color: var(--amber);
		color: var(--amber);
	}
	:global(.badge.improve) {
		border-color: var(--ochre);
		color: var(--yellow-soft);
	}
	:global(.badge.good) {
		border-color: var(--success);
		color: var(--success);
	}
	/* shipped claims may end in the node */
	:global(.dot) {
		display: inline-block;
		width: 0.34em;
		height: 0.34em;
		border-radius: 50%;
		border: 0.11em solid var(--yellow);
		vertical-align: baseline;
		margin-left: 0.08em;
	}
	/* one halftone dissolve zone per surface */
	:global(.halftone) {
		position: relative;
	}
	:global(.halftone::after) {
		content: '';
		position: absolute;
		inset: -10px -20px -18px;
		pointer-events: none;
		background-image: radial-gradient(circle, rgba(250, 200, 0, 0.5) 0 1.2px, transparent 1.3px);
		background-size: 8px 8px;
		-webkit-mask-image: linear-gradient(115deg, transparent 62%, rgba(0, 0, 0, 0.95) 96%);
		mask-image: linear-gradient(115deg, transparent 62%, rgba(0, 0, 0, 0.95) 96%);
	}
	@media (prefers-reduced-motion: reduce) {
		:global(*) {
			transition: none !important;
		}
	}

	/* editorial frame: hairline border, surveyor ticks on the top edge, coordinates */
	.frame {
		max-width: 1280px;
		margin: 28px auto 40px;
		border: 1px solid var(--line);
		position: relative;
		padding: 0 clamp(20px, 4vw, 48px) 0;
	}
	.frame::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 10px;
		background: repeating-linear-gradient(90deg, var(--line) 0 1px, transparent 1px 24px);
	}
	.coords {
		position: absolute;
		top: 18px;
		right: clamp(20px, 4vw, 48px);
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.14em;
		color: var(--muted);
		text-transform: uppercase;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 24px;
		padding: 44px 0 20px;
		border-bottom: 1px solid var(--line);
	}
	.brand {
		text-decoration: none;
		color: inherit;
		display: grid;
		grid-template-columns: auto auto;
		grid-template-rows: auto auto;
		column-gap: 12px;
		align-items: center;
	}
	.mark {
		grid-row: 1 / span 2;
		width: 36px;
		height: 36px;
	}
	.word {
		font-family: var(--display);
		font-size: 30px;
		font-weight: 700;
		letter-spacing: 0.02em;
		line-height: 1;
	}
	.sub {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--yellow);
	}
	nav {
		display: flex;
		gap: 8px;
		padding-bottom: 4px;
	}
	nav small {
		opacity: 0.8;
	}
	main {
		padding: 40px 0 72px;
	}
	footer {
		border-top: 1px solid var(--line);
		padding: 20px 0 24px;
		display: flex;
		justify-content: space-between;
		gap: 24px;
		flex-wrap: wrap;
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}
	footer a {
		color: var(--yellow);
		text-decoration: none;
	}
	.error {
		margin: 20px 0 0;
		padding: 14px 18px;
		border-left: 2px solid var(--danger);
		background: var(--surface);
		border-radius: 0 6px 6px 0;
	}
	.error .k {
		display: block;
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--danger);
		margin-bottom: 4px;
	}
	@media (max-width: 720px) {
		.frame {
			margin: 12px 10px 24px;
		}
		header {
			flex-direction: column;
			align-items: flex-start;
			gap: 16px;
		}
	}
</style>
