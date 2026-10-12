<script lang="ts">
	// The Founder Leadership System wheel: four overlapping circles, one ring
	// segment per aspect, overlap labels where the circles meet. Segments are
	// tinted by score and the highlighted aspect gets a dark outline.
	import {
		ASPECTS,
		OVERLAPS,
		QUADRANTS,
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
	const WHEEL: Record<QuadrantId, Circle> = {
		elevate_yourself: {
			cx: 385,
			cy: 385,
			sx: -1,
			sy: -1,
			label: [310, 330],
			segs: [
				['energy', { cut: 'x' }, { ang: 110 }],
				['meetings', { ang: 110 }, { ang: 160 }],
				['role', { ang: 160 }, { cut: 'y' }]
			]
		},
		activate_your_team: {
			cx: 615,
			cy: 385,
			sx: 1,
			sy: -1,
			label: [690, 330],
			segs: [
				['culture', { cut: 'y' }, { ang: 20 }],
				['coaching', { ang: 20 }, { ang: 70 }],
				['talent', { ang: 70 }, { cut: 'x' }]
			]
		},
		dominate_your_market: {
			cx: 615,
			cy: 615,
			sx: 1,
			sy: 1,
			label: [690, 672],
			segs: [
				['growth', { cut: 'x' }, { ang: 290 }],
				['ma', { ang: 290 }, { ang: 340 }],
				['fundraising', { ang: 340 }, { cut: 'y' }]
			]
		},
		communicate_your_vision: {
			cx: 385,
			cy: 615,
			sx: -1,
			sy: 1,
			label: [310, 672],
			segs: [
				['storytelling', { cut: 'y' }, { ang: 200 }],
				['strategy', { ang: 200 }, { ang: 250 }],
				['alignment', { ang: 250 }, { cut: 'x' }]
			]
		}
	};
	const OVERLAP_POS = {
		freedom: [500, 345],
		clarity: [330, 512],
		tenx: [500, 512],
		results: [670, 512],
		impact: [500, 680]
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
				let rot = 90 - tm;
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
		aria-label="Founder Leadership System wheel"
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
				class="seglbl"
				class:hit={s.hit}
				x={s.x.toFixed(1)}
				y={s.y.toFixed(1)}
				text-anchor="middle"
				dominant-baseline="middle"
				transform="rotate({s.rot.toFixed(1)} {s.x.toFixed(1)} {s.y.toFixed(1)})"
				>{name(s.aspect)}</text
			>
		{/each}
		{#each QUADRANTS as q (q.id)}
			{@const [lx, ly] = WHEEL[q.id].label}
			{@const words = q.name.split(' ')}
			<text class="area" x={lx} y={ly} text-anchor="middle"
				><tspan x={lx} dy="-0.35em">{words[0]}</tspan><tspan x={lx} dy="1.15em"
					>{words.slice(1).join(' ')}</tspan
				></text
			>
		{/each}
		{#each OVERLAPS as o (o.key)}
			<text
				class="ov {o.key}"
				x={OVERLAP_POS[o.key][0]}
				y={OVERLAP_POS[o.key][1]}
				text-anchor="middle"
				dominant-baseline="middle">{o.name.toUpperCase()}</text
			>
		{/each}
	</svg>
	<div class="legend">
		<span><i style="background:#fff"></i>Not scored</span>
		<span><i style="background:#dcefe4"></i>I'm good here</span>
		<span><i style="background:#f5ecd9"></i>I can improve</span>
		<span><i style="background:#efdcb4"></i>Important</span>
		<span><i style="background:#e8aaa0"></i>Urgent</span>
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
		fill: #fff;
		stroke: #cfcdc8;
		stroke-width: 2.5;
		transition: fill 0.2s;
	}
	.seg.s0 {
		fill: #dcefe4;
	}
	.seg.s1 {
		fill: #f5ecd9;
	}
	.seg.s2 {
		fill: #efdcb4;
	}
	.seg.s3 {
		fill: #e8aaa0;
	}
	.seg.hit {
		stroke: #2b2b2b;
		stroke-width: 4;
	}
	.circle {
		fill: #fff;
		fill-opacity: 0.55;
		stroke: #cfcdc8;
		stroke-width: 3;
	}
	.seglbl {
		font-family: 'Bradley Hand', 'Chalkboard SE', 'Segoe Print', 'Comic Sans MS', cursive;
		font-size: 30px;
		fill: #2b2b2b;
	}
	.seglbl.hit {
		font-weight: 700;
	}
	.area {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 24px;
		font-weight: 600;
		fill: #3b5bdb;
	}
	.ov {
		font-family: system-ui, sans-serif;
		font-size: 19px;
		letter-spacing: 0.12em;
		fill: #2f7a4f;
	}
	.ov.tenx {
		fill: #c8502d;
		font-size: 26px;
		font-weight: 700;
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
		justify-content: center;
		font-size: 12px;
		color: #6b6b66;
		margin-top: 8px;
	}
	.legend i {
		display: inline-block;
		width: 12px;
		height: 12px;
		border-radius: 3px;
		border: 1px solid #cfcdc8;
		vertical-align: -2px;
		margin-right: 4px;
	}
</style>
