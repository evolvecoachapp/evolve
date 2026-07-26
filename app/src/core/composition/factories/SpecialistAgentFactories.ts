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

export const WorkoutAgentFactory = {
  create(): WorkoutAgentService {
    return createWorkoutAgentService({ agentId: "agent:workout" });
  },
} as const;

export const NutritionAgentFactory = {
  create(): NutritionAgentService {
    return createNutritionAgentService({ agentId: "agent:nutrition" });
  },
} as const;

export const RecoveryAgentFactory = {
  create(): RecoveryAgentService {
    return createRecoveryAgentService({ agentId: "agent:recovery" });
  },
} as const;
