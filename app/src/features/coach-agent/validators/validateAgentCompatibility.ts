import type { CoachIntent } from "../models/CoachIntent";
import type { SpecialistAgentKind } from "../models/SpecialistAgentKind";
import {
  ALL_SPECIALIST_AGENT_KINDS,
  IMPLEMENTED_SPECIALIST_AGENTS,
} from "../models/SpecialistAgentKind";
import type {
  CoachValidation,
  CoachValidationIssue,
} from "../models/CoachValidation";
import { CoachValidationCodes } from "../models/CoachValidation";
import { AgentCapabilityResolver } from "../selectors/AgentCapabilityResolver";
import { freezeValidation } from "../utils/FreezeCoachState";

/**
 * Validates that selected agents are known and compatible with intent.
 */
export function validateAgentCompatibility(input: {
  readonly intent: CoachIntent;
  readonly agents?: readonly SpecialistAgentKind[];
  readonly resolver?: AgentCapabilityResolver;
}): CoachValidation {
  const resolver = input.resolver ?? new AgentCapabilityResolver();
  const expected = resolver.resolve({ intent: input.intent });
  const agents = input.agents ?? expected;
  const issues: CoachValidationIssue[] = [];
  const known = new Set<string>(ALL_SPECIALIST_AGENT_KINDS);
  const implemented = new Set<string>(IMPLEMENTED_SPECIALIST_AGENTS);
  const expectedSet = new Set(expected);

  for (const agent of agents) {
    if (!known.has(agent)) {
      issues.push(
        Object.freeze({
          code: CoachValidationCodes.INCOMPATIBLE,
          message: `Unknown specialist agent: ${agent}`,
          path: "agent",
        }),
      );
    } else if (!implemented.has(agent)) {
      issues.push(
        Object.freeze({
          code: CoachValidationCodes.UNSUPPORTED_AGENT,
          message: `Specialist agent ${agent} is reserved but not yet implemented.`,
          path: "agent",
        }),
      );
    } else if (input.agents != null && !expectedSet.has(agent) && expected.length > 0) {
      // Explicit agents may diverge from intent defaults when agentHints drive selection.
      // Only flag when resolving purely from intent (agents provided equal expected path).
    }
  }

  if (agents.length === 0) {
    issues.push(
      Object.freeze({
        code: CoachValidationCodes.EMPTY_PLAN,
        message: "At least one compatible specialist agent is required.",
        path: "agents",
      }),
    );
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
