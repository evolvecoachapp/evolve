import type { IdentityRepository } from "../../../core/persistence/repositories/IdentityRepository";
import type { SQLiteConnection } from "../connection/SQLiteConnection";
import { IdentityMapper } from "../mappers";
import { SQLiteRepositoryBase } from "./SQLiteRepositoryBase";

export class SQLiteIdentityRepository
  extends SQLiteRepositoryBase
  implements IdentityRepository
{
  readonly repositoryId = "identity" as const;

  constructor(connection: SQLiteConnection) {
    super(connection, "identity", IdentityMapper);
  }
}
