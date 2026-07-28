import type { AthleteRepository } from "../../../core/persistence/repositories/AthleteRepository";
import type { IdentityRepository } from "../../../core/persistence/repositories/IdentityRepository";
import type { WorkspaceRepository } from "../../../core/persistence/repositories/WorkspaceRepository";
import type { SnapshotRepository } from "../../../core/persistence/repositories/SnapshotRepository";
import type { TimelineRepository } from "../../../core/persistence/repositories/TimelineRepository";
import type { WorkoutRepository } from "../../../core/persistence/repositories/WorkoutRepository";
import type { NutritionRepository } from "../../../core/persistence/repositories/NutritionRepository";
import type { RecoveryRepository } from "../../../core/persistence/repositories/RecoveryRepository";
import type { SettingsRepository } from "../../../core/persistence/repositories/SettingsRepository";
import type { RuntimeRepository } from "../../../core/persistence/repositories/RuntimeRepository";
import type { RepositoryAdapterToken } from "../registry/RepositoryAdapterToken";

/**
 * Union of Persistence Contract repository surfaces bound by adapters.
 */
export type BoundRepository =
  | AthleteRepository
  | IdentityRepository
  | WorkspaceRepository
  | SnapshotRepository
  | TimelineRepository
  | WorkoutRepository
  | NutritionRepository
  | RecoveryRepository
  | SettingsRepository
  | RuntimeRepository;

/**
 * Map of repository adapter token → Persistence Contract repository.
 */
export type RepositoryAdapterMap = {
  readonly athlete: AthleteRepository;
  readonly identity: IdentityRepository;
  readonly workspace: WorkspaceRepository;
  readonly snapshot: SnapshotRepository;
  readonly timeline: TimelineRepository;
  readonly workout: WorkoutRepository;
  readonly nutrition: NutritionRepository;
  readonly recovery: RecoveryRepository;
  readonly settings: SettingsRepository;
  readonly runtime: RuntimeRepository;
};

export type RepositoryAdapterInstance =
  RepositoryAdapterMap[RepositoryAdapterToken];
