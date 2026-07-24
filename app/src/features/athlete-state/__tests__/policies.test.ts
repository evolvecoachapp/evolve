import { buildEmptyAthleteState } from "../builders/AthleteStateBuilder";
import { applyConsistencyPolicy } from "../policies/ConsistencyPolicy";
import { applyIntegrityPolicy } from "../policies/IntegrityPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import { applyTransitionPolicy } from "../policies/TransitionPolicy";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("athlete-state policies", () => {
  it("passes integrity and consistency for empty state", () => {
    const state = buildEmptyAthleteState({
      id: "state:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    expect(applyIntegrityPolicy(state).valid).toBe(true);
    expect(applyConsistencyPolicy(state).valid).toBe(true);
    expect(applySafetyPolicy(state).valid).toBe(true);
  });

  it("rejects contribution athlete mismatch", () => {
    const state = buildEmptyAthleteState({
      id: "state:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    const result = applyTransitionPolicy({
      current: state,
      contributions: [
        Object.freeze({
          id: "c:1",
          source: "workout",
          agentId: "agent:workout",
          athleteId: "athlete:other",
          training: null,
          recovery: null,
          nutrition: null,
          performance: null,
          readiness: null,
          fatigue: null,
          sleep: null,
          stress: null,
          goals: null,
          preferences: null,
          constraints: null,
          progress: null,
          coaching: null,
          notes: Object.freeze([] as string[]),
          metadata: Object.freeze({
            tags: Object.freeze([] as string[]),
            attributes: Object.freeze({} as Record<string, string>),
          }),
          contributedAt: FIXED_TIMESTAMP,
        }),
      ],
    });
    expect(result.valid).toBe(false);
  });
});
