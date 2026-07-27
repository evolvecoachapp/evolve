import type { WorkoutConstraints } from "./WorkoutConstraints";
import type { WorkoutDay } from "./WorkoutDay";
import type { WorkoutMetrics } from "./WorkoutMetrics";
import type { WorkoutModificationChange } from "./WorkoutModificationChange";
import type { WorkoutModificationKind } from "./WorkoutModificationKind";
import {
  ALL_WORKOUT_MODIFICATION_KINDS,
  WorkoutModificationKinds,
} from "./WorkoutModificationKind";
import type { WorkoutModificationRequest } from "./WorkoutModificationRequest";
import type {
  WorkoutModificationResult,
  WorkoutModificationStage,
  WorkoutModificationStageTrace,
} from "./WorkoutModificationResult";
import { WorkoutModificationStages } from "./WorkoutModificationResult";
import type { WorkoutNotes } from "./WorkoutNotes";
import type { WorkoutObjectives } from "./WorkoutObjectives";
import type { WorkoutPlan } from "./WorkoutPlan";
import type { WorkoutPlanMetadata } from "./WorkoutPlanMetadata";
import type { WorkoutPlanStatistics } from "./WorkoutPlanStatistics";
import type { WorkoutPlanSummary } from "./WorkoutPlanSummary";
import type {
  WorkoutPlanValidation,
  WorkoutPlanValidationIssue,
  WorkoutPlanValidationCode,
} from "./WorkoutPlanValidation";
import { WorkoutPlanValidationCodes } from "./WorkoutPlanValidation";
import type { WorkoutPipelineRequest } from "./WorkoutPipelineRequest";
import type {
  WorkoutPipelineStage,
  WorkoutPipelineStageTrace,
  WorkoutResult,
} from "./WorkoutResult";
import { WorkoutPipelineStages } from "./WorkoutResult";
import type { WorkoutProgression } from "./WorkoutProgression";
import type { WorkoutTarget } from "./WorkoutTarget";
import type { WorkoutWarnings } from "./WorkoutWarnings";
import type { WorkoutWeek } from "./WorkoutWeek";
export type {
  WorkoutSession,
  WorkoutBlock,
  WorkoutExercise,
  WorkoutSet,
} from "./AssemblyTypes";

export type {
  WorkoutConstraints,
  WorkoutDay,
  WorkoutMetrics,
  WorkoutModificationChange,
  WorkoutModificationKind,
  WorkoutModificationRequest,
  WorkoutModificationResult,
  WorkoutModificationStage,
  WorkoutModificationStageTrace,
  WorkoutNotes,
  WorkoutObjectives,
  WorkoutPlan,
  WorkoutPlanMetadata,
  WorkoutPlanStatistics,
  WorkoutPlanSummary,
  WorkoutPlanValidation,
  WorkoutPlanValidationIssue,
  WorkoutPlanValidationCode,
  WorkoutPipelineRequest,
  WorkoutPipelineStage,
  WorkoutPipelineStageTrace,
  WorkoutResult,
  WorkoutProgression,
  WorkoutTarget,
  WorkoutWarnings,
  WorkoutWeek,
};

export {
  ALL_WORKOUT_MODIFICATION_KINDS,
  WorkoutModificationKinds,
  WorkoutModificationStages,
  WorkoutPlanValidationCodes,
  WorkoutPipelineStages,
};

export const PIPELINE_VERSION = "1.0.0";

export const EMPTY_PLAN_METADATA: WorkoutPlanMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string>),
  source: "workout_generation_pipeline",
  pipelineVersion: PIPELINE_VERSION,
});
