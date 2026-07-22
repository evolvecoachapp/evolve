import { PIPELINE_STEP_ORDER } from "../../../src/features/program-generation/models/PipelineStepName";
import type { WorkoutGenerationResult } from "../../../src/features/program-generation/models/WorkoutGenerationResult";
import {
  validateExecutionOrder,
  validatePipelineConsistency,
  validatePipelineDependencies,
  validatePipelineIntegrity,
  validateRequiredOutputs,
} from "../../../src/features/program-generation/validators";

/**
 * Fluent domain assertions for WorkoutGenerationResult.
 *
 * Example:
 *   expectWorkout(result)
 *     .toBeValid()
 *     .toContainProgramming()
 *     .toHaveNoDuplicateExercises()
 *     .toBeImmutable();
 */
export class WorkoutAssertions {
  constructor(private readonly result: WorkoutGenerationResult) {}

  toBeValid(): this {
    expect(this.result.validationIssues).toEqual([]);
    expect(validatePipelineIntegrity(this.result.trace.steps)).toEqual([]);
    expect(validateExecutionOrder(this.result.trace.steps)).toEqual([]);
    expect(validateRequiredOutputs(this.result)).toEqual([]);
    expect(validatePipelineDependencies(this.result)).toEqual([]);
    expect(validatePipelineConsistency(this.result)).toEqual([]);
    expect(this.result.summary.status).toBe("succeeded");
    return this;
  }

  toContainProgramming(): this {
    expect(this.result.programming).toBeDefined();
    expect(this.result.programming.prescriptions.length).toBeGreaterThan(0);
    return this;
  }

  toContainProgression(): this {
    expect(this.result.progression).toBeDefined();
    expect(this.result.progression.timeline.length).toBeGreaterThan(0);
    return this;
  }

  toContainAdaptation(): this {
    expect(this.result.adaptation).toBeDefined();
    expect(this.result.adaptation.readiness).toBeDefined();
    expect(this.result.adaptation.adaptedProgression).toBeDefined();
    return this;
  }

  toContainWorkoutSession(): this {
    expect(this.result.session).toBeDefined();
    expect(this.result.assembly.session.id).toBe(this.result.session.id);
    expect(this.result.session.exercises.length).toBeGreaterThan(0);
    return this;
  }

  toHaveExerciseOrder(): this {
    const orders = this.result.session.exercises.map((exercise) => exercise.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);
    const unique = new Set(orders);
    expect(unique.size).toBe(orders.length);
    return this;
  }

  toHaveNoDuplicateExercises(): this {
    const ids = this.result.session.exercises.map(
      (exercise) => exercise.exerciseId,
    );
    expect(new Set(ids).size).toBe(ids.length);
    return this;
  }

  toHaveExecutionTrace(): this {
    expect(this.result.trace).toBeDefined();
    expect(this.result.trace.steps.map((step) => step.name)).toEqual([
      ...PIPELINE_STEP_ORDER,
    ]);
    return this;
  }

  toHaveExecutionSummary(): this {
    expect(this.result.summary).toBeDefined();
    expect(this.result.summary.completedSteps).toEqual([...PIPELINE_STEP_ORDER]);
    expect(this.result.summary.metrics.succeededStepCount).toBe(
      PIPELINE_STEP_ORDER.length,
    );
    expect(this.result.summary.failedStep).toBeNull();
    return this;
  }

  toBeImmutable(): this {
    expect(Object.isFrozen(this.result)).toBe(true);
    expect(Object.isFrozen(this.result.summary)).toBe(true);
    expect(Object.isFrozen(this.result.trace)).toBe(true);
    expect(Object.isFrozen(this.result.validationIssues)).toBe(true);
    const before = this.result.generatedAt;
    // Non-strict mode does not throw on frozen assignment — verify no mutation.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.result as any).generatedAt = "mutated";
    expect(this.result.generatedAt).toBe(before);
    return this;
  }

  /** Full structural pipeline validation suite. */
  toPassPipelineValidation(): this {
    return this.toBeValid()
      .toContainProgramming()
      .toContainProgression()
      .toContainAdaptation()
      .toContainWorkoutSession()
      .toHaveExerciseOrder()
      .toHaveNoDuplicateExercises()
      .toHaveExecutionTrace()
      .toHaveExecutionSummary()
      .toBeImmutable();
  }
}

export function expectWorkout(
  result: WorkoutGenerationResult,
): WorkoutAssertions {
  return new WorkoutAssertions(result);
}
