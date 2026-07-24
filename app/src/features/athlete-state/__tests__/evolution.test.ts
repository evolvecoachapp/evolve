import { buildEmptyAthleteState } from "../builders/AthleteStateBuilder";
  import { createMockRecoveryAgentPort } from "../contracts/RecoveryAgentPort";
  import { createStateEvolutionEngine } from "../evolution/StateEvolutionEngine";
  import { StateChangeKinds } from "../models/StateChange";
  import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("athlete-state evolution", () => {
  it("bumps revision and appends timeline/history", () => {
    const engine = createStateEvolutionEngine();
    const empty = buildEmptyAthleteState({
      id: "state:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    const contribution = createMockRecoveryAgentPort().contribute({
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    })!;
    const evolved = engine.evolve({
      state: empty,
      contributions: [contribution],
      kind: StateChangeKinds.UPDATE,
      at: FIXED_TIMESTAMP,
    });
    expect(evolved.version.revision).toBe(1);
    expect(evolved.history.entries).toHaveLength(1);
    expect(evolved.timeline.items).toHaveLength(1);
    expect(evolved.recovery.status).toBe("adequate");
    expect(evolved.summary).not.toBeNull();
  });
});
