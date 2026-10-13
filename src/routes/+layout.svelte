<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
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
	<title>Founder reflection</title>
</svelte:head>

<header>
	<a class="brand" href={resolve('/')}>
		<span class="name">Founder reflection</span>
		<span class="sub">Founder Leadership System · self-coaching</span>
	</a>
	<nav>
		<a href={resolve('/reflect')} aria-current={path.endsWith('/reflect') ? 'page' : undefined}>
			Reflect <small>{done}/{STATEMENTS.length}</small>
		</a>
		<a href={resolve('/plan')} aria-current={path.endsWith('/plan') ? 'page' : undefined}>Plan</a>
	</nav>
</header>

{#if reflection.error}
	<p class="error">Something went wrong: {reflection.error}. Your last saved answers are kept.</p>
{/if}

<main>
	{@render children()}
</main>

<footer>
	Framework: Founder Coach's Founder Leadership System. Answers are stored on this server.
</footer>

<style>
	:global(*) {
		box-sizing: border-box;
	}
	:global(html) {
		background: #f7f5f0;
		color: #2b2b2b;
		font:
			16px/1.5 system-ui,
			-apple-system,
			'Segoe UI',
			sans-serif;
	}
	:global(body) {
		margin: 0;
	}
	:global(h1, h2, h3) {
		font-family: Georgia, 'Times New Roman', serif;
		font-weight: 600;
		line-height: 1.15;
		margin: 0 0 12px;
	}
	:global(h1) {
		font-size: 36px;
	}
	:global(h2) {
		font-size: 26px;
	}
	:global(h3) {
		font-size: 20px;
	}
	:global(button.primary) {
		background: #d9542b;
		color: #fff;
		border: 0;
		border-radius: 999px;
		padding: 12px 22px;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}
	:global(button.primary:disabled) {
		opacity: 0.45;
		cursor: not-allowed;
	}
	:global(button.ghost) {
		background: transparent;
		color: #2b2b2b;
		border: 1px solid #cfcdc8;
		border-radius: 999px;
		padding: 11px 20px;
		font: inherit;
		cursor: pointer;
	}
	:global(a.button) {
		display: inline-block;
		background: #d9542b;
		color: #fff;
		border-radius: 999px;
		padding: 12px 22px;
		font-weight: 600;
		text-decoration: none;
	}
	:global(.muted) {
		color: #6b6b66;
	}
	:global(.badge) {
		display: inline-block;
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		border-radius: 999px;
		padding: 3px 10px;
		background: #ece9e1;
		color: #2b2b2b;
	}
	:global(.badge.urgent) {
		background: #e8aaa0;
	}
	:global(.badge.important) {
		background: #efdcb4;
	}
	:global(.badge.improve) {
		background: #f5ecd9;
	}
	:global(.badge.good) {
		background: #dcefe4;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 24px;
		padding: 20px 48px;
		border-bottom: 1px solid #e3e0d8;
	}
	.brand {
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
	}
	.brand .name {
		font-family: Georgia, serif;
		font-size: 22px;
		font-weight: 700;
	}
	.brand .sub {
		font-size: 11px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #8a8a84;
	}
	nav {
		display: flex;
		gap: 8px;
	}
	nav a {
		text-decoration: none;
		color: #2b2b2b;
		border: 1px solid #cfcdc8;
		border-radius: 999px;
		padding: 8px 16px;
		font-size: 14px;
	}
	nav a[aria-current='page'] {
		background: #2b2b2b;
		color: #fff;
		border-color: #2b2b2b;
	}
	nav small {
		opacity: 0.7;
		margin-left: 4px;
	}
	main {
		max-width: 1240px;
		margin: 0 auto;
		padding: 36px 48px 80px;
	}
	footer {
		border-top: 1px solid #e3e0d8;
		margin: 0 48px;
		padding: 24px 0;
		color: #8a8a84;
		font-size: 13px;
	}
	.error {
		max-width: 1240px;
		margin: 16px auto 0;
		padding: 12px 48px;
		color: #a33a1f;
	}
	@media (max-width: 720px) {
		header,
		main,
		.error {
			padding-left: 20px;
			padding-right: 20px;
		}
		footer {
			margin: 0 20px;
		}
	}
</style>
