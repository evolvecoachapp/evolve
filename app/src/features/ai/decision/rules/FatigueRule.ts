import { DecisionFactory } from "../factories/DecisionFactory";
import { Decision } from "../models/Decision";
import { DecisionInput } from "../models/DecisionInput";
import { DecisionPriority } from "../models/DecisionPriority";
import { DecisionType } from "../models/DecisionType";
import { DecisionRule } from "./DecisionRule";

export class FatigueRule implements DecisionRule {
  constructor(private readonly decisionFactory: DecisionFactory) {}

  evaluate(input: DecisionInput): Decision | null {
    if (input.context.fatigue < 8) {
      return null;
    }

    return this.decisionFactory.create(
      DecisionType.REDUCE_VOLUME,
      "Fatigue is too high.",
      DecisionPriority.HIGH,
    );
  }
}
