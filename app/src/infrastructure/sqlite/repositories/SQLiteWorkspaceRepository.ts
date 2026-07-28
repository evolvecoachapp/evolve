import type { WorkspaceRepository } from "../../../core/persistence/repositories/WorkspaceRepository";
import type { SQLiteConnection } from "../connection/SQLiteConnection";
import { WorkspaceMapper } from "../mappers";
import { SQLiteRepositoryBase } from "./SQLiteRepositoryBase";

export class SQLiteWorkspaceRepository
  extends SQLiteRepositoryBase
  implements WorkspaceRepository
{
  readonly repositoryId = "workspace" as const;

  constructor(connection: SQLiteConnection) {
    super(connection, "workspace", WorkspaceMapper);
  }
}
