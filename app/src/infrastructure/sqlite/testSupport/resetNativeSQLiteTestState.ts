import { resetSQLiteTestDatabases } from "../../../__mocks__/expo-sqlite";

/** Clears mocked native SQLite database files between tests. */
export function resetNativeSQLiteTestState(): void {
  resetSQLiteTestDatabases();
}
