import { DecisionFactory } from "../factories/DecisionFactory";
import { Decision } from "../models/Decision";
import { DecisionInput } from "../models/DecisionInput";
import { DecisionPriority } from "../models/DecisionPriority";
import { DecisionType } from "../models/DecisionType";
import { DecisionRule } from "./DecisionRule";

export class AdherenceRule implements DecisionRule {
  constructor(private readonly decisionFactory: DecisionFactory) {}

  evaluate(input: DecisionInput): Decision | null {
    if (input.context.adherence < 95) {
      return null;
    }

    return this.decisionFactory.create(
      DecisionType.INCREASE_VOLUME,
      "Excellent adherence.",
      DecisionPriority.LOW,
    );
  }
}
