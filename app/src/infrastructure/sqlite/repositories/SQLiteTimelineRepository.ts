import type { TimelineRepository } from "../../../core/persistence/repositories/TimelineRepository";
import type { SQLiteConnection } from "../connection/SQLiteConnection";
import { TimelineMapper } from "../mappers";
import { SQLiteRepositoryBase } from "./SQLiteRepositoryBase";

export class SQLiteTimelineRepository
  extends SQLiteRepositoryBase
  implements TimelineRepository
{
  readonly repositoryId = "timeline" as const;

  constructor(connection: SQLiteConnection) {
    super(connection, "timeline", TimelineMapper);
  }
}
