import type { Agent } from "../models/Agent";
import type { AgentCapabilities } from "../models/AgentCapabilities";
import type { AgentConfiguration } from "../models/AgentConfiguration";
import type { AgentContext } from "../models/AgentContext";
import type { AgentDependency } from "../models/AgentDependency";
import type { AgentDescriptor } from "../models/AgentDescriptor";
import type { AgentExecutionContext } from "../models/AgentExecutionContext";
import type { AgentExecutionResult } from "../models/AgentExecutionResult";
import type { AgentFeature } from "../models/AgentFeature";
import type { AgentHealth } from "../models/AgentHealth";
import type { AgentIdentity } from "../models/AgentIdentity";
import type { AgentMetadata } from "../models/AgentMetadata";
import type { AgentPackage } from "../models/AgentPackage";
import type { AgentRequest } from "../models/AgentRequest";
import type { AgentResponse } from "../models/AgentResponse";
import type { AgentSession } from "../models/AgentSession";
import type { AgentSnapshot } from "../models/AgentSnapshot";
import type { AgentState } from "../models/AgentState";
import type { AgentStatistics } from "../models/AgentStatistics";

export function freezeMetadata(metadata: AgentMetadata): AgentMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeCapabilities(
  capabilities: AgentCapabilities,
): AgentCapabilities {
  return Object.freeze({ ...capabilities });
}

export function freezeConfiguration(
  configuration: AgentConfiguration,
): AgentConfiguration {
  return Object.freeze({
    ...configuration,
    metadata: freezeMetadata(configuration.metadata),
  });
}

export function freezeHealth(health: AgentHealth): AgentHealth {
  return Object.freeze({
    ...health,
    details: Object.freeze({ ...health.details }),
  });
}

export function freezeIdentity(identity: AgentIdentity): AgentIdentity {
  return Object.freeze({ ...identity });
}

export function freezeFeature(feature: AgentFeature): AgentFeature {
  return Object.freeze({ ...feature });
}

export function freezeDependency(
  dependency: AgentDependency,
): AgentDependency {
  return Object.freeze({ ...dependency });
}

export function freezeStatistics(
  statistics: AgentStatistics,
): AgentStatistics {
  return Object.freeze({ ...statistics });
}

export function freezeState(state: AgentState): AgentState {
  return Object.freeze({ ...state });
}

export function freezeSession(session: AgentSession): AgentSession {
  return Object.freeze({
    ...session,
    state: freezeState(session.state),
    metadata: freezeMetadata(session.metadata),
  });
}

export function freezeContext(context: AgentContext): AgentContext {
  return Object.freeze({
    ...context,
    capabilityKeys: Object.freeze([...context.capabilityKeys]),
    attributes: Object.freeze({ ...context.attributes }),
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezeRequest(request: AgentRequest): AgentRequest {
  return Object.freeze({
    ...request,
    attributes: Object.freeze({ ...request.attributes }),
    metadata: freezeMetadata(request.metadata),
  });
}

export function freezeResponse(response: AgentResponse): AgentResponse {
  return Object.freeze({
    ...response,
    attributes: Object.freeze({ ...response.attributes }),
    metadata: freezeMetadata(response.metadata),
  });
}

export function freezeDescriptor(
  descriptor: AgentDescriptor,
): AgentDescriptor {
  return Object.freeze({
    ...descriptor,
    identity: freezeIdentity(descriptor.identity),
    capabilities: freezeCapabilities(descriptor.capabilities),
    configuration: freezeConfiguration(descriptor.configuration),
    dependencies: Object.freeze(descriptor.dependencies.map(freezeDependency)),
    features: Object.freeze(descriptor.features.map(freezeFeature)),
    metadata: freezeMetadata(descriptor.metadata),
  });
}

export function freezeAgent(agent: Agent): Agent {
  return Object.freeze({
    ...agent,
    capabilities: freezeCapabilities(agent.capabilities),
    configuration: freezeConfiguration(agent.configuration),
    health: agent.health ? freezeHealth(agent.health) : null,
    metadata: freezeMetadata(agent.metadata),
  });
}

export function freezeExecutionContext(
  context: AgentExecutionContext,
): AgentExecutionContext {
  return Object.freeze({
    ...context,
    request: freezeRequest(context.request),
    context: freezeContext(context.context),
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezeExecutionResult(
  result: AgentExecutionResult,
): AgentExecutionResult {
  return Object.freeze({
    ...result,
    executionContext: freezeExecutionContext(result.executionContext),
    response: result.response ? freezeResponse(result.response) : null,
    statistics: freezeStatistics(result.statistics),
    metadata: freezeMetadata(result.metadata),
  });
}

export function freezeSnapshot(snapshot: AgentSnapshot): AgentSnapshot {
  return Object.freeze({
    ...snapshot,
    descriptor: freezeDescriptor(snapshot.descriptor),
    state: snapshot.state ? freezeState(snapshot.state) : null,
    health: freezeHealth(snapshot.health),
    statistics: freezeStatistics(snapshot.statistics),
    metadata: freezeMetadata(snapshot.metadata),
  });
}

export function freezePackage(pkg: AgentPackage): AgentPackage {
  return Object.freeze({
    ...pkg,
    descriptor: freezeDescriptor(pkg.descriptor),
    features: Object.freeze(pkg.features.map(freezeFeature)),
    statistics: freezeStatistics(pkg.statistics),
    metadata: freezeMetadata(pkg.metadata),
  });
}

/**
 * Freeze bag for agent framework immutability helpers.
 */
export const FreezeAgent = Object.freeze({
  freezeAgent,
  freezeDescriptor,
  freezeContext,
  freezeRequest,
  freezeResponse,
  freezeState,
  freezeSession,
  freezeSnapshot,
  freezePackage,
  freezeExecutionResult,
  freezeMetadata,
  freezeCapabilities,
  freezeConfiguration,
  freezeHealth,
  freezeStatistics,
});
