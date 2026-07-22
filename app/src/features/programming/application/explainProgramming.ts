import { resolveService } from "../../../core/composition";
import type { ProgrammingExplanation } from "../models/ProgrammingExplanation";
import type { ProgrammingResult } from "../models/ProgrammingResult";
import type { ProgrammingService } from "../services";

/**
 * Thin application wrapper — explain a cached or in-hand programming result.
 * Default service is resolved from the Composition Root (no manual instantiation).
 */
export async function explainProgramming(
  requestIdOrResult: string | ProgrammingResult,
  service: ProgrammingService = resolveService("ProgrammingService"),
): Promise<readonly ProgrammingExplanation[]> {
  return service.explainProgramming(requestIdOrResult);
}
