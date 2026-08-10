module.exports = {
  preset: "jest-expo",
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.test.{ts,tsx}"],
  setupFiles: ["<rootDir>/src/setupTests.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTestsAfterEnv.ts"],
  moduleNameMapper: {
    "^expo-asset$": "<rootDir>/src/__mocks__/expo-asset.js",
    "^expo-font$": "<rootDir>/src/__mocks__/expo-font.js",
    "^expo-sqlite$": "<rootDir>/src/__mocks__/expo-sqlite.js",
    "^@expo/vector-icons$": "<rootDir>/src/__mocks__/@expo-vector-icons.js",
  },
};
