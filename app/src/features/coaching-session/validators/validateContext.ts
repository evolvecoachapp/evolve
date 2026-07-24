import { applyContextPolicy } from "../policies/ContextPolicy";
import { applyConsistencyPolicy } from "../policies/ConsistencyPolicy";
import type { SessionContext } from "../models/SessionContext";
import type { SessionResponse } from "../models/SessionResponse";
import type { SessionValidation } from "../models/SessionValidation";
import { validateHistory } from "./validateHistory";

export function validateContext(input: {
  readonly context: SessionContext;
  readonly response?: SessionResponse | null;
}): SessionValidation {
  const issues = [
    ...applyContextPolicy(input.context).issues,
    ...applyConsistencyPolicy({
      context: input.context,
      response: input.response ?? null,
    }).issues,
    ...validateHistory(input.context.history).issues,
  ];
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
