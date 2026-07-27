import {
  createCoachConversationService,
  type CoachConversationService,
} from "../../../features/coach-conversation/services/CoachConversationService";
import type { CoachingSessionService } from "../../../features/coaching-session/services/CoachingSessionService";
import type { CoachSupervisorService } from "../../../features/coach-supervisor/services/CoachSupervisorService";
import type { ConversationMemoryService } from "../../../features/conversation-memory/services/ConversationMemoryService";
import type { SupervisorRoutingService } from "../../../features/supervisor-routing/services/SupervisorRoutingService";
import type { ActiveWorkoutPlanStore } from "../../../features/coach-conversation/store/ActiveWorkoutPlanStore";
import type { WorkoutGenerationPipelineService } from "../../../features/workout-generation-pipeline/services/WorkoutGenerationPipelineService";

export interface CoachConversationFactoryDeps {
  readonly coachingSession: CoachingSessionService;
  readonly coachSupervisor: CoachSupervisorService;
  readonly supervisorRouting: SupervisorRoutingService;
  readonly workoutPipeline?: WorkoutGenerationPipelineService | null;
  readonly conversationMemory?: ConversationMemoryService;
  readonly planStore?: ActiveWorkoutPlanStore;
  readonly clock?: () => string;
}

export const CoachConversationFactory = {
  create(deps: CoachConversationFactoryDeps): CoachConversationService {
    return createCoachConversationService(deps);
  },
} as const;
