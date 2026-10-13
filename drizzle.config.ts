import { defineConfig } from 'drizzle-kit';

// drizzle-kit reads this file; the app reads the same variable through Effect
// Config in src/lib/server/db/SqliteReflectionStore.ts.
export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dbCredentials: { url: process.env.DATABASE_PATH ?? 'data/coaching.db' }
});
