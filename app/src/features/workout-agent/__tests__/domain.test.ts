import { DomainCapabilitySelector } from "../selectors/DomainCapabilitySelector";
import { WorkoutDomainCapabilities } from "../models/WorkoutDomainCapability";
import { WorkoutIntents } from "../models/WorkoutIntent";
import {
  createWorkoutDomainGateway,
} from "../orchestrator/WorkoutDomainGateway";
import type { TrainingAdaptationRequest } from "../../training-adaptation/models/TrainingAdaptationRequest";
import type { TrainingAdaptationResult } from "../../training-adaptation/models/TrainingAdaptationResult";
import { WorkoutDomainInvocationStatuses } from "../models/WorkoutDomainInvocation";
import { FIXED_TIMESTAMP, createFixedClock } from "../testSupport/fixtures";

describe("workout-agent domain gateway", () => {
  it("selects domain capabilities for plan intent", () => {
    const selected = new DomainCapabilitySelector().select(
      WorkoutIntents.PLAN_WORKOUT,
    );
    expect(selected).toContain(WorkoutDomainCapabilities.PROGRAM_GENERATION);
    expect(selected).toContain(WorkoutDomainCapabilities.WORKOUT_ASSEMBLY);
  });

  it("plans invocations without calling domain ports", () => {
    const gateway = createWorkoutDomainGateway({
      clock: createFixedClock(),
    });
    const planned = gateway.planInvocations(
      WorkoutIntents.ADAPT_WORKOUT,
      "ctx:1",
    );
    expect(planned.length).toBeGreaterThan(0);
    expect(planned.every((item) => item.status === "selected")).toBe(true);
    expect(planned[0]?.invokedAt).toBe(FIXED_TIMESTAMP);
  });

  it("invokeAdaptation delegates to Training Adaptation port", async () => {
    const adaptationResult = {
      requestId: "adapt:1",
      recommendations: Object.freeze([{ id: "rec:1" }]),
      readiness: { overallScore: 70 },
    } as unknown as TrainingAdaptationResult;

    const gateway = createWorkoutDomainGateway({
      clock: createFixedClock(),
      ports: {
        previewAdaptations: async () => adaptationResult,
      },
    });

    const { invocation, result } = await gateway.invokeAdaptation(
      { blueprint: {}, progression: {} } as unknown as TrainingAdaptationRequest,
      "ctx:adapt",
    );

    expect(result.requestId).toBe("adapt:1");
    expect(invocation.status).toBe(WorkoutDomainInvocationStatuses.INVOKED);
    expect(invocation.capability).toBe(
      WorkoutDomainCapabilities.TRAINING_ADAPTATION,
    );
    expect(invocation.attributes.recommendationCount).toBe("1");
  });

  it("invokeSelected skips missing payloads", async () => {
    const gateway = createWorkoutDomainGateway({
      clock: createFixedClock(),
    });
    const invocations = await gateway.invokeSelected(
      WorkoutIntents.PLAN_WORKOUT,
      "ctx:skip",
      {},
    );
    expect(invocations.length).toBeGreaterThan(0);
    expect(
      invocations.every(
        (item) => item.status === WorkoutDomainInvocationStatuses.SKIPPED,
      ),
    ).toBe(true);
  });
});
