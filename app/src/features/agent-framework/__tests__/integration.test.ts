import {
  describeAgent,
  listAgents,
  registerAgent,
  resolveAgent,
} from "../application";
import {
  createStubAgent,
  createTestFrameworkService,
  createWorkoutStubAgent,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { AgentCapabilityKeys } from "../models/AgentCapabilityKey";
import { AgentRoles } from "../models/AgentRole";
import { AgentPriorities } from "../models/AgentPriority";
import { PrioritySelector } from "../selectors";
import { DefaultAvailabilityPolicy } from "../policies";
import { WorkoutPlanning, Reasoning } from "../capabilities";

describe("agent-framework integration", () => {
  it("wires registry + factory + lifecycle + selectors + policies", () => {
    const service = createTestFrameworkService();
    const workout = createWorkoutStubAgent();
    const nutrition = createStubAgent({
      id: "agent:nutrition",
      name: "Nutrition Agent",
      role: AgentRoles.NUTRITION,
      priority: AgentPriorities.NORMAL,
      capabilityKeys: [
        AgentCapabilityKeys.NUTRITION_PLANNING,
        AgentCapabilityKeys.REASONING,
      ],
    });

    registerAgent({ service, agent: workout });
    registerAgent({ service, agent: nutrition });

    expect(listAgents({ service }).map((a) => a.id).sort()).toEqual([
      nutrition.id,
      workout.id,
    ]);

    const resolved = resolveAgent({
      service,
      capability: AgentCapabilityKeys.WORKOUT_PLANNING,
    });
    expect(resolved.getRole()).toBe(AgentRoles.WORKOUT);

    const snapshot = describeAgent({
      service,
      agentId: workout.id,
      clock: () => FIXED_TIMESTAMP,
    });
    expect(snapshot?.state?.status).toBe("ready");
    expect(service.getCapabilityRegistry().has(WorkoutPlanning.key)).toBe(true);
    expect(service.getCapabilityRegistry().has(Reasoning.key)).toBe(true);

    const ranked = new PrioritySelector().sortByPriority(listAgents({ service }));
    expect(ranked[0]?.id).toBe(workout.id);

    expect(DefaultAvailabilityPolicy.evaluate(workout)).toEqual([]);
  });
});
