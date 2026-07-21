import {
  addUtcWeeks,
  enumerateWeekKeys,
  startOfUtcWeek,
  toUtcDateString,
  weekKeyFromIso,
} from "../weekBounds";

describe("weekBounds", () => {
  it("snaps mid-week dates to the UTC Monday", () => {
    // Wednesday 2026-07-22
    const monday = startOfUtcWeek(new Date("2026-07-22T18:30:00.000Z"));
    expect(toUtcDateString(monday)).toBe("2026-07-20");
  });

  it("treats Sunday as part of the prior Monday week", () => {
    const monday = startOfUtcWeek(new Date("2026-07-19T12:00:00.000Z"));
    expect(toUtcDateString(monday)).toBe("2026-07-13");
  });

  it("derives week keys from ISO timestamps", () => {
    expect(weekKeyFromIso("2026-07-21T12:00:00.000Z")).toBe("2026-07-20");
  });

  it("enumerates inclusive Monday keys", () => {
    const from = startOfUtcWeek(new Date("2026-07-06T00:00:00.000Z"));
    const to = startOfUtcWeek(new Date("2026-07-20T00:00:00.000Z"));
    expect(enumerateWeekKeys(from, to)).toEqual([
      "2026-07-06",
      "2026-07-13",
      "2026-07-20",
    ]);
  });

  it("adds UTC weeks", () => {
    const monday = startOfUtcWeek(new Date("2026-07-20T00:00:00.000Z"));
    expect(toUtcDateString(addUtcWeeks(monday, -1))).toBe("2026-07-13");
  });
});
