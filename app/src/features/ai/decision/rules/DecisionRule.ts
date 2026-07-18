import { Decision } from "../models/Decision";
import { DecisionInput } from "../models/DecisionInput";

export interface DecisionRule {
  evaluate(input: DecisionInput): Decision | null;
}
