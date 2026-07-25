import type { UpdatedWorkoutBlueprint } from "./UpdatedWorkoutBlueprint";
import type { WorkoutAdaptation } from "./WorkoutAdaptation";
import type { WorkoutComparison } from "./WorkoutComparison";
import type { WorkoutDiagnostics } from "./WorkoutDiagnostics";
import type { WorkoutHistory } from "./WorkoutHistory";
import type { WorkoutMetadata } from "./WorkoutMetadata";
import type { WorkoutRuntimeInput } from "./WorkoutRuntimeInput";
import type { WorkoutSnapshot } from "./WorkoutSnapshot";
import type { WorkoutStatistics } from "./WorkoutStatistics";
import type { WorkoutSummary } from "./WorkoutSummary";
import type { WorkoutTimeline } from "./WorkoutTimeline";

export interface WorkoutPackage {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly contextId: string;
  readonly adaptation: WorkoutAdaptation | null;
  readonly updatedBlueprint: UpdatedWorkoutBlueprint | null;
  readonly runtimeInput: WorkoutRuntimeInput | null;
  readonly summary: WorkoutSummary | null;
  readonly snapshot: WorkoutSnapshot | null;
  readonly comparison: WorkoutComparison | null;
  readonly timeline: WorkoutTimeline | null;
  readonly history: WorkoutHistory | null;
  readonly statistics: WorkoutStatistics;
  readonly diagnostics: WorkoutDiagnostics;
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
