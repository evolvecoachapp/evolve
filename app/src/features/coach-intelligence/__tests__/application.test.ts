import {
  createCoachSnapshot,
  prepareCoachingContext,
  summarizeCoachingContext,
} from "../application";
import {
  createFullCoachInputs,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("coach-intelligence application API", () => {
  it("prepareCoachingContext returns frozen context via public API", () => {
    const inputs = createFullCoachInputs();
    const result = prepareCoachingContext({
      ...inputs,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "coach:app",
    });

    expect(Object.isFrozen(result.context)).toBe(true);
    expect(Object.isFrozen(result.snapshot)).toBe(true);
    expect(result.context.id).toBe("coach:app");
    expect(result.context.objectives.length).toBeGreaterThan(0);
  });

  it("createCoachSnapshot and summarizeCoachingContext work without exposing engine", () => {
    const inputs = createFullCoachInputs();
    const prepared = prepareCoachingContext({
      ...inputs,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "coach:app-parts",
    });

    const snapshot = createCoachSnapshot(prepared.context);
    expect(snapshot.context.objectives.length).toBe(
      prepared.context.objectives.length,
    );

    const fromSnapshot = summarizeCoachingContext(snapshot);
    expect(fromSnapshot.objectiveCount).toBe(snapshot.context.objectives.length);

    const fromContext = summarizeCoachingContext(prepared.context);
    expect(fromContext.summaryText).toContain("coaching objective");
  });
});
