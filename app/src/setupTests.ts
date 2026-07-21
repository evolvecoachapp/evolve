// Global Jest setup to mock Expo native modules that Jest environment doesn't provide.
// Mirrors per-test mocks elsewhere in the codebase.

// Prevent expo-asset resolution errors
jest.mock("expo-asset", () => ({ Asset: { fromModule: () => ({}) } }), { virtual: true });

// Prevent expo-font FontLoader requiring expo-asset during tests
jest.mock("expo-font", () => ({ loadAsync: async () => {} }), { virtual: true });

// AsyncStorage has no native module under Jest — mock the package globally.
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));
