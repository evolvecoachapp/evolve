import { createTestSupervisorService } from "../../coach-supervisor/testSupport/fixtures";
import { createCoachSupervisorPortAdapter } from "../../../core/composition/adapters/CoachSupervisorPortAdapter";
import { createCoachingSessionService } from "../../coaching-session/services/CoachingSessionService";
import { createConversationMemoryService } from "../../conversation-memory/services/ConversationMemoryService";
import {
  createSupervisorRoutingService,
} from "../../supervisor-routing/services/SupervisorRoutingService";
import {
  createMockCapabilityRegistry,
  createFixedClock as createRoutingClock,
} from "../../supervisor-routing/testSupport/fixtures";
import {
  createPipelineRequest,
  createTestWorkoutGenerationPipelineService,
  FIXED_GENERATION_TIMESTAMP,
} from "../../workout-generation-pipeline/testSupport/fixtures";
import { generateWorkoutPlan } from "../../workout-generation-pipeline/application";
import type { WorkoutPlan } from "../../workout-generation-pipeline/models/WorkoutPlan";
import type { WorkoutGenerationPipelineService } from "../../workout-generation-pipeline/services/WorkoutGenerationPipelineService";
import {
  EMPTY_COACH_CONVERSATION_METADATA,
  type CoachConversationRequest,
} from "../models";
import {
  createCoachConversationService,
  type CoachConversationService,
} from "../services/CoachConversationService";
import { createActiveWorkoutPlanStore } from "../store/ActiveWorkoutPlanStore";

export { FIXED_GENERATION_TIMESTAMP };

export function createFixedClock(
  ts = FIXED_GENERATION_TIMESTAMP,
): () => string {
  return () => ts;
}

export function createCoachConversationRequest(
  overrides: Partial<CoachConversationRequest> = {},
): CoachConversationRequest {
  return Object.freeze({
    id: overrides.id ?? "coach-conv-req:1",
    conversationId: overrides.conversationId ?? "conversation:1",
    sessionId: overrides.sessionId ?? null,
    athleteId: overrides.athleteId ?? "athlete:1",
    message: overrides.message ?? "Explain today's workout",
    intentHint: overrides.intentHint ?? null,
    metadata: overrides.metadata ?? EMPTY_COACH_CONVERSATION_METADATA,
    createdAt: overrides.createdAt ?? FIXED_GENERATION_TIMESTAMP,
  });
}

export function createTestCoachConversationService(
  overrides: {
    readonly clock?: () => string;
    readonly workoutPipeline?: WorkoutGenerationPipelineService | null;
  } = {},
): CoachConversationService {
  const clock = overrides.clock ?? createFixedClock();
  const supervisor = createTestSupervisorService();
  const coachingSession = createCoachingSessionService({
    supervisorPort: createCoachSupervisorPortAdapter(supervisor),
    clock,
  });
  const supervisorRouting = createSupervisorRoutingService({
    registry: createMockCapabilityRegistry(),
    clock: createRoutingClock(FIXED_GENERATION_TIMESTAMP),
  });
  const conversationMemory = createConversationMemoryService({
    athleteId: "athlete:1",
    conversationId: "conversation:1",
    sessionId: "session:1",
    clock,
  });
  const workoutPipeline =
    overrides.workoutPipeline === undefined
      ? createTestWorkoutGenerationPipelineService({ clock })
      : overrides.workoutPipeline;

  return createCoachConversationService({
    coachingSession,
    coachSupervisor: supervisor,
    supervisorRouting,
    workoutPipeline,
    conversationMemory,
    planStore: createActiveWorkoutPlanStore(),
    clock,
  });
}

export async function generateAndAttachPlan(
  service: CoachConversationService,
  overrides: { readonly conversationId?: string } = {},
): Promise<WorkoutPlan> {
  const pipeline = createTestWorkoutGenerationPipelineService();
  const result = await generateWorkoutPlan({
    service: pipeline,
    request: createPipelineRequest({
      id: "pipeline-req:coach-conv",
      conversationId: overrides.conversationId ?? "conversation:1",
    }),
  });
  expect(result.plan).not.toBeNull();
  service.attachWorkoutPlan(result.plan!);
  return result.plan!;
}
