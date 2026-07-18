import { DecisionFactory } from "../factories/DecisionFactory";
import { Decision } from "../models/Decision";
import { DecisionInput } from "../models/DecisionInput";
import { DecisionPriority } from "../models/DecisionPriority";
import { DecisionType } from "../models/DecisionType";
import { AdherenceRule } from "../rules/AdherenceRule";
import { DecisionRule } from "../rules/DecisionRule";
import { FatigueRule } from "../rules/FatigueRule";
import { RecoveryRule } from "../rules/RecoveryRule";
import { SorenessRule } from "../rules/SorenessRule";
import { WorkoutCompletionRule } from "../rules/WorkoutCompletionRule";

export class DecisionEngine {
  private readonly decisionFactory = new DecisionFactory();

  private readonly rules: DecisionRule[] = [
    new WorkoutCompletionRule(this.decisionFactory),
    new RecoveryRule(this.decisionFactory),
    new FatigueRule(this.decisionFactory),
    new SorenessRule(this.decisionFactory),
    new AdherenceRule(this.decisionFactory),
  ];

  evaluate(input: DecisionInput): Decision {
    for (const rule of this.rules) {
      const decision = rule.evaluate(input);

      if (decision !== null) {
        return decision;
      }
    }

    return this.decisionFactory.create(
      DecisionType.KEEP_PLAN,
      "No changes required.",
      DecisionPriority.MEDIUM,
    );
  }
}
