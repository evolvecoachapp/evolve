import type { RecoveryRepository } from "../../../core/persistence/repositories/RecoveryRepository";
import type { SQLiteConnection } from "../connection/SQLiteConnection";
import { RecoveryMapper } from "../mappers";
import { SQLiteRepositoryBase } from "./SQLiteRepositoryBase";

export class SQLiteRecoveryRepository
  extends SQLiteRepositoryBase
  implements RecoveryRepository
{
  readonly repositoryId = "recovery" as const;

  constructor(connection: SQLiteConnection) {
    super(connection, "recovery", RecoveryMapper);
  }
}
