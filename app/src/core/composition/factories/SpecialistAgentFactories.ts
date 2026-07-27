import {
  createWorkoutAgentService,
  type WorkoutAgentService,
} from "../../../features/workout-agent/services/WorkoutAgentService";
import {
  createNutritionAgentService,
  type NutritionAgentService,
} from "../../../features/nutrition-agent/services/NutritionAgentService";
import {
  createRecoveryAgentService,
  type RecoveryAgentService,
} from "../../../features/recovery-agent/services/RecoveryAgentService";
import type { CoachTimelineService } from "../../../features/coach-timeline/services/CoachTimelineService";

export const WorkoutAgentFactory = {
  create(): WorkoutAgentService {
    return createWorkoutAgentService({ agentId: "agent:workout" });
  },
} as const;

export interface NutritionAgentFactoryDeps {
  readonly coachTimeline?: CoachTimelineService | null;
}

export const NutritionAgentFactory = {
  create(deps: NutritionAgentFactoryDeps = {}): NutritionAgentService {
    return createNutritionAgentService({
      agentId: "agent:nutrition",
      coachTimeline: deps.coachTimeline ?? null,
    });
  },
} as const;

export interface RecoveryAgentFactoryDeps {
  readonly coachTimeline?: CoachTimelineService | null;
}

export const RecoveryAgentFactory = {
  create(deps: RecoveryAgentFactoryDeps = {}): RecoveryAgentService {
    return createRecoveryAgentService({
      agentId: "agent:recovery",
      coachTimeline: deps.coachTimeline ?? null,
    });
  },
} as const;
