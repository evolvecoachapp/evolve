import { scoreTrainingConsistency } from "../scoreTrainingConsistency";
import { createTrend } from "../../testSupport/fixtures";

describe("scoreTrainingConsistency", () => {
  it("returns 0 for an empty series", () => {
    expect(scoreTrainingConsistency(createTrend("workout_frequency", []))).toBe(
      0,
    );
  });

  it("scores perfect weekly attendance highly", () => {
    const score = scoreTrainingConsistency(
      createTrend("workout_frequency", [3, 3, 3, 3]),
    );
    expect(score).toBeGreaterThanOrEqual(0.9);
  });

  it("penalizes sparse and uneven weeks", () => {
    const sparse = scoreTrainingConsistency(
      createTrend("workout_frequency", [0, 0, 0, 1]),
    );
    const uneven = scoreTrainingConsistency(
      createTrend("workout_frequency", [0, 6, 0, 6]),
    );
    const steady = scoreTrainingConsistency(
      createTrend("workout_frequency", [3, 3, 3, 3]),
    );
    expect(sparse).toBeLessThan(steady);
    expect(uneven).toBeLessThan(steady);
  });
});
