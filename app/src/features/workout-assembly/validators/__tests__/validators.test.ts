import { WorkoutAssemblyEngine } from "../../engine/WorkoutAssemblyEngine";
import { createWorkoutAssemblyRequest } from "../../testSupport/fixtures";
import {
  validateAdaptationConsistency,
  validateDuplicatePrevention,
  validateExerciseOrdering,
  validatePrescriptionConsistency,
  validateSessionIntegrity,
  validateWorkoutAssemblyResult,
} from "../index";

describe("workout assembly validators", () => {
  it("accepts a well-formed assembly result", async () => {
    const engine = new WorkoutAssemblyEngine();
    const request = await createWorkoutAssemblyRequest();
    const result = await engine.assemble(request);

    expect(
      validateWorkoutAssemblyResult(
        request,
        result.session,
        request.adaptation.recommendations,
      ),
    ).toEqual([]);
  });

  it("detects exercise ordering violations", () => {
    const disordered = Object.freeze([
      Object.freeze({
        id: "b",
        exerciseId: "ex-b",
        name: "B",
        role: "primary" as const,
        order: 2,
        blockId: "block:primary",
        sets: Object.freeze([]),
        setCount: 0,
        repMin: 5,
        repMax: 5,
        intensityMetric: "rpe" as const,
        intensityValue: 7,
        restSeconds: 90,
        betweenSetsRestSeconds: 90,
        tempo: null,
        notes: Object.freeze([]),
        cues: Object.freeze([]),
        appliedRecommendationIds: Object.freeze([]),
        estimatedDurationSeconds: 0,
        estimatedWorkload: 0,
        fatigueEstimate: 1,
        skillEstimate: 1,
      }),
      Object.freeze({
        id: "a",
        exerciseId: "ex-a",
        name: "A",
        role: "primary" as const,
        order: 1,
        blockId: "block:primary",
        sets: Object.freeze([]),
        setCount: 0,
        repMin: 5,
        repMax: 5,
        intensityMetric: "rpe" as const,
        intensityValue: 7,
        restSeconds: 90,
        betweenSetsRestSeconds: 90,
        tempo: null,
        notes: Object.freeze([]),
        cues: Object.freeze([]),
        appliedRecommendationIds: Object.freeze([]),
        estimatedDurationSeconds: 0,
        estimatedWorkload: 0,
        fatigueEstimate: 1,
        skillEstimate: 1,
      }),
    ]);

    expect(validateExerciseOrdering(disordered)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/exercise_order_not_ascending/),
      ]),
    );
  });

  it("detects duplicate exercise ids", () => {
    const exercise = Object.freeze({
      id: "dup",
      exerciseId: "bench-press",
      name: "Bench",
      role: "primary" as const,
      order: 1,
      blockId: "block:primary",
      sets: Object.freeze([
        Object.freeze({
          setIndex: 1,
          repMin: 5,
          repMax: 8,
          targetRpe: 7,
          targetRir: null,
        }),
      ]),
      setCount: 1,
      repMin: 5,
      repMax: 8,
      intensityMetric: "rpe" as const,
      intensityValue: 7,
      restSeconds: 90,
      betweenSetsRestSeconds: 90,
      tempo: null,
      notes: Object.freeze([]),
      cues: Object.freeze([]),
      appliedRecommendationIds: Object.freeze([]),
      estimatedDurationSeconds: 40,
      estimatedWorkload: 10,
      fatigueEstimate: 1,
      skillEstimate: 1,
    });

    expect(validateDuplicatePrevention([exercise, exercise])).toEqual(
      expect.arrayContaining([
        "duplicate_workout_exercise_id:dup",
        "duplicate_exercise_id:bench-press",
      ]),
    );
  });

  it("detects prescription consistency issues", () => {
    const broken = Object.freeze({
      id: "ex-1",
      exerciseId: "bench-press",
      name: "Bench",
      role: "primary" as const,
      order: 1,
      blockId: "block:primary",
      sets: Object.freeze([]),
      setCount: 3,
      repMin: 8,
      repMax: 5,
      intensityMetric: "none" as const,
      intensityValue: null,
      restSeconds: 90,
      betweenSetsRestSeconds: 90,
      tempo: null,
      notes: Object.freeze([]),
      cues: Object.freeze([]),
      appliedRecommendationIds: Object.freeze([]),
      estimatedDurationSeconds: 0,
      estimatedWorkload: 0,
      fatigueEstimate: 1,
      skillEstimate: 1,
    });

    expect(validatePrescriptionConsistency([broken])).toEqual(
      expect.arrayContaining([
        "prescription_set_count_mismatch:ex-1",
        "prescription_rep_range_invalid:ex-1",
      ]),
    );
  });

  it("detects unknown applied adaptation ids", () => {
    const exercise = Object.freeze({
      id: "ex-1",
      exerciseId: "bench-press",
      name: "Bench",
      role: "primary" as const,
      order: 1,
      blockId: "block:primary",
      sets: Object.freeze([
        Object.freeze({
          setIndex: 1,
          repMin: 5,
          repMax: 5,
          targetRpe: null,
          targetRir: null,
        }),
      ]),
      setCount: 1,
      repMin: 5,
      repMax: 5,
      intensityMetric: "none" as const,
      intensityValue: null,
      restSeconds: 60,
      betweenSetsRestSeconds: 60,
      tempo: null,
      notes: Object.freeze([]),
      cues: Object.freeze([]),
      appliedRecommendationIds: Object.freeze(["missing-rec"]),
      estimatedDurationSeconds: 40,
      estimatedWorkload: 5,
      fatigueEstimate: 1,
      skillEstimate: 1,
    });

    expect(validateAdaptationConsistency([exercise], [])).toEqual(
      expect.arrayContaining([
        "adaptation_unknown_recommendation:ex-1:missing-rec",
      ]),
    );
  });

  it("detects session integrity issues on empty session", async () => {
    const engine = new WorkoutAssemblyEngine();
    const result = await engine.assemble(await createWorkoutAssemblyRequest());
    const broken = Object.freeze({
      ...result.session,
      exercises: Object.freeze([]),
      blocks: Object.freeze([]),
      executionOrder: Object.freeze({
        exerciseIds: Object.freeze(["ghost"]),
        blockIds: Object.freeze([]),
      }),
      summary: Object.freeze({
        ...result.session.summary,
        exerciseCount: 1,
        blockCount: 0,
      }),
    });

    expect(validateSessionIntegrity(broken)).toEqual(
      expect.arrayContaining([
        "session_empty",
        "session_execution_order_length_mismatch",
        "session_execution_order_unknown_exercise:ghost",
        "session_summary_exercise_count_mismatch",
      ]),
    );
  });
});
