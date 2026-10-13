// Server composition root: the SQLite store, configured from the environment.
// Route handlers run their effects through this one ManagedRuntime.
import { ManagedRuntime } from 'effect';
import { layerSqliteConfig } from './db/SqliteReflectionStore';

export const serverRuntime = ManagedRuntime.make(layerSqliteConfig);
