import { createAthleteProfile } from "../../testSupport/fixtures";
import { InMemoryAthleteContextRepository } from "../InMemoryAthleteContextRepository";

describe("InMemoryAthleteContextRepository", () => {
  it("loads an immutable default profile snapshot", async () => {
    const repository = new InMemoryAthleteContextRepository();
    const referenceDate = new Date("2026-07-22T12:00:00.000Z");

    const snapshot = await repository.getSnapshot(referenceDate);

    expect(snapshot.profile.id).toBe("athlete-1");
    expect(snapshot.trainingAgeYears).toBe(4);
    expect(snapshot.validation.valid).toBe(true);
    expect(snapshot.capturedAt).toBe(referenceDate.toISOString());
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.profile)).toBe(true);
  });

  it("updates the profile and returns a cloned immutable copy", async () => {
    const repository = new InMemoryAthleteContextRepository();
    const next = createAthleteProfile({
      displayName: "Updated Athlete",
      ageYears: 30,
      experience: {
        level: "advanced",
        trainingStartedAt: "2018-01-01T00:00:00.000Z",
        yearsTraining: 8,
      },
    });

    const updated = await repository.updateProfile(next);
    const loaded = await repository.getProfile();

    expect(updated.displayName).toBe("Updated Athlete");
    expect(updated.experience.level).toBe("advanced");
    expect(loaded?.displayName).toBe("Updated Athlete");
    expect(updated).not.toBe(next);
    expect(Object.isFrozen(updated)).toBe(true);
  });

  it("validates profiles without throwing", () => {
    const repository = new InMemoryAthleteContextRepository();
    const result = repository.validateProfile(
      createAthleteProfile({ ageYears: 5 }),
    );

    expect(result.valid).toBe(false);
    expect(result.issues[0]?.code).toBe("invalid_age");
  });

  it("returns independent clones from getProfile", async () => {
    const repository = new InMemoryAthleteContextRepository(
      createAthleteProfile({ displayName: "Clone Check" }),
    );

    const first = await repository.getProfile();
    const second = await repository.getProfile();

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
  });
});
