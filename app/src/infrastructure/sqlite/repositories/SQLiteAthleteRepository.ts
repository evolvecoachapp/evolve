import type { AthleteRepository } from "../../../core/persistence/repositories/AthleteRepository";
import type { SQLiteConnection } from "../connection/SQLiteConnection";
import { AthleteMapper } from "../mappers";
import { SQLiteRepositoryBase } from "./SQLiteRepositoryBase";

export class SQLiteAthleteRepository
  extends SQLiteRepositoryBase
  implements AthleteRepository
{
  readonly repositoryId = "athlete" as const;

  constructor(connection: SQLiteConnection) {
    super(connection, "athlete", AthleteMapper);
  }
}
