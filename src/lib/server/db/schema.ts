// Tables for the one persisted record, `Reflection`. The head row carries the
// timestamp; scores, notes and commitments reference it and go with it on
// delete, so a reset is one statement.
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const reflections = sqliteTable('reflections', {
	id: integer('id').primaryKey(),
	updatedAt: text('updated_at').notNull()
});

const reflectionId = () =>
	integer('reflection_id')
		.notNull()
		.references(() => reflections.id, { onDelete: 'cascade' });

export const scores = sqliteTable(
	'scores',
	{
		reflectionId: reflectionId(),
		statement: text('statement').notNull(),
		score: integer('score').notNull()
	},
	(t) => [primaryKey({ columns: [t.reflectionId, t.statement] })]
);

export const notes = sqliteTable(
	'notes',
	{
		reflectionId: reflectionId(),
		lens: text('lens').notNull(),
		text: text('text').notNull()
	},
	(t) => [primaryKey({ columns: [t.reflectionId, t.lens] })]
);

export const commitments = sqliteTable(
	'commitments',
	{
		reflectionId: reflectionId(),
		action: text('action').notNull()
	},
	(t) => [primaryKey({ columns: [t.reflectionId, t.action] })]
);
