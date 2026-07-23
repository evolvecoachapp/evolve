import type { MemoryQuery } from "../models/MemoryQuery";
import { MemoryQueryModes } from "../models/MemoryQuery";
import type {
  MemoryValidation,
  MemoryValidationIssue,
} from "../models/MemoryValidation";
import { MemoryValidationCodes } from "../models/MemoryValidation";
import { freezeValidation } from "../utils/FreezeMemoryState";

/**
 * Validates memory query shape.
 */
export function validateMemoryQuery(
  query: MemoryQuery | null | undefined,
): MemoryValidation {
  const issues: MemoryValidationIssue[] = [];

  if (!query) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.QUERY_INVALID,
        message: "Memory query is required.",
        path: "query",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  if (!query.id) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.MISSING_FIELD,
        message: "Query id is required.",
        path: "query.id",
      }),
    );
  }

  if (
    !(Object.values(MemoryQueryModes) as readonly string[]).includes(query.mode)
  ) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.QUERY_INVALID,
        message: "Query mode is invalid.",
        path: "query.mode",
      }),
    );
  }

  if (
    query.mode === MemoryQueryModes.BY_CATEGORY &&
    query.category == null
  ) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.QUERY_INVALID,
        message: "Category is required for by_category queries.",
        path: "query.category",
      }),
    );
  }

  if (
    query.mode === MemoryQueryModes.BY_IDENTIFIER &&
    !query.identifierId &&
    !query.key
  ) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.QUERY_INVALID,
        message: "identifierId or key is required for by_identifier queries.",
        path: "query.identifierId",
      }),
    );
  }

  if (query.mode === MemoryQueryModes.BY_SCOPE && query.scope == null) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.QUERY_INVALID,
        message: "Scope is required for by_scope queries.",
        path: "query.scope",
      }),
    );
  }

  if (
    query.mode === MemoryQueryModes.BY_PRIORITY &&
    query.minPriority == null
  ) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.QUERY_INVALID,
        message: "minPriority is required for by_priority queries.",
        path: "query.minPriority",
      }),
    );
  }

  if (query.limit != null && query.limit < 0) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.INVALID_VALUE,
        message: "Query limit must be >= 0.",
        path: "query.limit",
      }),
    );
  }

  if (!query.createdAt) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.MISSING_FIELD,
        message: "Query createdAt is required.",
        path: "query.createdAt",
      }),
    );
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
