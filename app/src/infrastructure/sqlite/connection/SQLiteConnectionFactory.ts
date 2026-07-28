import { SQLiteConnection, type SQLiteConnectionOptions } from "./SQLiteConnection";

export interface SQLiteConnectionFactoryDeps {
  readonly connection?: SQLiteConnection;
  readonly options?: SQLiteConnectionOptions;
}

/**
 * Creates SQLite connections. No domain logic.
 */
export const SQLiteConnectionFactory = {
  create(deps: SQLiteConnectionFactoryDeps = {}): SQLiteConnection {
    return deps.connection ?? new SQLiteConnection(deps.options);
  },
} as const;
