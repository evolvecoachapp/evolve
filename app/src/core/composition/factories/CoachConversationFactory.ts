import {
  createCoachConversationService,
  type CoachConversationService,
} from "../../../features/coach-conversation/services/CoachConversationService";
import type { CoachingSessionService } from "../../../features/coaching-session/services/CoachingSessionService";
import type { CoachSupervisorService } from "../../../features/coach-supervisor/services/CoachSupervisorService";
import type { ConversationMemoryService } from "../../../features/conversation-memory/services/ConversationMemoryService";
import type { PlanHistoryService } from "../../../features/plan-history/services/PlanHistoryService";
import type { PlanRestoreService } from "../../../features/plan-restore/services/PlanRestoreService";
import type { CoachTimelineService } from "../../../features/coach-timeline/services/CoachTimelineService";
import type { ProactiveInsightsService } from "../../../features/proactive-insights/services/ProactiveInsightsService";
import type { ExplainableCoachingSessionService } from "../../../features/coaching-session/composition/services/ExplainableCoachingSessionService";
import type { SupervisorRoutingService } from "../../../features/supervisor-routing/services/SupervisorRoutingService";
import type { ActiveWorkoutPlanStore } from "../../../features/coach-conversation/store/ActiveWorkoutPlanStore";
import type { WorkoutGenerationPipelineService } from "../../../features/workout-generation-pipeline/services/WorkoutGenerationPipelineService";

export interface CoachConversationFactoryDeps {
  readonly coachingSession: CoachingSessionService;
  readonly coachSupervisor: CoachSupervisorService;
  readonly supervisorRouting: SupervisorRoutingService;
  readonly workoutPipeline?: WorkoutGenerationPipelineService | null;
  readonly planHistory?: PlanHistoryService | null;
  readonly planRestore?: PlanRestoreService | null;
  readonly coachTimeline?: CoachTimelineService | null;
  readonly proactiveInsights?: ProactiveInsightsService | null;
  readonly explainableCoachingSession?: ExplainableCoachingSessionService | null;
  readonly conversationMemory?: ConversationMemoryService;
  readonly planStore?: ActiveWorkoutPlanStore;
  readonly clock?: () => string;
}

export const CoachConversationFactory = {
  create(deps: CoachConversationFactoryDeps): CoachConversationService {
    return createCoachConversationService(deps);
  },
} as const;
