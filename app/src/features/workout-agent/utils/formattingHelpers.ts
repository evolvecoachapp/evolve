import type { WorkoutAgent } from "../models/WorkoutAgent";
import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";

export function describeAgent(agent: WorkoutAgent): string {
  return `${agent.name} v${agent.version} (${agent.capabilities.length} capabilities)`;
}

export function describeProposal(proposal: WorkoutPlanProposal): string {
  return `${proposal.split} · ${proposal.daysPerWeek}d · ${proposal.primaryLifts.length} primaries`;
}

export function formatCapabilities(
  capabilities: readonly string[],
): readonly string[] {
  return Object.freeze([...capabilities].sort());
}
