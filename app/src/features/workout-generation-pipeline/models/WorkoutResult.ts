import type { AthleteStateResult } from "../../athlete-state/models/AthleteStateResult";
import type { ContextResult } from "../../context-fusion/models/ContextResult";
import type { DecisionResult } from "../../decision-engine/models/DecisionResult";
import type { RecommendationResult } from "../../recommendation-engine/models/RecommendationResult";
import type { SessionResult } from "../../coaching-session/models/SessionResult";
import type { CoachSupervisorResult } from "../../coach-supervisor/models/CoachSupervisorResult";
import type { WorkoutAgentGenerateResult } from "../../workout-agent/models/WorkoutAgentGenerateResult";
import type { WorkoutAgentResult } from "../../workout-agent/models/WorkoutAgentResult";
import type { WorkoutPlan } from "./WorkoutPlan";
import type { WorkoutPlanValidation } from "./WorkoutPlanValidation";

export const WorkoutPipelineStages = {
  CONVERSATION: "conversation",
  COACHING_SESSION: "coaching_session",
  COACH_SUPERVISOR: "coach_supervisor",
  WORKOUT_AGENT: "workout_agent",
  ATHLETE_STATE: "athlete_state",
  CONTEXT_FUSION: "context_fusion",
  DECISION: "decision",
  RECOMMENDATION: "recommendation",
  WORKOUT_GENERATION: "workout_generation",
  WORKOUT_PLAN: "workout_plan",
  VALIDATION: "validation",
} as const;

export type WorkoutPipelineStage =
  (typeof WorkoutPipelineStages)[keyof typeof WorkoutPipelineStages];

export interface WorkoutPipelineStageTrace {
  readonly stage: WorkoutPipelineStage;
  readonly success: boolean;
  readonly summary: string;
  readonly completedAt: string;
}

/**
 * Immutable pipeline result — WorkoutPlan is the canonical product output.
 */
export interface WorkoutResult {
  readonly id: string;
  readonly success: boolean;
  readonly plan: WorkoutPlan | null;
  readonly validation: WorkoutPlanValidation;
  readonly session: SessionResult | null;
  readonly supervisor: CoachSupervisorResult | null;
  readonly workoutAgent: WorkoutAgentResult | null;
  readonly athleteState: AthleteStateResult | null;
  readonly fusion: ContextResult | null;
  readonly decision: DecisionResult | null;
  readonly recommendation: RecommendationResult | null;
  readonly generation: WorkoutAgentGenerateResult | null;
  readonly trace: readonly WorkoutPipelineStageTrace[];
  readonly errors: readonly string[];
  readonly message: string;
  readonly startedAt: string;
  readonly completedAt: string;
}
