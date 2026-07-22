import { ProgrammingError } from "../../models/ProgrammingError";
import {
  createProgrammingRequest,
  createSampleSelectionResult,
} from "../../testSupport/fixtures";
import { createUpperBodySelectionRequest } from "../../../exercise-selection/testSupport/fixtures";
import { createWorkoutBlueprint } from "../../../workout-blueprint/testSupport/fixtures";
import { ProgrammingEngine } from "../ProgrammingEngine";

function createEngine() {
  return new ProgrammingEngine();
}

describe("ProgrammingEngine", () => {
  it("programs deterministic prescriptions from a selection result", async () => {
    const engine = createEngine();
    const request = createProgrammingRequest();

    const first = await engine.program(request);
    const second = await engine.program(request);

    expect(first.prescriptions.length).toBe(3);
    expect(first.prescriptions.map((entry) => entry.exerciseId)).toEqual(
      second.prescriptions.map((entry) => entry.exerciseId),
    );
    expect(first.prescriptions.map((entry) => entry.volume.sets)).toEqual(
      second.prescriptions.map((entry) => entry.volume.sets),
    );
    expect(first.programmedAt).toBe(second.programmedAt);
    expect(Object.isFrozen(first)).toBe(true);
  });

  it("assigns sets, reps, intensity, and rest without load or progression fields", async () => {
    const engine = createEngine();
    const result = await engine.program(createProgrammingRequest());

    for (const prescription of result.prescriptions) {
      expect(prescription.volume.sets).toBeGreaterThan(0);
      expect(prescription.volume.repMin).toBeGreaterThan(0);
      expect(prescription.volume.repMax).toBeGreaterThanOrEqual(
        prescription.volume.repMin,
      );
      expect(prescription.intensity.metric).not.toBe("none");
      expect(prescription.rest.seconds).toBeGreaterThan(0);
      expect(prescription.estimatedDurationSeconds).toBeGreaterThan(0);
      expect(prescription).not.toHaveProperty("load");
      expect(prescription).not.toHaveProperty("oneRepMax");
      expect(prescription).not.toHaveProperty("progression");
      expect(prescription.intensity.metric).not.toBe("percentage_1rm");
    }
  });

  it("orders primary before secondary before accessory", async () => {
    const engine = createEngine();
    const result = await engine.program(createProgrammingRequest());
    const roles = result.prescriptions.map((entry) => entry.role);
    expect(roles).toEqual(["primary", "secondary", "accessory"]);
    expect(result.prescriptions.map((entry) => entry.order)).toEqual([1, 2, 3]);
  });

  it("throws on empty selection", async () => {
    const engine = createEngine();
    const empty = createSampleSelectionResult({
      candidates: Object.freeze([]),
    });

    await expect(
      engine.program(
        createProgrammingRequest({
          selection: empty,
        }),
      ),
    ).rejects.toBeInstanceOf(ProgrammingError);
  });

  it("throws on blueprint / selection mismatch", async () => {
    const engine = createEngine();
    const otherBlueprint = createWorkoutBlueprint({ id: "bp-other" });
    const request = createProgrammingRequest({
      blueprint: otherBlueprint,
    });

    await expect(engine.program(request)).rejects.toBeInstanceOf(
      ProgrammingError,
    );
  });

  it("throws when targeting a rest day", async () => {
    const engine = createEngine();
    const selectionRequest = createUpperBodySelectionRequest();
    const request = createProgrammingRequest({
      blueprint: selectionRequest.blueprint,
      dayId: "day-rest",
    });

    await expect(engine.program(request)).rejects.toBeInstanceOf(
      ProgrammingError,
    );
  });

  it("preview always includes explanations", async () => {
    const engine = createEngine();
    const result = await engine.preview(
      createProgrammingRequest({ includeExplanations: false }),
    );
    expect(result.explanations.length).toBe(result.prescriptions.length);
  });

  it("explain rebuilds when explanations were omitted", async () => {
    const engine = createEngine();
    const result = await engine.program(
      createProgrammingRequest({ includeExplanations: false }),
    );
    expect(result.explanations).toEqual([]);
    const explanations = engine.explain(result);
    expect(explanations.length).toBe(result.prescriptions.length);
    expect(explanations[0]?.summaryCode.startsWith("programmed_as_")).toBe(
      true,
    );
  });
});
