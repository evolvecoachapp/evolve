import { createTestAthleteStateService } from "../../athlete-state/testSupport/fixtures";
import { createTestSupervisorService } from "../../coach-supervisor/testSupport/fixtures";
import { createTestContextFusionService } from "../../context-fusion/testSupport/fixtures";
import { createTestDecisionEngineService } from "../../decision-engine/testSupport/fixtures";
import { createTestRecommendationEngineService } from "../../recommendation-engine/testSupport/fixtures";
import {
  createTestProgramGenerationService,
  createWorkoutGenerationRequest,
  FIXED_GENERATION_TIMESTAMP,
} from "../../program-generation/testSupport/fixtures";
import { createWorkoutAgentService } from "../../workout-agent/services/WorkoutAgentService";
import { createCoachingSessionService } from "../../coaching-session/services/CoachingSessionService";
import { createCoachSupervisorPortAdapter } from "../../../core/composition/adapters/CoachSupervisorPortAdapter";
import { EMPTY_PLAN_METADATA } from "../models";
import type { WorkoutPipelineRequest } from "../models/WorkoutPipelineRequest";
import {
  createWorkoutGenerationPipelineService,
  type WorkoutGenerationPipelineService,
} from "../services/WorkoutGenerationPipelineService";

export { FIXED_GENERATION_TIMESTAMP };

export function createFixedClock(
  ts = FIXED_GENERATION_TIMESTAMP,
): () => string {
  return () => ts;
}

export function createPipelineRequest(
  overrides: Partial<WorkoutPipelineRequest> = {},
): WorkoutPipelineRequest {
  const generationRequest =
    overrides.generationRequest ?? createWorkoutGenerationRequest();
  return Object.freeze({
    id: overrides.id ?? "pipeline-req:1",
    athleteId:
      overrides.athleteId ?? generationRequest.athleteContext.profile.id,
    conversationId: overrides.conversationId ?? "conversation:1",
    sessionId: overrides.sessionId ?? null,
    message: overrides.message ?? "Generate my workout",
    intent: overrides.intent ?? "generate_workout",
    generationRequest,
    metadata: overrides.metadata ?? EMPTY_PLAN_METADATA,
    createdAt: overrides.createdAt ?? FIXED_GENERATION_TIMESTAMP,
  });
}

/**
 * Fully wired pipeline service for integration tests.
 * Workout Agent domain ports use the test Program Generation service (real engines).
 */
export function createTestWorkoutGenerationPipelineService(
  overrides: { readonly clock?: () => string } = {},
): WorkoutGenerationPipelineService {
  const clock = overrides.clock ?? createFixedClock();
  const programGeneration = createTestProgramGenerationService();
  const workoutAgent = createWorkoutAgentService({
    agentId: "agent:workout",
    clock,
    ports: {
      generateWorkoutProgram: (request) =>
        programGeneration.generateWorkoutProgram(request),
    },
  });
  const coachSupervisor = createTestSupervisorService({ clock });
  const coachingSession = createCoachingSessionService({
    supervisorPort: createCoachSupervisorPortAdapter(coachSupervisor),
    clock,
  });

  return createWorkoutGenerationPipelineService({
    coachingSession,
    coachSupervisor,
    workoutAgent,
    athleteState: createTestAthleteStateService({ clock }),
    contextFusion: createTestContextFusionService({ clock }),
    decisionEngine: createTestDecisionEngineService({ clock }),
    recommendationEngine: createTestRecommendationEngineService({ clock }),
    clock,
  });
}
