import { resetSQLiteTestDatabases } from "./__mocks__/expo-sqlite";

afterEach(() => {
  resetSQLiteTestDatabases();
});
