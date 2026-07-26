import {
  createWorkoutGenerationPipelineService,
  type WorkoutGenerationPipelineService,
} from "../../../features/workout-generation-pipeline/services/WorkoutGenerationPipelineService";
import type { CoachingSessionService } from "../../../features/coaching-session/services/CoachingSessionService";
import type { CoachSupervisorService } from "../../../features/coach-supervisor/services/CoachSupervisorService";
import type { WorkoutAgentService } from "../../../features/workout-agent/services/WorkoutAgentService";
import type { AthleteStateService } from "../../../features/athlete-state/services/AthleteStateService";
import type { ContextFusionService } from "../../../features/context-fusion/services/ContextFusionService";
import type { DecisionEngineService } from "../../../features/decision-engine/services/DecisionEngineService";
import type { RecommendationEngineService } from "../../../features/recommendation-engine/services/RecommendationEngineService";

export interface WorkoutGenerationPipelineFactoryDeps {
  readonly coachingSession: CoachingSessionService;
  readonly coachSupervisor: CoachSupervisorService;
  readonly workoutAgent: WorkoutAgentService;
  readonly athleteState: AthleteStateService;
  readonly contextFusion: ContextFusionService;
  readonly decisionEngine: DecisionEngineService;
  readonly recommendationEngine: RecommendationEngineService;
  readonly clock?: () => string;
}

export const WorkoutGenerationPipelineFactory = {
  create(
    deps: WorkoutGenerationPipelineFactoryDeps,
  ): WorkoutGenerationPipelineService {
    return createWorkoutGenerationPipelineService(deps);
  },
} as const;
