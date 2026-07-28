import type { WorkoutRepository } from "../../../core/persistence/repositories/WorkoutRepository";
import type { SQLiteConnection } from "../connection/SQLiteConnection";
import { WorkoutMapper } from "../mappers";
import { SQLiteRepositoryBase } from "./SQLiteRepositoryBase";

export class SQLiteWorkoutRepository
  extends SQLiteRepositoryBase
  implements WorkoutRepository
{
  readonly repositoryId = "workout" as const;

  constructor(connection: SQLiteConnection) {
    super(connection, "workout", WorkoutMapper);
  }
}
