import type { SQLiteConnection } from "../connection/SQLiteConnection";
import { SQLiteAthleteRepository } from "./SQLiteAthleteRepository";
import { SQLiteIdentityRepository } from "./SQLiteIdentityRepository";
import { SQLiteWorkspaceRepository } from "./SQLiteWorkspaceRepository";
import { SQLiteSnapshotRepository } from "./SQLiteSnapshotRepository";
import { SQLiteTimelineRepository } from "./SQLiteTimelineRepository";
import { SQLiteWorkoutRepository } from "./SQLiteWorkoutRepository";
import { SQLiteNutritionRepository } from "./SQLiteNutritionRepository";
import { SQLiteRecoveryRepository } from "./SQLiteRecoveryRepository";
import { SQLiteSettingsRepository } from "./SQLiteSettingsRepository";
import { SQLiteRuntimeRepository } from "./SQLiteRuntimeRepository";

export { SQLiteRepositoryBase } from "./SQLiteRepositoryBase";
export { SQLiteAthleteRepository } from "./SQLiteAthleteRepository";
export { SQLiteIdentityRepository } from "./SQLiteIdentityRepository";
export { SQLiteWorkspaceRepository } from "./SQLiteWorkspaceRepository";
export { SQLiteSnapshotRepository } from "./SQLiteSnapshotRepository";
export { SQLiteTimelineRepository } from "./SQLiteTimelineRepository";
export { SQLiteWorkoutRepository } from "./SQLiteWorkoutRepository";
export { SQLiteNutritionRepository } from "./SQLiteNutritionRepository";
export { SQLiteRecoveryRepository } from "./SQLiteRecoveryRepository";
export { SQLiteSettingsRepository } from "./SQLiteSettingsRepository";
export { SQLiteRuntimeRepository } from "./SQLiteRuntimeRepository";

/**
 * Frozen bag of SQLite repository implementations bound to one connection.
 */
export interface SQLiteRepositories {
  readonly athlete: SQLiteAthleteRepository;
  readonly identity: SQLiteIdentityRepository;
  readonly workspace: SQLiteWorkspaceRepository;
  readonly snapshot: SQLiteSnapshotRepository;
  readonly timeline: SQLiteTimelineRepository;
  readonly workout: SQLiteWorkoutRepository;
  readonly nutrition: SQLiteNutritionRepository;
  readonly recovery: SQLiteRecoveryRepository;
  readonly settings: SQLiteSettingsRepository;
  readonly runtime: SQLiteRuntimeRepository;
}

export function createSQLiteRepositories(
  connection: SQLiteConnection,
): SQLiteRepositories {
  return Object.freeze({
    athlete: new SQLiteAthleteRepository(connection),
    identity: new SQLiteIdentityRepository(connection),
    workspace: new SQLiteWorkspaceRepository(connection),
    snapshot: new SQLiteSnapshotRepository(connection),
    timeline: new SQLiteTimelineRepository(connection),
    workout: new SQLiteWorkoutRepository(connection),
    nutrition: new SQLiteNutritionRepository(connection),
    recovery: new SQLiteRecoveryRepository(connection),
    settings: new SQLiteSettingsRepository(connection),
    runtime: new SQLiteRuntimeRepository(connection),
  });
}
