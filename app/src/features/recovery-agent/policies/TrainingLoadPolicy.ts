import type { RecoveryContext } from "../models/RecoveryContext";
import type { RecoveryPlan } from "../models/RecoveryPlan";

export interface TrainingLoadPolicy {
  readonly id: string;
  evaluate(
    context: RecoveryContext,
    plan: RecoveryPlan | null,
  ): readonly string[];
}

export class DefaultTrainingLoadPolicy implements TrainingLoadPolicy {
  readonly id = "policy:recovery:training_load";

  evaluate(
    context: RecoveryContext,
    plan: RecoveryPlan | null,
  ): readonly string[] {
    const flags: string[] = [];
    if (context.trainingLoad.score >= 95) flags.push("training_load_extreme");
    if (
      context.constraints.maxTrainingLoad != null &&
      context.trainingLoad.score > context.constraints.maxTrainingLoad
    ) {
      flags.push("training_load_above_constraint");
    }
    if (plan && plan.assessment.trainingLoad.score > 95) {
      flags.push("plan_training_load_extreme");
    }
    return Object.freeze(flags);
  }
}
