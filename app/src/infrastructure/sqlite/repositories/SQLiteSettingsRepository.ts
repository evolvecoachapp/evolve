import type { SettingsRepository } from "../../../core/persistence/repositories/SettingsRepository";
import type { SQLiteConnection } from "../connection/SQLiteConnection";
import { SettingsMapper } from "../mappers";
import { SQLiteRepositoryBase } from "./SQLiteRepositoryBase";

export class SQLiteSettingsRepository
  extends SQLiteRepositoryBase
  implements SettingsRepository
{
  readonly repositoryId = "settings" as const;

  constructor(connection: SQLiteConnection) {
    super(connection, "settings", SettingsMapper);
  }
}
