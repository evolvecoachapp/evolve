import { createWorkoutToolAdapter } from "../adapters/WorkoutToolAdapter";
import {
  validateAdapterCollectionIntegrity,
  validateAdapterIntegrity,
} from "../validators/validateAdapterIntegrity";
import { validateAdapterExecutionContext } from "../validators/validateAdapterExecutionContext";
import { validateInputMapping } from "../validators/validateInputMapping";
import { validateOutputMapping } from "../validators/validateOutputMapping";
import { validateToolCompatibility } from "../validators/validateToolCompatibility";
import { createExecutionContext } from "../testSupport/fixtures";
import { DomainToolIds } from "../models/DomainToolIds";

describe("domain-tools validators", () => {
  it("validateInputMapping catches missing required parameters", () => {
    const issues = validateInputMapping(
      { parameters: Object.freeze({}) },
      [{ name: "request", required: true, type: "object" }],
    );
    expect(issues).toContain("missing_required_parameter");
  });

  it("validateInputMapping catches invalid types", () => {
    const issues = validateInputMapping(
      { parameters: Object.freeze({ request: "nope" }) },
      [{ name: "request", required: true, type: "object" }],
    );
    expect(issues).toContain("invalid_parameter_type");
  });

  it("validateOutputMapping rejects undefined and functions", () => {
    expect(validateOutputMapping(undefined)).toContain("missing_output");
    expect(validateOutputMapping(() => null)).toContain("invalid_output_shape");
    expect(validateOutputMapping({ ok: true })).toEqual([]);
  });

  it("validateAdapterIntegrity accepts workout adapter", () => {
    const adapter = createWorkoutToolAdapter({
      generateWorkoutProgram: async () => ({}) as never,
      analyzeWorkoutPerformance: () => ({}) as never,
    });
    expect(validateAdapterIntegrity(adapter)).toEqual([]);
  });

  it("validateAdapterCollectionIntegrity detects duplicate tool ids", () => {
    const a = createWorkoutToolAdapter({
      generateWorkoutProgram: async () => ({}) as never,
      analyzeWorkoutPerformance: () => ({}) as never,
    });
    const b = createWorkoutToolAdapter({
      generateWorkoutProgram: async () => ({}) as never,
      analyzeWorkoutPerformance: () => ({}) as never,
    });
    expect(validateAdapterCollectionIntegrity([a, b])).toContain(
      "duplicate_tool_id",
    );
  });

  it("validateToolCompatibility reports unsupported tools", () => {
    expect(validateToolCompatibility(null, "missing")).toContain(
      "unsupported_tool",
    );
    const adapter = createWorkoutToolAdapter({
      generateWorkoutProgram: async () => ({}) as never,
      analyzeWorkoutPerformance: () => ({}) as never,
    });
    expect(
      validateToolCompatibility(adapter, DomainToolIds.WORKOUT_GENERATE),
    ).toEqual([]);
  });

  it("validateAdapterExecutionContext reuses foundation rules", () => {
    expect(validateAdapterExecutionContext(createExecutionContext())).toEqual(
      [],
    );
    expect(
      validateAdapterExecutionContext(
        Object.freeze({
          conversationId: "conv-1",
          athleteId: "athlete-1",
          streamId: null,
          executionRequestId: null,
          now: "",
          attributes: Object.freeze({}),
        }),
      ),
    ).toContain("missing_now");
  });
});

