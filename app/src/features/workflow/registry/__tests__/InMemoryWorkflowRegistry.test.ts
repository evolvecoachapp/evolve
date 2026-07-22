import { InMemoryWorkflowRegistry } from "../InMemoryWorkflowRegistry";
import { GenerateWorkoutWorkflow } from "../../workflows/placeholders/GenerateWorkoutWorkflow";
import { AnalyzeProgressWorkflow } from "../../workflows/placeholders/AnalyzeProgressWorkflow";
import { WorkflowError } from "../../models/WorkflowError";
import { freezeWorkflowRegistry } from "../../utils/freezeWorkflowRegistry";

describe("InMemoryWorkflowRegistry", () => {
  it("registers workflows and looks them up by name", () => {
    const registry = new InMemoryWorkflowRegistry();
    const workflow = new GenerateWorkoutWorkflow();

    registry.register(workflow);

    expect(registry.has("generate_workout")).toBe(true);
    expect(registry.get("generate_workout")).toBe(workflow);
    expect(registry.list()).toHaveLength(1);
  });

  it("rejects duplicate workflow names", () => {
    const registry = new InMemoryWorkflowRegistry();
    registry.register(new GenerateWorkoutWorkflow());

    expect(() => registry.register(new GenerateWorkoutWorkflow())).toThrow(
      WorkflowError,
    );
  });

  it("lists unique capabilities", () => {
    const registry = new InMemoryWorkflowRegistry();
    registry.register(new GenerateWorkoutWorkflow());
    registry.register(new AnalyzeProgressWorkflow());

    expect(registry.listCapabilities()).toEqual(
      expect.arrayContaining(["generate_workout", "analyze_progress"]),
    );
  });

  it("becomes immutable after freeze", () => {
    const registry = new InMemoryWorkflowRegistry();
    registry.register(new GenerateWorkoutWorkflow());
    freezeWorkflowRegistry(registry);

    expect(registry.isFrozen()).toBe(true);
    expect(() => registry.register(new AnalyzeProgressWorkflow())).toThrow(
      WorkflowError,
    );
  });
});
