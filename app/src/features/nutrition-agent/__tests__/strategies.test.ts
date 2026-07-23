import {
  createDefaultStrategies,
  FatLossStrategy,
  MuscleGainStrategy,
  GeneralHealthStrategy,
} from "../strategies";
import { NutritionGoals } from "../models/NutritionGoal";

describe("nutrition-agent strategies", () => {
  it("creates default strategies", () => {
    expect(createDefaultStrategies().length).toBeGreaterThanOrEqual(9);
  });

  it("matches goals", () => {
    expect(new FatLossStrategy().matches(NutritionGoals.FAT_LOSS)).toBe(true);
    expect(new MuscleGainStrategy().matches(NutritionGoals.MUSCLE_GAIN)).toBe(
      true,
    );
    expect(new GeneralHealthStrategy().matches(NutritionGoals.UNKNOWN)).toBe(
      true,
    );
  });

  it("describe returns frozen strategy", () => {
    const strategy = new FatLossStrategy().describe();
    expect(Object.isFrozen(strategy)).toBe(true);
    expect(strategy.goal).toBe(NutritionGoals.FAT_LOSS);
  });
});
