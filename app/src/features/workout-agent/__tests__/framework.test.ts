import {
  describeAgent,
  registerAgent,
  resolveAgent,
} from "../../agent-framework/application";
import { createAgentFrameworkService } from "../../agent-framework/services/AgentFrameworkService";
import { AgentCapabilityKeys } from "../../agent-framework/models/AgentCapabilityKey";
import { AgentRoles } from "../../agent-framework/models/AgentRole";
import {
  executeAgent,
  listAgents,
} from "../../agent-runtime/application";
import { createAgentRuntimeService } from "../../agent-runtime/services/AgentRuntimeService";
import { buildAgentRuntimeRequest } from "../../agent-runtime/builders/AgentRuntimeRequestBuilder";
import {
  processWorkoutRequest,
  describeWorkoutCapabilities,
} from "../application";
import {
  createTestAgentService,
  createWorkoutRequestFixture,
  createFixedClock,
  FIXED_TIMESTAMP,
  FIXED_NOW_MS,
} from "../testSupport/fixtures";

describe("workout-agent framework migration", () => {
  it("registers with Agent Framework without changing process behavior", () => {
    const framework = createAgentFrameworkService({
      clock: createFixedClock(),
    });
    const service = createTestAgentService();
    service.registerWithFramework(framework);

    const frameworkAgent = resolveAgent({
      service: framework,
      role: AgentRoles.WORKOUT,
    });
    expect(frameworkAgent.id).toBe("agent:workout:test");
    expect(
      frameworkAgent.supports(AgentCapabilityKeys.WORKOUT_PLANNING),
    ).toBe(true);

    const snapshot = describeAgent({
      service: framework,
      agentId: frameworkAgent.id,
      clock: () => FIXED_TIMESTAMP,
    });
    expect(snapshot?.descriptor.identity.role).toBe(AgentRoles.WORKOUT);

    const result = processWorkoutRequest({
      service,
      request: createWorkoutRequestFixture(),
    });
    expect(result.success).toBe(true);
    expect(result.decision.accepted).toBe(true);

    const described = describeWorkoutCapabilities({ service });
    expect(described.name).toBe("Workout Agent");
  });

  it("asFrameworkAgent is registerable via public registerAgent API", () => {
    const framework = createAgentFrameworkService({
      clock: createFixedClock(),
    });
    const service = createTestAgentService();
    registerAgent({ service: framework, agent: service.asFrameworkAgent() });

    expect(
      resolveAgent({
        service: framework,
        capability: AgentCapabilityKeys.WORKOUT_PLANNING,
      }).getRole(),
    ).toBe(AgentRoles.WORKOUT);
  });

  it("registers with Agent Runtime and executes via workout executor", async () => {
    const runtime = createAgentRuntimeService({
      clock: createFixedClock(),
      nowMs: () => FIXED_NOW_MS,
      runtimeId: "runtime:workout:test",
    });
    const service = createTestAgentService();
    service.registerWithRuntime(runtime);

    expect(listAgents({ service: runtime }).map((a) => a.id)).toContain(
      "agent:workout:test",
    );

    const response = await executeAgent({
      service: runtime,
      request: buildAgentRuntimeRequest({
        id: "areq:workout:1",
        agentId: "agent:workout:test",
        intent: "plan hypertrophy",
        attributes: Object.freeze({
          message: "Build a hypertrophy workout plan for 4 days per week",
          athleteId: "athlete-1",
        }),
        createdAt: FIXED_TIMESTAMP,
      }),
    });

    expect(response.success).toBe(true);
    expect(response.result?.attributes.workoutResultId).toBeTruthy();
    expect(
      Number(response.result?.attributes.domainInvocationCount),
    ).toBeGreaterThan(0);
  });
});
