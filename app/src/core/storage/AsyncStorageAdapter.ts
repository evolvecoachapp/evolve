import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StorageAdapter } from "./StorageAdapter";

/**
 * Production `StorageAdapter` backed by React Native AsyncStorage.
 * Read failures resolve to `null` so callers can degrade gracefully.
 */
export class AsyncStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
}
