import type { RepositoryAdapterBundle } from "../../../infrastructure/repositories/application";
import { RepositoryAdapterFactory } from "../../../infrastructure/repositories/application";
import type { SQLiteAdapter } from "../../../infrastructure/sqlite/application/SQLiteAdapter";
import {
  SQLiteAdapterFactory,
  type SQLiteAdapterBundle,
} from "../../../infrastructure/sqlite/application";
import type { SQLiteConnection } from "../../../infrastructure/sqlite/connection/SQLiteConnection";
import type { SQLiteRepositories } from "../../../infrastructure/sqlite/repositories";
import type { CompositionConfiguration } from "../configuration/CompositionConfiguration";

/**
 * Selects SQLite-backed persistence contract repositories for runtime hydration
 * and write-through. Training Intelligence repositories remain in-memory via
 * {@link RepositoryProvider}.
 */
export class PersistenceRepositoryProvider {
  private sqliteBundle: SQLiteAdapterBundle | undefined;
  private adapterBundle: RepositoryAdapterBundle | undefined;

  constructor(
    private readonly configuration: CompositionConfiguration,
  ) {
    void this.configuration; // locked to sqlite for this sprint
  }

  /** Shared SQLite connection for the process-wide Composition Root graph. */
  createSQLiteConnection(): SQLiteConnection {
    return this.getSQLiteBundle().connection;
  }

  /** SQLite adapter bound to an existing connection. */
  createSQLiteAdapter(connection: SQLiteConnection): SQLiteAdapter {
    return SQLiteAdapterFactory.create({ connection }).adapter;
  }

  /** Persistence contract repositories backed by the SQLite engine. */
  createSQLiteRepositories(adapter: SQLiteAdapter): SQLiteRepositories {
    return adapter.repositories;
  }

  /** Repository adapters delegating to SQLite repositories. */
  createRepositoryAdapterBundle(
    repositories: SQLiteRepositories,
  ): RepositoryAdapterBundle {
    if (!this.adapterBundle) {
      this.adapterBundle = RepositoryAdapterFactory.create({ repositories });
    }
    return this.adapterBundle;
  }

  private getSQLiteBundle(): SQLiteAdapterBundle {
    if (!this.sqliteBundle) {
      this.sqliteBundle = SQLiteAdapterFactory.create();
    }
    return this.sqliteBundle;
  }
}
