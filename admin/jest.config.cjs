/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  setupFiles: ["<rootDir>/src/setupPolyfills.cjs"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  moduleNameMapper: {
    "\\.(css)$": "identity-obj-proxy",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.json",
        diagnostics: false,
      },
    ],
  },
  globals: {
    __API_BASE_URL__: "",
  },
};
