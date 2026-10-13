import type { RequestEvent } from './$types';
import { beforeAll, describe, expect, it, vi } from 'vitest';

// The server runtime reads its database path from the environment the first
// time a handler runs; point it at an in-memory database before that.
beforeAll(() => {
	vi.stubEnv('DATABASE_PATH', ':memory:');
});

const event = (request: Request) => ({ request }) as unknown as RequestEvent;
const url = 'http://app.test/api/reflection';
const body = {
	scores: [{ statement: 's01', score: 2 }],
	notes: [],
	commitments: [{ action: 'role.only-i-can' }],
	updatedAt: '2026-10-12T20:00:00.000Z'
};

describe('/api/reflection', () => {
	it('GET is 204 while nothing is stored, then returns what PUT stored', async () => {
		const { GET, PUT } = await import('./+server');
		expect((await GET(event(new Request(url)))).status).toBe(204);
		const put = await PUT(event(new Request(url, { method: 'PUT', body: JSON.stringify(body) })));
		expect(put.status).toBe(204);
		const get = await GET(event(new Request(url)));
		expect(get.status).toBe(200);
		expect(await get.json()).toEqual(body);
	});

	it('PUT rejects a body that is not a reflection', async () => {
		const { PUT } = await import('./+server');
		const bad = await PUT(
			event(new Request(url, { method: 'PUT', body: JSON.stringify({ scores: 'no' }) }))
		);
		expect(bad.status).toBe(400);
		const notJson = await PUT(event(new Request(url, { method: 'PUT', body: '{' })));
		expect(notJson.status).toBe(400);
	});

	it('DELETE clears the reflection', async () => {
		const { GET, PUT, DELETE } = await import('./+server');
		await PUT(event(new Request(url, { method: 'PUT', body: JSON.stringify(body) })));
		expect((await DELETE(event(new Request(url, { method: 'DELETE' })))).status).toBe(204);
		expect((await GET(event(new Request(url)))).status).toBe(204);
	});
});
