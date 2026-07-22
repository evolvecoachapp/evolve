import type { ProgrammingExplanation } from "../models/ProgrammingExplanation";
import type { ProgrammingResult } from "../models/ProgrammingResult";
import {
  createProgrammingService,
  type ProgrammingService,
} from "../services";

/**
 * Thin application wrapper — explain a cached or in-hand programming result.
 */
export async function explainProgramming(
  requestIdOrResult: string | ProgrammingResult,
  service: ProgrammingService = createProgrammingService(),
): Promise<readonly ProgrammingExplanation[]> {
  return service.explainProgramming(requestIdOrResult);
}
