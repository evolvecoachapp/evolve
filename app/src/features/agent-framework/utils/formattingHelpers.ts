import type { AgentDescriptor } from "../models/AgentDescriptor";
import type { AgentIdentity } from "../models/AgentIdentity";
import { listEnabledCapabilities } from "../models/AgentCapabilities";

export function formatAgentIdentity(identity: AgentIdentity): string {
  return `${identity.displayName} (${identity.id}@${identity.version})`;
}

export function formatAgentDescriptor(descriptor: AgentDescriptor): string {
  const caps = listEnabledCapabilities(descriptor.capabilities).join(",");
  return [
    formatAgentIdentity(descriptor.identity),
    `role=${descriptor.identity.role}`,
    `status=${descriptor.status}`,
    `priority=${descriptor.priority}`,
    `capabilities=[${caps}]`,
  ].join(" ");
}

export function formatAgentId(id: string): string {
  return id.trim().toLowerCase();
}
