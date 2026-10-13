import { serverRuntime } from '#lib/server/runtime.js';

// adapter-node emits this before the process exits. Disposing the runtime
// releases the layer, which closes the database.
process.on('sveltekit:shutdown', () => {
	void serverRuntime.dispose();
});
