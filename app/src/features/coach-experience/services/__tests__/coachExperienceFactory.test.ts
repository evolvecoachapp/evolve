import {
  createCoachExperienceService,
  resolveCoachExperienceProviderId,
} from "../coachExperienceFactory";
import { backendCoachExperienceService } from "../../providers/BackendCoachExperienceService";
import { localCoachExperienceService } from "../../providers/LocalCoachExperienceService";
import { mockCoachExperienceService } from "../../providers/MockCoachExperienceService";

describe("coachExperienceFactory", () => {
  const original = process.env.EXPO_PUBLIC_COACH_EXPERIENCE_PROVIDER;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.EXPO_PUBLIC_COACH_EXPERIENCE_PROVIDER;
    } else {
      process.env.EXPO_PUBLIC_COACH_EXPERIENCE_PROVIDER = original;
    }
  });

  it("defaults production selection to the backend provider", () => {
    delete process.env.EXPO_PUBLIC_COACH_EXPERIENCE_PROVIDER;

    expect(resolveCoachExperienceProviderId()).toBe("backend");
    expect(createCoachExperienceService()).toBe(backendCoachExperienceService);
  });

  it("preserves mock and local injection when explicitly selected", () => {
    process.env.EXPO_PUBLIC_COACH_EXPERIENCE_PROVIDER = "mock";
    expect(resolveCoachExperienceProviderId()).toBe("mock");
    expect(createCoachExperienceService("mock")).toBe(mockCoachExperienceService);

    process.env.EXPO_PUBLIC_COACH_EXPERIENCE_PROVIDER = "local";
    expect(resolveCoachExperienceProviderId()).toBe("local");
    expect(createCoachExperienceService("local")).toBe(
      localCoachExperienceService,
    );
  });

  it("ignores unknown env values and falls back to backend", () => {
    process.env.EXPO_PUBLIC_COACH_EXPERIENCE_PROVIDER = "openai";
    expect(resolveCoachExperienceProviderId()).toBe("backend");
  });
});
