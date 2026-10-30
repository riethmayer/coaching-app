<script lang="ts">
	// The AI builder wheel: four overlapping circles, one ring segment per
	// aspect, overlap labels where the circles meet, the full stop at the
	// centre. Segments are tinted by score; the highlighted aspect gets a cream
	// outline.
	import {
		ASPECTS,
		OVERLAPS,
		QUADRANTS,
		SCALE,
		type AspectId,
		type QuadrantId
	} from '#lib/domain/framework.js';

	interface Props {
		scores?: Partial<Record<AspectId, number>>;
		highlight?: AspectId;
	}
	let { scores = {}, highlight }: Props = $props();

	type Bound = { ang: number; cut?: undefined } | { cut: 'x' | 'y'; ang?: undefined };
	interface Circle {
		cx: number;
		cy: number;
		sx: number;
		sy: number;
		label: [number, number];
		segs: ReadonlyArray<[AspectId, Bound, Bound]>;
	}

	const W = { mid: 500, off: 115, R: 200, R2: 275 };
	// Segments run clockwise in the order the pillar lists its aspects. Angles are
	// counter-clockwise from 3 o'clock. The centre lines cut the two end segments
	// of each arc at a slant, so those get 42 degrees and the middle two 33.
	const WHEEL: Record<QuadrantId, Circle> = {
		judgement: {
			cx: 385,
			cy: 385,
			sx: -1,
			sy: -1,
			label: [310, 330],
			segs: [
				['craft', { cut: 'x' }, { ang: 102 }],
				['pace', { ang: 102 }, { ang: 135 }],
				['focus', { ang: 135 }, { ang: 168 }],
				['role', { ang: 168 }, { cut: 'y' }]
			]
		},
		delegation: {
			cx: 615,
			cy: 385,
			sx: 1,
			sy: -1,
			label: [690, 330],
			segs: [
				['compute', { cut: 'y' }, { ang: 12 }],
				['autonomy', { ang: 12 }, { ang: 45 }],
				['done', { ang: 45 }, { ang: 78 }],
				['context', { ang: 78 }, { cut: 'x' }]
			]
		},
		ownership: {
			cx: 615,
			cy: 615,
			sx: 1,
			sy: 1,
			label: [690, 672],
			segs: [
				['portfolio', { cut: 'x' }, { ang: 282 }],
				['feedback', { ang: 282 }, { ang: 315 }],
				['guardrails', { ang: 315 }, { ang: 348 }],
				['accountability', { ang: 348 }, { cut: 'y' }]
			]
		},
		initiative: {
			cx: 385,
			cy: 615,
			sx: -1,
			sy: 1,
			label: [310, 672],
			segs: [
				['adoption', { cut: 'y' }, { ang: 192 }],
				['alignment', { ang: 192 }, { ang: 225 }],
				['ambition', { ang: 225 }, { ang: 258 }],
				['strategy', { ang: 258 }, { cut: 'x' }]
			]
		}
	};
	const OVERLAP_POS = {
		leverage: [500, 345],
		clarity: [330, 512],
		center: [500, 512],
		reliability: [670, 512],
		outcomes: [500, 680]
	} as const;

	const rad = (d: number) => (d * Math.PI) / 180;
	const pt = ([x, y]: [number, number]) => `${x.toFixed(1)} ${y.toFixed(1)}`;

	// A boundary is either an explicit angle or the centre line (x or y) that
	// the ring is cut by; the cut point is where the circle of radius r meets it.
	function bpt(c: Circle, b: Bound, r: number): [number, number] {
		if (b.ang !== undefined)
			return [c.cx + r * Math.cos(rad(b.ang)), c.cy - r * Math.sin(rad(b.ang))];
		const h = Math.sqrt(r * r - W.off * W.off);
		return b.cut === 'x' ? [W.mid, c.cy + c.sy * h] : [c.cx + c.sx * h, W.mid];
	}
	function bang(c: Circle, b: Bound, near: number): number {
		if (b.ang !== undefined) return b.ang;
		const a = ([x, y]: [number, number]) => (Math.atan2(-(y - c.cy), x - c.cx) * 180) / Math.PI;
		let d = (a(bpt(c, b, W.R)) + a(bpt(c, b, W.R2))) / 2;
		while (d - near > 180) d -= 360;
		while (near - d > 180) d += 360;
		return d;
	}
	function segPath(c: Circle, a: Bound, b: Bound): string {
		const ai = bpt(c, a, W.R),
			bi = bpt(c, b, W.R),
			bo = bpt(c, b, W.R2),
			ao = bpt(c, a, W.R2);
		return `M${pt(ai)} A${W.R} ${W.R} 0 0 0 ${pt(bi)} L${pt(bo)} A${W.R2} ${W.R2} 0 0 1 ${pt(ao)} Z`;
	}

	const name = (id: AspectId) => ASPECTS.find((a) => a.id === id)?.name ?? id;

	const segments = $derived(
		QUADRANTS.flatMap((q) => {
			const c = WHEEL[q.id];
			return c.segs.map(([aspect, a, b]) => {
				const near = a.ang ?? b.ang ?? 0;
				const tm = (bang(c, a, near) + bang(c, b, near)) / 2;
				const rm = (W.R + W.R2) / 2;
				const x = c.cx + rm * Math.cos(rad(tm));
				const y = c.cy - rm * Math.sin(rad(tm));
				// Normalise to (-180, 180] first: a mid-angle past 360 (a segment that
				// crosses 0°) must not come out upside down against its neighbours.
				let rot = ((((90 - tm) % 360) + 540) % 360) - 180;
				if (rot <= -100 || rot >= 100) rot += 180;
				const v = scores[aspect];
				return {
					aspect,
					d: segPath(c, a, b),
					x,
					y,
					rot,
					score: v === undefined ? undefined : Math.round(v),
					hit: highlight === aspect
				};
			});
		})
	);
</script>

<div class="wheel">
	<svg
		viewBox="100 100 800 800"
		xmlns="http://www.w3.org/2000/svg"
		role="img"
		aria-label="AI builder wheel: four pillars, sixteen aspects, tinted by score"
	>
		{#each segments as s (s.aspect)}
			<path class="seg {s.score === undefined ? '' : `s${s.score}`}" class:hit={s.hit} d={s.d}
				><title>{name(s.aspect)}</title></path
			>
		{/each}
		{#each QUADRANTS as q (q.id)}
			<circle class="circle" cx={WHEEL[q.id].cx} cy={WHEEL[q.id].cy} r={W.R} />
		{/each}
		{#each segments as s (s.aspect)}
			<text
				class="seglbl {s.score === undefined ? '' : `s${s.score}`}"
				class:hit={s.hit}
				x={s.x.toFixed(1)}
				y={s.y.toFixed(1)}
				text-anchor="middle"
				dominant-baseline="middle"
				transform="rotate({s.rot.toFixed(1)} {s.x.toFixed(1)} {s.y.toFixed(1)})"
				>{name(s.aspect).toUpperCase()}</text
			>
		{/each}
		{#each QUADRANTS as q (q.id)}
			{@const [lx, ly] = WHEEL[q.id].label}
			{@const words = q.name.toUpperCase().split(' ')}
			<text class="area" x={lx} y={ly} text-anchor="middle"
				>{#if words.length === 1}<tspan x={lx} dy="0.35em">{words[0]}</tspan>{:else}<tspan
						x={lx}
						dy="-0.35em">{words[0]}</tspan
					><tspan x={lx} dy="1.05em">{words.slice(1).join(' ')}</tspan>{/if}</text
			>
		{/each}
		{#each OVERLAPS as o (o.key)}
			{#if o.key === 'center'}
				<text
					class="center"
					x={OVERLAP_POS.center[0]}
					y={OVERLAP_POS.center[1]}
					text-anchor="middle"
					dominant-baseline="middle">{o.name.toUpperCase()}</text
				>
			{:else}
				<text
					class="ov"
					x={OVERLAP_POS[o.key][0]}
					y={OVERLAP_POS[o.key][1]}
					text-anchor="middle"
					dominant-baseline="middle">{o.name.toUpperCase()}</text
				>
			{/if}
		{/each}
	</svg>
	<div class="legend">
		<span><i class="l-none"></i>Not scored</span>
		{#each SCALE as stop (stop.value)}
			<span><i class="l-{stop.value}"></i>{stop.short}</span>
		{/each}
	</div>
</div>

<style>
	.wheel {
		margin: 0 auto;
		max-width: 520px;
	}
	svg {
		width: 100%;
		height: auto;
		display: block;
	}
	.seg {
		fill: var(--surface);
		stroke: var(--line-strong);
		stroke-width: 2;
		transition: fill 0.2s;
	}
	.seg.s0 {
		fill: rgba(82, 199, 130, 0.3);
	}
	.seg.s1 {
		fill: rgba(143, 105, 11, 0.55);
	}
	.seg.s2 {
		fill: var(--amber);
	}
	.seg.s3 {
		fill: var(--yellow);
	}
	.seg.hit {
		stroke: var(--cream);
		stroke-width: 4;
	}
	.circle {
		fill: none;
		stroke: var(--line-strong);
		stroke-width: 2;
	}
	.seglbl {
		font-family: var(--mono);
		font-size: 14px;
		letter-spacing: 0.12em;
		fill: var(--cream);
	}
	.seglbl.s2,
	.seglbl.s3 {
		fill: var(--tunnel);
	}
	.seglbl.hit {
		font-weight: 600;
	}
	.area {
		font-family: var(--display);
		font-size: 26px;
		font-weight: 700;
		letter-spacing: -0.01em;
		fill: var(--cream);
	}
	.ov {
		font-family: var(--mono);
		font-size: 15px;
		letter-spacing: 0.14em;
		fill: var(--rail);
	}
	.center {
		font-family: var(--display);
		font-size: 34px;
		font-weight: 800;
		fill: var(--yellow);
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
		justify-content: center;
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted);
		margin-top: 10px;
	}
	.legend i {
		display: inline-block;
		width: 11px;
		height: 11px;
		border-radius: 2px;
		border: 1px solid var(--line-strong);
		vertical-align: -1px;
		margin-right: 6px;
		background: var(--surface);
	}
	.l-0 {
		background: rgba(82, 199, 130, 0.3) !important;
	}
	.l-1 {
		background: rgba(143, 105, 11, 0.55) !important;
	}
	.l-2 {
		background: var(--amber) !important;
	}
	.l-3 {
		background: var(--yellow) !important;
	}
</style>
