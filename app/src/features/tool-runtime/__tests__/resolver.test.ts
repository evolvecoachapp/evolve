import { ToolResolver } from "../resolver/ToolResolver";
import { DomainToolIds } from "../../domain-tools/models/DomainToolIds";
import {
  createMockAdapterCatalog,
  createMultiStepActionPlanFixture,
  createWorkoutActionPlanFixture,
} from "../testSupport/fixtures";

describe("tool-runtime resolver", () => {
  it("resolves workout ActionStep to workout adapter", () => {
    const resolver = new ToolResolver(createMockAdapterCatalog());
    const plan = createWorkoutActionPlanFixture();
    const binding = resolver.resolveStep(plan.steps[0], {
      planId: "texec:1",
    });

    expect(binding.toolId).toBe(DomainToolIds.WORKOUT_GENERATE);
    expect(binding.adapter?.id()).toBe("adapter.workout.mock");
    expect(binding.executionStep.status).toBe("ready");
  });

  it("marks reminder steps as blocked when no tool mapping", () => {
    const resolver = new ToolResolver(createMockAdapterCatalog());
    const plan = createMultiStepActionPlanFixture();
    const reminder = plan.steps.find((s) => s.type === "reminder")!;
    const binding = resolver.resolveStep(reminder, { planId: "texec:2" });

    expect(binding.toolId).toBeNull();
    expect(binding.adapter).toBeNull();
    expect(binding.executionStep.status).toBe("blocked");
  });

  it("CapabilityResolver lists available tools", () => {
    const resolver = new ToolResolver(createMockAdapterCatalog());
    const tools = resolver.capabilityResolver.listAvailableToolIds();
    expect(tools).toContain(DomainToolIds.WORKOUT_GENERATE);
    expect(tools).toContain(DomainToolIds.RECOVERY_ANALYZE);
  });
});
