import type { AthleteContext } from "../../../src/features/program-generation/models/WorkoutGenerationRequest";
import type { WorkoutGenerationRequest } from "../../../src/features/program-generation/models/WorkoutGenerationRequest";
import type { WorkoutGenerationResult } from "../../../src/features/program-generation/models/WorkoutGenerationResult";

/**
 * Named immutable athlete fixture used by builders and scenarios.
 */
export interface AthleteFixture {
  readonly key: string;
  readonly label: string;
  readonly athleteContext: AthleteContext;
}

/**
 * Scenario definition — request factory + metadata for e2e pipeline runs.
 */
export interface IntegrationScenario {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly athleteFixtureKey: string;
  readonly buildRequest: () => WorkoutGenerationRequest;
}

/**
 * Structural golden snapshot — deterministic, id/timestamp-normalized view
 * of a WorkoutGenerationResult suitable for regression comparison.
 */
export interface NormalizedWorkoutSnapshot {
  readonly frameworkVersion: string;
  readonly scenarioId: string;
  readonly status: string;
  readonly completedSteps: readonly string[];
  readonly failedStep: string | null;
  readonly stepOrder: readonly string[];
  readonly validationIssues: readonly string[];
  readonly exerciseIds: readonly string[];
  readonly exerciseOrder: readonly number[];
  readonly prescriptionCount: number;
  readonly progressionTimelineCount: number;
  readonly recommendationCount: number;
  readonly sessionExerciseCount: number;
  readonly hasProgramming: boolean;
  readonly hasProgression: boolean;
  readonly hasAdaptation: boolean;
  readonly hasAssembly: boolean;
  readonly hasSession: boolean;
  readonly hasTrace: boolean;
  readonly hasSummary: boolean;
  readonly explanationCount: number;
  readonly metrics: {
    readonly stepCount: number;
    readonly succeededStepCount: number;
    readonly failedStepCount: number;
  };
}

export type PipelineRunResult = WorkoutGenerationResult;
