import type { SQLiteConnection } from "../connection/SQLiteConnection";
import {
  SQLiteConnectionFactory,
  type SQLiteConnectionFactoryDeps,
} from "../connection/SQLiteConnectionFactory";
import type { SQLiteHealthReport } from "../health/ConnectionHealth";
import type { SQLiteRepositories } from "../repositories";
import { SQLiteAdapter } from "./SQLiteAdapter";
import {
  validateSQLiteAdapter,
  type SQLiteValidation,
} from "./validation";

export interface SQLiteAdapterBundle {
  readonly connection: SQLiteConnection;
  readonly adapter: SQLiteAdapter;
  readonly repositories: SQLiteRepositories;
}

export interface SQLiteAdapterFactoryDeps extends SQLiteConnectionFactoryDeps {
  readonly adapter?: SQLiteAdapter;
  readonly bundle?: SQLiteAdapterBundle;
}

export const SQLiteAdapterFactory = {
  create(deps: SQLiteAdapterFactoryDeps = {}): SQLiteAdapterBundle {
    if (deps.bundle) {
      return deps.bundle;
    }
    const connection = SQLiteConnectionFactory.create(deps);
    const adapter = deps.adapter ?? new SQLiteAdapter(connection);
    return Object.freeze({
      connection,
      adapter,
      repositories: adapter.repositories,
    });
  },
} as const;

/** Application API — SQLite health report. */
export function getSQLiteHealth(options: {
  readonly connection?: SQLiteConnection;
  readonly adapter?: SQLiteAdapter;
  readonly deps?: SQLiteAdapterFactoryDeps;
} = {}): SQLiteHealthReport {
  if (options.adapter) {
    return options.adapter.getHealthReport();
  }
  if (options.connection) {
    return options.connection.health.report();
  }
  return SQLiteAdapterFactory.create(options.deps).adapter.getHealthReport();
}

/** Application API — SQLite repository implementations. */
export function getSQLiteRepositories(options: {
  readonly adapter?: SQLiteAdapter;
  readonly repositories?: SQLiteRepositories;
  readonly connection?: SQLiteConnection;
  readonly deps?: SQLiteAdapterFactoryDeps;
} = {}): SQLiteRepositories {
  if (options.repositories) {
    return options.repositories;
  }
  if (options.adapter) {
    return options.adapter.repositories;
  }
  if (options.connection) {
    return SQLiteAdapterFactory.create({
      connection: options.connection,
    }).repositories;
  }
  return SQLiteAdapterFactory.create(options.deps).repositories;
}

/** Application API — SQLite connection. */
export function getSQLiteConnection(options: {
  readonly connection?: SQLiteConnection;
  readonly adapter?: SQLiteAdapter;
  readonly deps?: SQLiteAdapterFactoryDeps;
} = {}): SQLiteConnection {
  if (options.connection) {
    return options.connection;
  }
  if (options.adapter) {
    return options.adapter.connection;
  }
  return SQLiteAdapterFactory.create(options.deps).connection;
}

/** Application API — validate SQLite adapter wiring. */
export function validateSQLite(options: {
  readonly connection?: SQLiteConnection | null;
  readonly adapter?: SQLiteAdapter | null;
  readonly repositories?: SQLiteRepositories | null;
  readonly deps?: SQLiteAdapterFactoryDeps;
} = {}): SQLiteValidation {
  const hasExplicit =
    "connection" in options ||
    "adapter" in options ||
    "repositories" in options;

  if (hasExplicit) {
    return validateSQLiteAdapter({
      connection: options.connection ?? options.adapter?.connection ?? null,
      adapter: options.adapter ?? null,
      repositories:
        options.repositories ?? options.adapter?.repositories ?? null,
    });
  }
  const bundle = SQLiteAdapterFactory.create(options.deps);
  return validateSQLiteAdapter(bundle);
}

export type { SQLiteValidation };
