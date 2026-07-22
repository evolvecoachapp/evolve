import { createSelectionCatalog } from "../../../exercise-selection/testSupport/fixtures";
import type { ExercisePrescription } from "../../models/ExercisePrescription";
import { createEmptyProgrammingScore } from "../../models/ProgrammingScore";
import {
  createProgrammingCandidate,
  createProgrammingRequest,
} from "../../testSupport/fixtures";
import { normalizePrescription } from "../../utils/normalizePrescription";
import { createDefaultStrategies } from "../../strategies";
import { buildProgrammingContext } from "../../utils/buildProgrammingContext";
import { sortPrescriptions } from "../../utils/sortPrescriptions";
import { freezePrescription } from "../../utils/freezeProgrammingResult";
import {
  validateExecutionOrder,
  validateExerciseUniqueness,
  validateIntensityRanges,
  validatePrescriptionConsistency,
  validateProgrammingResult,
  validateRestRanges,
  validateVolumeRanges,
} from "../index";

function programSample(): readonly ExercisePrescription[] {
  const request = createProgrammingRequest();
  const context = buildProgrammingContext(request);
  const strategies = createDefaultStrategies();

  const programmed = request.selection.candidates.map((candidate) => {
    let current = normalizePrescription(candidate);
    for (const strategy of strategies) {
      current = strategy.apply(current, context);
    }
    return current;
  });

  return Object.freeze(
    sortPrescriptions(programmed).map((prescription, index) =>
      freezePrescription({ ...prescription, order: index + 1 }),
    ),
  );
}

describe("programming validators", () => {
  it("accepts a well-formed programmed result", () => {
    const request = createProgrammingRequest();
    const prescriptions = programSample();
    expect(validateProgrammingResult(request, prescriptions)).toEqual([]);
  });

  it("detects duplicate exercises", () => {
    const prescriptions = programSample();
    const duplicated = Object.freeze([
      ...prescriptions,
      prescriptions[0]!,
    ]) as readonly ExercisePrescription[];
    expect(validateExerciseUniqueness(duplicated)).toContain(
      `duplicate_exercise:${prescriptions[0]!.exerciseId}`,
    );
  });

  it("detects volume range violations", () => {
    const base = programSample()[0]!;
    const broken = freezePrescription({
      ...base,
      volume: Object.freeze({
        ...base.volume,
        sets: 0,
        totalRepsMin: 0,
        totalRepsMax: 0,
      }),
      sets: Object.freeze([]),
    });
    expect(validateVolumeRanges([broken])).toContain(
      `volume_sets_out_of_range:${broken.exerciseId}:0`,
    );
  });

  it("detects intensity range violations", () => {
    const base = programSample()[0]!;
    const broken = freezePrescription({
      ...base,
      intensity: Object.freeze({
        metric: "rpe" as const,
        value: 15,
        targetRpe: 15,
        targetRir: 2,
      }),
    });
    expect(validateIntensityRanges([broken])).toContain(
      `intensity_rpe_out_of_range:${broken.exerciseId}:15`,
    );
  });

  it("detects rest range violations", () => {
    const base = programSample()[0]!;
    const broken = freezePrescription({
      ...base,
      rest: Object.freeze({ seconds: 5, betweenSetsSeconds: 5 }),
    });
    expect(validateRestRanges([broken])).toContain(
      `rest_out_of_range:${broken.exerciseId}:5`,
    );
  });

  it("detects execution order gaps", () => {
    const prescriptions = programSample();
    const broken = Object.freeze(
      prescriptions.map((entry, index) =>
        freezePrescription({
          ...entry,
          order: index === 0 ? 2 : entry.order + 1,
        }),
      ),
    );
    expect(validateExecutionOrder(broken).length).toBeGreaterThan(0);
  });

  it("detects prescription consistency issues", () => {
    const catalog = createSelectionCatalog();
    const bench = catalog.find((entry) => entry.id === "bench-press")!;
    const skeleton = normalizePrescription(
      createProgrammingCandidate(bench, "primary", 1),
    );
    const inconsistent = freezePrescription({
      ...skeleton,
      order: 1,
      priority: 100,
      volume: Object.freeze({
        sets: 3,
        repMin: 6,
        repMax: 10,
        totalRepsMin: 18,
        totalRepsMax: 30,
      }),
      sets: Object.freeze([]),
      score: createEmptyProgrammingScore(),
    });
    expect(validatePrescriptionConsistency([inconsistent])).toContain(
      `volume_sets_mismatch:${bench.id}`,
    );
  });
});
