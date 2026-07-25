import type { ContextContribution } from "../models/ContextContribution";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import { freezeContext } from "../utils/FreezeContext";
import { aggregateAthlete } from "./AthleteAggregator";
import { aggregateConversation } from "./ConversationAggregator";
import { aggregateGoal } from "./GoalAggregator";
import { aggregateNutrition } from "./NutritionAggregator";
import { aggregateRecovery } from "./RecoveryAggregator";
import { aggregateSession } from "./SessionAggregator";
import { aggregateSupervisor } from "./SupervisorAggregator";
import { aggregateWorkout } from "./WorkoutAggregator";

/**
 * Deterministic aggregation of all source slices into a context shell.
 * Aggregation only — no AI, no business calculations.
 */
export function aggregateContextSlices(input: {
  readonly context: UnifiedCoachingContext;
  readonly contributions: readonly ContextContribution[];
  readonly updatedAt: string;
}): UnifiedCoachingContext {
  const { contributions } = input;
  return freezeContext({
    ...input.context,
    conversation: aggregateConversation({
      current: input.context.conversation,
      contributions,
    }),
    session: aggregateSession({
      current: input.context.session,
      contributions,
    }),
    athlete: aggregateAthlete({
      current: input.context.athlete,
      contributions,
    }),
    workout: aggregateWorkout({
      current: input.context.workout,
      contributions,
    }),
    nutrition: aggregateNutrition({
      current: input.context.nutrition,
      contributions,
    }),
    recovery: aggregateRecovery({
      current: input.context.recovery,
      contributions,
    }),
    goal: aggregateGoal({
      current: input.context.goal,
      contributions,
    }),
    supervisor: aggregateSupervisor({
      current: input.context.supervisor,
      contributions,
    }),
    updatedAt: input.updatedAt,
  });
}
