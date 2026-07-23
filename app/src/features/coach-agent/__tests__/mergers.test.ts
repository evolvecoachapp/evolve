import { CoachResultMerger } from "../mergers/CoachResultMerger";
import { EMPTY_COACH_METADATA } from "../models/CoachMetadata";
import { SpecialistAgentKinds } from "../models/SpecialistAgentKind";
import {
  createMockNutritionResult,
  createMockRecoveryResult,
  createMockWorkoutResult,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("coach-agent mergers", () => {
  const merger = new CoachResultMerger();

  it("merges recommendations and prioritizes recovery above workout", () => {
    const decision = merger.merge({
      id: "cdecision:1",
      decidedAt: FIXED_TIMESTAMP,
      outputs: Object.freeze({
        workout: createMockWorkoutResult(),
        recovery: createMockRecoveryResult(),
        nutrition: createMockNutritionResult(),
        invocations: Object.freeze([
          Object.freeze({
            id: "cinv:w",
            agent: SpecialistAgentKinds.WORKOUT,
            status: "invoked" as const,
            summary: "ok",
            success: true,
            resultId: "wresult:mock:1",
            attributes: Object.freeze({}),
            invokedAt: FIXED_TIMESTAMP,
          }),
          Object.freeze({
            id: "cinv:r",
            agent: SpecialistAgentKinds.RECOVERY,
            status: "invoked" as const,
            summary: "ok",
            success: true,
            resultId: "rresult:mock:1",
            attributes: Object.freeze({}),
            invokedAt: FIXED_TIMESTAMP,
          }),
          Object.freeze({
            id: "cinv:n",
            agent: SpecialistAgentKinds.NUTRITION,
            status: "invoked" as const,
            summary: "ok",
            success: true,
            resultId: "nresult:mock:1",
            attributes: Object.freeze({}),
            invokedAt: FIXED_TIMESTAMP,
          }),
        ]),
        metadata: EMPTY_COACH_METADATA,
      }),
    });

    expect(decision.accepted).toBe(true);
    expect(decision.recommendations.length).toBe(3);
    expect(decision.prioritizedAgents[0]).toBe(SpecialistAgentKinds.RECOVERY);
    expect(decision.recommendations[0]?.sourceAgent).toBe(
      SpecialistAgentKinds.RECOVERY,
    );
    expect(Object.isFrozen(decision)).toBe(true);
  });

  it("detects mixed success conflicts", () => {
    const decision = merger.merge({
      id: "cdecision:2",
      decidedAt: FIXED_TIMESTAMP,
      outputs: Object.freeze({
        workout: createMockWorkoutResult({ success: false }),
        recovery: createMockRecoveryResult(),
        nutrition: null,
        invocations: Object.freeze([
          Object.freeze({
            id: "cinv:w",
            agent: SpecialistAgentKinds.WORKOUT,
            status: "failed" as const,
            summary: "fail",
            success: false,
            resultId: null,
            attributes: Object.freeze({}),
            invokedAt: FIXED_TIMESTAMP,
          }),
          Object.freeze({
            id: "cinv:r",
            agent: SpecialistAgentKinds.RECOVERY,
            status: "invoked" as const,
            summary: "ok",
            success: true,
            resultId: "rresult:mock:1",
            attributes: Object.freeze({}),
            invokedAt: FIXED_TIMESTAMP,
          }),
        ]),
        metadata: EMPTY_COACH_METADATA,
      }),
    });

    expect(decision.accepted).toBe(false);
    expect(decision.conflicts.some((c) => c.kind === "success")).toBe(true);
  });
});
