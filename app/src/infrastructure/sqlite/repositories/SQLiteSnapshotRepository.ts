import type { SnapshotRepository } from "../../../core/persistence/repositories/SnapshotRepository";
import type { SQLiteConnection } from "../connection/SQLiteConnection";
import { SnapshotMapper } from "../mappers";
import { SQLiteRepositoryBase } from "./SQLiteRepositoryBase";

export class SQLiteSnapshotRepository
  extends SQLiteRepositoryBase
  implements SnapshotRepository
{
  readonly repositoryId = "snapshot" as const;

  constructor(connection: SQLiteConnection) {
    super(connection, "snapshot", SnapshotMapper);
  }
}
