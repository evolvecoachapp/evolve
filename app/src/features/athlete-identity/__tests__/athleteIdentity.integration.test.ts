import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import {
  buildAthleteIdentity,
  buildLocale,
  buildPreferences,
  buildProfile,
  buildSettings,
  buildTimeZone,
  buildUnits,
  composeAthleteIdentity,
  getAthleteIdentity,
  getAthleteProfile,
  getPreferences,
  getSettings,
  validateAthleteIdentityForAthlete,
  validateIdentity,
} from "../index";
import {
  createMinimalIdentityInput,
  createTestAthleteIdentityService,
  FIXED_IDENTITY_TIMESTAMP,
} from "../testSupport/fixtures";

describe("Athlete Identity integration (Sprint 29.1)", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  it("creates a complete immutable athlete identity", () => {
    const result = buildAthleteIdentity(createMinimalIdentityInput());

    expect(result.success).toBe(true);
    expect(result.identity?.id).toContain("athlete-identity:athlete:1:");
    expect(result.identity?.athleteId).toBe("athlete:1");
    expect(result.identity?.profile.displayName).toBe("Alex Athlete");
    expect(Object.isFrozen(result.identity)).toBe(true);
  });

  it("builds profile from explicit fields", () => {
    const profile = buildProfile({
      displayName: "Jordan",
      givenName: "Jordan",
      familyName: null,
      sex: null,
      birthYear: 1995,
      experienceLevel: "beginner",
    });

    expect(profile.displayName).toBe("Jordan");
    expect(profile.birthYear).toBe(1995);
    expect(Object.isFrozen(profile)).toBe(true);
  });

  it("builds preferences with frozen collections", () => {
    const preferences = buildPreferences({
      preferredTrainingTimes: ["evening"],
      preferredModalities: ["endurance"],
      dietaryPreferences: ["vegetarian"],
      communicationTone: "supportive",
      notes: ["note"],
    });

    expect(preferences.preferredTrainingTimes).toEqual(["evening"]);
    expect(preferences.preferredModalities).toEqual(["endurance"]);
    expect(Object.isFrozen(preferences)).toBe(true);
    expect(Object.isFrozen(preferences.preferredTrainingTimes)).toBe(true);
  });

  it("builds settings with defaults", () => {
    const settings = buildSettings();

    expect(settings.weekStartsOn).toBe(1);
    expect(settings.use24HourClock).toBe(true);
    expect(settings.appearance).toBe("system");
    expect(Object.isFrozen(settings)).toBe(true);
  });

  it("builds locale from language tag", () => {
    const locale = buildLocale({ languageTag: "en-US" });

    expect(locale.languageTag).toBe("en-US");
    expect(locale.language).toBe("en");
    expect(locale.region).toBe("US");
    expect(Object.isFrozen(locale)).toBe(true);
  });

  it("builds metric and imperial units", () => {
    const metric = buildUnits({ system: "metric" });
    const imperial = buildUnits({ system: "imperial" });

    expect(metric.mass).toBe("kg");
    expect(imperial.mass).toBe("lb");
    expect(Object.isFrozen(metric)).toBe(true);
  });

  it("builds timezone from IANA identifier", () => {
    const timeZone = buildTimeZone({
      iana: "Europe/Rome",
      displayName: "Central European Time",
    });

    expect(timeZone.iana).toBe("Europe/Rome");
    expect(timeZone.displayName).toBe("Central European Time");
    expect(Object.isFrozen(timeZone)).toBe(true);
  });

  it("rejects missing identity", () => {
    const validation = validateIdentity(null);

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain("Athlete identity is missing");
  });

  it("rejects invalid locale", () => {
    const result = buildAthleteIdentity(
      createMinimalIdentityInput({
        locale: { languageTag: "not a locale!!!" },
      }),
    );

    expect(result.success).toBe(false);
    expect(result.validation.errors.some((e) => e.includes("Invalid locale"))).toBe(
      true,
    );
  });

  it("rejects invalid units", () => {
    const result = buildAthleteIdentity(
      createMinimalIdentityInput({
        units: { system: "metric", mass: "lb" },
      }),
    );

    expect(result.success).toBe(false);
    expect(
      result.validation.errors.some((e) => e.includes("Invalid units")),
    ).toBe(true);
  });

  it("rejects invalid timezone", () => {
    const result = buildAthleteIdentity(
      createMinimalIdentityInput({
        timeZone: { iana: "Not/AZone" },
      }),
    );

    expect(result.success).toBe(false);
    expect(
      result.validation.errors.some((e) => e.includes("Invalid timezone")),
    ).toBe(true);
  });

  it("rejects duplicate identity ids", () => {
    const result = buildAthleteIdentity(
      createMinimalIdentityInput({
        validationOptions: {
          knownIdentityIds: new Set([
            "athlete-identity:athlete:1:req:identity:1",
          ]),
        },
      }),
    );

    expect(result.success).toBe(false);
    expect(
      result.validation.errors.some((e) => e.includes("Duplicate identity")),
    ).toBe(true);
  });

  it("rejects missing immutable profile displayName", () => {
    const result = buildAthleteIdentity(
      createMinimalIdentityInput({
        profile: {
          displayName: "   ",
        },
      }),
    );

    expect(result.success).toBe(false);
    expect(result.validation.errors).toContain("Profile displayName is required");
  });

  it("enforces immutability on composed identity", () => {
    const result = buildAthleteIdentity(createMinimalIdentityInput());
    const identity = result.identity!;

    expect(Object.isFrozen(identity)).toBe(true);
    expect(Object.isFrozen(identity.profile)).toBe(true);
    expect(Object.isFrozen(identity.preferences)).toBe(true);
    expect(Object.isFrozen(identity.settings)).toBe(true);
    expect(Object.isFrozen(identity.locale)).toBe(true);
    expect(Object.isFrozen(identity.units)).toBe(true);
    expect(Object.isFrozen(identity.timeZone)).toBe(true);
    expect(Object.isFrozen(identity.metadata)).toBe(true);

    const before = identity.athleteId;
    try {
      (identity as { athleteId: string }).athleteId = "mutated";
    } catch {
      // Strict mode may throw; non-strict silently ignores.
    }
    expect(identity.athleteId).toBe(before);
  });

  it("registers AthleteIdentityService in composition root", () => {
    const root = createCompositionRoot();

    expect(root.resolve("AthleteIdentityService")).toBeDefined();
    expect(root.getAthleteIdentityService()).toBe(
      root.resolve("AthleteIdentityService"),
    );
  });

  it("exposes application APIs after composition", () => {
    const service = createTestAthleteIdentityService();
    const composed = composeAthleteIdentity({
      service,
      input: createMinimalIdentityInput({
        generatedAt: FIXED_IDENTITY_TIMESTAMP,
      }),
    });

    expect(composed.success).toBe(true);
    expect(
      getAthleteIdentity({ athleteId: "athlete:1", service })?.id,
    ).toContain("athlete-identity:athlete:1:");
    expect(
      getAthleteProfile({ athleteId: "athlete:1", service })?.displayName,
    ).toBe("Alex Athlete");
    expect(
      getPreferences({ athleteId: "athlete:1", service })?.communicationTone,
    ).toBe("direct");
    expect(
      getSettings({ athleteId: "athlete:1", service })?.weekStartsOn,
    ).toBe(1);
    expect(
      validateAthleteIdentityForAthlete({ athleteId: "athlete:1", service })
        .valid,
    ).toBe(true);
  });

  it("allows replacing identity for the same athlete without duplicate error", () => {
    const service = createTestAthleteIdentityService();
    const first = service.build(
      createMinimalIdentityInput({ requestId: "req:a" }),
    );
    const second = service.build(
      createMinimalIdentityInput({ requestId: "req:b" }),
    );

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(service.getAthleteIdentity("athlete:1")?.id).toContain("req:b");
  });
});
