/**
 * Jest mock for expo-sqlite — simulates persistent file-backed databases in memory.
 * Each database name retains state across openDatabaseSync calls (app restart simulation).
 */

const databases = new Map();

function createEmptyState() {
  return {
    tables: new Map(),
    kv: new Map(),
    meta: new Map(),
    inTransaction: false,
    snapshot: null,
    openHandles: 0,
    closed: false,
  };
}

function getOrCreateState(databaseName) {
  if (!databases.has(databaseName)) {
    databases.set(databaseName, createEmptyState());
  }
  return databases.get(databaseName);
}

function captureState(state) {
  const tables = new Map();
  for (const [name, table] of state.tables) {
    tables.set(name, new Map(table));
  }
  return {
    tables,
    kv: new Map(state.kv),
    meta: new Map(state.meta),
  };
}

function restoreState(state, snapshot) {
  state.tables = new Map();
  for (const [name, table] of snapshot.tables) {
    state.tables.set(name, new Map(table));
  }
  state.kv = new Map(snapshot.kv);
  state.meta = new Map(snapshot.meta);
}

function ensureTable(state, tableName) {
  if (!state.tables.has(tableName)) {
    state.tables.set(tableName, new Map());
  }
}

function parseCreateTable(sql) {
  const match = sql.match(
    /CREATE TABLE IF NOT EXISTS "([^"]+)"\s*\(\s*id TEXT PRIMARY KEY NOT NULL,\s*payload TEXT NOT NULL\s*\)/i,
  );
  return match ? match[1] : null;
}

function parseTableFromSelect(sql) {
  const match = sql.match(/FROM "([^"]+)"/i);
  return match ? match[1] : null;
}

function parseTableFromInsert(sql) {
  const match = sql.match(/INSERT INTO "([^"]+)"/i);
  return match ? match[1] : null;
}

function parseTableFromDelete(sql) {
  const match = sql.match(/DELETE FROM "([^"]+)"/i);
  return match ? match[1] : null;
}

function createDatabaseInterface(databaseName, state) {
  state.openHandles += 1;
  state.closed = false;

  const assertOpen = () => {
    if (state.closed) {
      throw new Error("SQLite connection is closed");
    }
  };

  const execSync = (source) => {
    assertOpen();
    const statements = source
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean);

    for (const statement of statements) {
      if (/^PRAGMA journal_mode/i.test(statement)) {
        continue;
      }
      if (/^CREATE TABLE IF NOT EXISTS kv/i.test(statement)) {
        continue;
      }
      if (/^CREATE TABLE IF NOT EXISTS meta/i.test(statement)) {
        continue;
      }
      const tableName = parseCreateTable(statement);
      if (tableName) {
        ensureTable(state, tableName);
        continue;
      }
      if (/^BEGIN IMMEDIATE/i.test(statement)) {
        if (state.inTransaction) {
          throw new Error("Transaction already open");
        }
        state.snapshot = captureState(state);
        state.inTransaction = true;
        continue;
      }
      if (/^COMMIT/i.test(statement)) {
        if (!state.inTransaction) {
          throw new Error("No transaction to commit");
        }
        state.snapshot = null;
        state.inTransaction = false;
        continue;
      }
      if (/^ROLLBACK/i.test(statement)) {
        if (!state.inTransaction) {
          throw new Error("No transaction to rollback");
        }
        restoreState(state, state.snapshot);
        state.snapshot = null;
        state.inTransaction = false;
        continue;
      }
      throw new Error(`Unsupported mock SQL: ${statement}`);
    }
  };

  const runSync = (source, ...params) => {
    assertOpen();

    const upsertRepo = source.match(
      /INSERT INTO "([^"]+)" \(id, payload\) VALUES \(\?, \?\)\s*ON CONFLICT\(id\) DO UPDATE SET payload = excluded\.payload/i,
    );
    if (upsertRepo) {
      const tableName = upsertRepo[1];
      ensureTable(state, tableName);
      const [id, payload] = params;
      state.tables.get(tableName).set(id, { id, payload });
      return { changes: 1, lastInsertRowId: 0 };
    }

    const deleteRepo = source.match(/DELETE FROM "([^"]+)" WHERE id = \?/i);
    if (deleteRepo) {
      const tableName = deleteRepo[1];
      const id = params[0];
      const table = state.tables.get(tableName);
      const existed = table?.delete(id) ?? false;
      return { changes: existed ? 1 : 0, lastInsertRowId: 0 };
    }

    if (/^INSERT INTO kv/i.test(source)) {
      const [key, value] = params;
      state.kv.set(key, value);
      return { changes: 1, lastInsertRowId: 0 };
    }

    if (/^DELETE FROM kv WHERE key = \?/i.test(source)) {
      const existed = state.kv.delete(params[0]);
      return { changes: existed ? 1 : 0, lastInsertRowId: 0 };
    }

    if (/^DELETE FROM kv$/i.test(source.trim())) {
      const count = state.kv.size;
      state.kv.clear();
      return { changes: count, lastInsertRowId: 0 };
    }

    if (/^INSERT INTO meta/i.test(source)) {
      const [key, value] = params;
      state.meta.set(key, value);
      return { changes: 1, lastInsertRowId: 0 };
    }

    throw new Error(`Unsupported mock SQL: ${source}`);
  };

  const getFirstSync = (source, ...params) => {
    assertOpen();

    const selectRepo = source.match(
      /SELECT id, payload FROM "([^"]+)" WHERE id = \?/i,
    );
    if (selectRepo) {
      const tableName = selectRepo[1];
      const id = params[0];
      return state.tables.get(tableName)?.get(id) ?? null;
    }

    if (/^SELECT value FROM kv WHERE key = \?/i.test(source)) {
      const key = params[0];
      const value = state.kv.get(key);
      return value === undefined ? null : { value };
    }

    if (/^SELECT 1 AS one FROM kv WHERE key = \?/i.test(source)) {
      return state.kv.has(params[0]) ? { one: 1 } : null;
    }

    if (/^SELECT value FROM meta WHERE key = \?/i.test(source)) {
      const key = params[0];
      const value = state.meta.get(key);
      return value === undefined ? null : { value };
    }

    if (/^PRAGMA page_count/i.test(source)) {
      return { page_count: 1 };
    }

    if (/^PRAGMA page_size/i.test(source)) {
      return { page_size: 4096 };
    }

    throw new Error(`Unsupported mock SQL: ${source}`);
  };

  const getAllSync = (source) => {
    assertOpen();
    const tableName = parseTableFromSelect(source);
    if (!tableName) {
      throw new Error(`Unsupported mock SQL: ${source}`);
    }
    const table = state.tables.get(tableName);
    if (!table) {
      return [];
    }
    return [...table.values()];
  };

  const closeSync = () => {
    state.openHandles = Math.max(0, state.openHandles - 1);
    if (state.openHandles === 0) {
      state.closed = true;
    }
  };

  const isInTransactionSync = () => state.inTransaction;

  return {
    databasePath: databaseName,
    options: {},
    nativeDatabase: {},
    execSync,
    runSync,
    getFirstSync,
    getAllSync,
    closeSync,
    isInTransactionSync,
  };
}

function openDatabaseSync(databaseName) {
  const state = getOrCreateState(databaseName);
  return createDatabaseInterface(databaseName, state);
}

function deleteDatabaseSync(databaseName) {
  databases.delete(databaseName);
}

/** Test helper — clears all mocked database files. */
function resetSQLiteTestDatabases() {
  databases.clear();
}

module.exports = {
  openDatabaseSync,
  openDatabaseAsync: async (databaseName) => openDatabaseSync(databaseName),
  deleteDatabaseSync,
  deleteDatabaseAsync: async (databaseName) => deleteDatabaseSync(databaseName),
  defaultDatabaseDirectory: "/mock-sqlite",
  resetSQLiteTestDatabases,
};
