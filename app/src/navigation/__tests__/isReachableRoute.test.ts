import { isReachableRoute } from "../isReachableRoute";

describe("isReachableRoute", () => {
  it("returns false for null/undefined/empty destinations", () => {
    expect(isReachableRoute(null)).toBe(false);
    expect(isReachableRoute(undefined)).toBe(false);
    expect(isReachableRoute("")).toBe(false);
  });

  it("returns true for every main tab route", () => {
    expect(isReachableRoute("/(app)/(tabs)")).toBe(true);
    expect(isReachableRoute("/(app)/(tabs)/index")).toBe(true);
    expect(isReachableRoute("/(app)/(tabs)/workout")).toBe(true);
    expect(isReachableRoute("/(app)/(tabs)/nutrition")).toBe(true);
    expect(isReachableRoute("/(app)/(tabs)/coach")).toBe(true);
    expect(isReachableRoute("/(app)/(tabs)/progress")).toBe(true);
    expect(isReachableRoute("/(app)/(tabs)/profile")).toBe(true);
  });

  it("returns true for the secondary and detail routes that actually exist", () => {
    expect(isReachableRoute("/(app)/goals")).toBe(true);
    expect(isReachableRoute("/(app)/recovery")).toBe(true);
    expect(isReachableRoute("/(app)/notifications")).toBe(true);
    expect(isReachableRoute("/(app)/settings")).toBe(true);
    expect(isReachableRoute("/(app)/settings/appearance")).toBe(true);
    expect(isReachableRoute("/(app)/workout/history")).toBe(true);
  });

  it("returns false for destinations that have no matching route", () => {
    expect(isReachableRoute("/(app)/profile/appearance")).toBe(false);
    expect(isReachableRoute("/(app)/coach/history")).toBe(false);
    expect(isReachableRoute("/(app)/coach/settings")).toBe(false);
    expect(isReachableRoute("/(app)/progress/strength")).toBe(false);
    expect(isReachableRoute("/(app)/workout/exercise/123")).toBe(false);
    expect(isReachableRoute("/(app)/nutrition/meal-details/1")).toBe(false);
  });

  it("ignores a query string when matching against the route allowlist", () => {
    expect(isReachableRoute("/(app)/goals?highlight=1")).toBe(true);
    expect(isReachableRoute("/(app)/coach/history?tab=recent")).toBe(false);
  });
});
