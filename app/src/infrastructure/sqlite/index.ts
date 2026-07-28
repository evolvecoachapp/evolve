/**
 * SQLite Infrastructure Adapter (Sprint 30.1).
 *
 * Domain → Persistence Contracts → SQLite Adapter → SQLite Database
 *
 * The Domain never imports this module.
 * No React Native. No Expo. No cloud sync. No auth. No networking. No business logic.
 */

export * from "./connection";
export * from "./repositories";
export * from "./mappers";
export * from "./transactions";
export * from "./health";
export {
  SQLiteAdapter,
} from "./application/SQLiteAdapter";
export {
  SQLiteAdapterFactory,
  getSQLiteHealth,
  getSQLiteRepositories,
  getSQLiteConnection,
  validateSQLite,
  type SQLiteAdapterBundle,
  type SQLiteAdapterFactoryDeps,
  type SQLiteValidation,
} from "./application";
export { validateSQLiteAdapter } from "./application/validation";
