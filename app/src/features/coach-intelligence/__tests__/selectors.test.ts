import { InsightStatuses } from "../../insight-engine/models/InsightStatus";
import {
  createEvidenceSelector,
  createHistorySelector,
  createInsightSelector,
  createObjectiveSelector,
  createPrioritySelector,
  createRecoverySelector,
} from "../selectors";
import {
  createFullCoachInputs,
  createInsightSnapshotFixture,
} from "../testSupport/fixtures";

describe("coach-intelligence selectors", () => {
  it("InsightSelector selects active insights only", () => {
    const snapshot = createInsightSnapshotFixture();
    const selection = createInsightSelector().select(snapshot);

    expect(selection.allInsightIds.length).toBe(snapshot.collection.count);
    expect(
      selection.selectedInsights.every((i) => i.status === InsightStatuses.ACTIVE),
    ).toBe(true);
  });

  it("PrioritySelector ranks by priority desc", () => {
    const snapshot = createInsightSnapshotFixture();
    const insights = snapshot.collection.insights;
    const selection = createPrioritySelector().select(insights);

    const priorities = selection.rankedInsightIds.map(
      (id) => selection.prioritiesByInsightId[id],
    );
    for (let i = 1; i < priorities.length; i += 1) {
      expect(priorities[i - 1]).toBeGreaterThanOrEqual(priorities[i]);
    }
  });

  it("EvidenceSelector maps insights to evidence", () => {
    const snapshot = createInsightSnapshotFixture();
    const evidence = createEvidenceSelector().select(
      snapshot.collection.insights,
    );
    expect(evidence.length).toBe(snapshot.collection.insights.length);
    expect(evidence[0].sourceType).toBeTruthy();
  });

  it("RecoverySelector and HistorySelector handle optional inputs", () => {
    const inputs = createFullCoachInputs();

    const missingRecovery = createRecoverySelector().select(undefined);
    expect(missingRecovery.missing).toBe(true);
    expect(missingRecovery.constraints).toHaveLength(0);

    const withRecovery = createRecoverySelector().select(
      inputs.recoverySnapshot,
    );
    expect(withRecovery.referenced).toBe(true);
    expect(withRecovery.constraints.length).toBeGreaterThan(0);

    const missingHistory = createHistorySelector().select(undefined);
    expect(missingHistory.missing).toBe(true);

    const withHistory = createHistorySelector().select(inputs.athleteHistory);
    expect(withHistory.referenced).toBe(true);
    expect(withHistory.entryCount).toBe(inputs.athleteHistory.entryCount);
  });

  it("ObjectiveSelector builds objectives from ranked insights", () => {
    const snapshot = createInsightSnapshotFixture();
    const evidence = createEvidenceSelector().select(
      snapshot.collection.insights,
    );
    const objectives = createObjectiveSelector().select({
      rankedInsights: snapshot.collection.insights,
      evidence,
      focus: [],
      limit: 3,
    });

    expect(objectives.length).toBeLessThanOrEqual(3);
    expect(objectives.length).toBeGreaterThan(0);
    expect(objectives[0].id).toContain("coach-objective:");
  });
});
