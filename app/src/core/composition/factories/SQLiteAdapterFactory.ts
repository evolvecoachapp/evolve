import {
  SQLiteAdapterFactory,
  type SQLiteAdapterBundle,
  type SQLiteAdapterFactoryDeps,
} from "../../../infrastructure/sqlite/application";

export interface SQLiteAdapterCompositionFactoryDeps
  extends SQLiteAdapterFactoryDeps {}

/**
 * Composition Root factory for the SQLite infrastructure adapter.
 */
export const SQLiteAdapterCompositionFactory = {
  create(
    deps: SQLiteAdapterCompositionFactoryDeps = {},
  ): SQLiteAdapterBundle {
    return SQLiteAdapterFactory.create(deps);
  },
} as const;

export type { SQLiteAdapterBundle, SQLiteAdapterFactoryDeps };
