import type { ExerciseSelectionResult } from "../../exercise-selection/models/ExerciseSelectionResult";
import type { ProgrammingResult } from "../../programming/models/ProgrammingResult";
import type { ProgressionPlan } from "../../progression/models/ProgressionPlan";
import type { TrainingAdaptationResult } from "../../training-adaptation/models/TrainingAdaptationResult";
import type { WorkoutAssemblyResult } from "../../workout-assembly/models/WorkoutAssemblyResult";
import type { WorkoutSession } from "../../workout-assembly/models/WorkoutSession";
import type { WorkoutBlueprint } from "../../workout-blueprint/models/WorkoutBlueprint";
import type { PipelineExecutionContext } from "./PipelineExecutionContext";
import type { PipelineExecutionSummary } from "./PipelineExecutionSummary";
import type { PipelineExecutionTrace } from "./PipelineExecutionTrace";
import type { WorkoutGenerationExplanation } from "./WorkoutGenerationExplanation";

/**
 * Immutable output of the Program Generation Orchestrator.
 *
 * Collects every engine output plus pipeline summary/trace.
 * Does not invent training logic — only coordinates and freezes results.
 */
export interface WorkoutGenerationResult {
  readonly requestId: string;
  readonly context: PipelineExecutionContext;
  readonly session: WorkoutSession;
  readonly blueprint: WorkoutBlueprint;
  readonly selection: ExerciseSelectionResult;
  readonly programming: ProgrammingResult;
  readonly progression: ProgressionPlan;
  readonly adaptation: TrainingAdaptationResult;
  readonly assembly: WorkoutAssemblyResult;
  readonly summary: PipelineExecutionSummary;
  readonly trace: PipelineExecutionTrace;
  readonly explanations: readonly WorkoutGenerationExplanation[];
  readonly validationIssues: readonly string[];
  /** ISO-8601 — fixed by the orchestrator for determinism. */
  readonly generatedAt: string;
}
