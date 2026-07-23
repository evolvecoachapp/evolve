import { AgentRegistry } from "../registry/AgentRegistry";
import {
  createGenericAgent,
  createNutritionAgent,
  createWorkoutAgent,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { AgentCapabilityKeys } from "../../agent-framework/models/AgentCapabilityKey";
import { AgentRoles } from "../../agent-framework/models/AgentRole";

describe("agent-runtime registry", () => {
  it("registers and looks up by id / role / capability immutably", () => {
    const empty = AgentRegistry.empty();
    const workout = createWorkoutAgent();
    const nutrition = createNutritionAgent();

    const withWorkout = empty.register(workout, {
      registeredAt: FIXED_TIMESTAMP,
    });
    expect(empty.size()).toBe(0);
    expect(withWorkout.size()).toBe(1);

    const withBoth = withWorkout.register(nutrition, {
      registeredAt: FIXED_TIMESTAMP,
    });
    expect(withWorkout.size()).toBe(1);
    expect(withBoth.size()).toBe(2);

    expect(withBoth.lookupById(workout.id)?.id).toBe(workout.id);
    expect(withBoth.lookupByRole(AgentRoles.NUTRITION).map((a) => a.id)).toEqual([
      nutrition.id,
    ]);
    expect(
      withBoth
        .lookupByCapability(AgentCapabilityKeys.WORKOUT_PLANNING)
        .map((a) => a.id),
    ).toEqual([workout.id]);
    expect(withBoth.list().map((a) => a.id).sort()).toEqual(
      [nutrition.id, workout.id].sort(),
    );
  });

  it("unregister returns a new registry without mutating the previous", () => {
    const registry = AgentRegistry.empty()
      .register(createWorkoutAgent(), { registeredAt: FIXED_TIMESTAMP })
      .register(createGenericAgent(), { registeredAt: FIXED_TIMESTAMP });

    const removed = registry.unregister("agent:workout:runtime");
    expect(registry.has("agent:workout:runtime")).toBe(true);
    expect(removed.has("agent:workout:runtime")).toBe(false);
    expect(removed.size()).toBe(1);
  });

  it("rejects duplicate registration", () => {
    const workout = createWorkoutAgent();
    const registry = AgentRegistry.empty().register(workout, {
      registeredAt: FIXED_TIMESTAMP,
    });
    expect(() =>
      registry.register(workout, { registeredAt: FIXED_TIMESTAMP }),
    ).toThrow(/already registered/);
  });
});
