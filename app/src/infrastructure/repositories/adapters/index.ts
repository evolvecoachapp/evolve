import type { SQLiteRepositories } from "../../sqlite/repositories";
import { AthleteRepositoryAdapter } from "./AthleteRepositoryAdapter";
import { IdentityRepositoryAdapter } from "./IdentityRepositoryAdapter";
import { WorkspaceRepositoryAdapter } from "./WorkspaceRepositoryAdapter";
import { SnapshotRepositoryAdapter } from "./SnapshotRepositoryAdapter";
import { TimelineRepositoryAdapter } from "./TimelineRepositoryAdapter";
import { WorkoutRepositoryAdapter } from "./WorkoutRepositoryAdapter";
import { NutritionRepositoryAdapter } from "./NutritionRepositoryAdapter";
import { RecoveryRepositoryAdapter } from "./RecoveryRepositoryAdapter";
import { SettingsRepositoryAdapter } from "./SettingsRepositoryAdapter";
import { RuntimeRepositoryAdapter } from "./RuntimeRepositoryAdapter";

export { AthleteRepositoryAdapter } from "./AthleteRepositoryAdapter";
export { IdentityRepositoryAdapter } from "./IdentityRepositoryAdapter";
export { WorkspaceRepositoryAdapter } from "./WorkspaceRepositoryAdapter";
export { SnapshotRepositoryAdapter } from "./SnapshotRepositoryAdapter";
export { TimelineRepositoryAdapter } from "./TimelineRepositoryAdapter";
export { WorkoutRepositoryAdapter } from "./WorkoutRepositoryAdapter";
export { NutritionRepositoryAdapter } from "./NutritionRepositoryAdapter";
export { RecoveryRepositoryAdapter } from "./RecoveryRepositoryAdapter";
export { SettingsRepositoryAdapter } from "./SettingsRepositoryAdapter";
export { RuntimeRepositoryAdapter } from "./RuntimeRepositoryAdapter";

/**
 * Frozen bag of Persistence Contract adapters bound to SQLite repositories.
 */
export interface RepositoryAdapters {
  readonly athlete: AthleteRepositoryAdapter;
  readonly identity: IdentityRepositoryAdapter;
  readonly workspace: WorkspaceRepositoryAdapter;
  readonly snapshot: SnapshotRepositoryAdapter;
  readonly timeline: TimelineRepositoryAdapter;
  readonly workout: WorkoutRepositoryAdapter;
  readonly nutrition: NutritionRepositoryAdapter;
  readonly recovery: RecoveryRepositoryAdapter;
  readonly settings: SettingsRepositoryAdapter;
  readonly runtime: RuntimeRepositoryAdapter;
}

export function createRepositoryAdapters(
  repositories: SQLiteRepositories,
): RepositoryAdapters {
  return Object.freeze({
    athlete: new AthleteRepositoryAdapter(repositories.athlete),
    identity: new IdentityRepositoryAdapter(repositories.identity),
    workspace: new WorkspaceRepositoryAdapter(repositories.workspace),
    snapshot: new SnapshotRepositoryAdapter(repositories.snapshot),
    timeline: new TimelineRepositoryAdapter(repositories.timeline),
    workout: new WorkoutRepositoryAdapter(repositories.workout),
    nutrition: new NutritionRepositoryAdapter(repositories.nutrition),
    recovery: new RecoveryRepositoryAdapter(repositories.recovery),
    settings: new SettingsRepositoryAdapter(repositories.settings),
    runtime: new RuntimeRepositoryAdapter(repositories.runtime),
  });
}
