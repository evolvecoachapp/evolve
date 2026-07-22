import { createSelectionCatalog } from "../../../exercise-selection/testSupport/fixtures";
import {
  createProgrammingCandidate,
  createProgrammingRequest,
  createTestProgrammingContext,
} from "../../testSupport/fixtures";
import {
  buildProgrammingContext,
  calculateProgrammingScore,
  comparePrescriptionsByOrderThenId,
  estimateDuration,
  estimateFatigue,
  estimateWorkload,
  freezeProgrammingResult,
  mergeScoreParts,
  normalizePrescription,
  sortPrescriptions,
} from "../index";
import { VolumeStrategy } from "../../strategies/VolumeStrategy";
import { IntensityStrategy } from "../../strategies/IntensityStrategy";
import { RestStrategy } from "../../strategies/RestStrategy";
import { FIXED_PROGRAMMING_TIMESTAMP } from "../../engine/ProgrammingEngine";
import { createEmptyProgrammingScore } from "../../models/ProgrammingScore";

describe("programming utilities", () => {
  it("builds programming context from a request", () => {
    const context = createTestProgrammingContext();
    expect(context.dayId).toBe("day-upper");
    expect(context.selectionRequestId).toContain("selection:");
    expect(context.candidateCount).toBe(3);
  });

  it("normalizes a candidate into an empty prescription skeleton", () => {
    const catalog = createSelectionCatalog();
    const bench = catalog.find((entry) => entry.id === "bench-press")!;
    const prescription = normalizePrescription(
      createProgrammingCandidate(bench, "primary", 1),
    );
    expect(prescription.volume.sets).toBe(0);
    expect(prescription.order).toBe(0);
    expect(Object.isFrozen(prescription)).toBe(true);
  });

  it("calculates and merges programming scores", () => {
    const score = calculateProgrammingScore({
      volume: 4,
      intensity: 8,
      rest: 2,
    });
    expect(score.total).toBe(14);

    const merged = mergeScoreParts({ volume: 4 }, { intensity: 3 }, { rest: 1.5 });
    expect(merged.total).toBe(8.5);
  });

  it("estimates duration, fatigue, and workload deterministically", () => {
    const context = buildProgrammingContext(createProgrammingRequest());
    const catalog = createSelectionCatalog();
    const bench = catalog.find((entry) => entry.id === "bench-press")!;
    let prescription = normalizePrescription(
      createProgrammingCandidate(bench, "primary", 1),
    );
    prescription = new VolumeStrategy().apply(prescription, context);
    prescription = new IntensityStrategy().apply(prescription, context);
    prescription = new RestStrategy().apply(prescription, context);

    const durationA = estimateDuration(prescription);
    const durationB = estimateDuration(prescription);
    expect(durationA).toBe(durationB);
    expect(durationA).toBeGreaterThan(0);

    const fatigue = estimateFatigue(prescription);
    expect(fatigue).toBeGreaterThan(0);
    expect(fatigue).toBeLessThanOrEqual(10);

    const workload = estimateWorkload(prescription);
    expect(workload).toBeGreaterThan(0);
  });

  it("sorts prescriptions by order then id", () => {
    const catalog = createSelectionCatalog();
    const a = {
      ...normalizePrescription(
        createProgrammingCandidate(
          catalog.find((entry) => entry.id === "barbell-row")!,
          "secondary",
          1,
        ),
      ),
      order: 2,
    };
    const b = {
      ...normalizePrescription(
        createProgrammingCandidate(
          catalog.find((entry) => entry.id === "bench-press")!,
          "primary",
          1,
        ),
      ),
      order: 1,
    };

    const sorted = sortPrescriptions([a, b]);
    expect(sorted.map((entry) => entry.exerciseId)).toEqual([
      "bench-press",
      "barbell-row",
    ]);
    expect(comparePrescriptionsByOrderThenId(a, b)).toBeGreaterThan(0);
  });

  it("freezes programming results deeply", () => {
    const frozen = freezeProgrammingResult({
      requestId: "programming:test",
      context: createTestProgrammingContext(),
      prescriptions: Object.freeze([]),
      explanations: Object.freeze([]),
      validationIssues: Object.freeze([]),
      score: createEmptyProgrammingScore(),
      programmedAt: FIXED_PROGRAMMING_TIMESTAMP,
    });
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.context)).toBe(true);
  });
});
