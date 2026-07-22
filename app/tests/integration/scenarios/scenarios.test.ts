import { expectWorkout } from "../assertions";
import { INTEGRATION_SCENARIOS } from "./definitions";
import { executePipeline } from "../utils";

describe("integration scenarios — complete pipeline", () => {
  it.each(INTEGRATION_SCENARIOS.map((scenario) => [scenario.id, scenario]))(
    "%s executes the complete pipeline",
    async (_id, scenario) => {
      const result = await executePipeline(scenario.buildRequest());
      expectWorkout(result).toPassPipelineValidation();
    },
  );
});
