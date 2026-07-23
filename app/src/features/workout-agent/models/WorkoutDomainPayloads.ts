import type { TrainingAdaptationRequest } from "../../training-adaptation/models/TrainingAdaptationRequest";
import type { TrainingAdaptationResult } from "../../training-adaptation/models/TrainingAdaptationResult";
import type { WorkoutGenerationRequest } from "../../program-generation/models/WorkoutGenerationRequest";
import type { WorkoutGenerationResult } from "../../program-generation/models/WorkoutGenerationResult";
import type { ProgrammingRequest } from "../../programming/models/ProgrammingRequest";
import type { ProgrammingResult } from "../../programming/models/ProgrammingResult";
import type { ProgressionRequest } from "../../progression/models/ProgressionRequest";
import type { ProgressionPlan } from "../../progression/models/ProgressionPlan";
import type { WorkoutAssemblyRequest } from "../../workout-assembly/models/WorkoutAssemblyRequest";
import type { WorkoutAssemblyResult } from "../../workout-assembly/models/WorkoutAssemblyResult";
import type { ExerciseKnowledgeResult } from "../../exercise-kb/models/ExerciseKnowledgeResult";
import type { DecisionReport } from "../../../core/decision-intelligence/models/DecisionReport";

/**
 * Optional domain payloads the agent may forward to existing engines.
 * Agent never constructs domain business inputs — callers supply them.
 */
export interface WorkoutDomainPayloads {
  readonly generationRequest?: WorkoutGenerationRequest | null;
  readonly programmingRequest?: ProgrammingRequest | null;
  readonly progressionRequest?: ProgressionRequest | null;
  readonly adaptationRequest?: TrainingAdaptationRequest | null;
  readonly assemblyRequest?: WorkoutAssemblyRequest | null;
  readonly includeExerciseKnowledge?: boolean;
  readonly decisionSource?: WorkoutGenerationResult | null;
}

/**
 * Injectable domain ports — thin delegates to existing application APIs.
 */
export interface WorkoutDomainPorts {
  readonly generateWorkoutProgram?: (
    request: WorkoutGenerationRequest,
  ) => Promise<WorkoutGenerationResult>;
  readonly programExercises?: (
    request: ProgrammingRequest,
  ) => Promise<ProgrammingResult>;
  readonly generateProgression?: (
    request: ProgressionRequest,
  ) => Promise<ProgressionPlan>;
  readonly previewAdaptations?: (
    request: TrainingAdaptationRequest,
  ) => Promise<TrainingAdaptationResult>;
  readonly assembleWorkout?: (
    request: WorkoutAssemblyRequest,
  ) => Promise<WorkoutAssemblyResult>;
  readonly queryExerciseKnowledge?: () => Promise<ExerciseKnowledgeResult>;
  readonly createDecisionReport?: (
    source: WorkoutGenerationResult,
  ) => DecisionReport;
}
