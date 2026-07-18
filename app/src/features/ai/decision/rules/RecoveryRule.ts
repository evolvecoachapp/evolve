import { DecisionFactory } from "../factories/DecisionFactory";
import { Decision } from "../models/Decision";
import { DecisionInput } from "../models/DecisionInput";
import { DecisionPriority } from "../models/DecisionPriority";
import { DecisionType } from "../models/DecisionType";
import { DecisionRule } from "./DecisionRule";

export class RecoveryRule implements DecisionRule {
  constructor(private readonly decisionFactory: DecisionFactory) {}

  evaluate(input: DecisionInput): Decision | null {
    if (input.context.recovery >= 40) {
      return null;
    }

    return this.decisionFactory.create(
      DecisionType.REST_DAY,
      "Recovery is critically low.",
      DecisionPriority.CRITICAL,
    );
  }
}
