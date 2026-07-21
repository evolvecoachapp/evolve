/**
 * Thin key-value storage contract used by feature repositories.
 *
 * Implementations wrap AsyncStorage, in-memory maps (tests), or future engines.
 * Callers own serialization; this layer only moves strings.
 */
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;

  setItem(key: string, value: string): Promise<void>;

  removeItem(key: string): Promise<void>;
}
