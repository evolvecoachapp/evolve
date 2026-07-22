import { INTEGRATION_SCENARIOS } from "../scenarios";
import { matchGolden } from "../golden";
import { executePipeline } from "../utils";
import { normalizeWorkoutSnapshot } from "../snapshots";

describe("integration golden snapshots", () => {
  it.each(INTEGRATION_SCENARIOS.map((scenario) => [scenario.id, scenario]))(
    "%s matches golden snapshot",
    async (_id, scenario) => {
      const result = await executePipeline(scenario.buildRequest());
      matchGolden(scenario.id, result);
    },
  );

  it("normalizes snapshots deterministically across runs", async () => {
    const scenario = INTEGRATION_SCENARIOS[0];
    const first = await executePipeline(scenario.buildRequest());
    const second = await executePipeline(scenario.buildRequest());

    expect(
      normalizeWorkoutSnapshot(first, { scenarioId: scenario.id }),
    ).toEqual(normalizeWorkoutSnapshot(second, { scenarioId: scenario.id }));
  });
});
