import type { StorageAdapter } from "./StorageAdapter";

/**
 * Map-backed `StorageAdapter` for unit tests and local fixtures.
 * Does not touch AsyncStorage.
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

  /** Test helper — wipe all keys. */
  clear(): void {
    this.store.clear();
  }
}
