/**
 * Key-value storage contract for conversation persistence.
 *
 * Callers own serialization. No AsyncStorage / MMKV / SQLite here —
 * concrete adapters live outside domain services.
 */
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;

  setItem(key: string, value: string): Promise<void>;

  removeItem(key: string): Promise<void>;

  /** All keys currently stored. */
  keys(): Promise<readonly string[]>;

  /** Remove every key. */
  clear(): Promise<void>;
}
