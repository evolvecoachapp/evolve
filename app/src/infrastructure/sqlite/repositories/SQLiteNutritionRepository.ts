import type { NutritionRepository } from "../../../core/persistence/repositories/NutritionRepository";
import type { SQLiteConnection } from "../connection/SQLiteConnection";
import { NutritionMapper } from "../mappers";
import { SQLiteRepositoryBase } from "./SQLiteRepositoryBase";

export class SQLiteNutritionRepository
  extends SQLiteRepositoryBase
  implements NutritionRepository
{
  readonly repositoryId = "nutrition" as const;

  constructor(connection: SQLiteConnection) {
    super(connection, "nutrition", NutritionMapper);
  }
}
