import {
  GeneralFitnessStrategy,
  HypertrophyStrategy,
  StrengthStrategy,
  createDefaultStrategies,
} from "../strategies";
import { WorkoutObjectives } from "../models/WorkoutObjective";
import { StrategySelector } from "../selectors/StrategySelector";

describe("workout-agent strategies", () => {
  it("exports default strategies", () => {
    expect(createDefaultStrategies()).toHaveLength(5);
  });

  it("StrengthStrategy matches strength", () => {
    const s = new StrengthStrategy();
    expect(s.matches(WorkoutObjectives.STRENGTH)).toBe(true);
    expect(s.describe().objective).toBe(WorkoutObjectives.STRENGTH);
    expect(Object.isFrozen(s.describe())).toBe(true);
  });

  it("HypertrophyStrategy matches hypertrophy", () => {
    expect(new HypertrophyStrategy().matches(WorkoutObjectives.HYPERTROPHY)).toBe(
      true,
    );
  });

  it("GeneralFitnessStrategy is fallback", () => {
    expect(
      new GeneralFitnessStrategy().matches(WorkoutObjectives.UNKNOWN),
    ).toBe(true);
  });

  it("StrategySelector selects by objective", () => {
    const selected = new StrategySelector().select(WorkoutObjectives.POWERLIFTING);
    expect(selected.id).toBe("strategy:powerlifting");
  });
});
