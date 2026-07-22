import { ProgrammingEngine } from "../../programming/engine/ProgrammingEngine";
import type { ProgrammingResult } from "../../programming/models/ProgrammingResult";
import { createProgrammingRequest } from "../../programming/testSupport/fixtures";
import type { ProgressionRequest } from "../models/ProgressionRequest";
import type { ProgressionWindow } from "../models/ProgressionWindow";
import { createDefaultProgressionWindow } from "../models/ProgressionWindow";
import { buildProgressionContext } from "../utils/buildProgressionContext";

export { FIXED_TIMESTAMP } from "../../programming/testSupport/fixtures";

let cachedProgramming: {
  readonly blueprintId: string;
  readonly result: ProgrammingResult;
} | null = null;

/**
 * Program a sample selection once and reuse for progression fixtures.
 */
export async function createSampleProgrammingResult(): Promise<ProgrammingResult> {
  const programmingRequest = createProgrammingRequest();
  if (
    cachedProgramming &&
    cachedProgramming.blueprintId === programmingRequest.blueprint.id
  ) {
    return cachedProgramming.result;
  }

  const result = await new ProgrammingEngine().program(programmingRequest);
  cachedProgramming = {
    blueprintId: programmingRequest.blueprint.id,
    result,
  };
  return result;
}

export async function createProgressionRequest(
  overrides: Partial<ProgressionRequest> & {
    readonly window?: ProgressionWindow;
  } = {},
): Promise<ProgressionRequest> {
  const programmingRequest = createProgrammingRequest();
  const programming =
    overrides.programming ?? (await createSampleProgrammingResult());

  return Object.freeze({
    blueprint: overrides.blueprint ?? programmingRequest.blueprint,
    programming,
    window: overrides.window ?? createDefaultProgressionWindow(4),
    includeExplanations: overrides.includeExplanations,
  });
}

export async function createTestProgressionContext(
  overrides: Partial<ProgressionRequest> = {},
) {
  return buildProgressionContext(await createProgressionRequest(overrides));
}
