import { DecisionFactory } from "../factories/DecisionFactory";
import { Decision } from "../models/Decision";
import { DecisionInput } from "../models/DecisionInput";
import { DecisionPriority } from "../models/DecisionPriority";
import { DecisionType } from "../models/DecisionType";
import { DecisionRule } from "./DecisionRule";

export class SorenessRule implements DecisionRule {
  constructor(private readonly decisionFactory: DecisionFactory) {}

  evaluate(input: DecisionInput): Decision | null {
    if (input.context.soreness < 8) {
      return null;
    }

    return this.decisionFactory.create(
      DecisionType.CHANGE_EXERCISE,
      "High muscle soreness detected.",
      DecisionPriority.MEDIUM,
    );
  }
}
