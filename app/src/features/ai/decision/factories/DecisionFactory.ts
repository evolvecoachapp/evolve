import { Decision } from "../models/Decision";
import { DecisionPriority } from "../models/DecisionPriority";
import { DecisionType } from "../models/DecisionType";

export class DecisionFactory {
  create(
    type: DecisionType,
    reason: string,
    priority: DecisionPriority = DecisionPriority.MEDIUM,
    metadata?: Record<string, unknown>,
  ): Decision {
    const trimmedReason = reason.trim();

    if (trimmedReason.length === 0) {
      throw new Error("Decision reason must not be empty");
    }

    return {
      id: crypto.randomUUID(),
      type,
      priority,
      reason: trimmedReason,
      createdAt: new Date(),
      metadata,
    };
  }
}
