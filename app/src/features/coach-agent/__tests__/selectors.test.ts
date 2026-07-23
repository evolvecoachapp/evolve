import { AgentCapabilityResolver } from "../selectors/AgentCapabilityResolver";
import { CoachIntents } from "../models/CoachIntent";
import { SpecialistAgentKinds } from "../models/SpecialistAgentKind";

describe("coach-agent selectors", () => {
  const resolver = new AgentCapabilityResolver();

  it("resolves intent-based agent sets", () => {
    expect(resolver.resolve({ intent: CoachIntents.WORKOUT_FOCUS })).toEqual([
      SpecialistAgentKinds.WORKOUT,
    ]);
    expect(resolver.resolve({ intent: CoachIntents.RECOVERY_FOCUS })).toEqual([
      SpecialistAgentKinds.RECOVERY,
    ]);
    expect(resolver.resolve({ intent: CoachIntents.NUTRITION_FOCUS })).toEqual([
      SpecialistAgentKinds.NUTRITION,
    ]);
    expect(resolver.resolve({ intent: CoachIntents.HOLISTIC })).toEqual([
      SpecialistAgentKinds.WORKOUT,
      SpecialistAgentKinds.RECOVERY,
      SpecialistAgentKinds.NUTRITION,
    ]);
  });

  it("prefers explicit agent hints and filters future agents", () => {
    expect(
      resolver.resolve({
        intent: CoachIntents.HOLISTIC,
        agentHints: [
          SpecialistAgentKinds.NUTRITION,
          SpecialistAgentKinds.SLEEP,
        ],
      }),
    ).toEqual([SpecialistAgentKinds.NUTRITION]);
  });

  it("infers intent from message keywords", () => {
    expect(resolver.inferIntent("I need better sleep and recovery", null)).toBe(
      CoachIntents.RECOVERY_FOCUS,
    );
    expect(resolver.inferIntent("macros and meal timing", null)).toBe(
      CoachIntents.NUTRITION_FOCUS,
    );
    expect(
      resolver.inferIntent("workout and nutrition together", null),
    ).toBe(CoachIntents.MULTI_DOMAIN);
    expect(resolver.inferIntent("hello", CoachIntents.EDUCATION)).toBe(
      CoachIntents.EDUCATION,
    );
  });
});
