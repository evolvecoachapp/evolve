import {
  IdentityRepositoryAdapter,
  RuntimeRepositoryAdapter,
  WorkspaceRepositoryAdapter,
} from "../../../../infrastructure/repositories/adapters";
import { SQLiteConnection } from "../../../../infrastructure/sqlite/connection/SQLiteConnection";
import { DEFAULT_COMPOSITION_CONFIGURATION } from "../../configuration/CompositionConfiguration";
import { PersistenceRepositoryProvider } from "../PersistenceRepositoryProvider";

describe("PersistenceRepositoryProvider", () => {
  it("creates SQLite connection, adapter, repositories, and adapter bundle", () => {
    const provider = new PersistenceRepositoryProvider(
      DEFAULT_COMPOSITION_CONFIGURATION,
    );

    const connection = provider.createSQLiteConnection();
    expect(connection).toBeInstanceOf(SQLiteConnection);
    expect(connection.isConnected()).toBe(true);

    const adapter = provider.createSQLiteAdapter(connection);
    const repositories = provider.createSQLiteRepositories(adapter);
    expect(repositories.identity).toBeDefined();
    expect(repositories.runtime).toBeDefined();
    expect(repositories.workspace).toBeDefined();

    const bundle = provider.createRepositoryAdapterBundle(repositories);
    expect(bundle.adapters.identity).toBeInstanceOf(IdentityRepositoryAdapter);
    expect(bundle.adapters.runtime).toBeInstanceOf(RuntimeRepositoryAdapter);
    expect(bundle.adapters.workspace).toBeInstanceOf(WorkspaceRepositoryAdapter);
  });

  it("memoizes the adapter bundle for a single provider instance", () => {
    const provider = new PersistenceRepositoryProvider(
      DEFAULT_COMPOSITION_CONFIGURATION,
    );
    const repositories = provider.createSQLiteRepositories(
      provider.createSQLiteAdapter(provider.createSQLiteConnection()),
    );

    const first = provider.createRepositoryAdapterBundle(repositories);
    const second = provider.createRepositoryAdapterBundle(repositories);
    expect(first).toBe(second);
  });
});
