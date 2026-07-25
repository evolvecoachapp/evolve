import {
  buildUnifiedContext,
  createContextSnapshot,
  mergeContexts,
} from "../application";
import { selectSourceByKind } from "../selectors/SourceSelector";
import { selectSectionsByKind } from "../selectors/SectionSelector";
import {
  createContextRequest,
  createTestContextFusionService,
} from "../testSupport/fixtures";

describe("context-fusion integration", () => {
  it("fuses mock upstream modules into decision engine context", () => {
    const service = createTestContextFusionService({ withMocks: true });
    const built = buildUnifiedContext({
      service,
      request: createContextRequest(),
    });
    expect(built.success).toBe(true);
    expect(built.context!.conversation).not.toBeNull();
    expect(built.context!.session).not.toBeNull();
    expect(built.context!.athlete).not.toBeNull();
    expect(built.context!.workout!.facts.focus).toBe("strength");
    expect(built.context!.nutrition!.facts.planId).toBe("nutrition-plan:1");
    expect(built.context!.recovery!.facts.status).toBe("adequate");
    expect(built.context!.goal!.facts.primaryGoal).toBe("Increase squat");
    expect(built.context!.supervisor!.facts.focus).toBe("training");
    expect(selectSourceByKind(built.context!, "athlete")).not.toBeNull();
    expect(selectSectionsByKind(built.context!, "workout").length).toBe(1);
    expect(built.decisionEngineContext!.focusAreas).toContain("workout");

    const merged = mergeContexts({
      service,
      request: createContextRequest({
        id: "request:int:merge",
        kind: "merge",
      }),
    });
    expect(merged.success).toBe(true);
    expect(merged.context!.timeline.items.length).toBeGreaterThan(0);

    const snap = createContextSnapshot({
      service,
      request: createContextRequest({
        id: "request:int:snap",
        kind: "snapshot",
      }),
    });
    expect(snap.snapshot!.context.athleteId).toBe("athlete:1");
    expect(snap.package!.decisionEngineContext).not.toBeNull();
  });
});
