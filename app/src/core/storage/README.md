# Storage

Storage abstraction.

Wrappers around AsyncStorage, SecureStore, or future storage engines.

## Layout

| File | Role |
|------|------|
| `StorageAdapter.ts` | Key-value string contract (`getItem` / `setItem` / `removeItem`) |
| `AsyncStorageAdapter.ts` | Production adapter over `@react-native-async-storage/async-storage` |
| `InMemoryStorageAdapter.ts` | Map-backed adapter for unit tests |

Feature repositories (e.g. workout history) depend on `StorageAdapter`, never on AsyncStorage directly.
