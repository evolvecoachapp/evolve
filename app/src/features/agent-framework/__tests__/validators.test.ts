import {
  validateCapabilities,
  validateConfiguration,
  validateContextIntegrity,
  validateDependencies,
  validateLifecycleIntegrity,
  validateMetadata,
  validateRegistration,
} from "../validators";
import {
  createStubAgent,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { createCapabilities } from "../models/AgentCapabilities";
import { createDefaultConfiguration } from "../models/AgentConfiguration";
import { EMPTY_AGENT_METADATA } from "../models/AgentMetadata";
import { AgentStatuses } from "../models/AgentStatus";
import { AgentCapabilityKeys } from "../models/AgentCapabilityKey";
import { buildAgentContext } from "../builders";

describe("agent-framework validators", () => {
  it("validates registration of a stub agent", () => {
    const issues = validateRegistration(createStubAgent());
    expect(issues).toEqual([]);
  });

  it("flags missing configuration and metadata issues", () => {
    expect(validateMetadata(EMPTY_AGENT_METADATA)).toEqual([]);
    expect(
      validateConfiguration(createDefaultConfiguration("agent:1")),
    ).toEqual([]);
    expect(validateCapabilities(createCapabilities())).toEqual([]);
  });

  it("validates dependencies / context / lifecycle", () => {
    expect(
      validateDependencies([
        Object.freeze({
          id: "dep:1",
          kind: "capability" as const,
          targetId: AgentCapabilityKeys.REASONING,
          required: true,
          description: "needs reasoning",
        }),
      ]),
    ).toEqual([]);

    expect(
      validateDependencies([
        Object.freeze({
          id: "dep:bad",
          kind: "capability" as const,
          targetId: "not_a_capability",
          required: true,
          description: "bad",
        }),
      ]),
    ).toContain("dependency_capability_unknown:not_a_capability");

    const context = buildAgentContext({
      agentId: "agent:1",
      createdAt: FIXED_TIMESTAMP,
    });
    expect(validateContextIntegrity(context)).toEqual([]);

    expect(
      validateLifecycleIntegrity(
        Object.freeze({
          agentId: "agent:1",
          sessionId: null,
          status: AgentStatuses.READY,
          requestId: null,
          errorMessage: null,
          updatedAt: FIXED_TIMESTAMP,
        }),
      ),
    ).toEqual([]);
  });
});
