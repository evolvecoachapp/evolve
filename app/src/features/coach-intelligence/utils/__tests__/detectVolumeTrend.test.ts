import {
  detectFrequencyTrend,
  detectVolumeTrend,
} from "../detectVolumeTrend";
import { createTrend } from "../../testSupport/fixtures";

describe("detectVolumeTrend / detectFrequencyTrend", () => {
  it("returns insufficient_data for short series", () => {
    const trend = createTrend("volume", [100]);
    expect(detectVolumeTrend(trend)).toEqual({
      metric: "volume",
      direction: "insufficient_data",
      changeRatio: null,
      windowWeeks: 1,
    });
  });

  it("detects increasing volume", () => {
    const trend = createTrend("volume", [100, 110, 180, 200]);
    const result = detectVolumeTrend(trend);
    expect(result.direction).toBe("increasing");
    expect(result.changeRatio).toBeGreaterThan(0.05);
    expect(result.windowWeeks).toBe(4);
  });

  it("detects decreasing frequency", () => {
    const trend = createTrend("workout_frequency", [4, 4, 1, 1]);
    const result = detectFrequencyTrend(trend);
    expect(result.metric).toBe("frequency");
    expect(result.direction).toBe("decreasing");
    expect(result.changeRatio).toBeLessThan(-0.05);
  });

  it("treats small changes as stable", () => {
    const trend = createTrend("volume", [100, 102, 101, 103]);
    expect(detectVolumeTrend(trend).direction).toBe("stable");
  });

  it("requires a minimum number of active weeks", () => {
    const trend = createTrend("volume", [0, 0, 0, 50]);
    expect(detectVolumeTrend(trend).direction).toBe("insufficient_data");
  });
});
