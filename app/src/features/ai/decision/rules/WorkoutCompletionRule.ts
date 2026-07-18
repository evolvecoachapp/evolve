import { DecisionFactory } from "../factories/DecisionFactory";
import { Decision } from "../models/Decision";
import { DecisionInput } from "../models/DecisionInput";
import { DecisionPriority } from "../models/DecisionPriority";
import { DecisionType } from "../models/DecisionType";
import { DecisionRule } from "./DecisionRule";

export class WorkoutCompletionRule implements DecisionRule {
  constructor(private readonly decisionFactory: DecisionFactory) {}

  evaluate(input: DecisionInput): Decision | null {
    if (input.context.workoutCompleted) {
      return null;
    }

    return this.decisionFactory.create(
      DecisionType.KEEP_PLAN,
      "Workout not completed.",
      DecisionPriority.HIGH,
    );
  }
}
