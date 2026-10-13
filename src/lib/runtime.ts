// Composition root. The browser runtime wires the application service to the
// app's HTTP API; everything Svelte runs goes through this one ManagedRuntime.
import { Layer, ManagedRuntime } from 'effect';
import { FetchHttpClient } from 'effect/http';
import { ReflectionStore } from './services/ReflectionStore';
import { Reflections } from './services/Reflections';

export const API_URL = '/api/reflection';

export const appLayer = Reflections.layerNoDeps.pipe(
	Layer.provide(
		ReflectionStore.layerHttp({ url: API_URL }).pipe(Layer.provide(FetchHttpClient.layer))
	)
);

export const runtime = ManagedRuntime.make(appLayer);
