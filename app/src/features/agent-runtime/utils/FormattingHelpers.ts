import type { AgentRuntimeEvent } from "../models/AgentRuntimeEvent";
import type { AgentRuntimeResponse } from "../models/AgentRuntimeResponse";
import type { AgentRuntimeSummary } from "../models/AgentRuntimeSummary";
import type { AgentRuntimeDescriptor } from "../models/AgentRuntimeDescriptor";

export function describeResponse(response: AgentRuntimeResponse): string {
  return [
    `request=${response.requestId}`,
    `agent=${response.selectedAgentId ?? "none"}`,
    `status=${response.status}`,
    `success=${response.success}`,
  ].join(" ");
}

export function describeSummary(summary: AgentRuntimeSummary): string {
  return [
    `request=${summary.requestId}`,
    `agent=${summary.selectedAgentId ?? "none"}`,
    `status=${summary.status}`,
    `fallback=${summary.fallbackUsed}`,
  ].join(" ");
}

export function describeEvents(events: readonly AgentRuntimeEvent[]): string {
  return events.map((e) => `${e.type}@${e.occurredAt}`).join(", ");
}

export function describeAgentDescriptor(
  descriptor: AgentRuntimeDescriptor,
): string {
  return `${descriptor.agentId} (${descriptor.role}) v${descriptor.version}`;
}
