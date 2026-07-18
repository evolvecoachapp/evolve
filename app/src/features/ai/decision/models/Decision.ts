import { DecisionPriority } from "./DecisionPriority";
import { DecisionType } from "./DecisionType";

export interface Decision {
  id: string;

  type: DecisionType;

  priority: DecisionPriority;

  reason: string;

  createdAt: Date;

  metadata?: Record<string, unknown>;
}
