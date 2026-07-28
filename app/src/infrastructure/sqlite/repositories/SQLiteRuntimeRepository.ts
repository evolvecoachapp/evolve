import type { RuntimeRepository } from "../../../core/persistence/repositories/RuntimeRepository";
import type { SQLiteConnection } from "../connection/SQLiteConnection";
import { RuntimeMapper } from "../mappers";
import { SQLiteRepositoryBase } from "./SQLiteRepositoryBase";

export class SQLiteRuntimeRepository
  extends SQLiteRepositoryBase
  implements RuntimeRepository
{
  readonly repositoryId = "runtime" as const;

  constructor(connection: SQLiteConnection) {
    super(connection, "runtime", RuntimeMapper);
  }
}
