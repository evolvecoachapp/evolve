import { buildEmptyAthleteState } from "../builders/AthleteStateBuilder";
import { validateAthleteStateFull } from "../validators/validateAthleteState";
import { validateGoals } from "../validators/validateGoals";
import { validateMeasurements } from "../validators/validateMeasurements";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("athlete-state validators", () => {
  it("accepts a well-formed empty state", () => {
    const state = buildEmptyAthleteState({
      id: "state:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    expect(validateAthleteStateFull(state).valid).toBe(true);
  });

  it("rejects negative measurements", () => {
    const result = validateMeasurements({
      heightCm: -1,
      weightKg: 80,
      waistCm: null,
      chestCm: null,
      hipsCm: null,
      recordedAt: null,
    });
    expect(result.valid).toBe(false);
  });

  it("rejects primaryGoalId without matching item", () => {
    const result = validateGoals({
      primaryGoalId: "missing",
      items: Object.freeze([
        Object.freeze({
          id: "goal:1",
          kind: "strength",
          title: "Squat",
          status: "active",
          targetDate: null,
          notes: Object.freeze([] as string[]),
        }),
      ]),
      sourceAgentIds: Object.freeze([] as string[]),
    });
    expect(result.valid).toBe(false);
  });
});
