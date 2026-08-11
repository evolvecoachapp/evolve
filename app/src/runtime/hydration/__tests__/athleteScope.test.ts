import { filterRecordsForAthleteScope } from "../AthleteHydrationScope";

function record(id: string) {
  return Object.freeze({ id });
}

describe("filterRecordsForAthleteScope (Authenticated Athlete Persistence Boundary)", () => {
  it("returns every record unchanged when athleteIds is undefined", () => {
    const records = [record("athlete:a"), record("athlete:b")];

    expect(filterRecordsForAthleteScope(records, undefined)).toEqual(records);
  });

  it("keeps only records whose id is present in athleteIds", () => {
    const records = [record("athlete:a"), record("athlete:b"), record("athlete:c")];

    const scoped = filterRecordsForAthleteScope(records, ["athlete:b"]);

    expect(scoped).toHaveLength(1);
    expect(scoped[0].id).toBe("athlete:b");
  });

  it("supports multiple athlete ids in scope", () => {
    const records = [record("athlete:a"), record("athlete:b"), record("athlete:c")];

    const scoped = filterRecordsForAthleteScope(records, ["athlete:a", "athlete:c"]);

    expect(scoped.map((entry) => entry.id).sort()).toEqual(["athlete:a", "athlete:c"]);
  });

  it("is fail-safe: an empty athleteIds array restores nothing", () => {
    const records = [record("athlete:a"), record("athlete:b")];

    expect(filterRecordsForAthleteScope(records, [])).toHaveLength(0);
  });

  it("returns a frozen array", () => {
    const scoped = filterRecordsForAthleteScope([record("athlete:a")], ["athlete:a"]);

    expect(Object.isFrozen(scoped)).toBe(true);
  });

  it("never lets a previous athlete's record id leak through when scoped to a different athlete", () => {
    const previousAthleteRecord = record("athlete:previous-user");
    const scoped = filterRecordsForAthleteScope(
      [previousAthleteRecord],
      ["athlete:current-user"],
    );

    expect(scoped).toHaveLength(0);
  });
});
