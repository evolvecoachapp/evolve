import { createToolExecutor } from "../../../tool-calling/services/createToolExecutor";
import { InMemoryWorkflowRegistry } from "../../../workflow/registry/InMemoryWorkflowRegistry";
import { createDefaultWorkflowRegistry } from "../../../workflow/services/createWorkflowExecutor";
import { WorkflowExecutor } from "../../../workflow/services/WorkflowExecutor";
import { WorkflowPlanner } from "../../../workflow/services/WorkflowPlanner";
import {
  createWorkflowContext,
  createWorkflowRequest,
  FIXED_TIMESTAMP,
} from "../../../workflow/testSupport/fixtures";
import { createWorkoutBlueprintAIOutput } from "../../testSupport/fixtures";
import { GenerateWorkoutBlueprintWorkflow } from "../GenerateWorkoutBlueprintWorkflow";

describe("GenerateWorkoutBlueprintWorkflow", () => {
  const workflow = new GenerateWorkoutBlueprintWorkflow();
  const context = createWorkflowContext();
  const request = createWorkflowRequest({
    workflowName: "generate_workout_blueprint",
  });

  it("exposes stable name and capability", () => {
    expect(workflow.name()).toBe("generate_workout_blueprint");
    expect(workflow.capabilities()).toEqual(["generate_workout_blueprint"]);
  });

  it("plans context-loading tools without business logic", () => {
    const steps = workflow.plan(request, context);
    expect(steps.map((step) => step.toolName)).toEqual([
      "get_athlete_profile",
      "get_memory_context",
      "get_workout_history",
      "get_coach_summary",
    ]);
  });

  it("execute produces an immutable blueprint from derived strategy", async () => {
    const blueprint = await workflow.execute(request, context, []);

    expect(blueprint.id).toBe("blueprint-athlete-1");
    expect(blueprint.split.type).toBe("upper_lower");
    expect(blueprint.metadata.source).toBe("derived");
    expect(blueprint.metadata.createdAt).toBe(FIXED_TIMESTAMP);
    expect(Object.isFrozen(blueprint)).toBe(true);
    expect(blueprint.days.every((day) => typeof day.sessionGoal === "string")).toBe(
      true,
    );
  });

  it("execute prefers AI strategic payload from request arguments", async () => {
    const aiRequest = createWorkflowRequest({
      workflowName: "generate_workout_blueprint",
      arguments: Object.freeze([
        Object.freeze({
          name: "ai_blueprint",
          value: createWorkoutBlueprintAIOutput({
            id: "ai-bp-1",
            split: Object.freeze({
              type: "full_body",
              daysPerWeek: 3,
              cycleLengthDays: 7,
            }),
            weeklyFrequency: 3,
          }),
        }),
      ]),
    });

    const blueprint = await workflow.execute(aiRequest, context, []);

    expect(blueprint.id).toBe("ai-bp-1");
    expect(blueprint.split.type).toBe("full_body");
    expect(blueprint.weeklyFrequency).toBe(3);
    expect(blueprint.metadata.source).toBe("ai");
  });

  it("integrates with WorkflowExecutor end-to-end", async () => {
    const registry = new InMemoryWorkflowRegistry();
    registry.register(new GenerateWorkoutBlueprintWorkflow());
    registry.freeze();

    const executor = new WorkflowExecutor(
      registry,
      createToolExecutor(),
      new WorkflowPlanner(),
    );

    const result = await executor.execute(
      createWorkflowRequest({ workflowName: "generate_workout_blueprint" }),
      createWorkflowContext(),
    );

    expect(result.status).toBe("succeeded");
    expect(result.workflowName).toBe("generate_workout_blueprint");
    expect(result.error).toBeNull();
    expect(result.data).toMatchObject({
      id: "blueprint-athlete-1",
      weeklyFrequency: 4,
      metadata: expect.objectContaining({
        source: "derived",
        createdAt: FIXED_TIMESTAMP,
      }),
    });
  });

  it("is registered in the default workflow registry", () => {
    const registry = createDefaultWorkflowRegistry();
    expect(registry.get("generate_workout_blueprint")?.name()).toBe(
      "generate_workout_blueprint",
    );
  });
});
