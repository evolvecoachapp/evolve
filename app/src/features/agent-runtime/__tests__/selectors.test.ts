import { AgentSelector } from "../selectors/AgentSelector";
import {
  createFallbackRequest,
  createGenericAgent,
  createNutritionAgent,
  createRoleRequest,
  createWorkoutAgent,
  createCapabilityRequest,
  createAgentIdRequest,
} from "../testSupport/fixtures";
import { AgentCapabilityKeys } from "../../agent-framework/models/AgentCapabilityKey";
import { AgentRoles } from "../../agent-framework/models/AgentRole";
import { AgentPriorities } from "../../agent-framework/models/AgentPriority";
import { createStubAgent } from "../../agent-framework/testSupport/fixtures";
import { buildAgentRuntimeRequest } from "../builders/AgentRuntimeRequestBuilder";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("agent-runtime selectors", () => {
  const selector = new AgentSelector();

  it("selects by role with priority ranking", () => {
    const low = createStubAgent({
      id: "agent:workout:low",
      role: AgentRoles.WORKOUT,
      priority: AgentPriorities.LOW,
      capabilityKeys: [AgentCapabilityKeys.WORKOUT_PLANNING],
    });
    const high = createWorkoutAgent();
    const selection = selector.select(
      [low, high, createNutritionAgent()],
      createRoleRequest(AgentRoles.WORKOUT),
    );
    expect(selection.agentId).toBe(high.id);
    expect(selection.matchedBy).toBe("role");
    expect(selection.fallbackUsed).toBe(false);
  });

  it("selects by capability and agent id", () => {
    const agents = [createWorkoutAgent(), createNutritionAgent()];
    const byCap = selector.select(
      agents,
      createCapabilityRequest(AgentCapabilityKeys.NUTRITION_PLANNING),
    );
    expect(byCap.agentId).toBe("agent:nutrition:runtime");
    expect(byCap.matchedBy).toBe("capability");

    const byId = selector.select(
      agents,
      createAgentIdRequest("agent:workout:runtime"),
    );
    expect(byId.matchedBy).toBe("agent_id");
  });

  it("uses fallback when primary criteria miss", () => {
    const agents = [createGenericAgent(), createWorkoutAgent()];
    const selection = selector.select(agents, createFallbackRequest());
    expect(selection.agentId).toBe("agent:generic:runtime");
    expect(selection.matchedBy).toBe("fallback_role");
    expect(selection.fallbackUsed).toBe(true);
  });

  it("throws when no agent matches", () => {
    expect(() =>
      selector.select(
        [createWorkoutAgent()],
        buildAgentRuntimeRequest({
          id: "areq:none",
          role: AgentRoles.GOAL,
          createdAt: FIXED_TIMESTAMP,
        }),
      ),
    ).toThrow(/No agent matched/);
  });
});
