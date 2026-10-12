// Markdown export of a reflection: scores, then the plan per lens with the
// committed actions ticked. Meant for a journal or an Obsidian note.
import { DateTime, Option } from 'effect';
import { plan } from './actions';
import { STATEMENTS, aspectById, scaleStop } from './framework';
import { noteOf, scoreOf, type Reflection } from './reflection';

const fmt = (n: number) => n.toFixed(1);

export const toMarkdown = (r: Reflection): string => {
	const lines: Array<string> = [];
	lines.push(`# Founder reflection · ${DateTime.formatIsoDate(r.updatedAt)}`, '');
	lines.push('## Scores', '', '| Aspect | Statement | Score |', '|---|---|---|');
	for (const st of STATEMENTS) {
		const score = scoreOf(r, st.id);
		const label = Option.match(score, {
			onNone: () => 'not scored',
			onSome: (s) => `${s} · ${scaleStop(s).label}`
		});
		lines.push(`| ${aspectById(st.aspect).name} | ${st.text} | ${label} |`);
	}
	lines.push('');
	for (const lp of plan(r)) {
		const avg = Option.match(lp.average, { onNone: () => '', onSome: (a) => ` (avg ${fmt(a)})` });
		lines.push(`## ${lp.lens.name}${avg}`, '', `_${lp.lens.question}_`, '');
		if (lp.aspects.length === 0) lines.push('Nothing to work on here right now.', '');
		for (const a of lp.aspects) {
			lines.push(`### ${a.aspect.name} · ${scaleStop(a.score).label}`, '');
			lines.push(`Outcome: ${a.aspect.outcome}`, '');
			for (const act of a.actions) {
				lines.push(`- [${act.committed ? 'x' : ' '}] ${act.title} _(${act.cadence})_`);
			}
			lines.push('');
		}
		const note = noteOf(r, lp.lens.id);
		if (note !== '') lines.push('My own commitment:', '', `> ${note.replace(/\n/g, '\n> ')}`, '');
	}
	return lines.join('\n').trimEnd() + '\n';
};
