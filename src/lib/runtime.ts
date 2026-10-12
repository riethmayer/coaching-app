// Composition root. The browser runtime wires the application service to Web
// Storage; everything Svelte runs goes through this one ManagedRuntime.
import { Layer, ManagedRuntime } from 'effect';
import { ReflectionStore } from './services/ReflectionStore';
import { Reflections } from './services/Reflections';

export const STORAGE_KEY = 'coaching-app/reflection/v1';

export const appLayer = Reflections.layerNoDeps.pipe(
	Layer.provide(
		ReflectionStore.layerWebStorage({ key: STORAGE_KEY, storage: globalThis.localStorage })
	)
);

export const runtime = ManagedRuntime.make(appLayer);
