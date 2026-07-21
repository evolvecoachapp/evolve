import type { StorageAdapter } from "./StorageAdapter";

/**
 * Map-backed StorageAdapter for tests and ephemeral local use.
 *
 * Does not touch AsyncStorage, MMKV, or SQLite.
 */
export class InMemoryStorageAdapter implements StorageAdapter {
  private readonly store = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.store.has(key) ? (this.store.get(key) ?? null) : null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }

  async keys(): Promise<readonly string[]> {
    return Object.freeze([...this.store.keys()]);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}
