import { calculateSetVolume } from "../setVolume";

describe("calculateSetVolume", () => {
  it("multiplies weight by reps", () => {
    expect(calculateSetVolume(60, 10)).toBe(600);
    expect(calculateSetVolume(62.5, 8)).toBe(500);
  });

  it("treats non-finite or negative inputs as zero contribution", () => {
    expect(calculateSetVolume(Number.NaN, 10)).toBe(0);
    expect(calculateSetVolume(60, Number.POSITIVE_INFINITY)).toBe(0);
    expect(calculateSetVolume(-10, 5)).toBe(0);
    expect(calculateSetVolume(50, -2)).toBe(0);
  });
});
