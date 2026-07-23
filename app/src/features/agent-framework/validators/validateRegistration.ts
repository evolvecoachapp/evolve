import type { AgentCapabilityKey } from "../models/AgentCapabilityKey";
import { ALL_AGENT_CAPABILITY_KEYS } from "../models/AgentCapabilityKey";
import type { AgentCapabilities } from "../models/AgentCapabilities";
import type { AgentConfiguration } from "../models/AgentConfiguration";
import type { AgentContext } from "../models/AgentContext";
import type { AgentDependency } from "../models/AgentDependency";
import type { AgentId } from "../models/AgentId";
import { isValidAgentId } from "../models/AgentId";
import type { AgentMetadata } from "../models/AgentMetadata";
import type { AgentState } from "../models/AgentState";
import { ALL_AGENT_STATUSES } from "../models/AgentStatus";
import type { IAgent } from "../contracts/IAgent";
import { isKnownCapabilityKey } from "../utils/capabilityHelpers";

export function validateAgentId(agentId: AgentId): readonly string[] {
  const issues: string[] = [];
  if (!isValidAgentId(agentId)) {
    issues.push("agent_id_missing");
  }
  return Object.freeze(issues);
}

export function validateMetadata(metadata: AgentMetadata): readonly string[] {
  const issues: string[] = [];
  if (!metadata) {
    issues.push("metadata_missing");
    return Object.freeze(issues);
  }
  if (!Array.isArray(metadata.tags)) {
    issues.push("metadata_tags_invalid");
  }
  if (!metadata.attributes || typeof metadata.attributes !== "object") {
    issues.push("metadata_attributes_invalid");
  }
  return Object.freeze(issues);
}

export function validateCapabilities(
  capabilities: AgentCapabilities,
): readonly string[] {
  const issues: string[] = [];
  if (!capabilities) {
    issues.push("capabilities_missing");
    return Object.freeze(issues);
  }
  for (const key of ALL_AGENT_CAPABILITY_KEYS) {
    if (typeof capabilities[key] !== "boolean") {
      issues.push(`capability_flag_invalid:${key}`);
    }
  }
  return Object.freeze(issues);
}

export function validateConfiguration(
  configuration: AgentConfiguration,
): readonly string[] {
  const issues: string[] = [];
  if (!configuration) {
    issues.push("configuration_missing");
    return Object.freeze(issues);
  }
  issues.push(...validateAgentId(configuration.agentId));
  if (typeof configuration.enabled !== "boolean") {
    issues.push("configuration_enabled_invalid");
  }
  if (
    typeof configuration.maxConcurrentSessions !== "number" ||
    configuration.maxConcurrentSessions < 0
  ) {
    issues.push("configuration_max_sessions_invalid");
  }
  if (
    configuration.timeoutMs !== null &&
    (typeof configuration.timeoutMs !== "number" || configuration.timeoutMs < 0)
  ) {
    issues.push("configuration_timeout_invalid");
  }
  issues.push(...validateMetadata(configuration.metadata));
  return Object.freeze(issues);
}

export function validateDependencies(
  dependencies: readonly AgentDependency[],
): readonly string[] {
  const issues: string[] = [];
  if (!Array.isArray(dependencies)) {
    issues.push("dependencies_invalid");
    return Object.freeze(issues);
  }
  for (const dep of dependencies) {
    if (!dep.id?.trim()) {
      issues.push("dependency_id_missing");
    }
    if (dep.kind !== "agent" && dep.kind !== "capability") {
      issues.push(`dependency_kind_invalid:${dep.id}`);
    }
    if (!dep.targetId || String(dep.targetId).trim().length === 0) {
      issues.push(`dependency_target_missing:${dep.id}`);
    }
    if (dep.kind === "capability" && !isKnownCapabilityKey(String(dep.targetId))) {
      issues.push(`dependency_capability_unknown:${dep.targetId}`);
    }
  }
  return Object.freeze(issues);
}

export function validateContextIntegrity(
  context: AgentContext,
): readonly string[] {
  const issues: string[] = [];
  if (!context) {
    issues.push("context_missing");
    return Object.freeze(issues);
  }
  if (!context.id?.trim()) {
    issues.push("context_id_missing");
  }
  issues.push(...validateAgentId(context.agentId));
  for (const key of context.capabilityKeys) {
    if (!isKnownCapabilityKey(key)) {
      issues.push(`context_capability_unknown:${key}`);
    }
  }
  issues.push(...validateMetadata(context.metadata));
  return Object.freeze(issues);
}

export function validateLifecycleIntegrity(
  state: AgentState,
): readonly string[] {
  const issues: string[] = [];
  if (!state) {
    issues.push("lifecycle_state_missing");
    return Object.freeze(issues);
  }
  issues.push(...validateAgentId(state.agentId));
  if (!(ALL_AGENT_STATUSES as readonly string[]).includes(state.status)) {
    issues.push(`lifecycle_status_invalid:${state.status}`);
  }
  if (!state.updatedAt?.trim()) {
    issues.push("lifecycle_updated_at_missing");
  }
  return Object.freeze(issues);
}

export function validateRegistration(agent: IAgent): readonly string[] {
  const issues: string[] = [];
  if (!agent) {
    issues.push("agent_missing");
    return Object.freeze(issues);
  }
  issues.push(...validateAgentId(agent.id));
  const info = agent.getInfo();
  if (!info.name?.trim()) {
    issues.push("agent_name_missing");
  }
  if (!info.version?.trim()) {
    issues.push("agent_version_missing");
  }
  issues.push(...validateCapabilities(agent.getCapabilities()));
  issues.push(...validateConfiguration(agent.getConfiguration()));
  issues.push(...validateMetadata(agent.getMetadata()));
  const descriptor = agent.getDescriptor();
  issues.push(...validateDependencies(descriptor.dependencies));
  if (descriptor.identity.id !== agent.id) {
    issues.push("agent_identity_id_mismatch");
  }
  if (descriptor.configuration.agentId !== agent.id) {
    issues.push("agent_configuration_id_mismatch");
  }
  return Object.freeze(issues);
}

export function validateCapabilityKey(
  key: AgentCapabilityKey | string,
): readonly string[] {
  if (!isKnownCapabilityKey(key)) {
    return Object.freeze([`capability_unknown:${key}`]);
  }
  return Object.freeze([]);
}
