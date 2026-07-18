import { DecisionContext } from "./DecisionContext";

export interface DecisionInput {
  context: DecisionContext;

  metadata?: Record<string, unknown>;
}
